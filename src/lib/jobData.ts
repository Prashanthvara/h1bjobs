import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Job } from "@/lib/jobTypes";

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
 */
export async function fetchVisaJobCount(): Promise<{ count: number; error: string | null }> {
	const supabase = getClient();
	if (!supabase) {
		return { count: 0, error: MISSING_CREDENTIALS };
	}

	const { count, error } = await supabase
		.from("job")
		.select("job_id", { count: "exact", head: true })
		.eq("is_visa", true)
		.gte("job_posting_date", getThirtyDayCutoff());

	if (error) {
		return { count: 0, error: error.message };
	}

	return { count: count ?? 0, error: null };
}

export async function fetchVisaJobs(): Promise<{ jobs: Job[]; error: string | null }> {
	const supabase = getClient();
	if (!supabase) {
		return { jobs: [], error: MISSING_CREDENTIALS };
	}

	// Job rows only (Supabase default 1000, most recent first). The tab toggle and
	// summary row count what's rendered, so no exact-count scan is needed here.
	const { data, error } = await supabase
		.from("job")
		.select("job_id, org, job_title, location, job_posting_date, url, is_visa, keywords, department")
		.eq("is_visa", true)
		.order("job_posting_date", { ascending: false });

	if (error) {
		return { jobs: [], error: error.message };
	}

	return { jobs: (data ?? []) as Job[], error: null };
}
