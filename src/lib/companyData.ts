import { createClient } from "@supabase/supabase-js";
import { Company, COMPANY_COLUMNS } from "@/lib/companyTypes";

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
		.select(COMPANY_COLUMNS.join(", "))
		.order("h1b_approvals", { ascending: false });

	if (error) {
		return { companies: [], error: error.message };
	}

	// Cast via unknown: passing a runtime-built column string means the Supabase
	// client cannot infer the row shape and widens it to GenericStringError[].
	// COMPANY_COLUMNS is kept in sync with Company by companyTypes.test.ts and
	// the satisfies clause, so the shape is guaranteed at the source instead.
	return { companies: (data ?? []) as unknown as Company[], error: null };
}
