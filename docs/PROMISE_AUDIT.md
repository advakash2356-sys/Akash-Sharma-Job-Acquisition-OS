# Promise audit

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
| 37 | Privacy | No analytics, ads, trackers; fonts bundled (only own origin) | All request hosts across full audit session | Yes | hosts contacted by the browser: akash-sharma-job-acquisition-os.vercel.app,  | - |
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
