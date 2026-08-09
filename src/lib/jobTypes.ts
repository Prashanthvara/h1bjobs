export interface Job {
    job_id: string;
    org: string | null;
    job_title: string | null;
    location: string[] | string | null;
    job_posting_date: string | null;
    url: string | null;
    is_visa: boolean | null;
    keywords: string[] | string | null;
    department: string[] | string | null;
}

/**
 * The two-column projection of `Job` used to count jobs per employer.
 *
 * Declared beside `Job` rather than in companyJobCounts.ts so that jobData.ts,
 * which fetches these rows, does not have to import a type from a module that
 * consumes them.
 */
export interface OrgDateRow {
    org: Job["org"];
    job_posting_date: Job["job_posting_date"];
}

export type JobDateRange = "24h" | "7d" | "30d";
