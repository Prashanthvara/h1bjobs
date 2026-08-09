import { describe, it, expect } from "vitest";
import { parseJobUrlFilters } from "./jobUrlFilters";

const parse = (query: string) => parseJobUrlFilters(new URLSearchParams(query));

describe("parseJobUrlFilters", () => {
	it("reads the employer from ?org=", () => {
		expect(parse("org=Stanford+University")).toEqual({ org: "Stanford University" });
	});

	it("reads the date range from ?range=", () => {
		expect(parse("org=Stanford&range=30d")).toEqual({
			org: "Stanford",
			dateRange: "30d",
		});
	});

	it("accepts every supported range", () => {
		expect(parse("range=24h").dateRange).toBe("24h");
		expect(parse("range=7d").dateRange).toBe("7d");
		expect(parse("range=30d").dateRange).toBe("30d");
	});

	it("ignores an unrecognized range instead of filtering to nothing", () => {
		expect(parse("range=all-time")).toEqual({});
	});

	it("ignores a blank or whitespace-only org", () => {
		expect(parse("org=")).toEqual({});
		expect(parse("org=+++")).toEqual({});
	});

	it("trims surrounding whitespace from the org", () => {
		expect(parse("org=++Stanford+University++")).toEqual({ org: "Stanford University" });
	});

	it("returns an empty object for no params", () => {
		expect(parse("")).toEqual({});
	});
});
