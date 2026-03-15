# H1B Cap Exempt Jobs

A job board that helps international professionals find visa-sponsored roles at cap-exempt employers — universities, research institutes, and non-profits that can sponsor H-1B visas without the annual lottery.

**Live site:** [h1bcapexemptjobs.com](https://h1bcapexemptjobs.com)

## Features

- Browse visa-sponsored job listings with filters for location, skills, date posted, and full-text search
- Explore curated cap-exempt employers with H-1B approval history, departments, and direct career links
- Server-rendered pages for SEO with 24-hour incremental static regeneration
- Responsive design with dark/light mode favicon support
- PWA-ready with web app manifest

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS 4, shadcn/ui, Radix UI
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Cloudflare Workers via OpenNextJS
- **Language:** TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env.local` file with:

```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_SITE_URL=<your-site-url>
REVALIDATE_SECRET=<your-revalidation-secret>
```

## Deployment

```bash
# Preview locally on Cloudflare runtime
npm run preview

# Deploy to Cloudflare Workers
npm run deploy
```
