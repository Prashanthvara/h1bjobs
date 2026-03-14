export interface Job {
    job_id: string;
    org: string | null;
    job_title: string | null;
    location: string[] | string | null;
    job_posting_date: string | null;
    url: string | null;
    is_visa: boolean | null;
    keywords: string[] | string | null;
}

export type JobDateRange = "24h" | "7d" | "30d";
