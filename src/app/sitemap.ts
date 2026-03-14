import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const normalizedSiteUrl = getSiteUrl();

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	return [
		{
			url: normalizedSiteUrl,
			lastModified: now,
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${normalizedSiteUrl}/jobs`,
			lastModified: now,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: `${normalizedSiteUrl}/about`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.5,
		},
	];
}
