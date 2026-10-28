import { useState } from 'react';
import { CalendarPlus, Copy, Mail } from 'lucide-react';
import { Badge, Button, Label, Textarea } from './ui';
import type { Job } from '../types';
import { todayStr } from '../lib/insights';
import { REPLY_ADVICE, classifyReply, download, ics, slug, type ReplyKind } from '../lib/merged';
import { draft, followUpIcs, isGhosted, schedule } from '../lib/ghost';
import { useApp } from '../lib/state';

/** Ghost-Proof Follow-up: day 5/10/21 reminders, ready drafts, auto "ghosted" mark and a reply sorter. Browser only; you send everything. */
export default function JobFollowUp({ job, patch, go }: { job: Job; patch: (p: Partial<Job>) => void; go: (p: any, id?: string) => void }) {
  const { profile } = useApp();
  const [text, setText] = useState('');
  const [kind, setKind] = useState<ReplyKind | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const now = todayStr();
  const steps = schedule(job, now);
  const ghosted = isGhosted(job, now);
  const remind = (n: number, date: string) => download(ics({ uid: `${job.id}-fu${n}`, title: `Follow up #${n}: ${job.title}, ${job.company}`, start: date < now ? now : date, description: `Send follow-up #${n} for ${job.title} at ${job.company}. The draft is ready in Job Acquisition OS.`, url: job.url || undefined }), `follow-up-${n}-${slug(job.company)}.ics`, 'text/calendar');
  const advice = kind ? REPLY_ADVICE[kind] : null;
  return (
    <section className="mb-5 grid gap-4 rounded-xl border border-border p-4" data-testid="follow-up">
      <div>
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-medium">Ghost-proof follow-up</h3>{ghosted && <Badge tone="danger"><span data-testid="ghosted">Ghosted · no reply in 21+ days</span></Badge>}</div>
        {!job.appliedAt ? <p className="text-sm text-muted-foreground">Mark the job as applied to plan follow-ups on day 5, 10 and 21.</p>
          : job.reply ? <p className="text-sm text-muted-foreground">Stopped: you logged a reply ({REPLY_ADVICE[job.reply.kind as ReplyKind]?.label || job.reply.kind}).</p>
          : steps.length === 0 ? <p className="text-sm text-muted-foreground">No follow-ups needed at this stage.</p>
          : <ul className="mt-2 grid gap-3 text-sm">{steps.map((s) => { const d = draft(job, s.n, profile.name, profile.coverOwnLine); return (
            <li key={s.n} className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2"><b>Day {s.day}</b> · {s.date} <Badge tone={s.state === 'sent' ? 'primary' : s.state === 'due' ? 'gold' : 'muted'}>{s.state === 'sent' ? 'Sent' : s.state === 'due' ? 'Due now' : 'Upcoming'}</Badge>
                {s.state !== 'sent' && <Button size="sm" variant="outline" onClick={() => remind(s.n, s.date)}><CalendarPlus size={14} /> Reminder (.ics)</Button>}
                <Button size="sm" variant="ghost" onClick={() => setOpen(open === s.n ? null : s.n)}>{open === s.n ? 'Hide draft' : 'Show draft'}</Button>
                {s.state !== 'sent' && s.n === (job.followUpsSent || 0) + 1 && <Button size="sm" variant="ghost" onClick={() => patch({ followUpsSent: s.n })}>I sent it</Button>}
              </div>
              {open === s.n && <div className="rounded-lg bg-muted/60 p-3"><p className="font-medium">Subject: {d.subject}</p><p className="mt-1 whitespace-pre-wrap">{d.body}</p>
                <div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(`Subject: ${d.subject}\n\n${d.body}`)}><Copy size={14} /> Copy</Button>
                  <a className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm" href={`mailto:?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`}><Mail size={14} /> Open in my email</a></div>
                <p className="mt-1 text-xs text-muted-foreground">Nothing is sent by the app. Edit it so it sounds like you.</p></div>}
            </li>); })}
            <li><Button size="sm" variant="outline" onClick={() => download(followUpIcs(job, profile.name), `follow-ups-${slug(job.company)}.ics`, 'text/calendar')}><CalendarPlus size={14} /> All 3 reminders in one calendar file</Button></li>
            <li><button className="cursor-pointer text-sm underline" onClick={() => go('outreach', job.id)}>Write a longer one in Outreach studio</button></li></ul>}
      </div>
      <div>
        <Label htmlFor={`rp-${job.id}`} hint="optional">Got a reply? Paste it to sort it</Label>
        <Textarea id={`rp-${job.id}`} rows={3} value={text} onChange={(e) => { setText(e.target.value); setKind(null); }} placeholder="Paste the recruiter's email here. It stays in this browser." />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={text.trim().length < 10} onClick={() => setKind(classifyReply(text))}>Sort reply</Button>
          {advice && <><Badge tone={kind === 'rejection' || kind === 'bounce' ? 'danger' : kind === 'interview' || kind === 'positive' ? 'primary' : 'gold'}>{advice.label}</Badge><span className="text-sm text-muted-foreground">{advice.tip}</span>
            <Button size="sm" onClick={() => patch({ reply: { text: text.slice(0, 4000), kind: kind!, at: new Date().toISOString() }, ...(advice.status ? { status: advice.status } : {}) })}>{advice.status ? `Save and set status to ${advice.status}` : 'Save reply'}</Button></>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Sorted by simple word rules in your browser, not AI. Check it yourself.</p>
      </div>
    </section>
  );
}
