import { ANALYTICS_HOST, ANALYTICS_ON, gpcOn } from '../lib/analytics';
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Card, PageHeader } from '../components/ui';
import DeleteDataButton from '../components/DeleteDataButton';

const Item = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <Card><h2 className="mb-2 text-3xl">{t}</h2><div className="grid gap-2 text-sm leading-relaxed text-muted-foreground">{children}</div></Card>
);

export default function Privacy() {
  const [done, setDone] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Plain language" title="Privacy & security" subtitle="What this app collects, why, where it is kept, and how to ask for changes. We describe the code as accurately as we can; we cannot guarantee that any online service is free of errors or breaches." />
      <div className="grid gap-5">
        <Item t="Where your data lives">
          <p>Your resume, profile, jobs, notes, interviews, settings and API key are saved in this browser's local storage, on this device. They are not sent to the Google Sheet below. They do pass through this app's server, and on to Google Gemini, only when you use an AI feature (see below). Profile match reads the LinkedIn text or CSV files you give it only in this browser; it does not save them, send them anywhere or connect to LinkedIn.</p>
          <p>If you sign in with Google, your data is saved in the same local storage under your Google account id, so each person on a shared browser gets a separate workspace. Your resume and jobs do not sync across devices, and the separation is not protection against someone with access to this browser.</p>
        </Item>
        <Item t="What we collect, and why">
          <ul className="list-disc pl-5" data-testid="collect-list">
            <li><b>When you sign in with Google:</b> your Google name and email; a mobile number only if you type one (we do not verify it); when you first and last used the app and how many times; a random id this browser keeps for this site; a short device hint (a hash of screen size, language, timezone and platform); your browser's user agent; and which shared link you first came from (for example ref=linkedin), if any.</li>
            <li><b>Usage steps, signed-in users only:</b> that you filled your profile (with your first target role, country of residence and preferred work modes), viewed a job, generated documents, clicked an apply link, or moved a job to a new stage, at most once a day per step. Not which job, or what a document said.</li>
            <li><b>Feedback and comments:</b> what you type (name and email only if you give them, rating, message) and the page.</li>
          </ul>
          <p><b>Why:</b> to run the service and let you in, understand how it is used and what to improve, reply to feedback, and spot misuse (for example many accounts on one device, which is only flagged for the owner and not used to block anyone). We do not sell this data or use it for ads.</p>
          <p><b>Where it is kept:</b> in a private Google Sheet owned by Akash Sync Agent (adv.akash2356@gmail.com), written through Google Apps Script by this site's server. Only the owner can open it, and an owner-only admin page shows summaries of it.</p>
        </Item>
        <Item t="Who else processes data">
          <ul className="list-disc pl-5" data-testid="processors-list">
            <li><b>Google</b>: sign-in (Google Identity Services), and Google Sheets / Apps Script, which store the data above.</li>
            <li><b>Google Gemini</b>: the text an AI feature needs, using your own key (or the owner's key if one is set). For feedback with an email, your name, rating and message are sent to Gemini with the owner's key to write one thank-you email.</li>
            <li><b>Job sources</b> (FreeHire, Himalayas, Remote OK, SarkariMap): your target job titles, countries and cities, never your resume, name or email.</li>
            <li><b>Vercel</b>, which hosts the site and keeps standard request logs.</li>
            <li><b>GoatCounter</b>, which counts anonymous page views and steps (see below).</li>
          </ul>
        </Item>
        <Item t="Your consent and rights (DPDP Act, 2023)">
          <p data-testid="dpdp-consent">You give consent on the sign-in screen by ticking the box under a notice that lists what is stored (confirming you are 18 or older and agree to the Terms and this notice), then choosing "Continue with Google". Akash Sync Agent is the data fiduciary for the data above.</p>
          <p><b>Retention:</b> sign-in and usage rows are kept while the service runs, or until you ask us to delete them. Feedback is kept until it is dealt with, or until you ask for deletion.</p>
          <p><b>Your rights:</b> you can withdraw consent, ask to see, correct or delete your data, or raise a grievance, by emailing <a className="underline text-primary" href="mailto:adv.akash2356@gmail.com">adv.akash2356@gmail.com</a>. We aim to act within 30 days. Withdrawing consent means you can no longer sign in. You may also approach the Data Protection Board of India.</p>
          <p>If you leave your email with feedback, you may get one thank-you email about 10 minutes later.</p>
          <p><b>No guarantee:</b> we take reasonable care, but no website, host or Google service can be guaranteed secure or always available. Avoid pasting anything you would not want processed this way.</p>
        </Item>
        <Item t="Your API key">
          <p>Your Gemini key is stored only in this browser (per account; a signed-in account without its own key uses a key saved on the same browser before sign-in was required). When you press an AI button, the key is sent in a request header to this app's own serverless function, which uses it to call Google for that single request. The code does not store or log the key.</p>
          <p>Vercel, which hosts the site, keeps standard request metadata (such as the address and status of requests) as any host does. If the site owner has set a shared server key and you have not added your own, your requests use that key instead.</p>
        </Item>
        <Item t="What is sent to Google">
          <p>For each AI request, your resume text, your name, the job title, company and description, and any preferences or contact names you typed are sent through the serverless function to Google's Gemini API to produce the answer. Nothing is sent to Google unless you press an AI button or guided setup runs its AI steps (it starts by itself once a resume and a key are in place; you can cancel it or skip AI). With the short form and no key, nothing goes to Google.</p>
          <p>Guided setup runs by itself once you have added a resume and a key. Step one sends your resume text to Gemini to fill your profile. Step two searches real job postings on FreeHire (freehire.me, an open-source job search service): this app's server sends FreeHire only your target job titles, country codes, city names (for example Delhi, Noida), an entry-level flag, and for government jobs a flag plus your education level. It does not send your resume text, name, email or key, and FreeHire also sees the server's IP address. When you tick government jobs, this app's server also reads a public RSS feed from SarkariMap (sarkarimap.org) that contains no data about you; your education level is used only to filter the results here. Step three sends your resume text and the text of up to ten found postings at a time to Gemini to score fit; if Gemini is unavailable, a keyword match computed in your browser is used instead. Found jobs are saved only in this browser, with their original link, source and posted date. They may be out of date, so verify before applying.</p>
          <p>Google's terms for the Gemini API apply, and on free-tier use Google may use submitted content to improve its products. Read them at <a className="underline text-primary" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">ai.google.dev/gemini-api/terms</a>. Avoid pasting information you would not want Google to process.</p>
        </Item>
        <Item t="Checks that run only in your browser">
          <p>Fact check (on tailored resumes, cover letters and outreach), Sort reply, follow-up reminders (.ics), milestones, duplicate warnings, CSV export and the government-notice details are computed in this browser from data you already saved. They send nothing anywhere. A reply you paste is stored only in this browser with the job. Notice period and start date, if you fill them on My resume, are sent to Gemini with AI requests so letters can mention them.</p>
        </Item>
        <Item t="Usage counts and cookies">
          {ANALYTICS_ON
            ? <><p>This deployment counts a few anonymous steps with GoatCounter ({ANALYTICS_HOST}), a cookieless, open-source counter: landing view, start setup, resume added, key added, first job found, export, feedback sent and share. Each count is just the step name. It also counts one page view per visit: the page address (for example /about) and, if you came through one of our shared links, the channel named in that link (for example ref=instagram). It does not send resume text, keys, names, jobs or contact data. Your browser fetches a tiny counter image from {ANALYTICS_HOST}, so GoatCounter sees your IP address and browser type for that request; it does not store them (it keeps a random ID in memory for 8 hours to avoid double counts). No cookies are set. Counting is off by default: nothing is counted, and no referral source is saved, until you choose "Allow" on the banner or tick the box in Settings. It stays off if your browser sends Do Not Track or Global Privacy Control.</p>
            {gpcOn() && <p data-testid="gpc-note" className="rounded-lg bg-primary/10 px-3 py-2 text-primary">Global Privacy Control honoured: your browser sends GPC, so usage counting is off.</p>}</>
            : <p>This deployment does not count usage: no analytics code is switched on. If the owner turns on counting later, this paragraph changes to list exactly what is counted.</p>}
          <p>There are no advertising scripts, and fonts are bundled with the site rather than loaded from a third party. We do not sell your data.</p>
          <p>Cookies and local storage: this site sets no cookies of its own; Google's sign-in script may set Google cookies. It saves your data in this browser's local storage, which is needed for the app to work; clear it any time with "Delete everything" below.</p>
          <p>Google sign-in: when you use it, your browser loads Google's sign-in script (accounts.google.com) and Google sends this page a signed ID token. The token is sent once to this app's function, which checks it with Google's public keys (signature, expiry, that it was issued for this app, and that your email is verified) and returns your Google id, email, name and photo. With your consent, the details listed above are then written to the owner's Google Sheet. Your browser keeps that verified profile in local storage as a sign-in marker and shows it to you; it is not sent with AI requests. "Open in Gmail" opens a draft that you review and send yourself; the app does not send outreach for you.</p>
          <p data-testid="privacy-calendar">Google Calendar (optional): only if you click "Connect Google Calendar" on the Interviews page, Google asks you to allow read-only access to your calendar events (scope calendar.events.readonly). The app cannot create, change or delete events and never asks for Gmail access. Your browser reads events for the next 60 days directly from Google; the access token stays in memory in that tab, is never sent to or stored on our server, and is revoked when you click "Disconnect calendar" (it also expires after about an hour). Event titles, times, locations, links and descriptions that look like they could be interviews are sent through this app's function to Google Gemini (AI) to classify them; they are not stored by us, and Gemini's terms apply. Only events you confirm are saved, in this browser, as interview rounds. You can also remove the app's access at myaccount.google.com/permissions. Pasted invite emails and uploaded .ics files are handled the same way: the text goes to Gemini only to extract the details, and nothing is added until you confirm. Our use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.</p>
        </Item>
        <Item t="Feedback">
          <p>The feedback form and public comments (no login) send what you type (name and email only if you give them, rating, message, page) through this site's server to a private Google Sheet owned by Akash, who gets an email for each entry. Comments appear publicly only after Akash approves them; your email is not shown on the site. Ask at adv.akash2356@gmail.com to have an entry deleted. The feedback page also links to two other ways, sent only by you: a public GitHub issue (needs a GitHub account) or an email from your own mail app.</p>
        </Item>
        <Item t="Delete my data">
          <p>"Clear all data" on My resume removes your resume and jobs for the current account. These buttons only clear this browser; to delete what is in the owner's Sheet, email adv.akash2356@gmail.com. The button below removes everything this app has saved in this browser: all accounts' resumes and jobs, API keys and preferences. Exported files you downloaded stay where you saved them. Signing out (Settings) ends the sign-in session only and keeps your saved data on this device.</p>
          <div id="delete"><DeleteDataButton label="Delete my data (everything in this browser)" /></div>
          {done && <p role="status" className="text-primary">Deleted. Reloading…</p>}
        </Item>
      </div>
    </>
  );
}
