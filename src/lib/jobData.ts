import { createClient } from "@supabase/supabase-js";
import { Job } from "@/lib/jobTypes";

export async function fetchVisaJobs(): Promise<{ jobs: Job[]; error: string | null }> {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		return {
			jobs: [],
			error: "Supabase credentials are missing. Add SUPABASE_URL and SUPABASE_ANON_KEY.",
		};
	}

	const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
