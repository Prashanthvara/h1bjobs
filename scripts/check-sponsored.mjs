#!/usr/bin/env node
// Checks every entry in SPONSORED_JOBS against Mercor's live listing data.
//
// Mercor listing pages are server-rendered and embed the authoritative record
// in a __NEXT_DATA__ script tag. The field that matters is `disableApplications`:
// a closed listing keeps `status: "active"` but flips that flag to true, so
// status alone is not a usable liveness signal.
//
// Usage: npm run check:sponsored
// Exits non-zero if any listing is dead, so it can gate a deploy.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "src/lib/sponsoredJobs.ts"), "utf8");

// Pull id + title straight from the config so the two can never drift apart.
const entries = [...source.matchAll(/id:\s*"([^"]+)",\s*\n\s*org:\s*"[^"]*",\s*\n\s*title:\s*"([^"]+)"/g)].map(
    ([, id, title]) => ({ id, title })
);

if (entries.length === 0) {
    console.error("Could not parse any entries from src/lib/sponsoredJobs.ts — did its shape change?");
    process.exit(1);
}

async function check({ id, title }) {
    const url = `https://work.mercor.com/jobs/${id}`;
    let html;
    try {
        const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30_000) });
        if (!res.ok) return { id, title, ok: false, reason: `HTTP ${res.status}` };
        html = await res.text();
    } catch (err) {
        return { id, title, ok: false, reason: `fetch failed: ${err.message}` };
    }

    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) return { id, title, ok: false, reason: "no __NEXT_DATA__ (page shape changed?)" };

    let role;
    try {
        role = JSON.parse(match[1])?.props?.pageProps?.role;
    } catch {
        return { id, title, ok: false, reason: "__NEXT_DATA__ was not valid JSON" };
    }
    if (!role) return { id, title, ok: false, reason: "listing not found in payload" };

    if (role.deletedAt) return { id, title, ok: false, reason: "deleted" };
    if (role.status !== "active") return { id, title, ok: false, reason: `status=${role.status}` };
    if (role.disableApplications) return { id, title, ok: false, reason: "applications closed" };

    const rate = role.rateMin != null ? `$${role.rateMin}-$${role.rateMax}/hr` : "rate n/a";
    // Surface the live title/rate so a silent drift from the config is visible.
    return { id, title, ok: true, live: `${role.title} — ${rate}` };
}

const results = await Promise.all(entries.map(check));
const dead = results.filter((r) => !r.ok);

for (const r of results) {
    if (r.ok) console.log(`  live  ${r.title}\n          ${r.live}`);
    else console.log(`  DEAD  ${r.title}\n          ${r.reason}  (${r.id})`);
}

console.log(`\n${results.length - dead.length}/${results.length} sponsored listings live.`);

if (dead.length > 0) {
    console.error(
        `\n${dead.length} dead listing(s). Replace them in src/lib/sponsoredJobs.ts.\n` +
            `Find live ones: https://work.mercor.com/explore`
    );
    process.exit(1);
}
