# Momentum: job search OS

A job-search workspace whose data is stored only in your browser. Add jobs, score them against **your own resume**, tailor your resume and cover letter, simulate a recruiter's read, prep for interviews, write outreach, and track pay and pace.

## How it works (and what it stores)
- **Your data is stored in your browser.** Resume, jobs, notes and preferences are saved in `localStorage`. There is no database. Export or import a JSON backup from *My resume*.
- **Guest mode works with no account.** Optional **Sign in with Google** (Google Identity Services): the browser gets a Google ID token and posts it to `/api/auth/google`, which verifies it with `google-auth-library` (audience = `GOOGLE_CLIENT_ID`, email must be verified) and returns `{sub, email, name, picture}`; nothing is stored or logged server-side. The browser keeps that profile in `localStorage` and keys your data by `sub`. There are no server-side sessions or cloud storage: this separates data per account on one device, it does not sync across devices. Setup: [`GOOGLE_SIGNIN_SETUP.md`](./GOOGLE_SIGNIN_SETUP.md). Without `VITE_GOOGLE_CLIENT_ID` the button is disabled. Sign-out ends the session only.
- **Bring your own free Gemini key** from https://aistudio.google.com/apikey (Settings). It is stored only in your browser (per account), sent in the `x-user-gemini-key` header to this app's own `/api/ai/*` function, and used for that single request. The code does not store or log it. If the site owner sets `GEMINI_API_KEY` on the server, requests without a user key use that key. Without any key, AI buttons are disabled with a pointer to Settings.
- **What Google receives:** for each AI request, your resume text, the job details and any preferences you typed are sent via the function to Google's Gemini API. Google's terms apply (the free tier may use content to improve Google products).
- **No analytics or ad scripts.** Fonts are bundled. "Open in Gmail" and `.eml` are drafts you send yourself; nothing is sent for you.
- **Delete everything:** *Privacy & security* page > "Delete everything from this browser".

- **Guided setup (first screen for new users):** 1) upload a resume (or fill the short Hindi/English form if you have none: age, education, city, skills, preferred work), 2) add a Gemini key (optional for the short form, which still searches and uses keyword fit). Then it runs by itself: `parse-resume` (Gemini fills empty profile fields from your resume text; all editable), a job search on **FreeHire** (see below), and `fit-jobs` (Gemini scores fit, batched 10 per call; if Gemini fails, a plain keyword-match score is used and labelled as such). Nothing is invented: every job comes from FreeHire with its original link, source and posted date. If FreeHire fails or finds nothing, the page shows the real error and links to LinkedIn / Indeed / Google Jobs search pages.
- **Real jobs come from [FreeHire](https://github.com/strelov1/freehire)** (MIT, keyless public API, see `docs/FREEHIRE.md`). The browser calls this app's `/api/jobs/search`, which calls `https://freehire.me/api/v1/jobs/search`. **What FreeHire receives: only your target job titles (up to 14), country code(s), city names, an entry-level flag, and (government jobs) a flag plus education level, sent from this app's server. Never your resume text, name, age, phone or key.** Government jobs: FreeHire's official-source postings are kept only if they carry a .gov.in/.nic.in notification link and a future last date; a public SarkariMap RSS feed is added and labelled as an aggregator (the page links onward to the official notice). NCS, DSSSB, SSC etc. are not scraped; the app links to their portals instead. **Test mode** (Outreach/Settings toggle) prefixes email subject and body with `[TEST - please ignore]`; the app never sends email, it only makes a Gmail compose link or .eml. FreeHire also sees the server's IP address, as any web service would. The proxy caches identical searches for 10 minutes and limits each client to 12 searches per minute (in-memory, best effort on serverless). Postings can be stale; the UI says to verify before applying.

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
