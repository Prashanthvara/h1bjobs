import type { Job } from "@/lib/jobTypes";
import { normalizeJobDepartments } from "@/lib/jobFilterUtils";
import { normalizeOrgName } from "@/lib/orgName";

export interface RankingWeights {
	/** Days of apparent age added per job already placed from the same employer. */
	orgPenalty: number;
	/** Days of apparent age added per job already placed from the same department. */
	deptPenalty: number;
	/** Days of apparent age removed for a perfect affinity match. */
	affinityBoost: number;
}

/**
 * Tuned against the live feed on 2026-08-17. These values took page 1 from 7
 * employers / 9 departments / 11 cards from one employer to 17 / 14 / 3, while
 * keeping every page-1 card on the newest or second-newest posting date.
 *
 * The units are days, which is what makes them legible: an employer's second
 * job on page 1 is treated as 1.2 days staler than its first, so a genuinely
 * newer batch still outranks an older one.
 */
export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
	orgPenalty: 1.2,
	deptPenalty: 0.6,
	affinityBoost: 3,
};

export interface RankJobsOptions {
	orgPenalty?: number;
	deptPenalty?: number;
	affinityBoost?: number;
	/** Returns 0..1 for how well a job matches the visitor's stored profile. */
	affinity?: ((job: Job) => number) | null;
}

/**
 * The single department a job is grouped under.
 *
 * A job can list several; grouping needs exactly one, so the first wins. Jobs
 * with no department share the empty key, which is correct — they are
 * genuinely one undifferentiated group for spreading purposes.
 */
export function departmentRankKey(job: Job): string {
	return normalizeJobDepartments(job.department)[0] ?? "";
}

const MS_PER_DAY = 86_400_000;

/**
 * Jobs with no usable date sort below everything real, without NaN poisoning
 * the comparisons. Larger than any plausible age in days.
 */
const MISSING_DATE_AGE = 1e6;

/**
 * Separates the two halves of a group key.
 *
 * A NUL rather than a printable character because department names are free
 * text from the scraper: with a space, employer "a b" plus department "c"
 * would key identically to employer "a" plus department "b c", silently
 * merging two groups into one and weakening the spread.
 */
const GROUP_KEY_SEPARATOR = "\u0000";

interface PlacementCounter {
	placed: number;
}

interface RankItem {
	job: Job;
	/** Age in days, already reduced by any affinity boost. Fixed per job. */
	base: number;
	/** Intrinsic tiebreak rank; lower wins. */
	tie: number;
}

interface RankGroup {
	org: PlacementCounter;
	dept: PlacementCounter;
	items: RankItem[];
	head: number;
}

/**
 * Posting date as a timezone-independent timestamp.
 *
 * Deliberately NOT `parseJobDate` from jobFilterUtils, which resolves a bare
 * `YYYY-MM-DD` to local midnight. Ranking runs on the server (UTC on Workers)
 * to produce the cached HTML and may run again in the visitor's browser; if the
 * two computed different ages across a DST boundary they would produce
 * different orders and the page would visibly reshuffle on hydration.
 * `Date.parse` treats a bare date as UTC per spec, so both agree.
 */
