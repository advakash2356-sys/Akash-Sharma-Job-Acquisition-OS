# Feedback form + public comments: one-time setup (Akash only, about 5 minutes)

The Sheet already exists in Akash's Drive (private, owner adv.akash2356@gmail.com):
**Job Acquisition OS - Feedback & Comments**
https://docs.google.com/spreadsheets/d/1jnW3gBlQS9YHqgKRDYhB1hLELtWKT6xVznMAnxuHrA4/edit

Until steps 1 to 5 are done, the site shows both forms but says the inbox is "not connected yet" and offers email instead. Nothing is silently lost.

1. Open the Sheet > **Extensions > Apps Script**. Replace the sample code with the whole of `scripts/apps-script/Code.gs` from this repo. Save.
2. Pick the function **setup** and press **Run**. Allow the permissions (edit this spreadsheet, send email as you): choose your account > Advanced > Go to project > Allow. Copy the `SHARED_SECRET` from the Execution log.
3. **Deploy > New deployment > Web app**. Execute as **Me**, Who has access **Anyone**. Deploy and copy the URL ending in `/exec`. ("Anyone" lets the website's server reach it; requests without the secret are refused.)
4. Vercel > project akash-sharma-job-acquisition-os > Settings > Environment Variables (Production):
   - `FEEDBACK_SCRIPT_URL` = the /exec URL
   - `FEEDBACK_SECRET` = the SHARED_SECRET
5. Redeploy the latest deployment, then send a test from /feedback. A row appears in the Feedback tab and an email arrives at adv.akash2356@gmail.com.

## Daily use
- **Feedback**: a row in the Feedback tab plus an email to you. Reply by replying to the email (Reply-To is the sender when they left an email).
- **Comments**: a row in the Comments tab with Approved = `no`, plus an email. Set **Approved** to `yes` to publish. Type in **Team reply** to answer: it shows as "Akash Sync Agent team" (the date fills in). Set Approved back to `no` to hide. The site refreshes about once a minute.
- **Spam protection**: hidden honeypot field, minimum fill time, length and link limits, spam-word filter, 5 posts per 10 minutes per IP, posts only from this website, and nothing public until you approve it.
- After editing the code: Deploy > Manage deployments > Edit > New version (keeps the same URL).

## Google sign-in and the Users tab
1. Google Cloud Console > APIs & Services > Credentials > Create credentials > OAuth client ID > Web application. Authorised JavaScript origins: `https://akash-sharma-job-acquisition-os.vercel.app` (and `http://localhost:3000` for testing). No redirect URI is needed. The app uses only the client ID; never put the client secret anywhere in this project.
2. Vercel > Environment Variables (Production): `GOOGLE_CLIENT_ID` = the client ID (ends in `.apps.googleusercontent.com`). Redeploy. The sign-in screen then appears before the app. Without it, the app keeps working in guest mode.
3. Paste the new `Code.gs`, run **setup** once (it adds the **Users** tab), then Deploy > Manage deployments > Edit > New version.
4. Users tab columns: Email, Name, Mobile (self-entered, unverified), First seen / Last seen (IST), Visits (sign-ins plus at most one visit a day per device), Device IDs, Device hints, Multiple accounts on this device (flag only, nobody is blocked), Consent given (IST), Last user agent. Delete a row when someone asks for deletion.

## Feedback auto-reply (thank-you email)
1. Apps Script > Project Settings > Script Properties: add `GEMINI_API_KEY` = your own Gemini key (free tier is fine; it stays in Apps Script, never in this repo or on the site). Without it, a fixed template is used.
2. Run **setupAutoReply** once and allow "connect to an external service" (for Gemini). It installs a 10-minute trigger and sets `AUTO_REPLY_MODE` = `test`.
3. Test mode: replies go only to you, subject starts with "[TEST - please ignore]", body says who it would have gone to. Check a few in your inbox and in the Feedback tab (columns Auto-reply status / at / text).
4. Go live: change `AUTO_REPLY_MODE` to `live`. Feedback whose message contains "[TEST" still goes only to you.
5. What it says: a warm thank-you naming one point from their message, "we will look into it", and a request for some time. A filter rejects any text that promises a fix, feature, date or timeline ("soon", "within 2 days", "will be fixed", ...) and falls back to the template. Rows without an email are marked "no email: skipped". At most 20 replies per run; MailApp's free quota is about 100 a day.
6. Local check of the script logic (no real email, no Sheet): `node scripts/apps-script/test/users.mjs` and `GEMINI_API_KEY=... node scripts/apps-script/test/reply.mjs`.
