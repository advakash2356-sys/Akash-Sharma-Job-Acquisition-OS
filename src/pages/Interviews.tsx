import React, { useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Dialog, EmptyState, Input, Label, PageHeader, Select, Textarea } from '../components/ui';
import { AiError_, RunButton, useAiAction } from '../components/AiPanel';
import type { InterviewPrep } from '../types';
import { useApp } from '../lib/state';
import { uid } from '../lib/utils';

function Prep() {
  const { jobs, setJobs, go, hasResume } = useApp();
  const [id, setId] = useState('');
  const job = jobs.find((j) => j.id === id) || jobs.find((j) => j.status === 'Interviewing') || jobs[0];
  const ai = useAiAction<InterviewPrep>('interview-prep', job);
  if (!job) return null;
  const patch = (p: object) => setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, ...p } : j)));
  const done = job.prepDone || [];
  const pr = job.interviewPrep;
  return (
    <Card className="mt-8">
      <h2 className="mb-1 text-3xl">Interview prep</h2>
      <p className="mb-4 text-sm text-muted-foreground">Likely questions with answer outlines built only from your resume. Tick off each one as you rehearse.</p>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1"><Label htmlFor="pj">Job</Label><Select id="pj" value={job.id} onChange={(e) => setId(e.target.value)}>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.company}</option>)}</Select></div>
        <RunButton loading={ai.loading} disabled={!hasResume} onClick={async () => { const r = await ai.run(); if (r) patch({ interviewPrep: r, prepDone: [] }); }}>{pr ? 'Regenerate' : 'Generate prep'}</RunButton>
      </div>
      {!hasResume && <p className="mb-3 text-sm text-muted-foreground">Add your resume first. <button className="underline cursor-pointer" onClick={() => go('resume')}>Go to My resume</button></p>}
      <AiError_ error={ai.error} go={go} />
      {pr && (
        <div className="mt-4 grid gap-4">
          <div className="label text-muted-foreground">Rehearsed {done.length} / {pr.questions.length}</div>
          {pr.questions.map((q, i) => { const k = String(i); const on = done.includes(k); return (
            <details key={i} className="rounded-2xl border border-border p-4">
              <summary className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={on} aria-label="Rehearsed" onClick={(e) => e.stopPropagation()} onChange={() => patch({ prepDone: on ? done.filter((x) => x !== k) : [...done, k] })} />
                <span className={on ? 'text-muted-foreground line-through' : 'font-medium'}>{q.question}</span>
              </summary>
              <p className="mt-3 text-sm"><b>Why they ask:</b> {q.why}</p><p className="mt-2 text-sm"><b>Outline:</b> {q.answerOutline}</p>
            </details>); })}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><div className="mb-1 font-medium">Ask them</div><ul className="list-disc space-y-1 pl-5 text-sm">{pr.askThem.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            <div><div className="mb-1 font-medium">Research</div><ul className="list-disc space-y-1 pl-5 text-sm">{pr.research.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function Interviews() {
  const { jobs, setJobs, go } = useApp();
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ jobId: '', round: 'Recruiter screen', date: '', notes: '' });
  const all = jobs.flatMap((j) => j.interviews.map((i) => ({ ...i, job: j }))).sort((a, b) => a.date.localeCompare(b.date));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const id = f.jobId || jobs[0]?.id;
    if (!id) return;
    setJobs((js) => js.map((j) => j.id === id ? { ...j, status: j.status === 'Saved' || j.status === 'Applied' ? 'Interviewing' : j.status, interviews: [...j.interviews, { id: uid(), round: f.round, date: f.date, notes: f.notes }] } : j));
    setAdding(false);
    setF({ jobId: '', round: 'Recruiter screen', date: '', notes: '' });
  };

  return (
    <>
      <PageHeader title="Interviews" subtitle="Rounds you have scheduled across all jobs." action={jobs.length > 0 && <Button onClick={() => setAdding(true)}><Plus size={16} /> Add interview</Button>} />
      {jobs.length === 0 ? (
        <EmptyState icon={<CalendarDays size={32} />} title="Add a job first" body="Interviews belong to a job. Track a role, then log each round here." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} />
      ) : all.length === 0 ? (
        <EmptyState icon={<CalendarDays size={32} />} title="No interviews logged" body="When a recruiter schedules a round, add it here so you never miss one." action={<Button onClick={() => setAdding(true)}><Plus size={16} /> Add interview</Button>} />
      ) : (
        <div className="grid gap-3">
          {all.map((i) => (
            <Card key={i.id} className="flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{i.round} · {i.job.company}</div>
                <div className="text-sm text-muted-foreground">{i.job.title} · {i.date ? new Date(i.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'No date set'}</div>
                {i.notes && <p className="mt-2 whitespace-pre-wrap text-sm">{i.notes}</p>}
              </div>
              <Button size="sm" variant="ghost" aria-label="Delete interview" onClick={() => setJobs((js) => js.map((j) => j.id === i.job.id ? { ...j, interviews: j.interviews.filter((x) => x.id !== i.id) } : j))}><Trash2 size={15} /></Button>
            </Card>
          ))}
        </div>
      )}
      {jobs.length > 0 && <Prep />}
      <Dialog open={adding} onClose={() => setAdding(false)} title="Add interview">
        <form onSubmit={add} className="grid gap-4">
          <div><Label htmlFor="ij">Job</Label><Select id="ij" value={f.jobId || jobs[0]?.id} onChange={(e) => setF({ ...f, jobId: e.target.value })}>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.company}</option>)}</Select></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="ir">Round</Label><Input id="ir" value={f.round} onChange={(e) => setF({ ...f, round: e.target.value })} /></div>
            <div><Label htmlFor="id">Date and time</Label><Input id="id" type="datetime-local" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          </div>
          <div><Label htmlFor="in">Notes</Label><Textarea id="in" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </Dialog>
    </>
  );
}
