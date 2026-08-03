import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default defineCloudflareConfig({
  // Without this the home page is re-rendered on every request
  // (x-nextjs-cache: MISS) despite `export const revalidate = 86400`.
  // KV rather than R2: R2 is not enabled on this Cloudflare account, and at
  // ~9 routes the KV size limits are not a constraint.
  incrementalCache: kvIncrementalCache,
  // Required, not optional: /api/revalidate calls revalidatePath("/"), which
  // silently purges nothing if no tag cache is registered.
  tagCache: d1NextTagCache,
  // Revalidate inline rather than through a Durable Object queue. At this
  // traffic level the extra infrastructure is not worth its complexity.
  queue: "direct",
});
