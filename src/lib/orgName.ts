/**
 * The join key between `company.name` and `job.org`.
 *
 * There is no foreign key between the two tables — `job.org` is whatever the
 * scraper found on the listing — so "the same employer" is decided here and
 * nowhere else. Both the per-company counts (companyJobCounts.ts) and the
 * employer filter on the jobs page (jobFilterUtils.ts) call this, which is
 * what makes the number on a company card agree with the list behind its
 * link. Loosening this function widens both at once; that is deliberate.
 *
 * Punctuation is removed rather than mapped, so "St. Jude" and "St Jude"
 * collapse together. Only a LEADING "the" is dropped — "Museum of the City of
 * New York" must keep its own.
 *
 * Apostrophes are deleted in a separate pass BEFORE the rest of the
 * punctuation becomes whitespace. Folding them in with everything else would
 * split a word in half — "Children's" would normalize to "children s" and stop
 * matching "Childrens", which is exactly the near-miss spelling this function
 * exists to absorb. Both the straight and the typographic apostrophe are
 * handled; scrapers emit either.
 */
export function normalizeOrgName(value: string | null | undefined): string {
	if (!value) return "";

	return value
		.toLowerCase()
		.replace(/['’ʼ]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.replace(/^the /, "");
}

/**
 * One display spelling per normalized employer, chosen by frequency.
 *
 * The feed contains the same employer under several spellings. Whichever one
 * this returns is what appears in the employer dropdown and what goes into the
 * `?org=` link, so it must not change between two runs over the same data:
 * frequency first, then collation to break ties.
 *
 * `caseFirst: "upper"` is not cosmetic sugar on the tiebreak. ICU's default
 * collation sorts lowercase ahead of uppercase, so a plain `localeCompare`
 * would resolve a tie between "Stanford University" and "stanford university"
 * in favour of the lowercase one and print that in the dropdown. Both orders
 * are deterministic; this one also picks the spelling worth showing.
 */
export function pickOrgRepresentatives(
	orgs: ReadonlyArray<string | null | undefined>
): Map<string, string> {
	const variantCounts = new Map<string, Map<string, number>>();

	for (const org of orgs) {
		const key = normalizeOrgName(org);
		if (!key) continue;

		const raw = String(org).trim();
		const variants = variantCounts.get(key) ?? new Map<string, number>();
		variants.set(raw, (variants.get(raw) ?? 0) + 1);
		variantCounts.set(key, variants);
	}

	const representatives = new Map<string, string>();
	for (const [key, variants] of variantCounts) {
		const best = [...variants.entries()].sort((a, b) => {
			const byCount = b[1] - a[1];
			if (byCount !== 0) return byCount;
			return a[0].localeCompare(b[0], "en", { caseFirst: "upper" });
		})[0][0];
		representatives.set(key, best);
	}

	return representatives;
}
