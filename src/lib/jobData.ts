import { createClient } from "@supabase/supabase-js";
import { Job } from "@/lib/jobTypes";

export async function fetchVisaJobs(): Promise<{ jobs: Job[]; totalCount: number; error: string | null }> {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		return {
			jobs: [],
			totalCount: 0,
			error: "Supabase credentials are missing. Add SUPABASE_URL and SUPABASE_ANON_KEY.",
		};
	}

	const supabase = createClient(supabaseUrl, supabaseAnonKey);

	// Single query returns both job rows (Supabase default 1000, most recent first)
	// and the real total matching is_visa=true (displayed in tab toggle + summary row).
	const { data, count, error } = await supabase
		.from("job")
		.select(
			"job_id, org, job_title, location, job_posting_date, url, is_visa, keywords, department",
			{ count: "exact" }
		)
		.eq("is_visa", true)
		.order("job_posting_date", { ascending: false });

	if (error) {
		return { jobs: [], totalCount: 0, error: error.message };
	}

	return { jobs: (data ?? []) as Job[], totalCount: count ?? 0, error: null };
}
