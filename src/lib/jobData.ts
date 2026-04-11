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

	// Count query for the real total (displayed in tab toggle + summary row)
	const { count, error: countError } = await supabase
		.from("job")
		.select("*", { count: "exact", head: true })
		.eq("is_visa", true);

	if (countError) {
		return { jobs: [], totalCount: 0, error: countError.message };
	}

	// Data query for job cards (Supabase default 1000 rows, most recent first)
	const { data, error } = await supabase
		.from("job")
		.select("job_id, org, job_title, location, job_posting_date, url, is_visa, keywords, department")
		.eq("is_visa", true)
		.order("job_posting_date", { ascending: false });

	if (error) {
		return { jobs: [], totalCount: 0, error: error.message };
	}

	return { jobs: (data ?? []) as Job[], totalCount: count ?? 0, error: null };
}
