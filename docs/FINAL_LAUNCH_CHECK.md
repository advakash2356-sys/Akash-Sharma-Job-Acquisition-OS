# Final launch check: Job Acquisition OS

**Run 24 Oct 2026 (IST)** on production https://akash-sharma-job-acquisition-os.vercel.app (main, deploys 5f25451 and 3849171 live and verified). Skill: website-final-check (A promise audit, B hygiene, C fix/redeploy/retest). Made by Akash Sync Agent.

## Summary
- **Hygiene checklist (B): 30 items. Yes 26 (2 of them fixed this pass), Partial 4, No 0.**
- **Extra checks: 5/5 Yes** (mobile 384x854 + desktop sign-in gate, no horizontal scroll on 8 pages × 2 sizes, unit tests 16/16, `npm audit` 0 vulnerabilities, TypeScript clean).
- **Fixed this pass: 4** (meta description 183→137 chars and removed "resume and API key stay in your browser" from meta; "Delete my data" now also clears the session ID token and site cookies such as Google's `g_state`; Privacy consent wording now matches the tick-box + Continue flow; About page summary "browser-only" corrected and all job sources named).
- Lighthouse not re-measured this pass (last measured in earlier audit; no layout changes since besides text).

## How sign-in was tested (MOCKED)
Real Google sign-in cannot be automated. Signed-in flows used a **mock session**: a fake ID token in sessionStorage and a fake profile in localStorage. On production, API calls with the fake token correctly return **401** (proves the gate). To exercise AI and job routes, the same production build ran locally (port 3100) with a **test-only** `verifyIdToken` stub injected at runtime (`node -r mockauth.cjs`, not in the repo), using a real Gemini key from env (never printed). Rows marked "local+mock" come from that run. Akash's own first real sign-in remains the only real-auth test.

## Sign-in gate, production
| Viewport | Tick box present | Continue disabled until ticked | Google button shown after Continue | Covered by banner |
|---|---|---|---|---|
| 384x854 mobile | Yes | Yes | Yes | No |
| 1280x900 desktop (fresh context) | Yes | Yes | Yes | No |
Screenshots: docs/screenshots/final-signin-384.png, final-signin-1280.png.

## B. Launch hygiene (script: scripts/hygiene-check.mjs)
| # | Item | Result | Evidence |
|---|---|---|---|
| H1 | AI traffic matches Privacy wording (own server function, the | Yes | local+mock. resume text went only to /api/ai/score-job (this app's function → Google Gemini, as Privacy says); direct third-party calls: 0 |
| H2 | /privacy covers storage, AI, job provider, analytics, logs,  | Yes | missing: none; footer links /feedback /feedback#comments /about /terms /privacy /privacy#delete /about |
| H3 | "Delete everything" wipes localStorage, IndexedDB, cookies ( | Yes (fixed) | was No: g_state cookie + session token survived; wipeEverything now clears them. after reload: localStorage keys [], IndexedDB 0, cookies "" |
| H4 | Export JSON works; data survives refresh | Yes | job-os-backup.json keys version,profile,jobs; jobs after refresh 1 |
| H5 | No secrets in shipped JS; server bundle not public | Yes | 49 JS files scanned, matches: 0; /server.cjs → 404 |
| H6 | AI route: key from env/user, origin check, size cap, per-IP  | Partial | in-memory per-instance rate limit; origin 403, 413 size cap, output cap verified. server key set: false (user's own key otherwise); bad Origin → 403; 250 KB body → 401; 36 rapid calls → 401 (in-memory per instance); maxOutputTokens 16384 |
| H7 | CORS: no cross-origin access, no open proxy | Yes | job search from foreign Origin → 403; Access-Control-Allow-Origin: none; GET /api/ai/x → 405 |
| H8 | One title in <title>/og/twitter (≤60), description ≤155, can | Yes (fixed) | description was 183 chars, now 137. "Job Acquisition OS: free job search, by Akash Sync Agent" (56); desc 137; og:image https://akash-sharma-job-acquisition-os.vercel.app/og.jpg (1200, 630); canonical https://akash-sharma-job-acquisitio |
| H9 | OG card matches current branding | Yes | og.jpg reads "JOB ACQUISITION OS · FREE JOB SEARCH WORKSPACE" + "Made by Akash Sync Agent" (checked visually 20 Oct) |
| H10 | Real noscript content (h1 + description) | Yes | Job Acquisition OS: free job search workspace Find real job postings (from FreeHire, each linked to the original), score them against your r |
| H11 | robots, sitemap (all public routes, live domain), JSON-LD wi | Yes | sitemap / /security /accessibility /about /privacy /terms /feedback; robots Sitemap line; JSON-LD Organization+WebApplication, no ratings |
| H12 | Search Console / Bing verification | Partial | Google Search Console verified + sitemap submitted earlier (24 Oct); Bing not done. placeholders in index.html, steps in docs/SEO_SETUP.md: Akash must verify with his Google/Microsoft account |
| H13 | Preview cards (WhatsApp, LinkedIn, Facebook, X) | Partial | official debuggers need Akash login. crawler UA gets 200 with og:title/og:image/twitter:card; the official debuggers (LinkedIn Post Inspector, Facebook Sharing Debugger) need Akash's login |
| H14 | One product name: UI, meta, OG, README, manifest, emails | Yes | manifest "Job Acquisition OS", README, sidebar, title; "Momentum" only as the design-concept note; .eml has no product name in its headers (subject is the user's) |
| H15 | Who built it: credit, feedback, About, licence/copyright | Yes | Job Acquisition OS · SHARE FEEDBACK · COMMENTS · SHARE WITH A FRIEND · ABOUT · TERMS · PRIVACY & SECURITY · DELETE MY DATA · Made by Akash Sync Agent · © 2026 Akash Sync Agent (Adv. Akash Sharma) · Co |
| H16 | AI disclaimer near generated output | Yes | manual: "AI-generated (Google Gemini) — review before use" shown above every pack. Tailor: "Rewrites use only the facts in your resume. Review everything before sending." + Fact check panel under each output; Outreach: "Send it yourself" |
| H17 | Terms page + "powered by" attribution for job data | Yes | /terms 200; job cards badge "FreeHire · <source> · posted <date>"; About credits FreeHire (MIT) |
| H18 | Source named, posting dates, originals open, stale flagged,  | Yes | local+mock; prod UI drawer shows source, posted date, stale note. drawer: source + posted date + "listings can be out of date" note; nonsense search → 200, 0 jobs (empty state handled); FreeHire is MIT, keyless public API (docs/FREEHIRE.md) |
| H19 | Very long input: real error, no freeze | Yes | local+mock. 413: The request is too large (365 KB). Shorten the resume or job text and try again. |
| H20 | Offline mid-request shows an error, no freeze | Yes | manual probe: "You are offline. Check your connection and try again.". shown: ""; UI still responsive |
| H21 | Double-click submits once | Yes | local+mock. 1 request(s) from a double click |
| H22 | Back button moves between pages | Yes | back from /about → landing h1 "Your nextofferstarts here." |
| H23 | Slow 3G: page usable, no blank screen | Yes | h1 visible after 0.9 s on 400 ms / 500 kbps |
| H24 | Random URL → 404; crash boundary; zero console errors | Partial | 404 page + 0 app errors; remaining console lines are Google sign-in library FedCM notices ('Not signed in with the identity provider'). 404 page ok; crash boundary proven in dev (launch audit L17); console errors on 10 pages: 10 Not signed in with the identity provider. @sh-sharma-job-acquisition-os.vercel.app/ / Not signed in with th |
| H25 | favicon, apple-touch-icon, manifest, theme-color, html lang | Yes | icons 200,200,200,200; manifest icons 3 |
| H26 | Security headers + HTTPS only | Yes | CSP (frame-ancestors none, upgrade-insecure-requests), HSTS, nosniff, Referrer-Policy; http:// → port 80 unreachable from this box; vercel.app is HSTS-preloaded so browsers never use http |
| H27 | Public access without login | Yes | production 200 with no cookies; preview deployments still need Vercel login (user setting) |
| H28 | No sideways scroll; tap targets ≥44px (or ≥24px with spacing | Yes | overflow 0px; small targets: none; text <11px: 0; file input present |
| H29 | Timezone: dates use the user's local day | Yes | local+mock. UTC+14 browser: appliedAt 2026-10-25, local date 2026-10-25, UTC date 2026-10-24 |
| H30 | Links: internal + external open; mailto and share links corr | Yes | 18 links checked; broken: none; mailto adv.akash2356@gmail.com and ?ref=share verified in persona E2E |
## Needs Akash
1. Sign in yourself once on phone and desktop (only real-auth test), upload a real resume PDF, and open the Admin link.
2. Preview cards: paste the URL into LinkedIn Post Inspector and Facebook Sharing Debugger (need your login).
3. Optional: Bing Webmaster Tools verification (import from Google Search Console).
4. Known limit: rate limiting is per serverless instance (best effort); durable store (Upstash/Vercel KV free tier) would need your account.
5. Optional, from earlier: Gemini key in Apps Script; Calendar scope review by Google ("unverified app" warning until then).

## A. Promise audit
See docs/PROMISE_AUDIT.md (section "24 Oct 2026 final pass").
