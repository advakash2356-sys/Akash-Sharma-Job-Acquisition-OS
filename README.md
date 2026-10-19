# Momentum: job search OS

A private job-search workspace. Add jobs, score them against **your own resume**, tailor your resume and cover letter, simulate a recruiter's read, prep for interviews, write outreach, and track pay and pace.

## How it works (and what it stores)
- **Your data stays in your browser.** Resume, jobs, notes and preferences are saved in `localStorage`. There is no database. Export or import a JSON backup from *My resume*.
- **Guest mode works with no account.** Optional **Sign in with Google** (Google Identity Services): the browser gets a Google ID token and posts it to `/api/auth/google`, which verifies it with `google-auth-library` (audience = `GOOGLE_CLIENT_ID`, email must be verified) and returns `{sub, email, name, picture}`; nothing is stored or logged server-side. The browser keeps that profile in `localStorage` and keys your data by `sub`. There are no server-side sessions or cloud storage: this separates data per account on one device, it does not sync across devices. Setup: [`GOOGLE_SIGNIN_SETUP.md`](./GOOGLE_SIGNIN_SETUP.md). Without `VITE_GOOGLE_CLIENT_ID` the button is disabled. Sign-out ends the session only.
- **Bring your own free Gemini key** from https://aistudio.google.com/apikey (Settings). It is stored only in your browser (per account), sent in the `x-user-gemini-key` header to this app's own `/api/ai/*` function, and used for that single request. The code does not store or log it. If the site owner sets `GEMINI_API_KEY` on the server, requests without a user key use that key. Without any key, AI buttons are disabled with a pointer to Settings.
- **What Google receives:** for each AI request, your resume text, the job details and any preferences you typed are sent via the function to Google's Gemini API. Google's terms apply (the free tier may use content to improve Google products).
- **No analytics or ad scripts.** Fonts are bundled. "Open in Gmail" and `.eml` are drafts you send yourself; nothing is sent for you.
- **Delete everything:** *Privacy & security* page > "Delete everything from this browser".

- **Guided setup (Guided setup page, first screen for new users):** 1) upload a resume, 2) add a Gemini key. Then it runs by itself: `parse-resume` (Gemini fills name, headline, contact, location, links, skills, experience, target titles and pay only if the resume states one; only empty fields are filled, all editable) and `suggest-jobs`. `suggest-jobs` first tries Gemini with the Google Search grounding tool. If that works, suggestions come from web results and a per-job link is kept only when its site appears in the search sources. If grounding is not available for the key, the UI says so with Google's reason and only produces role titles plus links to real LinkedIn / Indeed / Google Jobs search pages. No postings or URLs are invented. Every suggestion is a Saved job labelled "AI-suggested, verify before applying". Data stays in the browser.

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
