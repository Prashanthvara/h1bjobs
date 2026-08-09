#!/usr/bin/env node
// Reports how well `company.name` joins to `job.org`.
//
// There is no foreign key between the two tables, so a company whose jobs are
// filed under an unexpected spelling silently renders the empty state on
// /companies. Nothing throws and no test fails — the only way to see it is to
// ask.
//
// Read the two lists together. A company in the unmatched list whose name
// nearly matches an entry in the orphan list is a real join bug worth an
// alias; a company that appears in neither is simply outside the 1000-row
// window, which is expected and not actionable here.
//
// Usage: npm run check:orgs
// Always exits 0: an employer with genuinely no listings is normal, so this is
// a report to read, not a gate to fail a deploy on.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Mirrors normalizeOrgName in src/lib/orgName.ts. Kept in sync by hand — this
// script cannot import TypeScript — so change both together. The apostrophe
// pass must come first: folding it in with the rest would split "Children's"
// into "children s" and stop it matching "Childrens".
function normalizeOrgName(value) {
    if (!value) return "";
    return value
        .toLowerCase()
        .replace(/['’ʼ]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/^the /, "");
}

function readDevVars() {
    try {
        const text = readFileSync(join(root, ".dev.vars"), "utf8");
        return Object.fromEntries(
            text
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line && !line.startsWith("#") && line.includes("="))
                .map((line) => {
                    const index = line.indexOf("=");
                    return [
                        line.slice(0, index).trim(),
                        line.slice(index + 1).trim().replace(/^["']|["']$/g, ""),
                    ];
                })
        );
    } catch {
        return {};
    }
}

const vars = readDevVars();
const url = process.env.SUPABASE_URL || vars.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || vars.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing SUPABASE_URL / SUPABASE_ANON_KEY (checked the environment and .dev.vars).");
    process.exit(1);
}

const supabase = createClient(url, key);

const { data: companies, error: companyError } = await supabase.from("company").select("id, name");
if (companyError) {
    console.error(`company query failed: ${companyError.message}`);
    process.exit(1);
}

// Same predicate and ordering as fetchVisaJobOrgDates, so this reports on the
// window the site actually counts over rather than the whole table.
const { data: jobs, error: jobError } = await supabase
    .from("job")
    .select("org")
    .eq("is_visa", true)
    .order("job_posting_date", { ascending: false })
    .order("job_id", { ascending: false });
if (jobError) {
    console.error(`job query failed: ${jobError.message}`);
    process.exit(1);
}

const orgCounts = new Map();
for (const { org } of jobs) {
    const key = normalizeOrgName(org);
    if (!key) continue;
    orgCounts.set(key, (orgCounts.get(key) || 0) + 1);
}

const matched = [];
const unmatched = [];
for (const company of companies) {
    const count = orgCounts.get(normalizeOrgName(company.name)) || 0;
    (count > 0 ? matched : unmatched).push({ name: company.name, count });
}

console.log(
    `${matched.length} of ${companies.length} companies matched at least one job ` +
        `(over ${jobs.length} job rows).\n`
);

if (unmatched.length > 0) {
    console.log("Companies with no matching job.org value:");
    for (const { name } of unmatched.sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`  ${name}`);
    }
    console.log("");
}

const companyKeys = new Set(companies.map((c) => normalizeOrgName(c.name)));
const orphanOrgs = [...orgCounts.entries()]
    .filter(([key]) => !companyKeys.has(key))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

if (orphanOrgs.length > 0) {
    console.log("Top job.org values matching no company (candidates for a near-miss spelling):");
    for (const [key, count] of orphanOrgs) {
        console.log(`  ${String(count).padStart(5)}  ${key}`);
    }
}
