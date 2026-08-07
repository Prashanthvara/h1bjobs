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
 * Single query body shared by every company projection.
 *
 * The exported fetchers differ only in which column list they pass, so that
 * difference is a visible argument here rather than two near-identical copies
 * of this function. Copies would let a future edit silently widen the home
 * route's projection back to every column — a change no test or typecheck
 * would catch, because the cast below erases the row shape either way.
 *
 * Cast via unknown: passing a runtime-built column string means the Supabase
 * client cannot infer the row shape and widens it to GenericStringError[]. The
 * column constants are kept in sync with their types by companyTypes.test.ts
 * and their satisfies clauses, so the shape is guaranteed at the source.
 */
async function fetchCompanyRows<T>(
	columns: readonly string[]
): Promise<{ companies: T[]; error: string | null }> {
	const supabase = getClient();
	if (!supabase) {
		return { companies: [], error: MISSING_CREDENTIALS };
	}

	const { data, error } = await supabase
		.from("company")
		.select(columns.join(", "))
		.order("h1b_approvals", { ascending: false });

	if (error) {
		return { companies: [], error: error.message };
	}

	return { companies: (data ?? []) as unknown as T[], error: null };
}

/**
 * Every company, every column. Used by /companies, which renders the full
 * employer directory. Do not call this from the home route — see
 * fetchCompanySummaries.
 */
export function fetchCompanies(): Promise<{ companies: Company[]; error: string | null }> {
	return fetchCompanyRows<Company>(COMPANY_COLUMNS);
}

/**
 * Name and logo for every company, for the home route's job-card logos and
 * its "Explore Companies" tab count.
 *
 * The tab count is the length of this result rather than a separate `head:
 * true` query. That differs from fetchVisaJobCount, which is deliberately
 * decoupled from fetchVisaJobs because Supabase caps responses at 1000 rows
 * and the job count exceeds what the row query returns. The company table is
 * a few dozen rows and this select is unbounded, so length is the true total.
 * Revisit if the company table ever approaches 1000 rows (Supabase's default
 * max rows per response).
 */
export function fetchCompanySummaries(): Promise<{ companies: CompanySummary[]; error: string | null }> {
	return fetchCompanyRows<CompanySummary>(COMPANY_SUMMARY_COLUMNS);
}
