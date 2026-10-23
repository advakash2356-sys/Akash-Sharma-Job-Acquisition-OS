# Job Acquisition OS

Free, browser-only job search workspace. Made by Akash Sync Agent. ("Momentum" is the name of its visual design concept, not the product.)

A job-search workspace that keeps your resume, jobs and API key in your browser. Sign-in details (name, email, optional mobile, device id, visit dates) and feedback go to the owner's private Google Sheet. Add jobs, score them against **your own resume**, tailor your resume and cover letter, simulate a recruiter's read, prep for interviews, write outreach, and track pay and pace.

## How it works (and what it stores)
- **Your resume and jobs are stored in your browser.** Resume, jobs, notes and preferences are saved in `localStorage`; they are not sent to any database of ours. Export or import a JSON backup from *My resume*.
- **Sign in with Google** (required when `GOOGLE_CLIENT_ID` is set; guest mode otherwise). With consent, the server logs name, email, optional mobile, a random device id, a light device hint and visit dates to the Users tab of the owner's Google Sheet (see `docs/FEEDBACK_SETUP.md`). (Google Identity Services): the browser gets a Google ID token and posts it to `/api/auth/google`, which verifies it with `google-auth-library` (audience = `GOOGLE_CLIENT_ID`, email must be verified) and returns `{sub, email, name, picture}`. The browser keeps that profile in `localStorage` and keys your data by `sub`. There are no server-side sessions or cloud storage: this separates data per account on one device, it does not sync across devices. Setup: [`GOOGLE_SIGNIN_SETUP.md`](./GOOGLE_SIGNIN_SETUP.md). Without `GOOGLE_CLIENT_ID` the app runs in guest mode with no sign-in. Sign-out ends the session only.
- **Bring your own free Gemini key** from https://aistudio.google.com/apikey (Settings). It is stored only in your browser (per account), sent in the `x-user-gemini-key` header to this app's own `/api/ai/*` function, and used for that single request. The code does not store or log it. If the site owner sets `GEMINI_API_KEY` on the server, requests without a user key use that key. Without any key, AI buttons are disabled with a pointer to Settings.
- **What Google receives:** for each AI request, your resume text, the job details and any preferences you typed are sent via the function to Google's Gemini API. Google's terms apply (the free tier may use content to improve Google products).
- **No ad scripts; the site sets no cookies of its own** (Google sign-in may set Google's). Anonymous step counts only (GoatCounter, cookieless; see below). Fonts are bundled. "Open in Gmail" and `.eml` are drafts you send yourself; outreach is not sent for you. The only email the system sends is an optional thank-you reply to feedback (see docs).
- **Delete everything:** *Privacy & security* page > "Delete everything from this browser".

- **Guided setup (first screen for new users):** 1) upload a resume (or fill the short Hindi/English form if you have none: age, education, city, skills, preferred work), 2) add a Gemini key (optional for the short form, which still searches and uses keyword fit). Then it runs by itself: `parse-resume` (Gemini fills empty profile fields from your resume text; all editable), a job search on **FreeHire** (see below), and `fit-jobs` (Gemini scores fit, batched 10 per call; if Gemini fails, a plain keyword-match score is used and labelled as such). Nothing is invented: every job comes from FreeHire with its original link, source and posted date. If FreeHire fails or finds nothing, the page shows the real error and links to LinkedIn / Indeed / Google Jobs search pages.
- **Real jobs come from [FreeHire](https://github.com/strelov1/freehire)** (MIT, keyless public API, see `docs/FREEHIRE.md`). The browser calls this app's `/api/jobs/search`, which calls `https://freehire.me/api/v1/jobs/search`. **What FreeHire receives: only your target job titles (up to 14), country code(s), city names, an entry-level flag, and (government jobs) a flag plus education level, sent from this app's server. Not your resume text, name, age, phone or key.** Government jobs: FreeHire's official-source postings are kept only if they carry a .gov.in/.nic.in notification link and a future last date; a public SarkariMap RSS feed is added and labelled as an aggregator (the page links onward to the official notice). NCS, DSSSB, SSC etc. are not scraped; the app links to their portals instead. **Test mode** (Outreach/Settings toggle) prefixes email subject and body with `[TEST - please ignore]`; the app does not send outreach email, it only makes a Gmail compose link or .eml. FreeHire also sees the server's IP address, as any web service would. The proxy caches identical searches for 10 minutes and limits each client to 12 searches per minute (in-memory, best effort on serverless). Postings can be stale; the UI says to verify before applying.

## Merged in (see docs/MERGE_PLAN.md)
- **Fact check** on AI text: numbers, names/skills and stock phrases not found in your resume or the job text (browser rules, no AI).
- **Follow-up schedule**: 5 and 10 working days after applying, max two, stops on a reply; .ics reminders. **Sort reply**: paste a recruiter reply, rules label it (interview, rejection, question, auto-reply, bounce) and suggest a status.
- **.ics** for interviews, **CSV export** of jobs, **duplicate warning** when adding a job, **Milestones** from real counts, **notice period / available from** profile fields, government-notice details (notice no., stated pay, age limit, days left), remote board search links (We Work Remotely, Remotive).

## Run
```
npm install
npm run dev     # http://localhost:3000
npm run build
```
AI routes run as Vercel functions (`api/ai/[action].ts`, `api/status.ts`, `api/auth/google.ts`) and locally through `server.ts`; both share `server/handlers.ts`.

## Env vars
See `.env.example`: optional `GEMINI_API_KEY` (server fallback), optional `VITE_GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_ID` (Google sign-in).

Design notes: `DESIGN.md`. License: MIT.

## Licence, credit and brand
- Third-party work: the tailored resume uses the **JSON Resume schema** (MIT), with an ATS layout adapted from **RenderCV** (MIT) and **jsonresume-theme-even** (MIT). Full list, authors and licence texts: `THIRD_PARTY_NOTICES.md`.
- Code: **MIT** © 2026 Akash Sync Agent (Akash Sharma). In plain words, MIT lets anyone use, copy, modify, publish and even sell this code, as long as they keep the copyright and licence notice. That is the trade-off of an open licence.
- **Brand is not licensed** (see `NOTICE`): the name "Akash Sync Agent", the Job Acquisition OS branding (design concept "Momentum"), logo and OG card are not covered by MIT and may not be reused. Forks must rebrand.
- The app shows "Made by Akash Sync Agent" in the footer, sidebar, About page and (optional, on by default, Settings) in exported PDF/DOCX footers.

## Analytics (privacy-first)
Production builds count to the owner's GoatCounter site `akashsyncagent` (default in `src/lib/brand.ts`; override with `VITE_GOATCOUNTER_CODE`, or set it to `off`; local dev never counts). It counts 8 anonymous steps: landing_view, start_setup, resume_added, key_added, first_job_found, export, feedback_sent, share. Only the step name is sent, as a cookieless counter image; no content. Respects Do Not Track / GPC and a Settings opt-out. The Privacy page always lists exactly what is counted. (Vercel Web Analytics was not used: custom events need the Pro plan.)

## Terms
The in-app Terms page (`#/app/terms`) is short and plain: the app is provided as is; Google's Gemini API Additional Terms apply (18+, free-tier content may be used by Google and seen by human reviewers, EEA/Switzerland/UK users need the paid tier); always verify jobs and AI text.

## Feedback
"Share feedback" opens a pre-filled GitHub issue (form: `.github/ISSUE_TEMPLATE/feedback.yml`, label `feedback`) or a pre-filled email to the owner. No backend, no key.

## SEO and channel links
Clean URLs `/about`, `/terms`, `/feedback`, `/privacy`; per-page title/description/canonical; JSON-LD (Organization + WebApplication, no ratings); sitemap and robots. Per-channel launch links (`?ref=instagram` etc.) are counted by source in GoatCounter. Owner steps for Google Search Console and Bing: `docs/SEO_SETUP.md`.
