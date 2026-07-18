# Cloudflare Web Analytics Beacon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Cloudflare Web Analytics record real-visitor data for h1bcapexemptjobs.com by adding the RUM beacon script and unblocking it in the Content-Security-Policy.

**Architecture:** A small server component renders the Cloudflare beacon `<script>` tag at the end of `<body>`, only in production builds and only when a token is configured. The CSP in `next.config.ts` gains two Cloudflare Insights origins so the browser is allowed to load the beacon and send its report. The beacon token is a public (non-secret) value supplied via `NEXT_PUBLIC_CF_BEACON_TOKEN`, inlined at build time.

**Tech Stack:** Next.js 15 App Router (React 19, TypeScript), deployed to Cloudflare Workers via OpenNext (`npm run deploy` builds locally, so `.env.local` is available at build time).

## Global Constraints

- Privacy: no cookies, no fingerprinting — Cloudflare Web Analytics is cookieless by design; do not add any other analytics scripts.
- The beacon must NOT load in development (`NODE_ENV !== "production"`) so localhost visits never pollute the data.
- CSP must stay as strict as it is today except for exactly two additions: `https://static.cloudflareinsights.com` in `script-src`, `https://cloudflareinsights.com` in `connect-src`.
- This repo has no test framework; each task verifies via build + `curl` checks with expected output instead of unit tests. Do not add a test framework for this change (YAGNI).
- Repo style: tabs for indentation in `next.config.ts` / `layout.tsx`, 4-space in `src/components/*.tsx` — match the file you're editing.
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

## Background for the implementer (zero-context summary)

- Cloudflare Web Analytics (dashboard: Analytics → Web Analytics) works by a JS beacon: `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "<TOKEN>"}'></script>`. The beacon POSTs measurements to `https://cloudflareinsights.com/cdn-cgi/rum`.
- The site currently sends a strict CSP from `next.config.ts` (`script-src 'self' 'unsafe-inline'`, `connect-src 'self'`), which blocks both the script load and the POST. Both directives must be extended.
- The dashboard site entry for h1bcapexemptjobs.com already exists (it currently shows "not enough data"). The token is retrieved from that dashboard entry — this is a manual user step in Task 3.
- There are pre-existing uncommitted changes in `src/components/FilterBar.tsx` and `src/components/ui/multi-combobox.tsx`. Do NOT include them in any commit for this plan — stage files explicitly, never `git add -A`.

---

### Task 1: Allow Cloudflare Insights origins in the CSP

**Files:**
- Modify: `next.config.ts:26` (script-src line) and `next.config.ts:35` (connect-src line)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: response header `Content-Security-Policy` containing `script-src ... https://static.cloudflareinsights.com` and `connect-src 'self' https://cloudflareinsights.com`. Task 2's beacon relies on this.

- [ ] **Step 1: Edit the two CSP directives**

In `next.config.ts`, change this line (currently line 26):

```ts
			`script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
```

to:

```ts
			// static.cloudflareinsights.com serves the Web Analytics beacon script
			`script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
```

and change this line (currently line 35):

```ts
			"connect-src 'self'",
```

to:

```ts
			// cloudflareinsights.com receives Web Analytics beacon reports (POST /cdn-cgi/rum)
			"connect-src 'self' https://cloudflareinsights.com",
```

Leave every other directive untouched.

- [ ] **Step 2: Verify the header is emitted with the new origins**

Run:

```bash
npm run build && npx next start &
sleep 5
curl -sI http://localhost:3000 | grep -i content-security-policy
kill %1
```

Expected output includes both new origins:

```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'
```

(Exact directive order may differ; the two `cloudflareinsights` origins must be present, and `'unsafe-eval'` must NOT appear since this is a production build.)

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: allow Cloudflare Web Analytics beacon in CSP"
```

---

### Task 2: Render the beacon script in production builds

**Files:**
- Create: `src/components/CloudflareAnalytics.tsx`
- Modify: `src/app/layout.tsx:102-103` (add component before `</body>`)

**Interfaces:**
- Consumes: CSP additions from Task 1 (browser-side only; no code dependency).
- Produces: `CloudflareAnalytics(): JSX.Element | null` — a React server component with no props, rendered once in the root layout. Reads `process.env.NEXT_PUBLIC_CF_BEACON_TOKEN` and `process.env.NODE_ENV`.

- [ ] **Step 1: Create the component**

Create `src/components/CloudflareAnalytics.tsx` (4-space indentation, matching other components):

```tsx
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
```

Notes for the implementer:
- No `"use client"` — this is a server component emitting a plain `<script>` tag; `next/script` is unnecessary for a `defer` beacon and would ship extra client JS.
- `NEXT_PUBLIC_` env vars are inlined at `next build` time, which is fine because `npm run deploy` builds locally where `.env.local` exists.

- [ ] **Step 2: Render it in the root layout**

In `src/app/layout.tsx`, add the import at the top with the other imports (tabs indentation):

```tsx
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
```

and change the body line (currently line 102):

```tsx
      <body className={`${syne.variable} ${syneBold.variable} ${syneExtraBold.variable} ${outfit.variable} ${outfitMedium.variable} ${outfitSemiBold.variable} ${outfitBold.variable} ${geistMono.variable} antialiased`}>{children}</body>
