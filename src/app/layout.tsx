import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/siteUrl";

const normalizedSiteUrl = getSiteUrl();

const geistSans = Geist({
	variable: "--font-geist-sans",
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
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
		</html>
	);
}
