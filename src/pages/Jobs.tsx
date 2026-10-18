import React, { useState } from 'react';
import { Plus, Briefcase, Trash2, ExternalLink } from 'lucide-react';
import { Badge, Button, Card, Dialog, EmptyState, Input, Label, PageHeader, Select, Textarea } from '../components/ui';
import { AiError_, RunButton, useAiAction } from '../components/AiPanel';
import { useApp } from '../lib/state';
import { uid, today } from '../lib/utils';
import { JOB_STATUSES, type Job, type JobScore, type JobStatus } from '../types';

const scoreTone = (n: number) => (n >= 75 ? 'primary' : n >= 55 ? 'gold' : 'danger') as 'primary' | 'gold' | 'danger';

function AddJob({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (j: Job) => void }) {
  const [f, setF] = useState({ title: '', company: '', url: '', description: '' });
  const ok = f.title.trim() && f.description.trim();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    onAdd({ id: uid(), ...f, title: f.title.trim(), company: f.company.trim() || 'Unknown company', status: 'Saved', createdAt: today(), notes: '', interviews: [] });
    setF({ title: '', company: '', url: '', description: '' });
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} title="Add a job">
      <form onSubmit={submit} className="grid gap-4">
        <div><Label htmlFor="jt">Job title</Label><Input id="jt" autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="jc">Company</Label><Input id="jc" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></div>
          <div><Label htmlFor="ju" hint="optional">Link</Label><Input id="ju" type="url" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://" /></div>
        </div>
        <div><Label htmlFor="jd">Job description</Label><Textarea id="jd" rows={8} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Paste the full job description" required /></div>
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!ok}>Add job</Button></div>
      </form>
    </Dialog>
  );
}

function JobDetail({ job, onClose }: { job: Job; onClose: () => void }) {
  const { setJobs, go, hasResume } = useApp();
  const ai = useAiAction<JobScore>('score-job', job);
  const patch = (p: Partial<Job>) => setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, ...p } : j)));
  const s = job.score;
  const score = async () => { const r = await ai.run(); if (r) patch({ score: r }); };

  return (
    <Dialog open onClose={onClose} title={job.title} wide>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>{job.company}</span>
        {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline"><ExternalLink size={13} /> Open posting</a>}
        <Select className="ml-auto h-9 w-40" aria-label="Status" value={job.status}
          onChange={(e) => patch({ status: e.target.value as JobStatus, appliedAt: e.target.value === 'Applied' && !job.appliedAt ? today() : job.appliedAt })}>
          {JOB_STATUSES.map((st) => <option key={st}>{st}</option>)}
        </Select>
      </div>

      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-medium">Fit score</h3>
          <RunButton loading={ai.loading} onClick={score} disabled={!hasResume}>{s ? 'Re-score' : 'Score this job'}</RunButton>
        </div>
        {!hasResume && <p className="text-sm text-muted-foreground">Add your resume first so the score reflects you. <button className="underline cursor-pointer" onClick={() => go('resume')}>Go to My resume</button></p>}
        <AiError_ error={ai.error} go={go} />
        {s && (
          <div className="mt-3 grid gap-3">
            <div className="flex items-center gap-3"><span className="font-mono text-3xl font-medium text-gold">{s.score}</span><span className="text-muted-foreground">/ 100</span><Badge tone={scoreTone(s.score)}>{s.verdict}</Badge></div>
            <p className="text-sm">{s.recommendation}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><div className="mb-1 text-sm font-medium">Strengths</div><ul className="list-disc space-y-1 pl-5 text-sm">{s.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              <div><div className="mb-1 text-sm font-medium">Gaps</div><ul className="list-disc space-y-1 pl-5 text-sm">{s.gaps.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            </div>
            <div className="flex flex-wrap gap-1.5">{s.keywords.map((k, i) => <Badge key={i}>{k}</Badge>)}</div>
          </div>
        )}
      </section>

      <div className="mb-5 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => go('tailor', job.id)}>Tailor resume & cover letter</Button>
        <Button variant="outline" onClick={() => go('outreach', job.id)}>Write outreach</Button>
      </div>

      <div className="mb-5"><Label htmlFor="nt">Notes</Label><Textarea id="nt" rows={3} value={job.notes} onChange={(e) => patch({ notes: e.target.value })} /></div>
      <details className="mb-5 text-sm"><summary className="cursor-pointer text-muted-foreground">Job description</summary><p className="mt-2 whitespace-pre-wrap">{job.description}</p></details>
      <div className="flex justify-between">
        <Button variant="danger" onClick={() => { if (confirm('Delete this job?')) { setJobs((js) => js.filter((j) => j.id !== job.id)); onClose(); } }}><Trash2 size={16} /> Delete</Button>
        <Button variant="outline" onClick={onClose}>Done</Button>
      </div>
    </Dialog>
  );
}

export default function Jobs() {
  const { jobs, setJobs } = useApp();
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | JobStatus>('All');
  const shown = jobs.filter((j) => filter === 'All' || j.status === filter);
  const open = jobs.find((j) => j.id === openId);

  return (
    <>
      <PageHeader title="Jobs" subtitle="Every role you are tracking, from saved to offer." action={<Button onClick={() => setAdding(true)}><Plus size={16} /> Add job</Button>} />
      {jobs.length === 0 ? (
        <EmptyState icon={<Briefcase size={32} />} title="No jobs yet" body="Paste a job description to score it against your resume and track it through to an offer." action={<Button onClick={() => setAdding(true)}><Plus size={16} /> Add your first job</Button>} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
            {(['All', ...JOB_STATUSES] as const).map((st) => (
              <button key={st} role="tab" aria-selected={filter === st} onClick={() => setFilter(st)}
                className={`rounded-full px-3 py-1 text-sm cursor-pointer ${filter === st ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {st}{st !== 'All' && ` · ${jobs.filter((j) => j.status === st).length}`}
              </button>
            ))}
          </div>
          <div className="grid gap-3">
            {shown.map((j) => (
              <Card key={j.id} className="flex flex-wrap items-center gap-3 p-4">
                <button onClick={() => setOpenId(j.id)} className="min-w-0 flex-1 text-left cursor-pointer">
                  <div className="truncate font-medium">{j.title}</div>
                  <div className="truncate text-sm text-muted-foreground">{j.company} · added {j.createdAt}</div>
                </button>
                {j.score && <span className="font-mono text-lg text-gold">{j.score.score}</span>}
                <Badge tone={j.status === 'Offer' ? 'primary' : 'muted'}>{j.status}</Badge>
              </Card>
            ))}
            {shown.length === 0 && <p className="text-muted-foreground">No jobs with this status.</p>}
          </div>
        </>
      )}
      <AddJob open={adding} onClose={() => setAdding(false)} onAdd={(j) => setJobs((js) => [j, ...js])} />
      {open && <JobDetail job={open} onClose={() => setOpenId(null)} />}
    </>
  );
}
