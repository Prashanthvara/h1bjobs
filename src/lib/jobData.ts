import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Job, type OrgDateRow } from "@/lib/jobTypes";

const MISSING_CREDENTIALS =
	"Supabase credentials are missing. Add SUPABASE_URL and SUPABASE_ANON_KEY.";

function getClient(): SupabaseClient | null {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseAnonKey) return null;
	return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * First day of the rolling 30-day window, as `YYYY-MM-DD`.
 *
 * Counts back 29 days from the start of today so the window is 30 days
 * inclusive — matching `filterJobsByDateRange`'s `"30d"` branch. If these two
 * ever disagree, the tab badge and the "Last 30 days" filter report different
 * numbers.
 *
 * `now` is injectable so the behavior is testable without freezing the clock.
 *
 * Timezone note: this runs on the server (UTC on Workers, the build machine's
 * zone during prerender), while `filterJobsByDateRange` runs in the visitor's
 * zone. Around the UTC date rollover the two windows can differ by one day.
 * `job_posting_date` is a bare `YYYY-MM-DD` with no timezone and the server
 * cannot know the visitor's, so this is documented rather than fixed — the
 * skew is ~1/30th of the count and far smaller than the deliberate gap between
 * this total and the 1000 rows `fetchVisaJobs` returns.
 */
export function getThirtyDayCutoff(now: Date = new Date()): string {
	const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	start.setDate(start.getDate() - 29);

	const year = start.getFullYear();
	const month = String(start.getMonth() + 1).padStart(2, "0");
	const day = String(start.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Count of visa jobs posted in the last 30 days.
 *
 * Deliberately independent of `fetchVisaJobs`: this asks Postgres for a number
 * and transfers no rows (`head: true`), so it is not subject to the 1000-row
 * response cap that limits the card query. Expect the count to exceed the
 * number of cards on the page — that is the intended decoupling, not a bug.
 *
 * Returns `count: null` on failure rather than 0, so callers can distinguish a
 * broken query from a genuine zero. Collapsing both to 0 would let a
 * permanently failing count silently render a plausible-looking fallback.
 */
export async function fetchVisaJobCount(): Promise<{ count: number | null; error: string | null }> {
	const supabase = getClient();
	if (!supabase) {
		return { count: null, error: MISSING_CREDENTIALS };
	}

	const { count, error } = await supabase
		.from("job")
		.select("job_id", { count: "exact", head: true })
		.eq("is_visa", true)
		.gte("job_posting_date", getThirtyDayCutoff());

	if (error) {
		return { count: null, error: error.message };
	}

	return { count: count ?? null, error: null };
}

export async function fetchVisaJobs(): Promise<{ jobs: Job[]; error: string | null }> {
	const supabase = getClient();
	if (!supabase) {
		return { jobs: [], error: MISSING_CREDENTIALS };
	}

	// Job rows only (Supabase default 1000, most recent first). The tab toggle and
	// summary row count what's rendered, so no exact-count scan is needed here.
	//
	// The `job_id` tiebreaker is not cosmetic: `job_posting_date` is a bare date
	// with many rows per day, so without a second sort key Postgres may return a
	// different 1000 rows on each call. fetchVisaJobOrgDates below relies on
	// getting the SAME window as this query — that is what makes a company
	// card's "47 open jobs" match the 47 rows behind its link.
	const { data, error } = await supabase
		.from("job")
		.select("job_id, org, job_title, location, job_posting_date, url, is_visa, keywords, department")
		.eq("is_visa", true)
		.order("job_posting_date", { ascending: false })
		.order("job_id", { ascending: false });

	if (error) {
		return { jobs: [], error: error.message };
	}

	return { jobs: (data ?? []) as Job[], error: null };
}

/**
 * The exact columns `fetchVisaJobOrgDates` selects.
 *
 * Guarded by jobData.test.ts the same way the company projections are: the
 * `satisfies` clause rejects a column that is not on Job at compile time, the
 * test rejects a changed list at run time.
 */
export const VISA_JOB_ORG_COLUMNS = [
	"org",
	"job_posting_date",
] as const satisfies readonly (keyof Job)[];

/**
 * Employer and posting date for every visa job in the same window `/` renders.
 *
 * Deliberately a copy of `fetchVisaJobs`'s predicate and ordering with a
 * narrower projection, NOT an aggregate `group by`. An aggregate would count
 * rows the home page cannot display — it caps at Supabase's 1000-row default —
 * so a card would advertise 300 jobs and its link would land on 40. Mirroring
 * the query trades exactness for a promise the destination can keep.
 *
 * Two residual sources of drift, both bounded and accepted: `/` and
 * `/companies` regenerate independently on their one-hour ISR windows, so one
 * route can be up to an hour staler than the other; and the server/visitor
 * timezone gap described on buildCompanyJobCounts.
 */
export async function fetchVisaJobOrgDates(): Promise<{ rows: OrgDateRow[]; error: string | null }> {
	const supabase = getClient();
	if (!supabase) {
		return { rows: [], error: MISSING_CREDENTIALS };
	}

	const { data, error } = await supabase
		.from("job")
		.select(VISA_JOB_ORG_COLUMNS.join(", "))
		.eq("is_visa", true)
		.order("job_posting_date", { ascending: false })
		.order("job_id", { ascending: false });

	if (error) {
		return { rows: [], error: error.message };
	}

	return { rows: (data ?? []) as unknown as OrgDateRow[], error: null };
}
