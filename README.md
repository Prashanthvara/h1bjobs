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
- Server-rendered pages with 24-hour ISR

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

## Deployment

```bash
npm run deploy
```

Deploys to Cloudflare Workers via the OpenNext adapter.
