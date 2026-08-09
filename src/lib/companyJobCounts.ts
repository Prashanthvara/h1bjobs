import type { Company } from "@/lib/companyTypes";
import type { OrgDateRow } from "@/lib/jobTypes";
import { filterJobsByDateRange } from "@/lib/jobFilterUtils";
import { normalizeOrgName, pickOrgRepresentatives } from "@/lib/orgName";

export interface CompanyJobCount {
	/**
	 * The `job.org` spelling to put in the `?org=` link. Not `company.name`:
	 * the filter on the other end matches normalized org values, and linking
	 * the spelling the feed actually uses keeps the URL legible.
	 */
	org: string;
	/** Jobs posted in the last 30 days. Always > 0 — see buildCompanyJobCounts. */
	open: number;
	/** Jobs posted in the last 7 days. May be 0. */
	recent: number;
}

/** Keyed by `company.id`. A missing key means "nothing to show for this employer". */
export type CompanyJobCounts = Record<string, CompanyJobCount>;

/**
 * Per-company open-job counts, derived from the job feed.
 *
 * Companies with no jobs in the 30-day window are OMITTED rather than
 * recorded as zero. That keeps the /companies RSC payload proportional to the
 * employers actually hiring, and gives the card one check to make.
 *
 * The window boundaries come from `filterJobsByDateRange`, not from local date
 * arithmetic, so "47 open jobs" on a card and the "Last 30 days" option its
 * link applies are the same predicate by construction.
 *
 * Timezone note: this runs on the server (UTC on Workers, the build machine's
 * zone during prerender) while the same filter re-runs in the visitor's zone
 * on the jobs page. Around the UTC date rollover the two windows can differ by
 * a day — `job_posting_date` is a bare `YYYY-MM-DD` with no timezone, so this
 * is the same documented skew that already applies to the tab badge.
 */
export function buildCompanyJobCounts(
	companies: ReadonlyArray<Pick<Company, "id" | "name">>,
	rows: ReadonlyArray<OrgDateRow>
): CompanyJobCounts {
	const representatives = pickOrgRepresentatives(rows.map((r) => r.org));

	const openByOrg = countByOrg(filterJobsByDateRange("30d", [...rows]));
	const recentByOrg = countByOrg(filterJobsByDateRange("7d", [...rows]));

	const counts: CompanyJobCounts = {};
	for (const company of companies) {
		const key = normalizeOrgName(company.name);
		const open = openByOrg.get(key) ?? 0;
		if (open === 0) continue;

		counts[company.id] = {
			org: representatives.get(key) ?? company.name,
			open,
			recent: recentByOrg.get(key) ?? 0,
		};
	}

	return counts;
}

function countByOrg(rows: OrgDateRow[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const { org } of rows) {
		const key = normalizeOrgName(org);
		if (!key) continue;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return counts;
}
