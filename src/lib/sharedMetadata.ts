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

interface RouteMetadataInput {
	/** The <title> for this route. */
	title: string;
	description: string;
	/** Root-relative path, used for both the canonical and og:url. */
	path: string;
	/** Shorter title for social cards. Falls back to `title`. */
	socialTitle?: string;
}

/**
 * Builds the metadata for a page route with the shared social fields already
 * spread in.
 *
 * Use this instead of hand-writing `openGraph`/`twitter` on a page. Because
 * Next replaces those objects rather than merging them, a route that defines
 * either one by hand and forgets OG_IMAGE ships with no social preview — and
 * nothing fails: not tsc, not the build, not the test suite. Routing every
 * page through here makes that mistake unrepresentable, and the test in
 * sharedMetadata.test.ts fails if the image is ever dropped from this builder.
 */
export function routeMetadata({
	title,
	description,
	path,
	socialTitle,
}: RouteMetadataInput): Metadata {
	const social = socialTitle ?? title;

	return {
		title,
		description,
		alternates: {
			canonical: path,
		},
		openGraph: {
			title: social,
			description,
			url: path,
			siteName: OG_SITE_NAME,
			images: [OG_IMAGE],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: social,
			description,
			images: [OG_IMAGE.url],
		},
	};
}
