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
