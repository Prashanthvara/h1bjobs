import { describe, it, expect } from "vitest";
import { OG_IMAGE, OG_SITE_NAME, routeMetadata } from "./sharedMetadata";

const input = {
	title: "Example Title",
	description: "Example description.",
	path: "/example",
};

describe("routeMetadata", () => {
	// The reason this builder exists. Next merges metadata shallowly, so a page
	// defining openGraph by hand replaces the root layout's object outright and
	// silently loses the site's og:image — with no failing build, typecheck, or
	// test to catch it. These two assertions are the guard.
	it("always carries the shared Open Graph image", () => {
		expect(routeMetadata(input).openGraph?.images).toEqual([OG_IMAGE]);
	});

	it("always carries the shared Twitter image", () => {
		expect(routeMetadata(input).twitter?.images).toEqual([OG_IMAGE.url]);
	});

	it("always carries the shared site name", () => {
		const openGraph = routeMetadata(input).openGraph;
		expect(openGraph && "siteName" in openGraph ? openGraph.siteName : undefined).toBe(OG_SITE_NAME);
	});

	it("points the canonical and og:url at the same path", () => {
		const result = routeMetadata(input);
		expect(result.alternates?.canonical).toBe("/example");
		expect(result.openGraph?.url).toBe("/example");
	});

	it("reuses the page title for social cards by default", () => {
		const result = routeMetadata(input);
		expect(result.openGraph?.title).toBe("Example Title");
		expect(result.twitter?.title).toBe("Example Title");
	});

	it("lets a route override the social title without changing the page title", () => {
		const result = routeMetadata({ ...input, socialTitle: "Short Title" });
		expect(result.title).toBe("Example Title");
		expect(result.openGraph?.title).toBe("Short Title");
		expect(result.twitter?.title).toBe("Short Title");
	});
});
