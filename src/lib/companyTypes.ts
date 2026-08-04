export interface Company {
    id: string;
    name: string;
    location: string;
    h1b_approvals: number;
    approvals_year: string;
    website: string;
    careers_url: string;
    linkedin_url: string;
    x_url: string;
    instagram_url: string;
    logo_url: string;
    exemptiondetails: string;
    tags: string;
    jobtitles: string;
    department: string;
    source: string;
}

/**
 * The exact columns fetched from the `company` table.
 *
 * Must stay in sync with the Company interface above. Two independent guards:
 * the `satisfies` clause below rejects a misspelled or non-existent column at
 * compile time (a typo'd "sorce" fails with TS2820), and the runtime test in
 * companyTypes.test.ts catches an omitted column, which `satisfies` alone does
 * NOT detect. Keep both.
 *
 * Never replace with select("*"): fetchCompanies() results are passed into
 * CompaniesClient, a client component, so every selected column is serialized
 * into the RSC payload and delivered to every visitor of /companies. The home
 * route no longer receives these rows at all — it fetches the much narrower
 * COMPANY_SUMMARY_COLUMNS instead.
 */
export const COMPANY_COLUMNS = [
    "id",
    "name",
    "location",
    "h1b_approvals",
    "approvals_year",
    "website",
    "careers_url",
    "linkedin_url",
    "x_url",
    "instagram_url",
    "logo_url",
    "exemptiondetails",
    "tags",
    "jobtitles",
    "department",
    "source",
] as const satisfies readonly (keyof Company)[];

/**
 * The subset of company fields the home page needs.
 *
 * `/` cannot skip the company table entirely — job cards render company logos
 * via buildOrgLogoMap in JobsList.tsx — but it has no use for the other
 * fourteen columns. Selecting only these two keeps `exemptiondetails`
 * (multi-sentence prose, per company) out of the RSC payload that every jobs
 * visitor downloads. The full row set is fetched only by /companies.
 */
export type CompanySummary = Pick<Company, "name" | "logo_url">;

/**
 * The exact columns fetched by `fetchCompanySummaries`.
 *
 * Guarded the same way as COMPANY_COLUMNS: `satisfies` rejects a misspelled
 * column at compile time, companyTypes.test.ts catches an omitted one at run
 * time. Keep both.
 */
export const COMPANY_SUMMARY_COLUMNS = [
    "name",
    "logo_url",
] as const satisfies readonly (keyof CompanySummary)[];
