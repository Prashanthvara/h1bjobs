#!/usr/bin/env node
// Purge the ISR cache and prove the regenerated pages match Supabase.
//
// Why this exists: / and /companies are cached in Cloudflare KV (see
// `export const revalidate` in each route). Writing rows to Supabase does
// nothing visible until that cache is purged via POST /api/revalidate and a
// subsequent GET regenerates the HTML from a fresh query.
//
// Usage:
//   npm run revalidate
//   npm run revalidate -- https://some-preview.example
//
// Config, in precedence order: real environment variables, then .dev.vars,
// then .env.local. That order lets a one-off run point at a different site or
// secret without editing either file.
//
//   REVALIDATE_SECRET     required — must match the Worker secret
//   SUPABASE_URL          required — used to verify, not to render
//   SUPABASE_ANON_KEY     required
//   NEXT_PUBLIC_SITE_URL  optional — defaults to production
//
// Exits non-zero on any failure, including "the purge succeeded but the page
// still does not match Supabase", which is the silent failure mode that made
// this script necessary.

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_SITE_URL = "https://h1bcapexemptjobs.com";
const VERIFY_ATTEMPTS = 3;
const VERIFY_DELAY_MS = 4000;

// process.loadEnvFile does not overwrite variables already in the
// environment, so an exported REVALIDATE_SECRET beats the file on disk.
for (const file of [".dev.vars", ".env.local"]) {
    const full = join(root, file);
    if (existsSync(full)) process.loadEnvFile(full);
}

function fail(message) {
    console.error(`revalidate: ${message}`);
    process.exit(1);
}

function required(name) {
    const value = process.env[name];
    if (!value) {
        fail(`${name} is not set. Export it, or add it to .dev.vars.`);
    }
    return value;
}

const siteUrl = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(
    /\/+$/,
    ""
);
const secret = required("REVALIDATE_SECRET");
const supabaseUrl = required("SUPABASE_URL").replace(/\/+$/, "");
const supabaseKey = required("SUPABASE_ANON_KEY");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getText(url, init) {
    const res = await fetch(url, { signal: AbortSignal.timeout(60_000), ...init });
    return { status: res.status, ok: res.ok, text: await res.text() };
}

async function supabaseJson(path) {
    const url = `${supabaseUrl}/rest/v1/${path}`;
    let res;
    try {
        res = await getText(url, {
            headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        });
    } catch (err) {
        fail(`Supabase request failed: ${err.message}`);
    }
    if (!res.ok) fail(`Supabase returned HTTP ${res.status} for ${path}`);
    try {
        return JSON.parse(res.text);
    } catch {
        fail(`Supabase returned non-JSON for ${path}`);
    }
}

/** What the site should be showing, read straight from the database. */
async function expectedFromSupabase() {
    const companies = await supabaseJson("company?select=name");
    const newest = await supabaseJson(
        "job?select=job_posting_date&is_visa=eq.true&order=job_posting_date.desc&limit=1"
    );
    return {
        companyCount: companies.length,
        newestJobDate: newest[0]?.job_posting_date ?? null,
    };
}

// Both markers come from the RSC flight payload, not from markup, so a
// Tailwind class or copy change cannot silently break verification.
// `logo_url` appears exactly once per company row; job_posting_date values
// are ISO dates in the home route's payload.
function companyCountFromHtml(html) {
    return (html.match(/logo_url/g) ?? []).length;
}

function newestJobDateFromHtml(html) {
    const dates = (html.match(/job_posting_date[^0-9]{0,12}(\d{4}-\d{2}-\d{2})/g) ?? []).map((m) =>
        m.slice(-10)
    );
    return dates.length ? dates.sort().at(-1) : null;
}

async function purge() {
    const url = `${siteUrl}/api/revalidate`;
    let res;
    try {
        res = await getText(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${secret}` },
            signal: AbortSignal.timeout(30_000),
        });
    } catch (err) {
        fail(`POST ${url} failed: ${err.message}`);
    }

    let body;
    try {
        body = JSON.parse(res.text);
    } catch {
        fail(`POST ${url} returned non-JSON (HTTP ${res.status}): ${res.text.slice(0, 200)}`);
    }
    // Body may contain { error: "Invalid token" }; it never contains the secret.
    if (res.status !== 200 || body?.revalidated !== true) {
        fail(`purge rejected (HTTP ${res.status}): ${JSON.stringify(body)}`);
    }
    console.log(`Purged ${siteUrl} (at ${body.at ?? "unknown"})`);
}

/** GET both routes so the Worker regenerates them, and return the HTML. */
async function warm() {
    const pages = {};
    for (const path of ["/", "/companies"]) {
        const url = `${siteUrl}${path}`;
        let res;
        try {
            res = await getText(url, { redirect: "follow" });
        } catch (err) {
            fail(`GET ${url} failed: ${err.message}`);
        }
        if (!res.ok) fail(`GET ${url} returned HTTP ${res.status}`);
        pages[path] = res.text;
    }
    return pages;
}

async function main() {
    console.log(`Revalidating ${siteUrl} …`);
    const expected = await expectedFromSupabase();
    await purge();

    // Retry: a first GET can be served from the stale entry while
    // regeneration finishes behind it.
    for (let attempt = 1; attempt <= VERIFY_ATTEMPTS; attempt++) {
        const pages = await warm();
        const actual = {
            companyCount: companyCountFromHtml(pages["/companies"]),
            newestJobDate: newestJobDateFromHtml(pages["/"]),
        };

        if (
            actual.companyCount === expected.companyCount &&
            actual.newestJobDate === expected.newestJobDate
        ) {
            console.log(
                `Verified: ${actual.companyCount} companies, newest job ${actual.newestJobDate}.`
            );
            return;
        }

        if (attempt < VERIFY_ATTEMPTS) {
            console.log(
                `Attempt ${attempt}: site has ${actual.companyCount} companies / ${actual.newestJobDate}, ` +
                    `Supabase has ${expected.companyCount} / ${expected.newestJobDate}. Retrying …`
            );
            await sleep(VERIFY_DELAY_MS);
            continue;
        }

        fail(
            `purge reported success but the page still does not match Supabase.\n` +
                `  companies: site ${actual.companyCount}, supabase ${expected.companyCount}\n` +
                `  newest job: site ${actual.newestJobDate}, supabase ${expected.newestJobDate}\n` +
                `Check the NEXT_INC_CACHE_KV and NEXT_TAG_CACHE_D1 bindings in wrangler.jsonc.`
        );
    }
}

await main();
