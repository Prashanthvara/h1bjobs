import type { JobDateRange } from "@/lib/jobTypes";

export interface JobUrlFilterValues {
	org?: string;
	dateRange?: JobDateRange;
}

const DATE_RANGES: readonly JobDateRange[] = ["24h", "7d", "30d"];

function isDateRange(value: string): value is JobDateRange {
	return (DATE_RANGES as readonly string[]).includes(value);
}

/**
 * Reads the filters a /companies card can request via the URL.
 *
 * Both params are dropped rather than defaulted when unusable: a typo in
 * `range` should leave the feed unfiltered, not silently narrow it to a window
 * the visitor did not ask for. `org` is matched loosely downstream by
 * `filterJobsByOrg`, so it is passed through with only whitespace trimmed.
 */
export function parseJobUrlFilters(params: URLSearchParams): JobUrlFilterValues {
	const values: JobUrlFilterValues = {};

	const org = params.get("org")?.trim();
	if (org) values.org = org;

	const range = params.get("range")?.trim();
	if (range && isDateRange(range)) values.dateRange = range;

	return values;
}
