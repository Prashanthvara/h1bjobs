import { describe, it, expect } from "vitest";
import { rankJobs, departmentRankKey, DEFAULT_RANKING_WEIGHTS } from "./jobRanking";
import type { Job } from "./jobTypes";

function job(
	id: string,
	org: string,
	department: string,
	date: string | null
): Job {
	return {
		job_id: id,
		org,
		job_title: `${org} ${id}`,
		location: null,
		job_posting_date: date,
		url: null,
		is_visa: true,
		keywords: null,
		department,
	};
}

const ids = (jobs: Job[]) => jobs.map((j) => j.job_id);

/**
 * Reproduces the clustering measured on 2026-08-17: one employer's scraped
 * batch owning the top of the page. Eleven Ohio State jobs posted the same day
 * as one job from each of five other employers.
 */
function clusteredFixture(): Job[] {
	const jobs: Job[] = [];
	const osuDepts = [
		"Legal & Compliance", "Clinical Operations", "Clinical Care", "Clinical Care",
		"Research", "Research", "Facilities", "Information Technology",
		"Clinical Care", "Research", "Data & Analytics",
	];
	osuDepts.forEach((dept, i) => {
		jobs.push(job(`osu-${String(i).padStart(2, "0")}`, "Ohio State University", dept, "2026-08-17"));
	});
	jobs.push(job("sj-00", "St. Jude Children's Research Hospital", "Clinical Care", "2026-08-17"));
	jobs.push(job("uc-00", "University of Chicago", "Engineering & Technology", "2026-08-17"));
	jobs.push(job("cc-00", "Cincinnati Children's Hospital", "Clinical Care", "2026-08-17"));
	jobs.push(job("up-00", "University of Pennsylvania", "Research", "2026-08-17"));
	jobs.push(job("uf-00", "University of Florida", "Research", "2026-08-17"));
	return jobs;
}

describe("departmentRankKey", () => {
	it("uses the first department as the grouping key", () => {
		expect(departmentRankKey(job("a", "Org", "Research, Clinical Care", "2026-08-17"))).toBe("Research");
	});

	it("returns an empty key for a job with no department", () => {
		expect(departmentRankKey(job("a", "Org", "", "2026-08-17"))).toBe("");
	});
});

describe("rankJobs preserves the listings it is given", () => {
	it("returns every job exactly once", () => {
		const jobs = clusteredFixture();
		const ranked = rankJobs(jobs);
		expect(ranked).toHaveLength(jobs.length);
		expect([...ids(ranked)].sort()).toEqual([...ids(jobs)].sort());
	});

	it("does not mutate its input", () => {
		const jobs = clusteredFixture();
		const before = ids(jobs);
		rankJobs(jobs);
		expect(ids(jobs)).toEqual(before);
	});

	it("handles empty and single-element inputs", () => {
		expect(rankJobs([])).toEqual([]);
		const one = [job("a", "Org", "Research", "2026-08-17")];
		expect(ids(rankJobs(one))).toEqual(["a"]);
	});
});

describe("rankJobs is deterministic", () => {
	it("produces the same order regardless of input order", () => {
		// Load-bearing: the server pre-ranks and the client may re-rank the same
		// list. If those disagreed, the page would visibly reshuffle on hydration.
		const jobs = clusteredFixture();
		const reversed = [...jobs].reverse();
		expect(ids(rankJobs(jobs))).toEqual(ids(rankJobs(reversed)));
	});

	it("is idempotent", () => {
		const jobs = clusteredFixture();
		const once = rankJobs(jobs);
		expect(ids(rankJobs(once))).toEqual(ids(once));
	});
});

describe("rankJobs is timezone-independent", () => {
	/**
	 * The server ranks in UTC to build the cached HTML; the visitor's browser may
	 * re-rank in any zone. `parseJobDate` from jobFilterUtils resolves a bare
	 * date to LOCAL midnight, which makes the day of a DST transition 23 hours
	 * long — measured at 3.958333 days of age where UTC gives 4.0. That gap is
	 * enough to change the order and visibly reshuffle the page on hydration.
	 *
	 * These jobs straddle the 2026-03-08 US transition and the employer penalty
	 * is tuned to sit exactly on the boundary the shortened day moves, so this
	 * fails if anyone swaps postingTimestamp for parseJobDate.
	 */
	function dstFixture(): Job[] {
		return [
			job("a-1", "Employer A", "Research", "2026-03-12"),
			job("a-2", "Employer A", "Research", "2026-03-12"),
			job("b-1", "Employer B", "Research", "2026-03-06"),
		];
	}

	function rankUnder(timezone: string): string[] {
		// Node applies a changed process.env.TZ to subsequent Date operations.
		// Restored in `finally` so a failure cannot leak the zone into later tests.
		const original = process.env.TZ;
		process.env.TZ = timezone;
		try {
			return ids(rankJobs(dstFixture(), { orgPenalty: 5.9999, deptPenalty: 0 }));
		} finally {
			process.env.TZ = original;
		}
	}

	it("orders identically in UTC and across a spring-forward transition", () => {
		expect(rankUnder("America/New_York")).toEqual(rankUnder("UTC"));
	});

	it("orders identically in a zone with a half-hour DST shift", () => {
		expect(rankUnder("Australia/Lord_Howe")).toEqual(rankUnder("UTC"));
	});

	it("puts the employer penalty ahead of the six-day gap, as the fixture intends", () => {
		// Guards the fixture itself: if the weights ever stop straddling the
		// boundary, the two tests above would pass without proving anything.
		expect(rankUnder("UTC")).toEqual(["a-2", "a-1", "b-1"]);
	});
});

