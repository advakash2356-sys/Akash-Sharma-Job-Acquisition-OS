import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { Badge, Button, Label, Textarea } from './ui';
import type { Job } from '../types';
import { REPLY_ADVICE, cadence, classifyReply, download, ics, slug, type ReplyKind } from '../lib/merged';

/** Follow-up schedule (.ics reminders) and a rules-based reply sorter. Browser only; nothing is sent. */
export default function JobFollowUp({ job, patch, go }: { job: Job; patch: (p: Partial<Job>) => void; go: (p: any, id?: string) => void }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState<ReplyKind | null>(null);
  const steps = cadence(job);
  const remind = (n: number, date: string) => download(ics({ uid: `${job.id}-fu${n}`, title: `Follow up #${n}: ${job.title}, ${job.company}`, start: date, description: `Send follow-up #${n} for ${job.title} at ${job.company}. Draft it in Momentum's Outreach studio.`, url: job.url || undefined }), `follow-up-${n}-${slug(job.company)}.ics`, 'text/calendar');
  const advice = kind ? REPLY_ADVICE[kind] : null;
  return (
    <section className="mb-5 grid gap-4 rounded-xl border border-border p-4">
      <div>
        <h3 className="text-lg font-medium">Follow-up schedule</h3>
        {!job.appliedAt ? <p className="text-sm text-muted-foreground">Mark the job as applied to plan follow-ups.</p>
          : job.reply ? <p className="text-sm text-muted-foreground">Stopped: you logged a reply ({REPLY_ADVICE[job.reply.kind as ReplyKind]?.label || job.reply.kind}).</p>
          : steps.length === 0 ? <p className="text-sm text-muted-foreground">{job.status !== 'Applied' ? 'No follow-ups needed at this stage.' : 'Both follow-ups done. Two is enough: move on if there is no answer.'}</p>
          : <ul className="mt-1 grid gap-2 text-sm">{steps.map((s) => (
            <li key={s.n} className="flex flex-wrap items-center gap-2"><b>#{s.n}</b> on {s.date} <span className="text-muted-foreground">({s.n === 1 ? '5' : '10'} working days after applying)</span>
              <Button size="sm" variant="outline" onClick={() => remind(s.n, s.date)}><CalendarPlus size={14} /> Add to calendar (.ics)</Button>
              {s.n === steps[0].n && <Button size="sm" variant="ghost" onClick={() => patch({ followUpsSent: s.n })}>Mark #{s.n} sent</Button>}
            </li>))}
            <li><button className="cursor-pointer text-sm underline" onClick={() => go('outreach', job.id)}>Draft the follow-up in Outreach studio</button></li></ul>}
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
