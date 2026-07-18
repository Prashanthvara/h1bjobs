export function CloudflareAnalytics() {
    const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
    // Production-only: keeps localhost visits out of the analytics data.
    if (process.env.NODE_ENV !== "production" || !token) return null;
    return (
        <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token })}
        />
    );
}
