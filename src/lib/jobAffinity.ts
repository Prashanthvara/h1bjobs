import type { Job } from "@/lib/jobTypes";
import { normalizeOrgName } from "@/lib/orgName";
import {
	normalizeJobDepartments,
	normalizeJobKeywords,
	normalizeJobLocations,
} from "@/lib/jobFilterUtils";

/**
 * Where the visitor's feed preferences live.
 *
 * localStorage, deliberately not a cookie. Reading a cookie on `/` means
 * calling `cookies()` in the server component, which opts the route out of
 * static rendering and turns an hourly-cached page into a per-request render.
 * localStorage also never leaves the browser and adds nothing to request size.
 *
 * The `v1` suffix is the migration story: a future shape change bumps the key
 * and old profiles are simply never read again.
 */
export const AFFINITY_STORAGE_KEY = "h1b:affinity:v1";

/**
 * How long it takes a recorded interest to lose half its pull.
 *
 * Job searches change. Two weeks means a visitor who pivots from clinical roles
 * to research sees the feed follow them within a couple of visits, while a
 * steady interest keeps compounding.
 */
export const AFFINITY_HALF_LIFE_DAYS = 14;

/** Entries kept per facet, strongest first. Bounds both storage and skew. */
export const AFFINITY_MAX_ENTRIES = 20;

/** Weights below this are indistinguishable from noise and get dropped. */
const AFFINITY_MIN_WEIGHT = 0.05;

const MS_PER_DAY = 86_400_000;

export type AffinityFacet = "orgs" | "departments" | "locations" | "keywords";

const FACETS: readonly AffinityFacet[] = ["orgs", "departments", "locations", "keywords"];

export interface AffinityProfile {
	v: 1;
	/** Epoch ms of the last write, used to compute decay on read. */
	updated: number;
	orgs: Record<string, number>;
	departments: Record<string, number>;
	locations: Record<string, number>;
	keywords: Record<string, number>;
}

/**
 * Employers are stored under the same normalized key the feed joins on, so a
 * preference recorded from the dropdown still matches jobs that spell the
 * employer differently. The other facets are stored as displayed.
 */
function storageKeyFor(facet: AffinityFacet, value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return "";
	return facet === "orgs" ? normalizeOrgName(trimmed) : trimmed;
}

function emptyProfile(now: number): AffinityProfile {
	return { v: 1, updated: now, orgs: {}, departments: {}, locations: {}, keywords: {} };
}

function readWeights(source: unknown): Record<string, number> {
	if (!source || typeof source !== "object") return {};
	const weights: Record<string, number> = {};
	for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
		if (typeof value === "number" && Number.isFinite(value) && value > 0) {
			weights[key] = value;
		}
	}
	return weights;
}

function isEmpty(profile: AffinityProfile): boolean {
	return FACETS.every((facet) => Object.keys(profile[facet]).length === 0);
}

/**
 * Applies time decay and the per-facet cap.
 *
 * Decay is computed on read from `updated` rather than on a timer, so a profile
 * that has sat untouched for a month is already faded the moment it is loaded.
 */
function decayProfile(profile: AffinityProfile, now: number): AffinityProfile {
	const elapsedDays = Math.max(now - profile.updated, 0) / MS_PER_DAY;
	const factor = Math.pow(0.5, elapsedDays / AFFINITY_HALF_LIFE_DAYS);

	const decayed = emptyProfile(now);
	for (const facet of FACETS) {
		const entries = Object.entries(profile[facet])
			.map(([key, weight]) => [key, weight * factor] as const)
			.filter(([, weight]) => weight >= AFFINITY_MIN_WEIGHT)
			.sort((a, b) => b[1] - a[1])
			.slice(0, AFFINITY_MAX_ENTRIES);
		decayed[facet] = Object.fromEntries(entries);
	}
	return decayed;
}

function defaultStorage(): Storage | null {
	try {
		return typeof window === "undefined" ? null : window.localStorage;
	} catch {
		return null;
	}
}

/**
 * The visitor's stored preferences, decayed to `now`.
 *
 * Returns null for absent, corrupt, future-versioned, or fully-decayed
 * profiles — all cases where the caller should simply not personalize. Every
 * storage access is guarded: Safari private mode throws, and losing a
 * preference must never break the feed.
 */
export function readAffinityProfile(
	storage: Storage | null = defaultStorage(),
	now: number = Date.now()
): AffinityProfile | null {
	if (!storage) return null;

	let raw: string | null;
	try {
		raw = storage.getItem(AFFINITY_STORAGE_KEY);
	} catch {
		return null;
	}
	if (!raw) return null;

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}

	if (!parsed || typeof parsed !== "object") return null;
	const candidate = parsed as Partial<AffinityProfile>;
	if (candidate.v !== 1) return null;

	const stored = emptyProfile(
		typeof candidate.updated === "number" && Number.isFinite(candidate.updated)
			? candidate.updated
			: now
	);
	for (const facet of FACETS) {
		stored[facet] = readWeights(candidate[facet]);
	}

	const decayed = decayProfile(stored, now);
	return isEmpty(decayed) ? null : decayed;
}

/**
 * Records that the visitor filtered by a value.
 *
 * Only facet filters reach here — never free-text search, which is noisy and
 * may contain personal text that does not belong in storage. Existing weights
 * are decayed before the new signal is added, so one signal today always
 * outweighs one signal a month ago.
 */
export function recordAffinitySignal(
	facet: AffinityFacet,
	value: string,
	storage: Storage | null = defaultStorage(),
	now: number = Date.now()
): void {
	if (!storage) return;

	const key = storageKeyFor(facet, value);
	if (!key) return;

	const current = readAffinityProfile(storage, now) ?? emptyProfile(now);
	const updated: AffinityProfile = { ...current, updated: now };
	updated[facet] = { ...current[facet], [key]: (current[facet][key] ?? 0) + 1 };

	const capped = decayProfile(updated, now);

	try {
		storage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(capped));
	} catch {
		// Quota exceeded or storage disabled. Personalization is a nicety.
	}
}

function facetValuesOf(job: Job, facet: AffinityFacet): string[] {
	switch (facet) {
		case "orgs": {
			const key = normalizeOrgName(job.org);
			return key ? [key] : [];
		}
		case "departments":
			return normalizeJobDepartments(job.department);
		case "locations":
			return normalizeJobLocations(job.location);
		case "keywords":
			return normalizeJobKeywords(job.keywords);
	}
}

/**
 * Turns a profile into the 0..1 score `rankJobs` multiplies by `affinityBoost`.
 *
 * Each facet contributes its best match normalized against that facet's own
 * strongest weight, and the four are averaged. Normalizing per facet keeps the
 * scale stable no matter how many signals a visitor has accumulated; averaging
 * rather than summing keeps a single strong match from dominating the way four
 * matches should.
 */
export function buildAffinityFn(profile: AffinityProfile): (job: Job) => number {
	const maxima = new Map<AffinityFacet, number>();
	for (const facet of FACETS) {
		const weights = Object.values(profile[facet]);
		maxima.set(facet, weights.length > 0 ? Math.max(...weights) : 0);
	}

	return (job: Job): number => {
		let total = 0;
		for (const facet of FACETS) {
			const max = maxima.get(facet) ?? 0;
			if (max <= 0) continue;

			let best = 0;
			for (const value of facetValuesOf(job, facet)) {
				const weight = profile[facet][value] ?? 0;
				if (weight > best) best = weight;
			}
			total += best / max;
		}
		return total / FACETS.length;
	};
}
