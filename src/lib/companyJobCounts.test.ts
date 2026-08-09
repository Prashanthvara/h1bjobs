import { describe, it, expect } from "vitest";
import { buildCompanyJobCounts } from "./companyJobCounts";
import type { OrgDateRow } from "./jobTypes";

/** `n` days before today, as the bare `YYYY-MM-DD` the job table stores. */
function daysAgo(n: number): string {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
		d.getDate()
	).padStart(2, "0")}`;
}

const stanford = { id: "c1", name: "Stanford University" };
const marine = { id: "c2", name: "Marine Biological Laboratory" };

function row(org: string | null, date: string | null): OrgDateRow {
	return { org, job_posting_date: date };
}

describe("buildCompanyJobCounts", () => {
	it("counts jobs from the last 30 days as `open`", () => {
		const counts = buildCompanyJobCounts(
			[stanford],
			[row("Stanford University", daysAgo(0)), row("Stanford University", daysAgo(29))]
		);
		expect(counts.c1.open).toBe(2);
	});

	it("excludes jobs older than the 30-day window", () => {
		const counts = buildCompanyJobCounts(
			[stanford],
			[row("Stanford University", daysAgo(0)), row("Stanford University", daysAgo(30))]
		);
		expect(counts.c1.open).toBe(1);
	});

	it("counts jobs from the last 7 days as `recent`", () => {
		const counts = buildCompanyJobCounts(
			[stanford],
			[
				row("Stanford University", daysAgo(0)),
				row("Stanford University", daysAgo(6)),
				row("Stanford University", daysAgo(7)),
			]
		);
		expect(counts.c1.open).toBe(3);
		expect(counts.c1.recent).toBe(2);
	});

	it("matches an employer across spelling variants", () => {
		const counts = buildCompanyJobCounts(
			[{ id: "c3", name: "The Johns Hopkins University" }],
			[row("Johns Hopkins University", daysAgo(1)), row("johns hopkins university", daysAgo(2))]
		);
		expect(counts.c3.open).toBe(2);
	});

	it("returns the most frequent spelling as the link target", () => {
		const counts = buildCompanyJobCounts(
			[stanford],
			[
				row("Stanford University", daysAgo(1)),
				row("Stanford University", daysAgo(2)),
				row("stanford university", daysAgo(3)),
			]
		);
		expect(counts.c1.org).toBe("Stanford University");
	});

	it("omits a company with no matching rows, rather than reporting zero", () => {
		const counts = buildCompanyJobCounts([stanford, marine], [row("Stanford University", daysAgo(1))]);
		expect(counts.c1).toBeDefined();
		expect(counts.c2).toBeUndefined();
	});

	it("omits a company whose only jobs fall outside the 30-day window", () => {
		const counts = buildCompanyJobCounts([stanford], [row("Stanford University", daysAgo(45))]);
		expect(counts.c1).toBeUndefined();
	});

	it("reports recent: 0 when the company has open jobs but none this week", () => {
		const counts = buildCompanyJobCounts([stanford], [row("Stanford University", daysAgo(20))]);
		expect(counts.c1.open).toBe(1);
		expect(counts.c1.recent).toBe(0);
	});

	it("ignores rows with a null org or a null date", () => {
		const counts = buildCompanyJobCounts(
			[stanford],
			[row(null, daysAgo(1)), row("Stanford University", null), row("Stanford University", daysAgo(1))]
		);
		expect(counts.c1.open).toBe(1);
	});

	it("returns an empty record for no companies and for no rows", () => {
		expect(buildCompanyJobCounts([], [row("Stanford University", daysAgo(1))])).toEqual({});
		expect(buildCompanyJobCounts([stanford], [])).toEqual({});
	});
});
