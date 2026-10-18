import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Card, PageHeader } from '../components/ui';
import { wipeEverything } from '../lib/storage';

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
          <p>If you sign in with Google, your data is saved in the same local storage under your account id, so each person on a shared browser gets a separate workspace. Signing in does not upload your data anywhere.</p>
        </Item>
        <Item t="Your API key">
          <p>Your Gemini key is stored only in this browser. When you press an AI button, the key is sent in a request header to this app's own serverless function, which uses it to call Google for that single request. The code does not store or log the key.</p>
          <p>Vercel, which hosts the site, keeps standard request metadata (such as the address and status of requests) as any host does. If the site owner has set a shared server key and you have not added your own, your requests use that key instead.</p>
        </Item>
        <Item t="What is sent to Google">
          <p>For each AI request, your resume text, your name, the job title, company and description, and any preferences or contact names you typed are sent through the serverless function to Google's Gemini API to produce the answer. Nothing is sent to Google unless you press an AI button.</p>
          <p>Google's terms for the Gemini API apply, and on free-tier use Google may use submitted content to improve its products. Read them at <a className="underline text-primary" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">ai.google.dev/gemini-api/terms</a>. Avoid pasting information you would not want Google to process.</p>
        </Item>
        <Item t="No tracking, no sale">
          <p>The app includes no analytics, advertising or tracking scripts, and fonts are bundled with the site rather than loaded from a third party. We do not sell or share your data, because we do not hold it.</p>
          <p>Google sign-in is optional. When enabled, Firebase Authentication talks to Google to sign you in and keeps its session in your browser; only your name, email and photo from Google are shown to you, and they are not sent to our serverless functions. "Open in Gmail" opens a draft that you review and send yourself; the app never sends email.</p>
        </Item>
        <Item t="Delete everything">
          <p>"Clear all data" on My resume removes your resume and jobs for the current account. The button below removes everything this app has saved in this browser: all accounts' resumes and jobs, API keys and preferences. Exported files you downloaded stay where you saved them. Your Google sign-in session is managed by Firebase in your browser; use Sign out in Settings to end it.</p>
          <div><Button variant="danger" onClick={() => { if (confirm('Delete all Job OS data from this browser, including API keys? This cannot be undone.')) { wipeEverything(); setDone(true); setTimeout(() => location.reload(), 900); } }}><Trash2 size={16} /> Delete everything from this browser</Button></div>
          {done && <p role="status" className="text-primary">Deleted. Reloading…</p>}
        </Item>
      </div>
    </>
  );
}