describe("rankJobs breaks up single-employer clustering", () => {
	it("puts six distinct employers in the first six cards", () => {
		const ranked = rankJobs(clusteredFixture());
		const employers = new Set(ranked.slice(0, 6).map((j) => j.org));
		expect(employers.size).toBe(6);
	});

	it("shows a given employer at most once in the first six cards", () => {
		const ranked = rankJobs(clusteredFixture());
		const osu = ranked.slice(0, 6).filter((j) => j.org === "Ohio State University");
		expect(osu).toHaveLength(1);
	});

	it("leaves the unranked order clustered, proving the fixture is the problem case", () => {
		const employers = new Set(clusteredFixture().slice(0, 6).map((j) => j.org));
		expect(employers.size).toBe(1);
	});
});

describe("rankJobs respects recency", () => {
	it("prefers a newer job over an older one from an unseen employer", () => {
		const ranked = rankJobs([
			job("old", "Employer A", "Research", "2026-07-01"),
			job("new", "Employer B", "Research", "2026-08-17"),
		]);
		expect(ids(ranked)).toEqual(["new", "old"]);
	});

	it("does not let the employer penalty outrank a large age gap", () => {
		// Two jobs from one employer today, one job from another a month ago.
		// One day of penalty must not drag a month-old listing to the top.
		const ranked = rankJobs([
			job("fresh-1", "Employer A", "Research", "2026-08-17"),
			job("fresh-2", "Employer A", "Research", "2026-08-17"),
			job("stale", "Employer B", "Research", "2026-07-17"),
		]);
		// fresh-2 leads fresh-1 because they share employer, department and date,
		// so the job_id-descending tiebreak decides - the same tiebreak fetchVisaJobs
		// already applies. What matters here is that "stale" stays last.
		expect(ids(ranked)).toEqual(["fresh-2", "fresh-1", "stale"]);
	});

	it("sinks jobs with an unparseable posting date to the bottom", () => {
		const ranked = rankJobs([
			job("nodate", "Employer A", "Research", null),
			job("dated", "Employer B", "Research", "2026-08-17"),
		]);
		expect(ids(ranked)).toEqual(["dated", "nodate"]);
	});
});

describe("rankJobs with penalties disabled", () => {
	it("falls back to date-descending, job_id-descending order", () => {
		// This is exactly today's behaviour, and it is what the feed must show
		// when the visitor has already pinned the employer and department facets.
		const jobs = [
			job("a-1", "Employer A", "Research", "2026-08-15"),
			job("a-3", "Employer A", "Research", "2026-08-17"),
			job("a-2", "Employer A", "Clinical Care", "2026-08-17"),
		];
		const ranked = rankJobs(jobs, { orgPenalty: 0, deptPenalty: 0 });
		expect(ids(ranked)).toEqual(["a-3", "a-2", "a-1"]);
	});
});

describe("rankJobs affinity", () => {
	it("pulls matching jobs forward without discarding anything", () => {
		const jobs = [
			job("clin-1", "Employer A", "Clinical Care", "2026-08-17"),
			job("clin-2", "Employer B", "Clinical Care", "2026-08-17"),
			job("res-1", "Employer C", "Research", "2026-08-16"),
		];
		const affinity = (j: Job) => (departmentRankKey(j) === "Research" ? 1 : 0);
		const ranked = rankJobs(jobs, { affinity, affinityBoost: DEFAULT_RANKING_WEIGHTS.affinityBoost });
		expect(ranked[0].job_id).toBe("res-1");
		expect(ranked).toHaveLength(3);
	});

	it("ignores affinity when no function is supplied", () => {
		const jobs = [
			job("clin-1", "Employer A", "Clinical Care", "2026-08-17"),
			job("res-1", "Employer C", "Research", "2026-08-16"),
		];
		expect(ids(rankJobs(jobs))).toEqual(["clin-1", "res-1"]);
	});
});
