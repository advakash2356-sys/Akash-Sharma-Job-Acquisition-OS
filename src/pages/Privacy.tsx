import { ANALYTICS_HOST, ANALYTICS_ON } from '../lib/analytics';
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
      <PageHeader eyebrow="Plain language" title="Privacy & security" subtitle="Exactly what this app does with your data. Every line below matches the code." />
      <div className="grid gap-5">
        <Item t="Where your data lives">
          <p>Your resume, jobs, notes, interviews and settings are saved in this browser's local storage, on this device. This app has no database and no user-data server, so there is nothing of yours stored on our side.</p>
          <p>If you sign in with Google, your data is saved in the same local storage under your Google account id, so each person on a shared browser gets a separate workspace. This app has no server-side sessions and no cloud storage: sign-in verifies who you are and separates data on this device, but it does not sync across devices and is not access control against someone with access to this browser.</p>
        </Item>
        <Item t="Your API key">
          <p>Your Gemini key is stored only in this browser (per account; a signed-in account without its own key uses the guest-mode key saved on the same browser). When you press an AI button, the key is sent in a request header to this app's own serverless function, which uses it to call Google for that single request. The code does not store or log the key.</p>
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
        <Item t="Usage counts, no tracking, no sale">
          {ANALYTICS_ON
            ? <p>This deployment counts a few anonymous steps with GoatCounter ({ANALYTICS_HOST}), a cookieless, open-source counter: landing view, start setup, resume added, key added, first job found, export, feedback sent and share. Each count is just the step name. It also counts one page view per visit: the page address (for example /about) and, if you came through one of our shared links, the channel named in that link (for example ref=instagram). No resume text, key, name, job or contact data is ever sent. Your browser fetches a tiny counter image from {ANALYTICS_HOST}, so GoatCounter sees your IP address and browser type for that request; it does not store them (it keeps a random ID in memory for 8 hours to avoid double counts). No cookies are set. Counting is off if your browser sends Do Not Track or Global Privacy Control, and you can switch it off in Settings.</p>
            : <p>This deployment does not count usage: no analytics code is switched on. If the owner turns on counting later, this paragraph changes to list exactly what is counted.</p>}
          <p>There are no advertising or tracking scripts and no cookies; fonts are bundled with the site rather than loaded from a third party. We do not sell or share your data, because we do not hold it.</p>
          <p>Cookies and local storage: the app sets no cookies. It saves your data in this browser's local storage, which is needed for the app to work; clear it any time with "Delete everything" below.</p>
          <p>Google sign-in is optional. When you use it, your browser loads Google's sign-in script (accounts.google.com) and Google sends this page a signed ID token. The token is sent once to this app's function, which checks it with Google's public keys (signature, expiry, that it was issued for this app, and that your email is verified) and returns your Google id, email, name and photo. The function does not store or log them. Your browser keeps that verified profile in local storage as a sign-in marker and shows it to you; it is not sent with AI requests. "Open in Gmail" opens a draft that you review and send yourself; the app never sends email.</p>
        </Item>
        <Item t="Feedback">
          <p>The feedback form and public comments (no login) send what you type (name and email only if you give them, rating, message, page) through this site's server to a private Google Sheet owned by Akash, who gets an email for each entry. Comments appear publicly only after Akash approves them; your email is never shown. Ask at adv.akash2356@gmail.com to have an entry deleted. The feedback page also links to two other ways, sent only by you: a public GitHub issue (needs a GitHub account) or an email from your own mail app.</p>
        </Item>
        <Item t="Delete my data">
          <p>"Clear all data" on My resume removes your resume and jobs for the current account. The button below removes everything this app has saved in this browser: all accounts' resumes and jobs, API keys and preferences. Exported files you downloaded stay where you saved them. Signing out (Settings) ends the sign-in session only and keeps your saved data on this device.</p>
          <div id="delete"><DeleteDataButton label="Delete my data (everything in this browser)" /></div>
          {done && <p role="status" className="text-primary">Deleted. Reloading…</p>}
        </Item>
      </div>
    </>
  );
}
