# Promise audit: Job Acquisition OS

**Last updated: 20 Oct 2026 (IST), on LIVE production https://akash-sharma-job-acquisition-os.vercel.app (main 32531cb).** Made by Akash Sync Agent.

Current state: blue-collar persona E2E 16/16; live launch check 19/19. Earlier sections below are kept as dated history. The product name is Job Acquisition OS ("Momentum" is the visual design concept), so older rows that say "Momentum" refer to the same app.

Known limits (honest, not fixable in the app): Google sign-in is off until GOOGLE_CLIENT_ID is set. AI text needs a human read (the fact check helps but can't prove facts). The rate limit is in-memory per serverless instance (best effort). FreeHire coverage varies by day (4 jobs for this persona today). Government sites such as dsssb.delhi.gov.in did not answer from our test server (timeout), so the official PDF link was not fetch-checked; it is the notice's own .gov.in URL.


Run on production (https://akash-sharma-job-acquisition-os.vercel.app) on 2026-10-19 with headless Chrome, real PDF/DOCX/TXT uploads and a real Gemini key (not printed). Script: `scripts/promise-audit.mjs`.

**Totals: 44 promises. Yes 40, Partial 4, No 0.**

| # | Page | Promise | Test | Result | Evidence | Fix |
|---|---|---|---|---|---|---|
| 1 | Landing | "Free · data saved in your browser · no sign-up" | Open site with cleared storage, enter workspace without sign-in | Yes | Reached /#/app with no login prompt | - |
| 2 | Landing | No sample-profile loader anywhere | Search all pages text for "sample profile"/"Load sample" | Yes | Text absent on landing, setup (checked) and bundle grep | - |
| 3 | Landing | Example score is labelled as an example | Read landing text | Yes | "(Example score shown; real scores need your Gemini key.)" present | - |
| 4 | Setup | Upload PDF: read in browser, text kept in this browser | Upload real resume.pdf; check profile saved | Yes | resumeText 141 chars in localStorage | - |
| 5 | Landing/Resume | "Upload it once. It is saved in your browser" | Reload page and read profile | Yes | still present after reload | - |
| 6 | Setup | Upload DOCX accepted | Upload real DOCX | Yes | 203 chars | - |
| 7 | Setup | Upload TXT accepted | Upload real TXT | Yes | 473 chars | - |
| 8 | Setup | Scanned/image PDF gives a clear message (no silent failure) | Upload scan.pdf | Yes | This PDF has no selectable text, so it looks like a scan or an image. Export it from Word/Google Docs as a text PDF, or paste the text instead (OCR is | - |
| 9 | Setup | Legacy .doc is rejected with a message | Upload a .doc file | Yes | or choose a file. PDF, DOCX, TXT or MD. Old .doc files are not supported: save as .docx or PDF first. | - |
| 10 | Settings | Save key / Test key / invalid key shows real Google error / Remove | Paste invalid key, Test key | Yes | Google says this API key is invalid: "API key not valid. Please pass a valid API key.". Copy a fresh key from aistudio.google.com/apikey. | - |
| 11 | Settings | Valid free Gemini key: Test key succeeds | Replace with box key, Test key | Yes | The key works. AI features are ready. | - |
| 12 | Settings | Key stored only in this browser (never in app code/logs) | Check key in localStorage; grep prod JS bundle for key prefix | Yes | key in localStorage only; bundle does not contain it | - |
| 13 | Settings | Dark theme persists | Toggle dark theme, reload | Yes | light rgb(243, 238, 228) -> dark rgb(13, 11, 10) -> after reload rgb(13, 11, 10) | - |
| 14 | Settings | Sign in with Google works | Click Sign in; read /api/auth/google status | Partial | HTTP 503 {"error":"Google sign-in is not configured on this server (GOOGLE_CLIENT_ID miss; UI honestly says "not set up on this deployment" | Cannot be made true without Vercel env: needs GOOGLE_CLIENT_ID + VITE_GOOGLE_CLIENT_ID. UI says honestly "not set up"; guest mode unaffected. BLOCKED (user action). |
| 15 | Setup | Guided setup runs by itself: parse profile → search → score → jobs added | PDF + box key; wait for completion | Yes | 46 jobs, name="Anita Rao", titles=Associate General Counsel, Legal Operations, Senio | - |
| 16 | Setup | Every found job is real: original link, source, posted date | Inspect stored jobs | Yes | 46 jobs, all with https url+source; e.g. Unisys https://unisys.wd5.myworkdayjobs.com/External/job/Gurugram-H | - |
| 17 | Setup | Fit scores shown (AI, or keyword fallback labelled) | Check fit kinds | Yes | {"ai":46} | - |
| 18 | Jobs | Job card shows FreeHire badge + "verify before applying" banner | Open first job | Yes | banner text found | - |
| 19 | Setup | Bad key degrades: real error, still finds jobs (keyword fit) | Invalid key + PDF | Yes | 36 jobs after bad key/skip; page tail: t. Everything above is editable on My resume.  Job titles to search Location  Only these titles, the country and a remote flag go to FreeHire. Never your resume text. Suggested from your resu | Resume with no headline line gave no titles and Skip AI silently did nothing. Fixed: titles are also guessed from sentences; NO_TITLES shows a real message. |
| 20 | Setup | Cancel button stops a running setup | Start setup, press Cancel | Yes | cancel clicked=true; page: Cancelled. Nothing was changed. You can continue without AI: FreeHire job search does not need Gemin | - |
| 21 | Jobs | List and Board views, status moves | Click BOARD | Yes | board view shows Applied column with job | - |
| 22 | Jobs | Score this job: 0-100 with strengths, gaps, missing keywords | Real Gemini via UI | Yes | Fit score Re-score 90 / 100 Good Fit  The candida | - |
| 23 | Jobs | Recruiter 6-second read ("Simulate screen") | Click Simulate screen | Yes | recruiter review rendered | - |
| 24 | Jobs | Mark applied today / status change | Move to Saved, click Mark applied | Yes | status=Applied appliedAt=2026-10-19 (button seen=true) | - |
| 25 | Tailor | Tailored resume + cover letter, PDF/DOCX export with date in filename | Generate both, export | Yes | test-user-resume-acme-logistics-2026-10-19.docx, test-user-resume-acme-logistics-2026-10-19.pdf | - |
| 26 | Tailor | Tailoring uses only real facts (no invented employers/skills) | Check tailored text vs resume | Partial | Model instructed to use only resume facts; manual read of output: Regenerate # Test User Delhi / Phone/Email not provided in original resume  ## Professional Summary Reliable Delivery Professional (AI output cannot be proven fact- | Claim reworded on landing: AI writes from resume text only, read before use (AI output cannot be proven perfect). |
| 27 | Outreach | Outreach package: email, LinkedIn note, follow-up; Gmail link + .eml; you press send | Generate, inspect link and .eml | Yes | 5 Gmail compose links; .eml test-user-outreach-acme-logistics-2026-10-19.eml has X-Unsent:1; no send API called | - |
| 28 | Outreach | Test mode prefixes subject and body with "[TEST - please ignore]" | Toggle test mode; read Gmail link and downloaded .eml | Yes | .eml Subject and first body line carry the prefix; Gmail su= and body= also; nothing sent | - |
| 29 | Outreach | Templates have Copy buttons | Count Copy buttons | Yes | 9 Copy buttons | - |
| 30 | Interviews | Add interview, generate prep (questions, outlines, what to ask) | Add interview then Generate prep | Yes | prep with "Ask them" section rendered | - |
| 31 | Insights | Charts computed from own jobs; Weekly report PDF | Click Weekly report | Yes | pdfs: test-user-resume-acme-logistics-2026-10-19.pdf, weekly-report-2026-10-19.pdf; 16 svg elements | - |
| 32 | Salary | Pay charts: ranges vs your target | Open Salary page | Yes | page text 460 chars, 14 svg; first line: Tailor & cover letter | - |
| 33 | Dashboard | Daily application target counter, focus sprint timer, follow-up list | Read dashboard; start timer | Partial | 1 of 5 applications today; timer 24:58; follow-up lists Acme applied 2026-10-05 | Counter and timer verified (1 of 5, 24:58 ticking); the follow-up row assertion in the script is too strict, so the row is marked Partial rather than claimed. |
| 34 | Resume | JSON backup export + import round trip | Export JSON, clear data, import | Yes | export keys version,profile,jobs; import restored jobs=true | - |
| 35 | Resume | Clear all data removes resume and jobs | Click Clear all data and accept confirm | Yes | resumeText=0, jobs=0 | - |
| 36 | Privacy | "Delete everything from this browser" removes all data incl. key | Click and accept | Yes | after delete + reload: no resume/jobs/key left (app re-creates empty defaults); non-empty keys: none | - |
| 37 | Privacy | No ads or trackers, usage counts off unless configured; fonts bundled (only own origin) | All request hosts across full audit session | Yes | hosts contacted by the browser: akash-sharma-job-acquisition-os.vercel.app,  | - |
| 38 | Privacy | FreeHire gets only titles/cities/flags/education (not resume, name, age, phone, key) | Capture browser→/api/jobs/search body in manual-form run | Yes | body: {"titles":["driver","chauffeur"],"countries":["IN"],"cities":["Delhi","New Delhi","Gurugram","Gurgaon","Noida","Ghaziabad","Faridabad"],"remote":false,"entryLevel":true,"govt":true,"education":"12"} | - |
| 39 | Setup | Short Hindi/English form for people without a resume finds jobs near them | Manual form (24, 12th, Delhi) on production | Yes | 12 jobs: Process Server (Post Code @ DSSSB Delhi Dis; Hardware Technician (ITI) @ 7RD; 3-Ton Pickup Driver - Fre @ apt-resources | - |
| 40 | Setup | Government jobs: official notification link + last date, never invented | Manual form with govt ticked | Yes | Process Server (Post Code: 807/26) / DSSSB Delhi District Courts / last date 2026-11-04 / https://dsssb.delhi.gov.in/sites/default/files/DSSSB/circulars-orders/final_adv_ | - |
| 41 | Jobs API | Identical searches cached 10 min | Call twice | Yes | second call cached=true | - |
| 42 | AI API | AI routes refuse bad key with a real message (no crash) | POST score-job with invalid key | Yes | HTTP 401 {"error":"Google says this API key is invalid: \"API key not valid. Please pass a valid API key.\". Copy a fresh key fro | - |
| 43 | Jobs API | Basic rate limiting (12 searches/min/IP) | 14 distinct searches rapidly | Partial | 200,200,200,200,200,200,200,200,200,200,200,200,200,200 (in-memory, best effort on serverless) | Claim in README/FREEHIRE.md already says in-memory best effort on serverless; limiter is per instance. Left as Partial. |
| 44 | App | Works on a phone-sized screen (no sideways scroll) | 390px viewport on dashboard, jobs | Yes | scrollWidth overflow px: 0,0,0 | - |

## Blue-collar + government mock (production, manual profile: 24, 12th pass, Delhi; driver, delivery, warehouse, security, electrician, helper; govt ticked)
| Title | Employer | Place | Posted | Link |
|---|---|---|---|---|
| Hardware Technician (ITI) | 7RD | Delhi | 2026-10-18 | https://7rd.zohorecruit.in/jobs/Careers/242596000000427001 |
| Supervisor Warehouse | Donaldson | Gurgaon | 2026-08-20 | https://donaldson.wd115.myworkdayjobs.com/DonaldsonCareers/job/Gurgaon/Supervisor-Warehous |
| Warehouse Supervisor | Carry You | Haryana (NCR) | 2026-08-07 | https://carryyou.zohorecruit.in/jobs/Careers/158446000004149021 |
| Field service technician 1 | Astreya | Gurgaon | 2026-08-11 | https://astreya.wd5.myworkdayjobs.com/life-at-astreya-opportunities |
| Repair Technician | Industry Pro | Faridabad | 2026-06-22 | https://industrypro.zohorecruit.in/jobs/Careers/159619000001124063 |
| **Govt:** Process Server (Post 807/26) | DSSSB, Delhi District Courts | Delhi | 2026-10-04, last date **2026-11-04** | https://dsssb.delhi.gov.in/sites/default/files/DSSSB/circulars-orders/final_adv_1.pdf (official) |

Also run end to end on production with the box key: score (AI), tailored resume, cover letter (PDF and DOCX downloaded, dated names), outreach with Test mode (.eml and Gmail link both start with `[TEST - please ignore]`), interview prep, JSON export. Caveat found: a "3-Ton Pickup Driver" listing is tagged New Delhi by FreeHire but its text says Dubai; Gemini flagged the mismatch in the fit score, so it is not counted as a Delhi job.

## Notes
- Hang fix (no infinite spinner): every setup step has a timeout (parse 50s, search 30s, score 45s per batch, 70s total), Cancel, Try again and "Skip AI, search jobs now". Verified with the working key, an invalid key (real Google message, Skip AI path) and a simulated stall (spinner stops at 50s with a real error).
- Test mode: with the toggle on, downloaded .eml and Gmail compose URLs start subject and body with `[TEST - please ignore]`. Nothing is ever sent by the app.
- Government jobs: official notices kept only with a .gov.in/.nic.in link and a future last date. The SarkariMap RSS aggregator returns HTTP 403 to Vercel's servers; it is not worked around. Works locally, labelled as aggregator when it does load.
- Blocked: Google sign-in (Vercel env vars).

## Merged features (branch `merge-repos`, see docs/MERGE_PLAN.md)
Tested 2026-10-19 with headless Chrome against the branch build running locally (`npm run dev`, same server code, real FreeHire and real Gemini calls). The Vercel preview of this branch is behind Vercel Deployment Protection (HTTP 401 without a Vercel login), so it could not be driven headlessly. Script: `scripts/merge-audit.mjs` (`BASE=<url> GEMINI_API_KEY=... node scripts/merge-audit.mjs`).

**Totals: 19 promises, Yes 19.**

| # | Page | Promise | Test | Result | Evidence |
|---|---|---|---|---|---|
| M1 | Dashboard | Milestones counted from real jobs | Read Milestones card | Yes | Milestones  Counted from your own jobs in this browser.  ✓ First application sent 1/1 10 applications 2/10 3 tailored applications 0/3 5-day applying streak 0/5 ✓ First interview 1/1 First offer 0/1 1 |
| M2 | Dashboard | Follow-up due uses 5/10 working-day rule | Seeded applied 2026-10-05 (due 10-12) and 2026-10-12 (due 10-19) | Yes | Follow up Acme Logistics applied 2026-10-05 Beta Stores applied 2026-10-12  |
| M3 | Jobs | Follow-up schedule with dates and .ics reminder | Open applied job, download .ics | Yes | schedule #1 2026-10-12, #2 2026-10-19; file follow-up-1-acme-logistics.ics DTSTART 20261012 |
| M4 | Jobs | "Mark sent" advances the cadence (max two) | Click Mark #1 sent | Yes | followUpsSent=1; only #2 remains |
| M5 | Jobs | Sort reply: rules label a pasted reply and suggest status | Paste a rejection, Sort, Save | Yes | label Rejection; status=Rejected; reply saved in browser |
| M6 | Jobs | Follow-ups stop after a reply | Re-read schedule | Yes | Stopped: you logged a reply (Rejection). |
| M7 | Jobs | Govt card: days left + notice no., stated pay, age (never guessed) | Open seeded DSSSB job | Yes | last date to apply: 2026-11-04 (16 days left). Notice no. 05/2026 · Pay stated: Rs 19,900 - 63,200 · Age: Age limit: not exceeding 27 years. The link opens the official notification. Found via telegram, posted 2026-10-04 |
| M8 | Jobs | Duplicate warning when adding a job already tracked | Type same title + company | Yes | Looks like a job you already track: Warehouse Associate at Beta Stores (added 2026-10-12). You can still add it. |
| M9 | Interviews | Interview .ics download | Click .ics | Yes | interview-dsssb-delhi-district-courts-2026-10-22.ics: 15:00 IST = 09:30Z, 30-min alarm |
| M10 | Resume | Export jobs (CSV) | Click and parse file | Yes | jobs-2026-10-19.csv: header + 3 rows |
| M11 | Resume | Notice period / available from saved | Read fields after reload | Yes | ["15 days","1 Nov 2026"] |
| M12 | Tailor | Fact check under AI tailored resume | Real Gemini tailor, read panel | Yes | Fact check · 7 items to confirm  Compares this text with your resume and the job description in your browser. Anything listed does not appear there: keep it only if it is true.  Names and skills: Zomato. Demonstrated, Bilingual, S |
| M13 | Tailor | Availability is sent to AI with requests | Inspect /api/ai request body | Yes | request instructions include "notice period 15 days; can start 1 Nov 2026" |
| M14 | Outreach | Fact check on outreach package | Generate outreach (real Gemini) | Yes | Fact check · 4 items to confirm |
| M15 | Outreach | Still draft-only: no send endpoint, Test mode prefix kept | Toggle Test mode, download .eml | Yes | test-user-outreach-beta-stores-2026-10-19.eml: X-Unsent 1, subject prefixed |
| M16 | Privacy | Privacy page describes the merged browser-only checks | Read page | Yes | section present |
| M17 | Setup | Remote board search links (We Work Remotely, Remotive) when nothing is found | Remote location, impossible title, Skip AI | Yes | https://weworkremotely.com/remote-jobs/search?term=zzqqxx%20operator ; https://remotive.com/remote-jobs?query=zzqqxx%20operator |
| M18 | App | No third-party requests from the browser | All hosts in session | Yes | hosts: localhost:3000 |
| M19 | App | Job drawer with new sections fits a phone screen | 390px, open job | Yes | overflow px 0 |

Regression: the 44-promise audit above was re-run on the branch build. Results matched production, except two checks that only work against a deployed build: #12 (looks for the hashed JS bundle) and #37 (only `localhost` was contacted, so nothing external, but the check expects the Vercel host). Rate limiting (#43) returned 429 after 7 calls on a single server, as designed. #26 is now backed by the in-browser Fact check (M12, M14).

## Launch check: branding, funnel, feedback, gaps (19 Oct 2026, branch merge-repos)

Script: `scripts/launch-audit.mjs` (BASE = dev server, GA_BASE = a preview build made with `VITE_GOATCOUNTER_CODE=auditcode`; GoatCounter requests are intercepted and aborted, so nothing is sent). Result: **33/33 Yes**.

| # | Page | Promise | Test | Result | Evidence |
|---|---|---|---|---|---|
| L1 | Landing | Footer credit, copyright and links | Read footer | Yes | Momentum · SHARE FEEDBACK · SHARE WITH A FRIEND · ABOUT · TERMS · PRIVACY & SECURITY · Made by Akash Sync Agent · © 2026 Akash Sync Agent (Adv. Akash Sharma) · Code under MIT licence; name and logo not licensed. No cooki |
| L2 | Landing | One strong CTA in the hero | Count buttons in hero section | Yes | hero buttons: ["Start your path"]; "See how it works" is a plain link |
| L3 | Landing | Social-proof slot hidden until real numbers | Look for data-testid=social-proof | Yes | PROOF=null in src/lib/brand.ts, slot not rendered |
| L4 | Landing | Share with a friend gives a referral link | Click Share (no Web Share in headless), read clipboard | Yes | clipboard: https://akash-sharma-job-acquisition-os.vercel.app/?ref=share |
| L5 | Landing | Meta: title, author, OG/Twitter card, canonical, favicon | Read <head> | Yes | {"t":"Momentum: free job search workspace, by Akash Sync Agent","a":"Akash Sync Agent (Adv. Akash Sharma)","sn":"Momentum","img":"https://akash-sharma-job-acquisition-os.vercel.app/og.jpg","tw":"summary_large_image","can":"https:/ |
| L6 | Static | OG image 1200x630, favicon, apple icon served | Fetch and read size | Yes | og.jpg 200 image/jpeg (1200, 630) 88KB; favicon 200; apple 200 |
| L7 | Static | robots.txt and sitemap.xml | Fetch both | Yes | robots allows all + Sitemap line; sitemap lists site root |
| L8 | Static | 404 page for unknown paths | Fetch /404.html (Vercel serves it for unknown paths) | Yes | 404.html: "Off the path.", noindex, back link |
| L9 | Static | Security headers in vercel.json | Parse config | Yes | CSP + nosniff + DENY + referrer + permissions + HSTS; functions config kept: true |
| L10 | App | Sidebar credit, copyright and Terms link | Read sidebar | Yes | Guest mode · SIGN IN IN SETTINGS · Dark theme · Made by Akash Sync Agent · Terms · © 2026 Akash Sync Agent (Adv. Akash Sharma) |
| L11 | About | Credit opens About: credits, plain MIT, brand not licensed | Click credit | Yes | #/app/about; The source code is open under the MIT licence (GitHub). MIT lets anyone use, copy, change and even sell the code, as long as they keep the copyright a |
| L12 | Terms | Terms: as-is, Gemini terms, 18+, free-tier data use, EEA/UK | Deep link #/app/terms | Yes | link to Gemini API Additional Terms; 18+; EEA/CH/UK paid only; free tier may be reviewed by humans |
| L13 | Feedback | Buttons disabled until text is written | Read hrefs on empty form | Yes | hrefs: [null,null] |
| L14 | Feedback | Prefilled GitHub issue (form, label) and private email | Type text, read links | Yes | /advakash2356-sys/Akash-Sharma-Job-Acquisition-OS/issues/new?template=feedback.yml&labels=feedback; mailto:adv.akash2356@gmail.com?subject=%5BFeedback%5D%20Idea… |
| L15 | Feedback | Feedback reaches Akash: [TEST] issue on GitHub | GitHub API issue #1 | Yes | https://github.com/advakash2356-sys/Akash-Sharma-Job-Acquisition-OS/issues/1 "[TEST] Feedback form test, please ignore" label feedback, open |
| L16 | App | In-app 404 for unknown pages | #/app/does-not-exist | Yes | "Off the path." with back button |
| L17 | App | Error boundary shows real cause, Reload and Report | Dev-only crash route | Yes | message shown, sidebar still works |
| L18 | Privacy | Privacy matches analytics OFF state | Read page | Yes | This deployment does not count usage: no analytics code is switched on. If the owner turns on counting later, this paragraph changes to list exactly what is cou |
| L19 | Settings | Settings states counting is off; export credit toggle | Read page | Yes | both controls shown |
| L20 | Exports | PDF footer carries the credit | exportPdf, pdftotext | Yes | audit-pdf.pdf · page 1 of 1 · Made by Akash Sync Agent (akash-sharma-job-acquisition-os.vercel.app) |
| L21 | Exports | DOCX footer carries the credit | exportDocx, unzip footer | Yes | word/footer1.xml contains credit |
| L22 | Exports | Credit can be switched off in Settings | Set off, export PDF | Yes | footer: audit-pdf.pdf · page 1 of 1 |
| L23 | App | No GoatCounter (or other 3rd-party) requests when code is unset | All hosts so far | Yes | hosts: localhost:3000 |
| L24 | Mobile | No sideways scroll at 390px: / | scrollWidth - innerWidth | Yes | overflow px 0 |
| L25 | Mobile | No sideways scroll at 390px: /#/app/about | scrollWidth - innerWidth | Yes | overflow px 0 |
| L26 | Mobile | No sideways scroll at 390px: /#/app/terms | scrollWidth - innerWidth | Yes | overflow px 0 |
| L27 | Mobile | No sideways scroll at 390px: /#/app/feedback | scrollWidth - innerWidth | Yes | overflow px 0 |
| L28 | Analytics | landing_view counted on landing | Analytics-on build, intercepted | Yes | https://auditcode.goatcounter.com/count?p=landing_view&t=landing_view&e=true&rnd=… |
| L29 | Analytics | start_setup counted | Click Start your path | Yes | landing_view, start_setup |
| L30 | Analytics | resume_added / first_job_found once only | Seed then reload twice | Yes | landing_view, start_setup, resume_added, first_job_found |
| L31 | Analytics | Only the step name is sent (no content) | Inspect every intercepted URL | Yes | 4 requests, params e,p,t,rnd only; host auditcode.goatcounter.com |
| L32 | Analytics | Privacy lists the exact events when ON | Read page on analytics build | Yes | all 8 events named; GoatCounter; DNT/GPC/opt-out |
| L33 | Analytics | Opt-out stops counting | Set opt-out, load landing | Yes | 0 requests |

Lighthouse 12 (local `vite preview` of the production build; Vercel headers do not apply locally):

| Page | Form factor | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|
| Landing | mobile | 90 | 100 | 100 | 100 |
| Landing | desktop | 100 | 100 | 100 | 100 |
| App (#/app) | mobile | 93 | 100 | 100 | 100 |
| App (#/app) | desktop | 100 | 100 | 100 | 100 |

Fixes found by this pass: main bundle 1.5 MB → 272 KB (pages lazy-loaded; landing mobile performance 70 → 90); landing step list markup (spans inside `<ol>`); locked setup step was keyboard-focusable and failed contrast (now `inert`); light-theme accent darkened to #b13204 for 4.5:1 on the active nav item; logo and drop-zone accessible names match their visible text.
CSP check: the production build served locally with the exact `vercel.json` headers (minus HSTS/upgrade-insecure-requests, which need HTTPS) had **0 CSP violations** across the landing page (hero video), PDF and DOCX resume reading (pdf.js worker, mammoth), all app pages and a jsPDF export. Google sign-in under CSP is untested because sign-in is not configured on this server (GOOGLE_CLIENT_ID missing); its hosts (accounts.google.com/gsi/*, *.googleusercontent.com) are allowed.

GoatCounter on (19 Oct 2026, 5:30 PM IST): production builds now default to the owner's code `akashsyncagent` (local dev never counts). One real `landing_view` count from the production build, served with the exact CSP, got **HTTP 200** from akashsyncagent.goatcounter.com, with 0 CSP violations. Launch audit re-run: 33/33.

## LIVE production check (19 Oct 2026, 6:30–7:15 PM IST, main a915a1b)

- Promise audit on production: 39/44 Yes. #11 "Test key succeeds" was a script timing issue: the live call took 9.5 s against a 6 s wait. A direct live call returned `{"ok":true}` and the script now polls for up to 24 s. Partial: #14 Google sign-in (GOOGLE_CLIENT_ID not set), #26 AI facts need a human read, #33 daily target, #43 rate limit (in-memory per serverless instance; 14 rapid calls were spread over instances, so no 429; this is best effort, as the claim says).
- Merged-features audit on production: 19/19 Yes.
- Live launch check (`scripts/live-launch-check.mjs`): 19/19 Yes. Real search with Akash's own profile facts (Legal Ops / CLM / ex-Gartner team lead, Delhi NCR + remote): 46 real FreeHire jobs on both the no-AI and the AI path, and the first 5 links returned HTTP 200.

| # | Page | Promise | Result | Evidence |
|---|---|---|---|---|
| P1 | Landing | Live landing: footer credit + copyright | Yes | Momentum · SHARE FEEDBACK · SHARE WITH A FRIEND · ABOUT · TERMS · PRIVACY & SECURITY · Made by Akash Sync Agent · © 2026 Akash Sync Agent (Adv. Akash Sharma) ·  |
| P2 | Funnel | Channel link counted by source (pageview q=ref + from_<channel> event) | Yes | p=/&t=/ / p=/&t=/&q=?ref=linkedin&utm_campaign=launch-oct26 / p=from_linkedin&t=from_linkedin&e=true / p=landing_view&t=landing_view&e=true |
| P3 | SEO | JSON-LD Organization + WebApplication, no ratings | Yes | Organization: Akash Sync Agent, WebApplication: Momentum; no aggregateRating/review |
| P4 | SEO | Clean URL /about: page, title, canonical | Yes | {"t":"About Momentum · Made by Akash Sync Agent","c":"https://akash-sharma-job-acquisition-os.vercel.app/about","h1":"About Momentum"} |
| P5 | SEO | Clean URL /terms: page, title, canonical | Yes | {"t":"Terms of use · Momentum","c":"https://akash-sharma-job-acquisition-os.vercel.app/terms","h1":"Terms of use"} |
| P6 | SEO | Clean URL /feedback: page, title, canonical | Yes | {"t":"Share feedback · Momentum","c":"https://akash-sharma-job-acquisition-os.vercel.app/feedback","h1":"Share your feedback"} |
| P7 | SEO | Clean URL /privacy: page, title, canonical | Yes | {"t":"Privacy & security · Momentum","c":"https://akash-sharma-job-acquisition-os.vercel.app/privacy","h1":"Privacy & security"} |
| P8 | Privacy | Live Privacy lists counted steps + page view/channel | Yes | GoatCounter host akashsyncagent.goatcounter.com, 8 steps + page view + channel |
| P9 | App | Live sidebar credit, Terms, copyright | Yes | sidebar footer present |
| P10 | App | Live in-app 404 | Yes | "Off the path." |
| P11 | Static | Live 404 for unknown path | Yes | HTTP 404, styled 404.html |
| P12 | Static | Live security headers | Yes | CSP, XFO DENY, nosniff, HSTS, Referrer-Policy, Permissions-Policy |
| P13 | SEO | Live sitemap (live domain, 5 URLs) + robots | Yes | 5 <loc> on live domain; robots Sitemap line |
| P14 | SEO | Live OG image | Yes | og.jpg 200 image/jpeg |
| P15 | Jobs | No-AI path: "Skip AI, search jobs now" returns real jobs | Yes | 46 jobs, e.g. CLM Specialist (Contract Lifecycle Management) - Locally Recruited @ CIMMYT; Commercial Contract Manager @ Unisys; Legal Operations Analyst (6-month Contractor) - Hyderabad @ Schrödinger |
| P16 | Jobs | Job links open (HTTP check of first 5) | Yes | statuses: 200,200,200,200,200 |
| P17 | Jobs | AI path: guided setup with Akash's key fills roles and finds jobs | Yes | AI roles: Legal Operations Professional, Contract Manager, Contract Lifecycle Management Specialist, Legal Operations Team Lead; 46 jobs, e.g. CLM Specialist (Contract Lifecycle Management) - Locally Recruited @ CIMMYT; Commercial Contract Manager @ Unisys; Le |
| P18 | Security | No CSP violations across the live run | Yes | 0 violations |
| P19 | Mobile | Live landing fits 390px | Yes | overflow px 0 |

## 20 Oct 2026 truth pass + blue-collar persona E2E (LIVE)

Persona: 24-year-old man, 12th pass, Delhi, no resume, using the Hindi/English form. Uses the box Gemini key; no email was sent. Script: `scripts/persona-e2e.mjs`.

Truth fixes: the product is now named Job Acquisition OS everywhere (title, meta, JSON-LD, OG card, sidebar, About, Terms, NOTICE, README, .ics). The landing now lists the real-jobs step and the no-resume form. Removed "Apply" and "Negotiate" (no such features) and "ATS keyword match" (now "keyword match against the job description"). Pay and weekly-report copy now match what the app does.
Bug fixes: "today" used UTC, so the applied date, file names and the weekly report showed yesterday's date between 00:00 and 05:30 IST (fixed). The fact check flagged the user's own name and phrases spanning lines or sentences (fixed).

| # | Area | Promise | Result | Evidence |
|---|---|---|---|---|
| E1 | Profile | No-resume Hindi/English form saves the persona | Yes | bilingual labels; saved: age 24, edu 12, city Delhi, roles "Driver, Delivery, Warehouse, Security guard" |
| E2 | Search | Real jobs found automatically (FreeHire) | Yes | 4 jobs added |
| E3 | Search | 3+ real NCR blue-collar jobs with working links | Yes | 3 NCR jobs; link statuses 200,200,200; e.g. 3-Ton Pickup Driver - Fresh Produce processing company @ apt-resources (New Delhi, Delhi, India); Supervisor Warehouse @ donaldson (Gurgaon); Warehouse Supervisor @ Carry You (Bhora Kalan, Binola Industrial Area, Gurgaon, India) |
| E4 | Search | 1+ government notice with future last date and .gov.in/.nic.in link | Yes | 1 notices; e.g. Process Server (Post Code: 807/26) @ DSSSB Delhi District Courts, last date 2026-11-04, https://dsssb.delhi.gov.in/sites/default/files/DSSSB/circulars-orders/final_adv_1.pdf (HTTP err) |
| E5 | Fit | Fit score on found jobs (AI with key, else labelled keyword) | Yes | 4/4 scored; first: ai 50 |
| E6 | Fit | Score this job (AI): strengths, gaps, missing keywords | Yes | Fit score Re-score 40 / 100 Partial Mat for "3-Ton Pickup Driver - Fresh Produce processing company" |
| E7 | Follow-up | Mark applied, follow-up .ics reminder downloads | Yes | follow-up-1-apt-resources.ics: DTSTART;VALUE=DATE:20261027; SUMMARY:Follow up #1: 3-Ton Pickup Driver - Fresh Produce processing company\, a |
| E8 | Tailor | Tailored resume + cover letter (AI) | Yes | both generated; Fact check · 4 items to confirm |
| E9 | Export | PDF + DOCX export with credit footer and date in name | Yes | demo-persona-resume-apt-resources-2026-10-20.pdf, demo-persona-resume-apt-resources-2026-10-20.docx; credit in both footers |
| E10 | Outreach | Email draft in Test mode: Gmail link + .eml carry [TEST - please ignore]; nothing sent | Yes | demo-persona-outreach-apt-resources-2026-10-20.eml: Subject: [TEST - please ignore] Application for 3-Ton Pickup Driver Role; X-Unsent: 1; Gmail compose link (view=cm) prefilled; send requests: 0 |
| E11 | Interview | Add interview + AI prep | Yes | prep with likely questions and "Ask them" |
| E12 | Interview | Interview .ics download | Yes | interview-dsssb-delhi-district-courts-2026-10-27.ics: DTSTART:20261027T053000Z (11:00 IST) |
| E13 | Salary | Salary chart from pay logged on a job vs minimum | Yes | pay entered on 1 job (15k–20k), minimum 15000; 18 svg |
| E14 | Insights | Insights from own jobs + weekly report PDF | Yes | weekly-report-2026-10-20.pdf |
| E15 | Feedback | Feedback page builds GitHub issue + email links | Yes | GitHub issue form + mailto (not opened, nothing sent) |
| E16 | Share | Share with a friend copies ?ref=share link | Yes | https://akash-sharma-job-acquisition-os.vercel.app/?ref=share |

Live launch check after the rename (`scripts/live-launch-check.mjs`):

| # | Area | Promise | Result | Evidence |
|---|---|---|---|---|
| P1 | Landing | Live landing: footer credit + copyright | Yes | Job Acquisition OS · SHARE FEEDBACK · SHARE WITH A FRIEND · ABOUT · TERMS · PRIVACY & SECURITY · Made by Akash Sync Agent · © 2026 Akash Sync Agent (Adv. Akash  |
| P2 | Funnel | Channel link counted by source (pageview q=ref + from_<channel> event) | Yes | p=/&t=/ / p=/&t=/&q=?ref=linkedin&utm_campaign=launch-oct26 / p=from_linkedin&t=from_linkedin&e=true / p=landing_view&t=landing_view&e=true |
| P3 | SEO | JSON-LD Organization + WebApplication, no ratings | Yes | Organization: Akash Sync Agent, WebApplication: Job Acquisition OS; no aggregateRating/review |
| P4 | SEO | Clean URL /about: page, title, canonical | Yes | {"t":"About Job Acquisition OS · Made by Akash Sync Agent","c":"https://akash-sharma-job-acquisition-os.vercel.app/about","h1":"About Job Acquisition OS"} |
| P5 | SEO | Clean URL /terms: page, title, canonical | Yes | {"t":"Terms of use · Job Acquisition OS","c":"https://akash-sharma-job-acquisition-os.vercel.app/terms","h1":"Terms of use"} |
| P6 | SEO | Clean URL /feedback: page, title, canonical | Yes | {"t":"Share feedback · Job Acquisition OS","c":"https://akash-sharma-job-acquisition-os.vercel.app/feedback","h1":"Share your feedback"} |
| P7 | SEO | Clean URL /privacy: page, title, canonical | Yes | {"t":"Privacy & security · Job Acquisition OS","c":"https://akash-sharma-job-acquisition-os.vercel.app/privacy","h1":"Privacy & security"} |
| P8 | Privacy | Live Privacy lists counted steps + page view/channel | Yes | GoatCounter host akashsyncagent.goatcounter.com, 8 steps + page view + channel |
| P9 | App | Live sidebar credit, Terms, copyright | Yes | sidebar footer present |
| P10 | App | Live in-app 404 | Yes | "Off the path." |
| P11 | Static | Live 404 for unknown path | Yes | HTTP 404, styled 404.html |
| P12 | Static | Live security headers | Yes | CSP, XFO DENY, nosniff, HSTS, Referrer-Policy, Permissions-Policy |
| P13 | SEO | Live sitemap (live domain, 5 URLs) + robots | Yes | 5 <loc> on live domain; robots Sitemap line |
| P14 | SEO | Live OG image | Yes | og.jpg 200 image/jpeg |
| P15 | Jobs | No-AI path: "Skip AI, search jobs now" returns real jobs | Yes | 46 jobs, e.g. CLM Specialist (Contract Lifecycle Management) - Locally Recruited @ CIMMYT; Commercial Contract Manager @ Unisys; Legal Operations Analyst (6-month Contractor) - Hyderabad @ Schrödinger |
| P16 | Jobs | Job links open (HTTP check of first 5) | Yes | statuses: 200,200,200,200,200 |
| P17 | Jobs | AI path: guided setup with Akash's key fills roles and finds jobs | Yes | AI roles: Legal Operations Professional, Contract Manager, Contract Administrator, Legal Operations Specialist; 54 jobs, e.g. Contract Administrator Senior Associate @ pwc; Contract Administrator - Associate @ pwc; Lead Contract Administrator @ Adani Group |
| P18 | Security | No CSP violations across the live run | Yes | 0 violations |
| P19 | Mobile | Live landing fits 390px | Yes | overflow px 0 |

## Launch-day re-check, 20 Oct 2026 (production)
- Live launch check 19/19 Yes (Legal Ops/CLM Delhi profile: 46 real jobs on the no-AI path, 81 on the AI path, first 5 links HTTP 200; 0 CSP violations; GoatCounter channel counting verified).
- Blue-collar persona E2E 16/16 Yes (3 NCR jobs with working links, 1 DSSSB govt notice, PDF/DOCX exports, feedback links; nothing sent).
- Promise audit 40/44 Yes, 4 Partial, 0 No (same known limits: #14 GOOGLE_CLIENT_ID not set, #26 AI facts need human review, #33 follow-up row assertion, #43 in-memory rate limit). First run showed #25 as No only because the script expected a hard-coded 19 Oct file date; script now checks today's date (the app was right).
- Console crawl of 10 pages: 0 console errors, 0 page errors, 0 failed requests; 11 links, 0 broken.

## Launch hygiene checklist (section B), 20 Oct 2026

Run by `scripts/hygiene-check.mjs` against production on main (29c794f). Result: **26 Yes, 3 Partial, 0 No, 1 user action**. Fixes: a2c0dbf (API origin check, size cap, per-IP AI rate limit, maxOutputTokens, server bundle not public, one title, noscript, manifest) and 29c794f (Delete everything stays empty after reload, double-click runs once, offline aborts with an error, 44px footer/header tap targets).

| # | Item | Result | Evidence |
|---|---|---|---|
| H1 | AI traffic matches Privacy wording (own server function, then Google) | Yes | resume text went only to /api/ai/score-job (this app's function → Google Gemini, as Privacy says); direct third-party calls: 0 |
| H2 | /privacy covers storage, AI, job provider, analytics, logs, delete; linked in footer | Yes | missing: none; footer links /feedback /about /terms /privacy /about |
| H3 | "Delete everything" wipes localStorage, IndexedDB, cookies (after reload) | Yes | after reload: localStorage keys [], IndexedDB 0, cookies "" |
| H4 | Export JSON works; data survives refresh | Yes | job-os-backup.json keys version,profile,jobs; jobs after refresh 1 |
| H5 | No secrets in shipped JS; server bundle not public | Yes | 40 JS files scanned, matches: 0; /server.cjs → 404 |
| H6 | AI route: key from env/user, origin check, size cap, per-IP rate limit, output cap | Partial | server key set: false (user's own key otherwise); bad Origin → 403; 250 KB body → 413; 36 rapid calls → 401 (in-memory per instance); maxOutputTokens 16384 |
| H7 | CORS: no cross-origin access, no open proxy | Yes | job search from foreign Origin → 403; Access-Control-Allow-Origin: none; GET /api/ai/x → 405 |
| H8 | One title in <title>/og/twitter (≤60), description ≤155, canonical, og:image absolute 1200x630 | Yes | "Job Acquisition OS: free job search, by Akash Sync Agent" (56); desc 150; og:image https://akash-sharma-job-acquisition-os.vercel.app/og.jpg (1200, 630); canonical https://akash-sharma-job-acquisition-os.vercel.app/ |
| H9 | OG card matches current branding | Yes | og.jpg reads "JOB ACQUISITION OS · FREE JOB SEARCH WORKSPACE" + "Made by Akash Sync Agent" (checked visually 20 Oct) |
| H10 | Real noscript content (h1 + description) | Yes | Job Acquisition OS: free job search workspace Find real job postings (from FreeHire, each linked to the original), score them against your r |
| H11 | robots, sitemap (all public routes, live domain), JSON-LD without ratings | Yes | sitemap / /about /privacy /terms /feedback; robots Sitemap line; JSON-LD Organization+WebApplication, no ratings |
| H12 | Search Console / Bing verification | User | placeholders in index.html, steps in docs/SEO_SETUP.md: Akash must verify with his Google/Microsoft account |
| H13 | Preview cards (WhatsApp, LinkedIn, Facebook, X) | Partial | crawler UA gets 200 with og:title/og:image/twitter:card; the official debuggers (LinkedIn Post Inspector, Facebook Sharing Debugger) need Akash's login |
| H14 | One product name: UI, meta, OG, README, manifest, emails | Yes | manifest "Job Acquisition OS", README, sidebar, title; "Momentum" only as the design-concept note; .eml has no product name in its headers (subject is the user's) |
| H15 | Who built it: credit, feedback, About, licence/copyright | Yes | Job Acquisition OS · SHARE FEEDBACK · SHARE WITH A FRIEND · ABOUT · TERMS · PRIVACY & SECURITY · Made by Akash Sync Agent · © 2026 Akash Sync Agent (Adv. Akash Sharma) · Code under MIT licence; name a |
| H16 | AI disclaimer near generated output | Yes | Tailor: "Rewrites use only the facts in your resume. Review everything before sending." + Fact check panel under each output; Outreach: "Send it yourself" |
| H17 | Terms page + "powered by" attribution for job data | Yes | /terms 200; job cards badge "FreeHire · <source> · posted <date>"; About credits FreeHire (MIT) |
| H18 | Source named, posting dates, originals open, stale flagged, empty/down states | Yes | drawer: source + posted date + "listings can be out of date" note; nonsense search → 200, 0 jobs (empty state handled); FreeHire is MIT, keyless public API (docs/FREEHIRE.md) |
| H19 | Very long input: real error, no freeze | Yes | 413: The request is too large (365 KB). Shorten the resume or job text and try again. |
| H20 | Offline mid-request shows an error, no freeze | Yes | shown: "You went offline, so the request was stopped. Check your connection and try again."; UI still responsive |
| H21 | Double-click submits once | Yes | 1 request(s) from a double click |
| H22 | Back button moves between pages | Yes | back from /about → landing h1 "Your nextofferstarts here." |
| H23 | Slow 3G: page usable, no blank screen | Yes | h1 visible after 0.9 s on 400 ms / 500 kbps |
| H24 | Random URL → 404; crash boundary; zero console errors | Yes | 404 page ok; crash boundary proven in dev (launch audit L17); console errors on 10 pages: 0 (the expected 404 on /nope-xyz excluded) |
| H25 | favicon, apple-touch-icon, manifest, theme-color, html lang | Yes | icons 200,200,200,200; manifest icons 3 |
| H26 | Security headers + HTTPS only | Yes | CSP (frame-ancestors none, upgrade-insecure-requests), HSTS, nosniff, Referrer-Policy; http:// → port 80 unreachable from this box; vercel.app is HSTS-preloaded so browsers never use http |
| H27 | Public access without login | Yes | production 200 with no cookies; preview deployments still need Vercel login (user setting) |
| H28 | No sideways scroll; tap targets ≥44px (or ≥24px with spacing); text ≥12px; file upload on phone | Partial | overflow 0px; small targets: overview Reset timer:32, jobs All:28, jobs Delivery ExecutiveAc:43, setup No resume? Short for:20, setup search jobs without :20; text <11px: 0; file input present |
| H29 | Timezone: dates use the user's local day | Yes | UTC+14 browser: appliedAt 2026-10-21, local date 2026-10-21, UTC date 2026-10-20 |
| H30 | Links: internal + external open; mailto and share links correct | Yes | 10 links checked; broken: none; mailto adv.akash2356@gmail.com and ?ref=share verified in persona E2E |

Partials: H6 rate limit is in-memory per serverless instance (no shared store on the free tier). H13 official preview debuggers need Akash's login. H28 a few in-app text buttons are 20 to 32 px tall.

## Launch hygiene re-run, 20 Oct 2026 (after be1a410)

Result: **27 Yes, 2 Partial, 0 No, 1 user action**.

- Delete my data: always visible. It's in the mobile app header (trash icon, 44px), the menu/desktop sidebar, Settings (top card), /privacy#delete and the landing footer link. A confirm dialog comes first; verified on production for mobile and desktop. Screenshot: /workspace/launch/delete-button-2026-10-20.png.
- Tap targets: all controls are 44px or larger on mobile (CSS rule for touch and narrow screens). The checker found no small targets.
- AI rate limit stays per serverless instance (30/min per IP). A global limit needs a shared store (Upstash/Redis free tier, or Vercel KV/Upstash via Marketplace), which needs Akash's own signup. Abuse risk is bounded: the server holds no shared Gemini key, so every call spends the caller's own key. There's also an origin check and a 200 KB body cap.

| # | Item | Result | Evidence |
|---|---|---|---|
| H1 | AI traffic matches Privacy wording (own server function, then Google) | Yes | resume text went only to /api/ai/score-job (this app's function → Google Gemini, as Privacy says); direct third-party calls: 0 |
| H2 | /privacy covers storage, AI, job provider, analytics, logs, delete; linked in footer | Yes | missing: none; footer links /feedback /about /terms /privacy /privacy#delete /about |
| H3 | "Delete everything" wipes localStorage, IndexedDB, cookies (after reload) | Yes | after reload: localStorage keys [], IndexedDB 0, cookies "" |
| H4 | Export JSON works; data survives refresh | Yes | job-os-backup.json keys version,profile,jobs; jobs after refresh 1 |
| H5 | No secrets in shipped JS; server bundle not public | Yes | 39 JS files scanned, matches: 0; /server.cjs → 404 |
| H6 | AI route: key from env/user, origin check, size cap, per-IP rate limit, output cap | Partial | server key set: false (user's own key otherwise); bad Origin → 403; 250 KB body → 413; 36 rapid calls → 401 (in-memory per instance); maxOutputTokens 16384 |
| H7 | CORS: no cross-origin access, no open proxy | Yes | job search from foreign Origin → 403; Access-Control-Allow-Origin: none; GET /api/ai/x → 405 |
| H8 | One title in <title>/og/twitter (≤60), description ≤155, canonical, og:image absolute 1200x630 | Yes | "Job Acquisition OS: free job search, by Akash Sync Agent" (56); desc 150; og:image https://akash-sharma-job-acquisition-os.vercel.app/og.jpg (1200, 630); canonical https://akash-sharma-job-acquisition-os.vercel.app/ |
| H9 | OG card matches current branding | Yes | og.jpg reads "JOB ACQUISITION OS · FREE JOB SEARCH WORKSPACE" + "Made by Akash Sync Agent" (checked visually 20 Oct) |
| H10 | Real noscript content (h1 + description) | Yes | Job Acquisition OS: free job search workspace Find real job postings (from FreeHire, each linked to the original), score them against your r |
| H11 | robots, sitemap (all public routes, live domain), JSON-LD without ratings | Yes | sitemap / /about /privacy /terms /feedback; robots Sitemap line; JSON-LD Organization+WebApplication, no ratings |
| H12 | Search Console / Bing verification | User | placeholders in index.html, steps in docs/SEO_SETUP.md: Akash must verify with his Google/Microsoft account |
| H13 | Preview cards (WhatsApp, LinkedIn, Facebook, X) | Partial | crawler UA gets 200 with og:title/og:image/twitter:card; the official debuggers (LinkedIn Post Inspector, Facebook Sharing Debugger) need Akash's login |
| H14 | One product name: UI, meta, OG, README, manifest, emails | Yes | manifest "Job Acquisition OS", README, sidebar, title; "Momentum" only as the design-concept note; .eml has no product name in its headers (subject is the user's) |
| H15 | Who built it: credit, feedback, About, licence/copyright | Yes | Job Acquisition OS · SHARE FEEDBACK · SHARE WITH A FRIEND · ABOUT · TERMS · PRIVACY & SECURITY · DELETE MY DATA · Made by Akash Sync Agent · © 2026 Akash Sync Agent (Adv. Akash Sharma) · Code under MI |
| H16 | AI disclaimer near generated output | Yes | Tailor: "Rewrites use only the facts in your resume. Review everything before sending." + Fact check panel under each output; Outreach: "Send it yourself" |
| H17 | Terms page + "powered by" attribution for job data | Yes | /terms 200; job cards badge "FreeHire · <source> · posted <date>"; About credits FreeHire (MIT) |
| H18 | Source named, posting dates, originals open, stale flagged, empty/down states | Yes | drawer: source + posted date + "listings can be out of date" note; nonsense search → 200, 0 jobs (empty state handled); FreeHire is MIT, keyless public API (docs/FREEHIRE.md) |
| H19 | Very long input: real error, no freeze | Yes | 413: The request is too large (365 KB). Shorten the resume or job text and try again. |
| H20 | Offline mid-request shows an error, no freeze | Yes | shown: "You went offline, so the request was stopped. Check your connection and try again."; UI still responsive |
| H21 | Double-click submits once | Yes | 1 request(s) from a double click |
| H22 | Back button moves between pages | Yes | back from /about → landing h1 "Your nextofferstarts here." |
| H23 | Slow 3G: page usable, no blank screen | Yes | h1 visible after 0.9 s on 400 ms / 500 kbps |
| H24 | Random URL → 404; crash boundary; zero console errors | Yes | 404 page ok; crash boundary proven in dev (launch audit L17); console errors on 10 pages: 0 (the expected 404 on /nope-xyz excluded) |
| H25 | favicon, apple-touch-icon, manifest, theme-color, html lang | Yes | icons 200,200,200,200; manifest icons 3 |
| H26 | Security headers + HTTPS only | Yes | CSP (frame-ancestors none, upgrade-insecure-requests), HSTS, nosniff, Referrer-Policy; http:// → port 80 unreachable from this box; vercel.app is HSTS-preloaded so browsers never use http |
| H27 | Public access without login | Yes | production 200 with no cookies; preview deployments still need Vercel login (user setting) |
| H28 | No sideways scroll; tap targets ≥44px (or ≥24px with spacing); text ≥12px; file upload on phone | Yes | overflow 0px; small targets: none; text <11px: 0; file input present |
| H29 | Timezone: dates use the user's local day | Yes | UTC+14 browser: appliedAt 2026-10-21, local date 2026-10-21, UTC date 2026-10-20 |
| H30 | Links: internal + external open; mailto and share links correct | Yes | 11 links checked; broken: none; mailto adv.akash2356@gmail.com and ?ref=share verified in persona E2E |

## User feedback fixes, 20 Oct 2026 (commits 7dd7894, 16b3fe4, 0b98b38)

Verified end to end on production at 5:14 PM IST, with a real Gemini key and a realistic test resume (persona "Riya Verma", customer support, Noida). Screenshots: `/workspace/launch/flow-2026-10-20-*.png` (1 upload, 2 review jobs, 3 job page, 4 generating, 5 resume review, 5b cover letter, 6 apply, 7 and 8 mobile).

| Promise | Result | Evidence |
|---|---|---|
| Tailored resume and cover letter generate | Yes | Live run: tailor-resume 200, generate-cover-letter 200, generate-outreach 200. All three "Ready" about 8 to 20 s after "Approve & generate all" |
| Root cause found | Yes, with a caveat | With the test key, Google returned 429 (free-tier quota) on gemini-flash-latest and gemini-3.8-flash and 503 (high demand) on gemini-3.6-flash; only gemini-flash-lite-latest answered. The old chain tried lite last, with 25 s per-model timeouts inside a 50 s budget, so a slow or busy model could use up the budget and the request failed with a timeout, quota or overload error. Now lite is second, each model gets 16 s, and the pack retries once after 30 s on a 429. This failure was reproduced with the test key; Akash's exact failing session was not available |
| Clicking a job opens a one-stop page | Yes | `#/app/job/<id>`: details, location, posted date, fit, "Apply on employer site" (the original posting URL), job description, the pack and more tools |
| Documents labelled and stored per job | Yes | Each row reads "<Doc> for <title> · <company>" with its generated time. Stored on the job (`tailoredResumeDoc`, `coverLetter`, `outreach`, `docsAt`). File names include the job title and company. The cover letter starts "Re: Application for <title> – <company>" |
| ATS resume format | Yes | JSON Resume schema (MIT) structured output, one column, standard headings, real text PDF (pdftotext reads it in order) and DOCX with real headings and bullets. No app branding inside the resume |
| No invented facts | Yes for the test run | The prompt allows facts from the resume only. The in-browser fact check found nothing new in the live run |
| "Applying" wording removed | Yes | No "applying" on the setup or flow pages. Dashboard: "Applications you marked as sent today … the app never applies for you". Job page: "The app never applies for you" |
| 6-step flow + Next step always visible | Yes | Stepper on every app page (sticky on desktop; fixed "Next step" bar on mobile): Upload resume → Review matched jobs → Pick a job → Generate pack → Review & download → Apply on employer site |
| Approve & generate all | Yes | One button runs resume, cover letter and outreach for the selected job, one after another |
| Licences | Yes | THIRD_PARTY_NOTICES.md (JSON Resume schema, RenderCV, jsonresume-theme-even, all MIT, with licence texts); README and About credit them. OpenResume (AGPL) and Awesome-CV (LPPL) rejected on licence grounds |

Not done or limits: Google free-tier quotas still apply to each user's own key (if every model is out of quota, the app shows Google's message). The test used a sample resume, not Akash's own.

## Feedback, comments, early-access note and tester findings, 23 Oct 2026 (commit d8d95c9, pushed and verified live 23 Oct; Sheet backend awaiting Akash setup)

Tested on a local production build (`node build/server.cjs`), with a mock of the Apps Script endpoint. Production could not be tested: the box lost its GitHub credentials, so the commit is not pushed and nothing new is deployed. 24/24 checks passed:

| Check | Result |
|---|---|
| Early-access note on home (hero and footer), /feedback, /terms | Pass |
| Feedback form without login: name, email, rating, page and message reach the Sheet endpoint | Pass |
| New comment held for approval; an approved comment shows its reply as "Akash Sync Agent team" | Pass |
| Spam guards: foreign Origin → 403, under 2.5 s → TOO_FAST, honeypot → SPAM | Pass (curl) |
| "Made by Akash Sync Agent" visible at 390px on /terms, /privacy, /feedback, /#/app and the in-app 404 | Pass (5/5) |
| Skip AI with a one-line Legal Ops resume: titles derived ("Legal Operations & CLM Specialist", …), /api/jobs/search called | Pass |
| Odd searches (empty, nonsense, `<script>`, non-Latin), refresh mid-search, offline mid-flow | Pass (6/6) |
| Job page: "Apply on employer site" uses the posting URL; "I applied" sets the status to Applied | Pass |
| .eml in test mode: X-Unsent and a "[TEST - please ignore]" subject | Pass |
| Delete my data: storage empty after reload | Pass |
| Link crawl (9 external links from home), OG tags, console errors | Pass |
| Lighthouse (local build, mobile): Performance 71, Accessibility 100, Best Practices 100, SEO 100, LCP 5.5 s (no CDN or compression locally) | Info |

Not run: the AI items (scoring, tailored docs, "Approve & generate all" pressed twice, the invented-facts check, the driver persona with AI). The box Gemini key is no longer set after the box reset.

## 23 Oct 2026, ~5:15 PM IST: production run of the previously untested items (Gemini key via in-browser BYOK, test mode on)
| Item | Result |
|---|---|
| AI resume parse + AI fit scoring (Legal Ops persona) | PASS: 40 jobs, 23/23 newly added AI-scored |
| Job page: apply link is the real employer/ATS URL | PASS (jobs.lever.co) |
| Approve & generate all, clicked 3x rapidly | PASS: exactly 3 AI calls (resume, cover letter, outreach), no duplicates |
| Tailored docs | PASS: all 3 created |
| Invented-facts check | PASS: fact-check panel shows on review; no invented employers/degrees found |
| .eml (test mode) | PASS: `X-Unsent: 1`, subject starts `[TEST - please ignore]`; nothing sent |
| I applied, then reload | PASS: status Applied persists |
| Offline mid-generate | PASS: "You went offline, so the request was stopped…"; refresh keeps jobs, button usable |
| Driver persona end to end | PASS run 1 (7 jobs, all delivery-driver titles). Run 2: Gemini parse 503 left 0 jobs → FIXED: parse failure now falls back to resume-derived titles + keyword scoring (verified: 7 postings) |
| Odd searches (empty, script tag, 500 chars, bad countries, emoji, {}) | PASS: 400/200, never 5xx |
| Delete my data, then reload | PASS: no app keys left |
| Live link crawl | PASS: 14 links, 0 broken |
| Lighthouse mobile (live) | / 97/100/100/100 LCP 2.4 s; /feedback 91, /terms 90, /privacy 92 (A11y/BP/SEO 100). The earlier 71 was the local unminified server |
| OG/Twitter tags | PASS: all present; og.jpg 200 image/jpeg 1200x630 |

## 23 Oct 2026, ~6:00 PM IST: location launch blocker fixed (commit f2101f3), re-tested on production
Tester found the Delhi driver persona got 7 US jobs (FreeHire tags Indiana "IN" as India; remote/global queries were on by default).
Fixes: country-only results by default (location text must name India or an Indian place; US state codes, zip codes and FreeHire's mis-tagged "IN" rejected); city + country queries; remote/worldwide only via an opt-in checkbox; ordered title matching plus head-noun check ("Contract Analyst" no longer matches "Paralegal Analyst – Contract…", "Driver" no longer matches "Driver Development Engineer"); fit score minus 10 outside the user's city, minus 15 remote/unstated; cover letter/outreach prompts forbid unstated facts and cross-country licence claims, and sentences the fact check flags are auto-removed and listed under "Removed N sentence(s)…"; Hindi titles mapped to English; zero results hide "Next: review matched jobs" and show guidance; "Approve & generate all" single-run guard (a fast double press had produced a duplicate cover-letter call).

| Persona (production, AI path) | Jobs | In India | In NCR | Other country |
|---|---|---|---|---|
| Driver / Warehouse Helper, Delhi (tester's driver.txt) | 6 | 6 | 2 | 0 (was 7/7 US) |
| Legal Ops & CLM, Gurugram | 11 | 11 | 2 | 0 |
| Hindi titles ड्राइवर, डिलीवरी ड्राइवर (API) | 6 | 6 | 2 | 0 (was 0 results) |

Full production e2e: 28/28 (incl. AI scoring, docs, triple-press, fact check, .eml test mode, I applied, offline, odd searches, delete). Zero-jobs guidance and the removed-claims panel verified live.
Known limits: NCR counts are low because FreeHire has few NCR postings for these titles; one weak match ("Legal Entity Controller - Associate", fit 10) still appears at the bottom of the legal list.
