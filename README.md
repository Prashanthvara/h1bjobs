# H1B Cap Exempt Jobs

[h1bcapexemptjobs.com](https://h1bcapexemptjobs.com)

A job board for international professionals looking for H-1B visa sponsorship without the annual lottery. Cap-exempt employers like universities, research hospitals, and nonprofits can sponsor H-1B visas year-round with no cap limits. This site aggregates their open positions in one place.

## What it does

- **Job listings** from cap-exempt employers, updated daily. Filter by location, department, keywords, and date posted.
- **Employer profiles** with H-1B approval history, departments, exemption details, and direct links to career pages.
- **Visa eligibility signals** on each listing so you can quickly tell which roles are likely to sponsor.
- **Full-text search** across job titles, organizations, locations, and keywords.

## Who it's for

Researchers, engineers, physicians, academics, and other skilled professionals on (or seeking) H-1B status who want to find employers that can sponsor without entering the lottery.

## Tech stack

- Next.js 15 (App Router, React 19, TypeScript)
- Tailwind CSS 4 with Radix UI primitives
- Supabase (PostgreSQL) for job and company data
- Cloudflare Workers via OpenNext for deployment
- Server-rendered pages with 1-hour ISR

## Local development

```bash
npm install
npm run dev
```

Create `.env.local`:

```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_SITE_URL=<your-site-url>
```

`npm run revalidate` additionally needs `REVALIDATE_SECRET`, read from
`.dev.vars` (the file Wrangler already uses for local secrets — not committed):

```
REVALIDATE_SECRET=<same value as the Cloudflare Worker secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Real environment variables take precedence over both files, so a one-off run
can target a different site or secret without editing them. The scraper does
not use this script — it has its own `REVALIDATE_SECRET` Worker secret.

## Deployment

```bash
npm run deploy
```

Builds, deploys to Cloudflare Workers via the OpenNext adapter, then runs
`npm run revalidate` to confirm the live pages match Supabase. If that last
step fails, **the deploy already succeeded** — re-run `npm run revalidate`
rather than deploying again.

## How content reaches the site

`/` and `/companies` are server-rendered and cached in Cloudflare KV for one
hour (`export const revalidate = 3600` in each route). Writing rows to
Supabase does **not** update the live site by itself.

Three things refresh the cache, in order of how often they matter:

1. **The scraper** (`h1b-processor`, in the separate cloudflare-worker-scraper
   repo) calls `POST /api/revalidate` after any queue batch that saved jobs,
   then GETs `/` and `/companies`. This is the normal path — jobs scraped by
   the nightly 03:00 UTC run appear with nobody in the loop.
2. **The one-hour ISR window** expires. This is the backstop for a missed or
   failed trigger, not the mechanism.
3. **`npm run revalidate`**, run by hand. The scraper only writes the `job`
   table, so new employers — added to `company` by hand — need this. Also the
   right tool when something looks stale.

```bash
npm run revalidate
```

It purges the cache, warms both routes, then compares the served HTML against
Supabase — the company count and the newest `job_posting_date` — and exits
non-zero if they still disagree. A purge that returns 200 without changing the
page usually means the `NEXT_INC_CACHE_KV` or `NEXT_TAG_CACHE_D1` binding in
`wrangler.jsonc` is wrong; the adapter disables caching silently on a bad
binding name.

To check the live site by hand:

```bash
curl -sI https://h1bcapexemptjobs.com/companies | grep -i x-nextjs-cache
curl -s https://h1bcapexemptjobs.com/companies | grep -o 'logo_url' | wc -l
```

The second number is the rendered company count, and should match the `company`
table. (It counts rows in the RSC payload rather than scraping markup, so
restyling the page cannot break the check.)
