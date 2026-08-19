import { describe, it, expect } from "vitest";
import {
	AFFINITY_STORAGE_KEY,
	AFFINITY_MAX_ENTRIES,
	buildAffinityFn,
	readAffinityProfile,
	recordAffinitySignal,
	type AffinityProfile,
} from "./jobAffinity";
import type { Job } from "./jobTypes";

/**
 * Vitest runs in a node environment here — this repo has no jsdom and adding
 * one for four functions is not worth the install. Storage is injectable
 * precisely so these tests need nothing but a Map.
 */
function fakeStorage(initial: Record<string, string> = {}): Storage {
	const map = new Map(Object.entries(initial));
	return {
		get length() { return map.size; },
		clear: () => map.clear(),
		getItem: (key: string) => map.get(key) ?? null,
		key: (index: number) => [...map.keys()][index] ?? null,
		removeItem: (key: string) => { map.delete(key); },
		setItem: (key: string, value: string) => { map.set(key, value); },
	} as Storage;
}

function throwingStorage(): Storage {
	return {
		get length() { return 0; },
		clear: () => { throw new Error("denied"); },
		getItem: () => { throw new Error("denied"); },
		key: () => null,
		removeItem: () => { throw new Error("denied"); },
		setItem: () => { throw new Error("denied"); },
	} as Storage;
}

const DAY = 86_400_000;
const NOW = Date.parse("2026-08-17T12:00:00Z");

function job(org: string, department: string, keywords: string[], locations: string[]): Job {
	return {
		job_id: `${org}-${department}`,
		org,
		job_title: "Some Role",
		location: locations,
		job_posting_date: "2026-08-17",
		url: null,
		is_visa: true,
		keywords,
		department,
	};
}

describe("recordAffinitySignal", () => {
	it("writes a profile on the first signal", () => {
		const storage = fakeStorage();
		recordAffinitySignal("departments", "Research", storage, NOW);

		const profile = readAffinityProfile(storage, NOW);
		expect(profile?.departments).toEqual({ Research: 1 });
		expect(profile?.v).toBe(1);
	});

	it("accumulates repeated signals for the same value", () => {
		const storage = fakeStorage();
		recordAffinitySignal("departments", "Research", storage, NOW);
		recordAffinitySignal("departments", "Research", storage, NOW);

		expect(readAffinityProfile(storage, NOW)?.departments.Research).toBe(2);
	});

	it("keeps facets independent", () => {
		const storage = fakeStorage();
		recordAffinitySignal("departments", "Research", storage, NOW);
		recordAffinitySignal("orgs", "Yale University", storage, NOW);

		const profile = readAffinityProfile(storage, NOW);
		expect(profile?.departments.Research).toBe(1);
		expect(profile?.orgs["yale university"]).toBe(1);
	});

	it("normalizes employer names so they match the job feed's join key", () => {
		const storage = fakeStorage();
		recordAffinitySignal("orgs", "The Ohio State University", storage, NOW);

		expect(readAffinityProfile(storage, NOW)?.orgs["ohio state university"]).toBe(1);
	});

	it("ignores empty values", () => {
		const storage = fakeStorage();
		recordAffinitySignal("departments", "   ", storage, NOW);

		expect(readAffinityProfile(storage, NOW)).toBeNull();
	});

	it("keeps only the strongest entries per facet", () => {
		const storage = fakeStorage();
		// A clearly dominant interest, then a long tail of one-off filters. The
		// cap must evict the tail, not the thing the visitor keeps coming back to.
		for (let i = 0; i < 5; i += 1) {
			recordAffinitySignal("keywords", "keyword-winner", storage, NOW);
		}
		for (let i = 0; i < AFFINITY_MAX_ENTRIES + 10; i += 1) {
			recordAffinitySignal("keywords", `keyword-${i}`, storage, NOW);
		}

		const profile = readAffinityProfile(storage, NOW);
		const entries = Object.keys(profile!.keywords);
		expect(entries.length).toBeLessThanOrEqual(AFFINITY_MAX_ENTRIES);
		expect(profile!.keywords["keyword-winner"]).toBe(5);
	});

	it("does not throw when storage refuses writes", () => {
		// Safari private mode throws on setItem. A job board must not break
		// because a preference could not be saved.
		expect(() => recordAffinitySignal("departments", "Research", throwingStorage(), NOW)).not.toThrow();
	});

	it("does nothing when there is no storage at all", () => {
		expect(() => recordAffinitySignal("departments", "Research", null, NOW)).not.toThrow();
	});
});

