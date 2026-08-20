import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the site-wide rule that external links open in a new tab.
 *
 * Three <a> tags in the CompanyList "Read More" footer shipped without
 * target/rel, so clicking a source citation navigated the visitor off the
 * site with no way back except the back button. Every other external link
 * already had them, which is exactly the kind of drift a unit test on pure
 * logic cannot catch — so this test reads the component sources instead.
 *
 * There is no jsdom or testing-library here, and adding one to assert two
 * attributes would cost more than it returns.
 *
 * The rule is deliberately inverted: a link is treated as EXTERNAL unless
 * its href is provably same-site. Trusting a recognised-external list
 * instead would wave through href={someUrl}, which is the shape a future
 * offsite link is most likely to take.
 */

const SCAN_DIRS = ["src/components", "src/app"];

/**
 * Same-site links whose href is an expression this scanner cannot read.
 *
 * Keyed by href text rather than line number so the entry survives edits
 * above it. Keep this list short: every entry is a link nothing checks.
 */
const SAME_SITE_EXCEPTIONS = [
	{
		file: "ExploreTabs.tsx",
		href: "href={tab.href}",
		why: "tabs is a local const in the same file holding '/' and '/companies'",
	},
];

function tsxFilesIn(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory()
			? tsxFilesIn(join(dir, entry.name))
			: entry.name.endsWith(".tsx")
				? [join(dir, entry.name)]
				: [],
	);
}

/**
 * Returns the opening tag text of every <a> and <Link> in `source`.
 *
 * A regex up to the first ">" is not enough: attributes span multiple lines
 * here, and an arrow function inside a JSX expression ("onClick={() => …}")
 * contains a ">" that does not end the tag. So this walks the characters,
 * tracking quote and brace depth, and stops at the first ">" that sits at
 * brace depth zero outside a string.
 */
function openingTags(source: string): { text: string; line: number }[] {
	const tags: { text: string; line: number }[] = [];
	const starts = /<(a|Link)(?=[\s/>])/g;
	let match: RegExpExecArray | null;

	while ((match = starts.exec(source)) !== null) {
		let i = match.index + match[0].length;
		let depth = 0;
		let quote: string | null = null;

		while (i < source.length) {
			const char = source[i];
			if (quote) {
				if (char === quote) quote = null;
			} else if (char === '"' || char === "'" || char === "`") {
				quote = char;
			} else if (char === "{") {
				depth++;
			} else if (char === "}") {
				depth--;
			} else if (char === ">" && depth === 0) {
				break;
			}
			i++;
		}

		tags.push({
			text: source.slice(match.index, i + 1),
			line: source.slice(0, match.index).split("\n").length,
		});
	}

	return tags;
}

/** A path literal ("/companies", "#top") or template literal ("`/?org=…`"). */
function isProvablySameSite(tag: string): boolean {
	return /href="[/#]/.test(tag) || /href=\{`[/#]/.test(tag);
}

function isExcepted(file: string, tag: string): boolean {
	return SAME_SITE_EXCEPTIONS.some(
		(entry) => file.endsWith(entry.file) && tag.includes(entry.href),
	);
}

function linksNeedingNewTab() {
	return SCAN_DIRS.flatMap(tsxFilesIn).flatMap((file) => {
		const source = readFileSync(file, "utf8");
		return openingTags(source)
			.filter((tag) => /\bhref=/.test(tag.text))
			.filter((tag) => !isProvablySameSite(tag.text))
			.filter((tag) => !isExcepted(file, tag.text))
			.map((tag) => ({ ...tag, file }));
	});
}

describe("external links", () => {
	it("finds external links to check", () => {
		expect(linksNeedingNewTab().length).toBeGreaterThan(0);
	});

	it("opens every external link in a new tab", () => {
		const offenders = linksNeedingNewTab()
			.filter((link) => !/target="_blank"/.test(link.text))
			.map((link) => `${link.file}:${link.line} is missing target="_blank"`);

		expect(offenders).toEqual([]);
	});

	it("pairs every new-tab link with rel=noopener noreferrer", () => {
		const offenders = SCAN_DIRS.flatMap(tsxFilesIn).flatMap((file) =>
			openingTags(readFileSync(file, "utf8"))
				.filter((tag) => /target="_blank"/.test(tag.text))
				.filter((tag) => !/rel="noopener noreferrer"/.test(tag.text))
				.map((tag) => `${file}:${tag.line} is missing rel="noopener noreferrer"`),
		);

		expect(offenders).toEqual([]);
	});

	it("has no stale same-site exceptions", () => {
		const sources = SCAN_DIRS.flatMap(tsxFilesIn).map((file) => ({
			file,
			text: readFileSync(file, "utf8"),
		}));

		const stale = SAME_SITE_EXCEPTIONS.filter(
			(entry) =>
				!sources.some(
					({ file, text }) => file.endsWith(entry.file) && text.includes(entry.href),
				),
		).map((entry) => `${entry.file} no longer contains ${entry.href}`);

		expect(stale).toEqual([]);
	});
});
