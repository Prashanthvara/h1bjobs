import { describe, it, expect } from "vitest";
import { getThirtyDayCutoff } from "./jobData";
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
