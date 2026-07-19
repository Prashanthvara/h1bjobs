import type { Metadata } from "next";
import { Geist_Mono, Syne, Outfit } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/siteUrl";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";

const normalizedSiteUrl = getSiteUrl();

// Syne and Outfit are variable fonts: one file per family covers all weights.
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
		siteName: "H1B Cap Exempt Jobs",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "H1B Cap Exempt Jobs — Visa-Sponsored Jobs & Cap-Exempt Employers",
			},
		],
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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${syne.variable} ${outfit.variable} ${geistMono.variable} antialiased`}>

        {children}
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
