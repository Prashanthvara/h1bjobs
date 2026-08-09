import { describe, it, expect } from "vitest";
import { normalizeOrgName, pickOrgRepresentatives } from "./orgName";

describe("normalizeOrgName", () => {
	it("lowercases", () => {
		expect(normalizeOrgName("Stanford University")).toBe("stanford university");
	});

	it("collapses runs of whitespace and trims", () => {
		expect(normalizeOrgName("  Yale   University ")).toBe("yale university");
	});

	it("drops punctuation so 'St. Jude' matches 'St Jude'", () => {
		expect(normalizeOrgName("St. Jude Children's Research Hospital")).toBe(
			normalizeOrgName("St Jude Childrens Research Hospital")
		);
	});

	it("deletes apostrophes instead of splitting the word around them", () => {
		// Turning "'" into a space would yield "children s", which matches
		// nothing. Both apostrophe characters must behave the same way.
		expect(normalizeOrgName("Children's Hospital")).toBe("childrens hospital");
		expect(normalizeOrgName("Children’s Hospital")).toBe("childrens hospital");
	});

	it("drops a leading 'The'", () => {
		expect(normalizeOrgName("The Johns Hopkins University")).toBe("johns hopkins university");
	});

	it("does not drop 'the' anywhere but the start", () => {
		expect(normalizeOrgName("Museum of the City of New York")).toBe(
			"museum of the city of new york"
		);
	});

	it("returns an empty string for null, undefined, and blank input", () => {
		expect(normalizeOrgName(null)).toBe("");
		expect(normalizeOrgName(undefined)).toBe("");
		expect(normalizeOrgName("   ")).toBe("");
		// A name that is nothing but punctuation must not become a key that
		// every other empty-ish value also collapses into.
		expect(normalizeOrgName("---")).toBe("");
	});
});

describe("pickOrgRepresentatives", () => {
	it("groups spelling variants under one normalized key", () => {
		const reps = pickOrgRepresentatives(["Stanford University", "stanford university"]);
		expect(reps.size).toBe(1);
		expect(reps.has("stanford university")).toBe(true);
	});

	it("chooses the most frequent spelling", () => {
		const reps = pickOrgRepresentatives([
			"stanford university",
			"Stanford University",
			"Stanford University",
		]);
		expect(reps.get("stanford university")).toBe("Stanford University");
	});

	it("breaks frequency ties deterministically, preferring the title-cased spelling", () => {
		// ICU's default collation would hand this tie to the lowercase variant,
		// which then becomes the dropdown label and the ?org= value. The
		// caseFirst option is what keeps the nicer spelling.
		const reps = pickOrgRepresentatives(["stanford university", "Stanford University"]);
		expect(reps.get("stanford university")).toBe("Stanford University");
	});

	it("breaks ties between distinct names alphabetically", () => {
		const reps = pickOrgRepresentatives(["Yale University", "yale university"]);
		expect(reps.get("yale university")).toBe("Yale University");
	});

	it("ignores null, undefined, and blank entries", () => {
		const reps = pickOrgRepresentatives([null, undefined, "", "  ", "Yale University"]);
		expect([...reps.keys()]).toEqual(["yale university"]);
	});

	it("returns an empty map for an empty input", () => {
		expect(pickOrgRepresentatives([]).size).toBe(0);
	});
});
