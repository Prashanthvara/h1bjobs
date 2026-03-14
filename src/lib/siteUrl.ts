export function getSiteUrl() {
	const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
	const withProtocol = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
		? rawUrl
		: `https://${rawUrl}`;
	return withProtocol.replace(/\/+$/, "");
}
