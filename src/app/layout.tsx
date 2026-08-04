import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/siteUrl";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { OG_IMAGE, OG_SITE_NAME } from "@/lib/sharedMetadata";

const normalizedSiteUrl = getSiteUrl();

// Outfit is a variable font: one file covers all weights.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(normalizedSiteUrl),
	title: "H1B Cap Exempt Jobs — Your Alternative Path to H1B Sponsorship",
	description: "Discover visa-sponsored roles at cap-exempt universities, research institutes, and non-profits. Get your H1B sponsored while making a real-world impact.",
	icons: {
		icon: [
			{ url: "/favicons/favicon-light-16.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: light)" },
			{ url: "/favicons/favicon-light-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
			{ url: "/favicons/favicon-dark-16.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: dark)" },
			{ url: "/favicons/favicon-dark-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
		],
		apple: [
			{ url: "/favicons/favicon-light-192.png", sizes: "192x192", media: "(prefers-color-scheme: light)" },
			{ url: "/favicons/favicon-dark-192.png", sizes: "192x192", media: "(prefers-color-scheme: dark)" },
		],
	},
	openGraph: {
		title: "H1B Cap Exempt Jobs — Your Alternative Path to H1B Sponsorship",
		description: "Discover visa-sponsored roles at cap-exempt universities, research institutes, and non-profits. Get your H1B sponsored while making a real-world impact.",
		url: normalizedSiteUrl,
		siteName: OG_SITE_NAME,
		images: [OG_IMAGE],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "H1B Cap Exempt Jobs — Your Alternative Path to H1B Sponsorship",
		description: "Discover visa-sponsored roles at cap-exempt universities, research institutes, and non-profits. Get your H1B sponsored while making a real-world impact.",
		images: ["/og-image.png"],
	},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior is required because globals.css sets
    // `scroll-behavior: smooth` on <html>. Next currently disables smooth
    // scrolling during route transitions automatically, but warns that future
    // versions will not — without it, the tab navigation added with /companies
    // would eventually animate the scroll reset instead of jumping.
    // https://nextjs.org/docs/messages/missing-data-scroll-behavior
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head />
      <body className={`${outfit.variable} antialiased`}>

        {children}
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