```

to:

```tsx
      <body className={`${syne.variable} ${syneBold.variable} ${syneExtraBold.variable} ${outfit.variable} ${outfitMedium.variable} ${outfitSemiBold.variable} ${outfitBold.variable} ${geistMono.variable} antialiased`}>
        {children}
        <CloudflareAnalytics />
      </body>
```

- [ ] **Step 3: Verify absence without a token (negative case first)**

`NEXT_PUBLIC_CF_BEACON_TOKEN` is not yet in `.env.local`, so a production build must NOT contain the beacon:

```bash
npm run build && npx next start &
sleep 5
curl -s http://localhost:3000 | grep -c beacon.min.js
kill %1
```

Expected output: `0` (grep count is zero — no beacon without a token).

- [ ] **Step 4: Verify presence with a token**

```bash
echo 'NEXT_PUBLIC_CF_BEACON_TOKEN=test-token-placeholder' >> .env.local
npm run build && npx next start &
sleep 5
curl -s http://localhost:3000 | grep -o 'beacon.min.js'
kill %1
```

Expected output: `beacon.min.js`

Then remove the placeholder line so the real token can be added in Task 3:

```bash
sed -i '' '/NEXT_PUBLIC_CF_BEACON_TOKEN=test-token-placeholder/d' .env.local
```

- [ ] **Step 5: Commit**

```bash
git add src/components/CloudflareAnalytics.tsx src/app/layout.tsx
git commit -m "feat: add Cloudflare Web Analytics beacon (production only)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Configure the real token, deploy, and verify live (user-assisted)

**Files:**
- Modify: `.env.local` (gitignored — never committed)

**Interfaces:**
- Consumes: `CloudflareAnalytics` component from Task 2; CSP from Task 1.
- Produces: live site serving the beacon; data flowing into the Web Analytics dashboard.

- [ ] **Step 1 (USER ACTION — pause and ask the user):** Get the beacon token

In the Cloudflare dashboard: **Analytics → Web Analytics → View Web Analytics sites → Manage site** for h1bcapexemptjobs.com → copy the token from the JS snippet (the `"token": "..."` value in the snippet shown).

While there, also check **Manage RUM settings / Automatic Setup**: if automatic script injection is ON for this zone, turn it OFF (the site now embeds the snippet itself; auto-injection would double-count visits).

- [ ] **Step 2: Add the token to `.env.local`**

Append (with the real token in place of the placeholder):

```bash
echo 'NEXT_PUBLIC_CF_BEACON_TOKEN=<PASTE_REAL_TOKEN_HERE>' >> .env.local
```

Confirm `.env.local` is gitignored (it is, per `.gitignore`) — the token is public-by-design but the file also holds Supabase keys.

- [ ] **Step 3: Deploy**

```bash
npm run deploy
```

Expected: OpenNext build completes and `wrangler deploy` reports the worker published.

- [ ] **Step 4: Verify the live site serves the beacon and the CSP allows it**

```bash
curl -s https://h1bcapexemptjobs.com | grep -o 'beacon.min.js'
curl -sI https://h1bcapexemptjobs.com | grep -i content-security-policy | grep -o 'cloudflareinsights.com' | sort -u
```

Expected output:

```
beacon.min.js
cloudflareinsights.com
```

- [ ] **Step 5: Verify end-to-end in a real browser**

Open https://h1bcapexemptjobs.com in a browser, open DevTools → Network, and confirm:
- `beacon.min.js` loads with status 200 (no CSP violation in the console), and
- a request to `cloudflareinsights.com/cdn-cgi/rum` fires with status 2xx.

Then check the Cloudflare **Web Analytics** dashboard after ~5–10 minutes: Visits and Page views should show ≥ 1 (your own visit). Core Web Vitals populate more slowly (up to a day).

- [ ] **Step 6: No commit** — this task only touched the gitignored `.env.local` and the dashboard.

---

## Rollback

If anything misbehaves: `git revert` the two commits (Tasks 1–2) and run `npm run deploy`. Removing the beacon or the CSP entries has no effect on the rest of the site.
