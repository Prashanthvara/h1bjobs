/**
 * Validates a URL before it is placed in an href attribute.
 *
 * Job and company URLs come from Supabase, which is populated from external
 * aggregation. Next.js <Link> does not filter javascript: URIs, and this site's
 * CSP allows 'unsafe-inline', so a hostile row would otherwise be click-to-execute.
 *
 * Returns the trimmed URL when safe, or "" when not. Empty string is falsy, so
 * existing `{company.website && ...}` guards at call sites keep working unchanged.
 *
 * Normalisation is used only to DECIDE safety; the original trimmed string is
 * returned. The normalised form cannot be returned because it is lowercased, and
 * asset paths like /logos/Foo.png are case-sensitive.
 */
export function safeHref(url: string | null | undefined): string {
	if (!url) return "";

	const trimmed = url.trim();
	const normalized = trimmed
		// Strip characters browsers ignore when parsing a scheme. Without this,
		// "java\tscript:alert(1)" would slip past a naive prefix check.
		.replace(/[\u0000-\u0020\u007f]/g, "")
		// Browsers treat \ as / when resolving URLs, so "/\evil.com" resolves to
		// https://evil.com/. Normalising here means the // check below catches it.
		// Verified bypass - do not remove.
		.replace(/\\/g, "/")
		.toLowerCase();

	if (!normalized) return "";

	// Protocol-relative ("//evil.com") inherits the page scheme and points offsite.
	if (normalized.startsWith("//")) return "";

	// Root-relative paths are same-origin and cannot carry a scheme.
	if (normalized.startsWith("/")) return trimmed;

	if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
		return trimmed;
	}

	// Anything else: bare words, javascript:, data:, vbscript:, mailto:,
	// scheme-prefixed payloads like "https:javascript:", unknown schemes.
	return "";
}
