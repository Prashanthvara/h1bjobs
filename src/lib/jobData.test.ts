import { describe, it, expect } from "vitest";
import { getThirtyDayCutoff } from "./jobData";

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
