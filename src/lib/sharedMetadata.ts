import type { Metadata } from "next";

/**
 * Social-preview fields every route must restate.
 *
 * Next merges metadata shallowly: a page that sets `openGraph` REPLACES the
 * root layout's `openGraph` wholesale rather than merging into it. Any route
 * defining its own og:title therefore drops the site's og:image unless it
 * spreads these back in. Import and spread these instead of retyping them.
 */
export const OG_IMAGE = {
	url: "/og-image.png",
	width: 1200,
	height: 630,
	alt: "H1B Cap Exempt Jobs — Visa-Sponsored Jobs & Cap-Exempt Employers",
} as const satisfies NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;

export const OG_SITE_NAME = "H1B Cap Exempt Jobs";
