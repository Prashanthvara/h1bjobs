import { describe, it, expect } from "vitest";
import { COMPANY_COLUMNS, type Company } from "./companyTypes";

describe("COMPANY_COLUMNS", () => {
	it("lists exactly the fields declared on the Company interface", () => {
		// TypeScript forces this literal to carry every Company field. If someone
		// adds a field to the interface without adding it to COMPANY_COLUMNS,
		// this test fails and the mismatch is caught before it ships.
		//
		// This catches OMISSIONS. The `satisfies` clause on COMPANY_COLUMNS
		// catches misspellings at compile time. Both are needed.
		const sample: Company = {
			id: "",
			name: "",
			location: "",
			h1b_approvals: 0,
			approvals_year: "",
			website: "",
			careers_url: "",
			linkedin_url: "",
			x_url: "",
			instagram_url: "",
			logo_url: "",
			exemptiondetails: "",
			tags: "",
			jobtitles: "",
			department: "",
			source: "",
		};

		expect([...COMPANY_COLUMNS].sort()).toEqual(Object.keys(sample).sort());
	});

	it("contains no duplicates", () => {
		expect(new Set(COMPANY_COLUMNS).size).toBe(COMPANY_COLUMNS.length);
	});

	it("does not use a wildcard", () => {
		expect(COMPANY_COLUMNS).not.toContain("*");
	});
});
