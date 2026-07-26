/**
 * Reads the revalidation secret, preferring the Authorization header.
 *
 * Header form is preferred because query strings are recorded in Cloudflare
 * Workers Logs (observability is enabled in wrangler.jsonc), server access logs
 * and browser history. The ?secret= form is still accepted so existing callers
 * keep working.
 *
 * MIGRATION: dual-accept is a transition state, not the destination. While the
 * query fallback exists, any caller still using it keeps writing the secret into
 * Workers Logs. Once every caller sends `Authorization: Bearer`, change the last
 * line to `return "";` and drop the searchParams argument at the call site.
 *
 * Deliberately free of next/* imports so it can be unit tested in isolation.
 */
export function extractSecret(headers: Headers, querySecret: string | null): string {
	const authorization = headers.get("authorization") ?? "";
	const match = authorization.match(/^Bearer\s+(.+)$/i);
	if (match) {
		return match[1].trim();
	}
	return querySecret ?? "";
}