function postingTimestamp(value: Job["job_posting_date"]): number | null {
	if (!value) return null;
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Position of each job in a `job_id`-descending ordering.
 *
 * Ties are broken on this rather than on array position so that ranking does
 * not depend on the order the caller happened to pass jobs in — the property
 * that makes rankJobs idempotent and lets the server's order and the client's
 * agree. Descending matches the existing `job_id` tiebreaker in fetchVisaJobs.
 */
function buildTiebreakRanks(jobs: Job[]): number[] {
	const order = jobs.map((_, index) => index);
	order.sort((a, b) => {
		const idA = jobs[a].job_id ?? "";
		const idB = jobs[b].job_id ?? "";
		if (idA === idB) return 0;
		return idA < idB ? 1 : -1;
	});

	const ranks = new Array<number>(jobs.length);
	for (let rank = 0; rank < order.length; rank += 1) {
		ranks[order[rank]] = rank;
	}
	return ranks;
}

function counterFor(counters: Map<string, PlacementCounter>, key: string): PlacementCounter {
	let counter = counters.get(key);
	if (!counter) {
		counter = { placed: 0 };
		counters.set(key, counter);
	}
	return counter;
}

/**
 * Orders a job list so the top of the page spreads across employers and
 * departments instead of showing one employer's scraped batch.
 *
 * Each job scores `age + orgPenalty * (jobs already placed from this employer)
 * + deptPenalty * (same for its department) - affinityBoost * affinity`, and
 * the lowest score is placed next. Scoring every remaining job at every step
 * would be O(n^2) — roughly 360ms for 1000 jobs, far too slow to run when a
 * filter changes.
 *
 * The speedup rests on one observation: within a single (employer, department)
 * group, both penalty counters are identical for every member, so that group's
 * lowest scorer is always its oldest unplaced job. The best candidate overall
 * is therefore always the head of some group, and each step scans ~150 group
 * heads rather than 1000 jobs. The result is the exact greedy order, measured
 * at 1.77ms for 1000 jobs.
 *
 * Returns a new array; the input is not mutated.
 */
export function rankJobs(jobs: Job[], options: RankJobsOptions = {}): Job[] {
	const count = jobs.length;
	if (count < 2) return jobs.slice();

	const {
		orgPenalty = DEFAULT_RANKING_WEIGHTS.orgPenalty,
		deptPenalty = DEFAULT_RANKING_WEIGHTS.deptPenalty,
		affinityBoost = DEFAULT_RANKING_WEIGHTS.affinityBoost,
		affinity = null,
	} = options;

	const tiebreak = buildTiebreakRanks(jobs);

	// Age is measured from the newest job in this list, not from the wall clock,
	// so the scale stays meaningful for a filtered subset whose newest job is
	// weeks old.
	let newest = 0;
	for (const job of jobs) {
		const timestamp = postingTimestamp(job.job_posting_date);
		if (timestamp !== null && timestamp > newest) newest = timestamp;
	}

	const orgCounters = new Map<string, PlacementCounter>();
	const deptCounters = new Map<string, PlacementCounter>();
	const groups = new Map<string, RankGroup>();

	for (let index = 0; index < count; index += 1) {
		const job = jobs[index];
		const orgKey = normalizeOrgName(job.org);
		const deptKey = departmentRankKey(job);
		const groupKey = `${orgKey}${GROUP_KEY_SEPARATOR}${deptKey}`;

		let group = groups.get(groupKey);
		if (!group) {
			group = {
				org: counterFor(orgCounters, orgKey),
				dept: counterFor(deptCounters, deptKey),
				items: [],
				head: 0,
			};
			groups.set(groupKey, group);
		}

		const timestamp = postingTimestamp(job.job_posting_date);
		const age = timestamp === null ? MISSING_DATE_AGE : (newest - timestamp) / MS_PER_DAY;
		const boost = affinity ? affinityBoost * affinity(job) : 0;

		group.items.push({ job, base: age - boost, tie: tiebreak[index] });
	}

	// Sorting each group up front is what lets the selection loop read only
	// `items[head]` — the group's best remaining candidate by construction.
	for (const group of groups.values()) {
		group.items.sort((a, b) => a.base - b.base || a.tie - b.tie);
	}

	const groupList = [...groups.values()];
	const ranked = new Array<Job>(count);

	for (let placed = 0; placed < count; placed += 1) {
		let best: RankGroup | null = null;
		let bestScore = Infinity;
		let bestTie = Infinity;

		for (let index = 0; index < groupList.length; index += 1) {
			const group = groupList[index];
			if (group.head >= group.items.length) continue;

			const item = group.items[group.head];
			const score = item.base + orgPenalty * group.org.placed + deptPenalty * group.dept.placed;

			if (score < bestScore || (score === bestScore && item.tie < bestTie)) {
				bestScore = score;
				bestTie = item.tie;
				best = group;
			}
		}

		// Unreachable while any group has items left, which the loop bound
		// guarantees; the check keeps the non-null assertion honest.
		if (!best) break;

		ranked[placed] = best.items[best.head].job;
		best.head += 1;
		best.org.placed += 1;
		best.dept.placed += 1;
	}

	return ranked;
}
