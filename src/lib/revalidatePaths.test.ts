import { describe, it, expect } from "vitest";
import { REVALIDATE_PATHS } from "./revalidatePaths";

describe("REVALIDATE_PATHS", () => {
	it("covers both routes that render Supabase data", () => {
		// /companies is easy to forget here. If it is missing, a company edit
		// stays invisible until the 24-hour ISR window expires on its own.
		expect([...REVALIDATE_PATHS].sort()).toEqual(["/", "/companies"]);
	});

	it("contains no duplicates", () => {
		expect(new Set(REVALIDATE_PATHS).size).toBe(REVALIDATE_PATHS.length);
	});
});
