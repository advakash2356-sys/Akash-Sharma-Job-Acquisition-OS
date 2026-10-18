# Momentum: job search OS

A private job-search workspace. Add jobs, score them against **your own resume**, tailor your resume and cover letter, simulate a recruiter's read, prep for interviews, write outreach, and track pay and pace.

## How it works (and what it stores)
- **Your data stays in your browser.** Resume, jobs, notes and preferences are saved in `localStorage`. There is no database. Export or import a JSON backup from *My resume*.
- **Guest mode works with no account.** Optional **Google sign-in** (Firebase Authentication) gives each person a separate workspace on a shared browser: data is stored under keys suffixed with the account id. Sign-in does not upload your data. Setup: see [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md). Without `VITE_FIREBASE_*` variables the sign-in button is disabled.
- **Bring your own free Gemini key** from https://aistudio.google.com/apikey (Settings). It is stored only in your browser (per account), sent in the `x-user-gemini-key` header to this app's own `/api/ai/*` function, and used for that single request. The code does not store or log it. If the site owner sets `GEMINI_API_KEY` on the server, requests without a user key use that key. Without any key, AI buttons are disabled with a pointer to Settings.
- **What Google receives:** for each AI request, your resume text, the job details and any preferences you typed are sent via the function to Google's Gemini API. Google's terms apply (the free tier may use content to improve Google products).
- **No analytics or ad scripts.** Fonts are bundled. "Open in Gmail" and `.eml` are drafts you send yourself; nothing is sent for you.
- **Delete everything:** *Privacy & security* page > "Delete everything from this browser".

## Run
```
npm install
npm run dev     # http://localhost:3000
npm run build
```
AI routes run as Vercel functions (`api/ai/[action].ts`, `api/status.ts`) and locally through `server.ts`; both share `server/handlers.ts`.

## Env vars
See `.env.example`: optional `GEMINI_API_KEY` (server fallback), optional `VITE_FIREBASE_*` (Google sign-in).

Design notes: `DESIGN.md`. License: MIT.
