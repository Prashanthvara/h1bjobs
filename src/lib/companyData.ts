import { createClient } from "@supabase/supabase-js";
import { Company } from "@/lib/companyTypes";

export async function fetchCompanies(): Promise<{ companies: Company[]; error: string | null }> {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		return {
			companies: [],
			error: "Supabase credentials are missing. Add SUPABASE_URL and SUPABASE_ANON_KEY.",
		};
	}

	const supabase = createClient(supabaseUrl, supabaseAnonKey);

	const { data, error } = await supabase
		.from("company")
		.select("*")
		.order("h1b_approvals", { ascending: false });

	if (error) {
		return { companies: [], error: error.message };
	}

	return { companies: (data ?? []) as Company[], error: null };
}
