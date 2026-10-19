# Merge plan: Autonomous-Job-Outreach-Agent-Platform + Recruiter-Scraper-and-Matcher-Game → Job OS

Reviewed read-only on 2026-10-19 (both cloned into /workspace/repos, 5 commits each). Recruiter-Scraper-and-Matcher-Game is a superset of Autonomous-Job-Outreach-Agent-Platform (same server.ts plus pipeline, compliance and achievement modules).

**Secrets in git history:** scanned all commits for Google/OpenAI/GitHub/Slack/Apify keys, OAuth secrets and private keys: none found. `.env.example` holds placeholders only, but `OWNER_EMAIL` and source files hardcode the owner's personal email (`SOVEREIGN_ANCHOR`), which is public in the public repo.

**Real vs simulated:** almost everything server-side is simulated: job "scraping" and recruiter "scouting" ask Gemini to invent postings, recruiter names and "verified" emails; email "dispatch" is fake (`SIMULATED_SERVER_SMTP` + random proof hashes); evaluator, regression, telemetry and token counts use `Math.random`; job lists are seeded (`initialLeads.ts`, `remoteJobsData.ts`) with fabricated URLs. Nothing scrapes LinkedIn, but the YouTube/Instagram "scout" invents contact details (ToS and honesty risk).

| Feature (source) | Real? | Decision | Reason |
|---|---|---|---|
| Fact verifier / "unauthorized skills" scan + Voice DNA banned phrases (`careerOpsVerifier.ts`) | Real, deterministic | **Merge** as *Fact check* on tailored resume, cover letter and outreach | Catches numbers, skills and names the AI added that are not in your resume, plus stock clichés. Runs in the browser, no AI. |
| Compliance CSV export (`/api/compliance/export/csv`) | Real (server, in-memory) | **Merge** as browser-only *Export jobs (CSV)* | Spreadsheet-friendly backup; Job OS only had JSON. |
| Vault calendar events + 48-hour follow-up cadence | Calendar real, cadence simulated | **Merge** as *.ics downloads* for interviews and follow-up reminders | Puts real dates in any calendar app without connecting an account. No automatic sending. |
| Candidate availability / notice period (`/api/candidate/availability`) | Hardcoded to the owner | **Merge** as profile fields *Notice period* and *Available from* | Recruiters ask for it; passed to AI only as your own typed text. |
| Achievement Center (XP, badges, quests) | Real, from local data, but XP/levels are fluff | **Merge (trimmed)** as *Milestones* on the dashboard | Badges from real counts (first application, 10 applications, first interview, offer, 5-day streak). No XP or invented perks. |
| JD fingerprint (SimHash) | Real | **Merge** as duplicate warning when adding a job | Stops tracking the same posting twice. |
| Remote board targets (Himalayas, Remotive, WeWorkRemotely, Wellfound) | Scraping simulated | **Merge as search links only** (We Work Remotely, Remotive) | Real public search pages, checked HTTP 200; no scraping. Himalayas and Wellfound answered 403 to a plain check, so they are left out. FreeHire stays the posting source. |
| LLM "scrape" of remote jobs / YouTube / Instagram recruiter scout | Fabricated | **Drop** | Invents postings, recruiters and emails; ToS risk. |
| Email dispatch (SMTP) | Simulated | **Drop** | Job OS is draft-only (Gmail compose / .eml, Test mode). |
| Local template cover email (`localResumeLLM.ts`) | Real but inserts claims not in the resume | **Drop** | Job OS already has fill-in templates and AI letters grounded in the resume. |
| ATS PDF generator (jsPDF) | Real | **Drop** (duplicate) | Job OS already exports PDF and DOCX with dated names. |
| Resume text extraction | Real | **Drop** (duplicate) | Job OS reads PDF/DOCX/TXT/MD with pdfjs and mammoth. |
| Applicant CRM, Lead dashboard, pipeline studio | Seeded data | **Drop** (duplicate) | Job OS Jobs list/board covers this with real data. |
| CEO orchestrator DAG, worker pool, evaluator-optimizer, prompt registry, memory explorer, telemetry, kill switch, budget override | Simulated (`Math.random`) | **Drop** | Show fake activity; no user value. |
| Sovereign OIDC "root admin" | Hardcoded email check, no real OIDC | **Drop** | Job OS has real (optional) Google sign-in. |
| Consent banner, legal modal, compliance dashboard, TTL purge | Partly real, in-memory server | **Drop** (duplicate) | Job OS stores nothing server-side; Privacy page + Delete everything cover it. |
| Voice dictation → tasks/calendar | Gemini parse, mostly demo | **Drop** | Out of scope for job search. |
| Gamified "matcher game" scoring (75–98% match) | Fabricated range | **Drop** | Job OS fit score is real (AI or labelled keyword). |

## Borrowed from hokage-job-finder (read-only reference, private; not merged, modified or pushed)
Python/LangGraph local agent system. Secret scan of its history: no keys (the only hit is the regex inside its own `scripts/secret_scan.sh`). No code, data, personal details or preferences were copied; these ideas were rewritten in TypeScript for the browser:

| Idea (hokage file) | Ported as |
|---|---|
| Follow-up cadence: one note after 5 business days, a second after 10, max 2, stop on any reply (`followup.py`) | Job drawer *Follow-up schedule* with .ics reminders and "Mark sent"; dashboard *Follow up* uses the same rule |
| Reply classifier: bounce / auto-reply / rejection / interview / positive / question (`followup.py`) | *Sort reply* in the job drawer: paste a reply, rules label it and suggest a status. No inbox access. |
| Government notice parsing: notification no., stated pay, age limit, minimum years, never guessed (`govjobs.py parse_notice`) | Shown on government job cards when the text states them |
| Days-left flag: closed / closes today / closing soon (`govjobs.py flag`) | Next to the last date on government jobs |

Not borrowed: portal adapters for Naukri/Indeed/foundit/Instahyre etc. (scraping, ToS risk), Gmail send/read OAuth and send scheduler (Job OS is draft-only), browser automation and captcha hand-off, salary estimates for government pay levels (would be guesses).
