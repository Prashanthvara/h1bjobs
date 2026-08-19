import { describe, it, expect } from "vitest";
import { getThirtyDayCutoff, VISA_JOB_COLUMNS, VISA_JOB_ORG_COLUMNS } from "./jobData";
import { filterJobsByDateRange } from "./jobFilterUtils";
import type { Job } from "./jobTypes";

describe("getThirtyDayCutoff", () => {
	it("returns the date 29 days earlier, giving a 30-day inclusive window", () => {
		expect(getThirtyDayCutoff(new Date(2026, 7, 2))).toBe("2026-07-04");
	});

	it("zero-pads single-digit months and days", () => {
		expect(getThirtyDayCutoff(new Date(2026, 1, 5))).toBe("2026-01-07");
	});

	it("crosses a year boundary correctly", () => {
		expect(getThirtyDayCutoff(new Date(2026, 0, 15))).toBe("2025-12-17");
	});

	it("crosses a 28-day February correctly (2026 is not a leap year)", () => {
		expect(getThirtyDayCutoff(new Date(2026, 2, 1))).toBe("2026-01-31");
	});

	it("ignores time of day, anchoring to the start of the day", () => {
		const morning = getThirtyDayCutoff(new Date(2026, 7, 2, 0, 1));
		const night = getThirtyDayCutoff(new Date(2026, 7, 2, 23, 59));
		expect(morning).toBe(night);
		expect(morning).toBe("2026-07-04");
	});
});

// The badge counts jobs on or after getThirtyDayCutoff(); the "Last 30 days"
// filter narrows the same feed independently. Both hardcode a 29-day window,
// so editing either one alone silently makes the badge disagree with the
// filter. These assertions fail if that ever happens.
describe("getThirtyDayCutoff agrees with the '30d' filter boundary", () => {
	const job = (date: string) => ({ job_posting_date: date }) as Job;

	function dayBefore(isoDate: string): string {
		const [y, m, d] = isoDate.split("-").map(Number);
		const prev = new Date(y, m - 1, d - 1);
		return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(
			prev.getDate()
		).padStart(2, "0")}`;
	}

	it("keeps a job posted exactly on the cutoff", () => {
		const cutoff = getThirtyDayCutoff();
		expect(filterJobsByDateRange("30d", [job(cutoff)])).toHaveLength(1);
	});

	it("drops a job posted the day before the cutoff", () => {
		const cutoff = getThirtyDayCutoff();
		expect(filterJobsByDateRange("30d", [job(dayBefore(cutoff))])).toHaveLength(0);
	});
});

describe("VISA_JOB_ORG_COLUMNS", () => {
	it("selects exactly the two fields buildCompanyJobCounts reads", () => {
		// Widening this projection costs bandwidth on every /companies
		// regeneration for data nothing renders; narrowing it silently zeroes
		// every count. Both directions fail here.
		expect([...VISA_JOB_ORG_COLUMNS].sort()).toEqual(["job_posting_date", "org"]);
	});

	it("does not use a wildcard", () => {
		expect(VISA_JOB_ORG_COLUMNS).not.toContain("*");
	});
});

describe("VISA_JOB_COLUMNS", () => {
	it("selects exactly the nine fields the home feed renders", () => {
		// This projection is delivered to every visitor inside the RSC payload.
		// Adding a column here costs bandwidth on every home page load; removing
		// one blanks a field on the job card. Both directions fail this test.
		expect([...VISA_JOB_COLUMNS].sort()).toEqual([
			"department",
			"is_visa",
			"job_id",
			"job_posting_date",
			"job_title",
			"keywords",
			"location",
			"org",
			"url",
		]);
	});

	it("does not use a wildcard", () => {
		expect(VISA_JOB_COLUMNS).not.toContain("*");
	});

	it("includes the three fields ranking depends on", () => {
		// rankJobs groups by employer and department and scores by posting date.
		// If any of these leaves the projection, ranking silently degrades to
		// one undifferentiated group rather than failing loudly.
		expect(VISA_JOB_COLUMNS).toContain("org");
		expect(VISA_JOB_COLUMNS).toContain("department");
		expect(VISA_JOB_COLUMNS).toContain("job_posting_date");
	});
});
