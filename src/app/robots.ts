import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const normalizedSiteUrl = getSiteUrl();

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${normalizedSiteUrl}/sitemap.xml`,
	};
}
