import { describe, it, expect } from "vitest";
import { COMPANY_COLUMNS, COMPANY_SUMMARY_COLUMNS, type Company, type CompanySummary } from "./companyTypes";

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

describe("COMPANY_SUMMARY_COLUMNS", () => {
	it("lists exactly the fields declared on the CompanySummary type", () => {
		// Same guard as COMPANY_COLUMNS above: `satisfies` catches a misspelled
		// column at compile time, this catches an omitted one at run time.
		const sample: CompanySummary = {
			name: "",
			logo_url: "",
		};

		expect([...COMPANY_SUMMARY_COLUMNS].sort()).toEqual(Object.keys(sample).sort());
	});

	it("contains no duplicates", () => {
		expect(new Set(COMPANY_SUMMARY_COLUMNS).size).toBe(COMPANY_SUMMARY_COLUMNS.length);
	});

	it("does not use a wildcard", () => {
		expect(COMPANY_SUMMARY_COLUMNS).not.toContain("*");
	});

	it("selects strictly fewer columns than the full company query", () => {
		// The whole point of this projection is that it is smaller. If it ever
		// grows to match COMPANY_COLUMNS, the homepage payload saving is gone
		// and the second query is pure overhead.
		expect(COMPANY_SUMMARY_COLUMNS.length).toBeLessThan(COMPANY_COLUMNS.length);
	});

	it("only names columns that exist in the full company query", () => {
		const fullColumns = new Set<string>(COMPANY_COLUMNS);
		COMPANY_SUMMARY_COLUMNS.forEach((column) => {
			expect(fullColumns.has(column)).toBe(true);
		});
	});
});
