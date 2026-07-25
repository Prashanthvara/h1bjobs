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
 * HomeClient, a client component, so every selected column is serialized into
 * the RSC payload and delivered to every visitor's browser.
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
