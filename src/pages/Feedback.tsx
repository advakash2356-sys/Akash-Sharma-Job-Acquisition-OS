import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button, Card, Label, PageHeader, Select, Textarea } from '../components/ui';
import { OWNER_EMAIL, REPO } from '../lib/brand';
import { track } from '../lib/analytics';

const KINDS = ['Idea', 'Bug', 'Job search results', 'Something confusing', 'Praise'];

/** Feedback goes straight to Akash: as a GitHub issue (public) or as an email you send yourself. No backend, no key. */
export default function Feedback() {
  const [kind, setKind] = useState(KINDS[0]);
  const [text, setText] = useState('');
  const ok = text.trim().length >= 5;
  const title = `[Feedback] ${kind}: ${text.trim().split('\n')[0].slice(0, 60)}`;
  const body = `**Type:** ${kind}\n\n${text.trim()}\n\n---\nSent from the Job Acquisition OS feedback page (${new Date().toISOString().slice(0, 10)}).`;
  const issueUrl = `https://github.com/${REPO}/issues/new?${new URLSearchParams({ template: 'feedback.yml', title, labels: 'feedback', kind, details: text.trim() }).toString()}`;
  const mailUrl = `mailto:${OWNER_EMAIL}?${new URLSearchParams({ subject: title, body: body.replace(/\*\*/g, '') }).toString().replace(/\+/g, '%20')}`;
  return (
    <>
      <PageHeader eyebrow="Help shape it" title="Share your feedback" subtitle="It goes straight to Akash. Nothing is sent until you press send yourself." />
      <Card className="grid gap-4">
        <div className="max-w-xs"><Label htmlFor="fk">What kind?</Label><Select id="fk" value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map((k) => <option key={k}>{k}</option>)}</Select></div>
        <div><Label htmlFor="ft">Your feedback</Label><Textarea id="ft" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="What worked, what didn't, what you wish it did." /></div>
        <p className="text-sm text-muted-foreground">Please do not paste your resume, phone number or API key here. GitHub issues are public.</p>
        <div className="flex flex-wrap gap-2">
          <a aria-disabled={!ok} onClick={(e) => { if (!ok) e.preventDefault(); else track('feedback_sent'); }} href={ok ? issueUrl : undefined} target="_blank" rel="noreferrer" className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium ${ok ? 'bg-primary text-primary-foreground' : 'pointer-events-none bg-muted text-muted-foreground'}`}><MessageSquare size={16} /> Post on GitHub (public)</a>
          <a aria-disabled={!ok} onClick={(e) => { if (!ok) e.preventDefault(); else track('feedback_sent'); }} href={ok ? mailUrl : undefined} className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium ${ok ? 'border-border hover:bg-muted' : 'pointer-events-none border-border text-muted-foreground'}`}>Email Akash instead (private)</a>
          <Button variant="ghost" onClick={() => setText('')} disabled={!text}>Clear</Button>
        </div>
        <p className="text-xs text-muted-foreground">GitHub needs a free GitHub account. Email opens your mail app with the message filled in, to {OWNER_EMAIL}.</p>
      </Card>
    </>
  );
}