describe("readAffinityProfile decay", () => {
	it("halves weights after one half-life", () => {
		const storage = fakeStorage();
		recordAffinitySignal("departments", "Research", storage, NOW);

		const later = readAffinityProfile(storage, NOW + 14 * DAY);
		expect(later?.departments.Research).toBeCloseTo(0.5, 5);
	});

	it("drops entries that have decayed into noise", () => {
		const storage = fakeStorage();
		recordAffinitySignal("departments", "Research", storage, NOW);

		// Far enough out that the weight falls below the retention floor.
		expect(readAffinityProfile(storage, NOW + 365 * DAY)).toBeNull();
	});

	it("leaves weights untouched when no time has passed", () => {
		const storage = fakeStorage();
		recordAffinitySignal("departments", "Research", storage, NOW);

		expect(readAffinityProfile(storage, NOW)?.departments.Research).toBe(1);
	});

	it("lets a fresh signal outweigh an older one", () => {
		const storage = fakeStorage();
		recordAffinitySignal("departments", "Clinical Care", storage, NOW);
		recordAffinitySignal("departments", "Research", storage, NOW + 21 * DAY);

		const profile = readAffinityProfile(storage, NOW + 21 * DAY);
		expect(profile!.departments.Research).toBeGreaterThan(profile!.departments["Clinical Care"]);
	});
});

describe("readAffinityProfile robustness", () => {
	it("returns null when nothing is stored", () => {
		expect(readAffinityProfile(fakeStorage(), NOW)).toBeNull();
	});

	it("returns null for unparseable JSON rather than throwing", () => {
		const storage = fakeStorage({ [AFFINITY_STORAGE_KEY]: "{not json" });
		expect(readAffinityProfile(storage, NOW)).toBeNull();
	});

	it("returns null for a profile written by a future version", () => {
		const storage = fakeStorage({
			[AFFINITY_STORAGE_KEY]: JSON.stringify({ v: 99, updated: NOW, orgs: {} }),
		});
		expect(readAffinityProfile(storage, NOW)).toBeNull();
	});

	it("returns null for a structurally valid but empty profile", () => {
		const storage = fakeStorage({
			[AFFINITY_STORAGE_KEY]: JSON.stringify({
				v: 1, updated: NOW, orgs: {}, departments: {}, locations: {}, keywords: {},
			}),
		});
		expect(readAffinityProfile(storage, NOW)).toBeNull();
	});

	it("survives a profile with the wrong value types", () => {
		const storage = fakeStorage({
			[AFFINITY_STORAGE_KEY]: JSON.stringify({
				v: 1, updated: NOW, orgs: { yale: "lots" }, departments: null,
			}),
		});
		expect(() => readAffinityProfile(storage, NOW)).not.toThrow();
	});

	it("does not throw when storage refuses reads", () => {
		expect(() => readAffinityProfile(throwingStorage(), NOW)).not.toThrow();
		expect(readAffinityProfile(throwingStorage(), NOW)).toBeNull();
	});
});

describe("buildAffinityFn", () => {
	const profile: AffinityProfile = {
		v: 1,
		updated: NOW,
		orgs: { "yale university": 4 },
		departments: { Research: 4 },
		locations: { "New Haven, CT": 4 },
		keywords: { Python: 4 },
	};

	it("returns 0 for a job matching nothing", () => {
		const score = buildAffinityFn(profile)(job("Employer X", "Facilities", ["Welding"], ["Fargo, ND"]));
		expect(score).toBe(0);
	});

	it("returns 1 for a job matching every facet at full weight", () => {
		const score = buildAffinityFn(profile)(
			job("Yale University", "Research", ["Python"], ["New Haven, CT"])
		);
		expect(score).toBeCloseTo(1, 5);
	});

	it("scores a partial match between 0 and 1", () => {
		const score = buildAffinityFn(profile)(job("Yale University", "Facilities", ["Welding"], ["Fargo, ND"]));
		expect(score).toBeGreaterThan(0);
		expect(score).toBeLessThan(1);
	});

	it("scales a weaker stored preference below a stronger one", () => {
		const mixed: AffinityProfile = {
			...profile,
			departments: { Research: 4, Facilities: 1 },
		};
		const scoreFn = buildAffinityFn(mixed);
		const strong = scoreFn(job("Employer X", "Research", [], []));
		const weak = scoreFn(job("Employer X", "Facilities", [], []));
		expect(strong).toBeGreaterThan(weak);
		expect(weak).toBeGreaterThan(0);
	});

	it("matches employers across spelling variants", () => {
		const score = buildAffinityFn(profile)(job("The Yale University", "Facilities", [], []));
		expect(score).toBeGreaterThan(0);
	});

	it("never returns a value outside 0..1", () => {
		const scoreFn = buildAffinityFn(profile);
		const scores = [
			scoreFn(job("Yale University", "Research", ["Python"], ["New Haven, CT"])),
			scoreFn(job("Employer X", "Facilities", [], [])),
		];
		scores.forEach((score) => {
			expect(score).toBeGreaterThanOrEqual(0);
			expect(score).toBeLessThanOrEqual(1);
		});
	});
});
