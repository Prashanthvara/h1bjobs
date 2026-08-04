import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
	Company,
	CompanySummary,
	COMPANY_COLUMNS,
	COMPANY_SUMMARY_COLUMNS,
} from "@/lib/companyTypes";

const MISSING_CREDENTIALS =
	"Supabase credentials are missing. Add SUPABASE_URL and SUPABASE_ANON_KEY.";

function getClient(): SupabaseClient | null {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseAnonKey) return null;
	return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Every company, every column. Used by /companies, which renders the full
 * employer directory. Do not call this from the home route — see
 * fetchCompanySummaries.
 */
export async function fetchCompanies(): Promise<{ companies: Company[]; error: string | null }> {
	const supabase = getClient();
	if (!supabase) {
		return { companies: [], error: MISSING_CREDENTIALS };
	}

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

/**
 * Name and logo for every company, for the home route's job-card logos and
 * its "Explore Companies" tab count.
 *
 * The tab count is the length of this result rather than a separate `head:
 * true` query. That differs from fetchVisaJobCount, which is deliberately
 * decoupled from fetchVisaJobs because Supabase caps responses at 1000 rows
 * and the job count exceeds what the row query returns. The company table is
 * ~16 rows and this select is unbounded, so length is the true total. Revisit
 * if the company table ever approaches 1000 rows.
 */
export async function fetchCompanySummaries(): Promise<{ companies: CompanySummary[]; error: string | null }> {
	const supabase = getClient();
	if (!supabase) {
		return { companies: [], error: MISSING_CREDENTIALS };
	}

	const { data, error } = await supabase
		.from("company")
		.select(COMPANY_SUMMARY_COLUMNS.join(", "))
		.order("h1b_approvals", { ascending: false });

	if (error) {
		return { companies: [], error: error.message };
	}

	// Same unknown-cast rationale as fetchCompanies above.
	return { companies: (data ?? []) as unknown as CompanySummary[], error: null };
}
