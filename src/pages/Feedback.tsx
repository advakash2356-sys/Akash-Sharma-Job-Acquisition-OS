import { today } from '../lib/utils';
import { useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { Button, Card, Input, Label, PageHeader, Select, Textarea } from '../components/ui';
import { OWNER_EMAIL, REPO } from '../lib/brand';
import { track } from '../lib/analytics';
import EarlyAccessNote from '../components/EarlyAccessNote';
import Comments from '../components/Comments';

const PAGES = ['Whole site', 'Home page', 'Guided setup', 'Jobs', 'Job page / application pack', 'Tailored resume', 'Cover letter', 'Outreach', 'Dashboard', 'Settings', 'Other'];

/** Feedback form for anyone, no login. Saved to Akash's private Google Sheet via this site's server; Akash gets an email per entry. */
export default function Feedback() {
  const [f, setF] = useState({ name: '', email: '', message: '', page: PAGES[0], website: '' });
  const [rating, setRating] = useState(0);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');
  const t0 = useRef(Date.now());
  const ok = f.message.trim().length >= 5;
  const title = `[Feedback] ${f.page}: ${f.message.trim().split('\n')[0].slice(0, 60)}`;
  const body = `Rating: ${rating || '-'}/5\nPage: ${f.page}\n\n${f.message.trim()}\n\n---\nSent from the Job Acquisition OS feedback page (${today()}).`;
  const issueUrl = `https://github.com/${REPO}/issues/new?${new URLSearchParams({ template: 'feedback.yml', title, labels: 'feedback', details: f.message.trim() }).toString()}`;
  const mailUrl = `mailto:${OWNER_EMAIL}?${new URLSearchParams({ subject: title, body }).toString().replace(/\+/g, '%20')}`;
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!ok || state === 'sending') return;
    setState('sending'); setErr('');
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, rating, elapsedMs: Date.now() - t0.current }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || `Could not send (${r.status}).`);
      setState('sent'); track('feedback_sent'); setF({ ...f, message: '' }); setRating(0);
    } catch (x: any) { setState('error'); setErr(x.message); }
  };
  return (
    <>
      <PageHeader eyebrow="Help shape it" title="Share your feedback" subtitle="No login needed. Akash reads every message. If you leave an email, we aim to reply within 3 working days." />
      <EarlyAccessNote className="mb-5" />
      <Card className="mb-6">
        <form onSubmit={send} className="grid gap-4" aria-label="Feedback form">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="fn" hint="optional">Name</Label><Input id="fn" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div><Label htmlFor="fe" hint="optional, only if you want a reply">Email</Label><Input id="fe" type="email" maxLength={120} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset><legend className="mb-1.5 text-sm font-medium">Rating <span className="text-muted-foreground">(optional)</span></legend>
              <div className="flex gap-1" role="radiogroup" aria-label="Rating out of 5">{[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(rating === n ? 0 : n)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted cursor-pointer">
                  <Star size={22} className={n <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                </button>))}</div>
            </fieldset>
            <div><Label htmlFor="fp">Which page?</Label><Select id="fp" value={f.page} onChange={(e) => setF({ ...f, page: e.target.value })}>{PAGES.map((p) => <option key={p}>{p}</option>)}</Select></div>
          </div>
          <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label></div>
          <div><Label htmlFor="ft">Your feedback</Label><Textarea id="ft" rows={6} maxLength={3000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="What worked, what didn't, what you wish it did." /></div>
          <p className="text-xs text-muted-foreground">Saved privately for Akash (a Google Sheet only he can open). Please do not paste your resume, phone number or API key.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!ok || state === 'sending'} data-testid="send-feedback">{state === 'sending' ? 'Sending…' : 'Send feedback'}</Button>
            {state === 'sent' && <span role="status" className="text-sm text-primary">Thank you! Akash has been notified.</span>}
            {state === 'error' && <span role="alert" className="text-sm text-danger">{err}</span>}
          </div>
          <p className="text-xs text-muted-foreground">Prefer another way? <a className="underline" href={ok ? mailUrl : `mailto:${OWNER_EMAIL}`}>Email Akash</a> from your own mail app, or <a className="underline" href={issueUrl} target="_blank" rel="noreferrer">open a public GitHub issue</a>.</p>
        </form>
      </Card>
      <Comments />
    </>
  );
}
