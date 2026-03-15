import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const normalizedSiteUrl = getSiteUrl();

// Evaluated once at module load (build time or ISR revalidation) — stable per deployment cycle
const dynamicLastModified = new Date();

// Hardcoded to the date /about content was last meaningfully changed
const aboutLastModified = new Date(2026, 2, 13); // 2026-03-13

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: normalizedSiteUrl,
			lastModified: dynamicLastModified,
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${normalizedSiteUrl}/jobs`,
			lastModified: dynamicLastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: `${normalizedSiteUrl}/about`,
			lastModified: aboutLastModified,
			changeFrequency: "monthly",
			priority: 0.5,
		},
	];
}
