import { describe, it, expect } from "vitest";
import { safeHref } from "./safeHref";

// Control characters are built from char codes so this file stays free of
// literal control bytes, which are invisible in diffs and easy to mangle.
const TAB = String.fromCharCode(9);
const NEWLINE = String.fromCharCode(10);
const NUL = String.fromCharCode(0);
const DEL = String.fromCharCode(127);

describe("safeHref", () => {
	it("allows https URLs unchanged", () => {
		expect(safeHref("https://example.com/jobs/1")).toBe("https://example.com/jobs/1");
	});

	it("allows http URLs unchanged", () => {
		// Deliberately NOT https-only: live job links may legitimately be http,
		// and silently dropping them would lose real listings.
		expect(safeHref("http://example.com")).toBe("http://example.com");
	});

	it("allows query strings and hashes", () => {
		expect(safeHref("https://ex.com/jobs?id=1&ref=a")).toBe("https://ex.com/jobs?id=1&ref=a");
		expect(safeHref("https://ex.com/jobs#section")).toBe("https://ex.com/jobs#section");
		expect(safeHref("https://ex.com/a?b=1#c")).toBe("https://ex.com/a?b=1#c");
	});

	it("allows root-relative paths", () => {
		expect(safeHref("/logos/stanford-university.png")).toBe("/logos/stanford-university.png");
	});

	it("blocks javascript: URIs", () => {
		expect(safeHref("javascript:alert(1)")).toBe("");
	});

	it("blocks javascript: regardless of case and padding", () => {
		expect(safeHref("  JaVaScRiPt:alert(1)")).toBe("");
	});

	it("blocks javascript: with embedded control characters", () => {
		expect(safeHref("java" + TAB + "script:alert(1)")).toBe("");
		expect(safeHref("java" + NEWLINE + "script:alert(1)")).toBe("");
		expect(safeHref("java" + NUL + "script:alert(1)")).toBe("");
		expect(safeHref("java" + DEL + "script:alert(1)")).toBe("");
	});

	it("blocks scheme-prefixed javascript:", () => {
		expect(safeHref("https:javascript:alert(1)")).toBe("");
		expect(safeHref("http:javascript:alert(1)")).toBe("");
	});

	it("blocks data: URIs", () => {
		expect(safeHref("data:text/html,<script>alert(1)</script>")).toBe("");
	});

	it("blocks vbscript: URIs", () => {
		expect(safeHref("vbscript:msgbox(1)")).toBe("");
	});

	it("blocks protocol-relative URLs", () => {
		expect(safeHref("//evil.com/path")).toBe("");
	});

	it("blocks backslash protocol-relative URLs", () => {
		// Browsers normalise \ to / when resolving. Without the backslash
		// normalisation in safeHref, these pass the root-relative check and
		// then navigate offsite. Verified: new URL("/\\evil.com", origin)
		// resolves to https://evil.com/.
		expect(safeHref("/" + "\\" + "evil.com")).toBe("");
		expect(safeHref("/" + "\\" + "/evil.com")).toBe("");
		expect(safeHref("\\" + "\\" + "evil.com")).toBe("");
		expect(safeHref("/" + "\\" + "\\" + "evil.com")).toBe("");
		expect(safeHref("\\" + "/evil.com")).toBe("");
	});

	it("returns empty string for null, undefined and empty input", () => {
		expect(safeHref(null)).toBe("");
		expect(safeHref(undefined)).toBe("");
		expect(safeHref("")).toBe("");
		expect(safeHref("   ")).toBe("");
	});

	it("blocks bare words that are not URLs", () => {
		expect(safeHref("example.com")).toBe("");
	});

	it("trims surrounding whitespace from valid URLs", () => {
		expect(safeHref("  https://example.com  ")).toBe("https://example.com");
	});

	it("preserves real production values", () => {
		expect(safeHref("/logos/mayo-clinic.png")).toBe("/logos/mayo-clinic.png");
		expect(safeHref("https://careers.stanford.edu/jobs/123")).toBe("https://careers.stanford.edu/jobs/123");
	});
});
