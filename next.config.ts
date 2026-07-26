import type { NextConfig } from "next";

const securityHeaders = [
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=()",
	},
	{
		key: "Content-Security-Policy",
		value: [
			"default-src 'self'",
			// ACCEPTED RISK (reviewed 2026-07-25): 'unsafe-inline' means CSP provides no
			// XSS mitigation for scripts. Kept deliberately — the nonce-based alternative
			// requires middleware that reads a per-request nonce in the root layout, which
			// forces dynamic rendering on every route and discards the ISR static caching
			// this site depends on. The concrete threat it would have covered — a
			// javascript: URI arriving in a database URL field — is instead closed at the
			// source by safeHref() in src/lib/safeHref.ts.
			// Revisit if this site ever adds authentication, forms, or user-generated content.
			// 'unsafe-eval' required in dev only: React Fast Refresh uses eval()
			// static.cloudflareinsights.com serves the Web Analytics beacon script
			`script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
			// 'unsafe-inline' required: Radix UI (Tooltip, Accordion, Select, Popover) applies inline style attributes at runtime
			"style-src 'self' 'unsafe-inline'",
			// next/font/google self-hosts fonts at build time — no external font requests at runtime
			"font-src 'self'",
			// Company logos are self-hosted in /public/logos — no external image domains needed
			// data: covers Next.js blur placeholder base64 URIs
			"img-src 'self' data:",
			// All Supabase fetches are server-side only — no client-side API calls in this app
			// cloudflareinsights.com receives Web Analytics beacon reports (POST /cdn-cgi/rum)
			"connect-src 'self' https://cloudflareinsights.com",
			"frame-ancestors 'none'",
			"object-src 'none'",
			"base-uri 'self'",
		].join("; "),
	},
];

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
