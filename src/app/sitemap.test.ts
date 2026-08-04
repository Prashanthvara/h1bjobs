import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
	it("lists the home, companies, and about routes", () => {
		const paths = sitemap().map((entry) => new URL(entry.url).pathname);
		expect(paths.sort()).toEqual(["/", "/about", "/companies"]);
	});

	it("ranks companies above about and below home", () => {
		const byPath = new Map(
			sitemap().map((entry) => [new URL(entry.url).pathname, entry.priority])
		);
		expect(byPath.get("/")).toBe(1);
		expect(byPath.get("/companies")).toBe(0.8);
		expect(byPath.get("/about")).toBe(0.5);
	});

	it("emits no duplicate URLs", () => {
		const urls = sitemap().map((entry) => entry.url);
		expect(new Set(urls).size).toBe(urls.length);
	});
});
