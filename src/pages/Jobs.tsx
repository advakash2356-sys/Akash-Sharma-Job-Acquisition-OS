import { daysOld } from '../lib/keywords';
import React, { useEffect, useState } from 'react';
import { Plus, Briefcase, Trash2, ExternalLink } from 'lucide-react';
import { Badge, Button, Card, Dialog, EmptyState, Input, Label, PageHeader, Select, Textarea } from '../components/ui';
import { AiError_, RunButton, useAiAction } from '../components/AiPanel';
import { useApp } from '../lib/state';
import { uid, today } from '../lib/utils';
import { setStage } from '../lib/tracker';
import JobFacts from '../components/JobFacts';
import { JOB_STATUSES, type Job, type JobScore, type JobStatus, type RecruiterReview } from '../types';
import { SOURCES, keywordGap, jobFit, jobKeywordText } from '../lib/insights';
import JobFollowUp from '../components/JobFollowUp';
import JobTruth from '../components/JobTruth';
import { isGhosted } from '../lib/ghost';
import { todayStr } from '../lib/insights';
import { daysLeftLabel, findDuplicate, parseNotice } from '../lib/merged';

const Wrap = ({ inline, onClose, title, children }: { inline?: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (inline ? <Card>{children}</Card> : <Dialog open onClose={onClose} title={title} wide>{children}</Dialog>);
const num = (v: string) => (v.trim() && !isNaN(Number(v)) ? Number(v) : undefined);
const scoreTone = (n: number) => (n >= 75 ? 'primary' : n >= 55 ? 'gold' : 'danger') as 'primary' | 'gold' | 'danger';

function AddJob({ open, onClose, onAdd, existing = [] }: { open: boolean; onClose: () => void; onAdd: (j: Job) => void; existing?: Job[] }) {
  const [f, setF] = useState({ title: '', company: '', url: '', description: '', source: 'LinkedIn' });
  const [pay, setPay] = useState({ min: '', max: '' });
  useEffect(() => { if (!open) { setF({ title: '', company: '', url: '', description: '', source: 'LinkedIn' }); setPay({ min: '', max: '' }); } }, [open]);
  const ok = f.title.trim() && f.description.trim();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    onAdd({ id: uid(), ...f, title: f.title.trim(), company: f.company.trim() || 'Unknown company', status: 'Saved', createdAt: today(), notes: '', interviews: [], salaryMin: num(pay.min), salaryMax: num(pay.max) });
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
        <div><Label htmlFor="src">Found on</Label><Select id="src" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>{SOURCES.map((x) => <option key={x}>{x}</option>)}</Select></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="sm" hint="optional, your unit e.g. LPA">Pay min</Label><Input id="sm" inputMode="decimal" value={pay.min} onChange={(e) => setPay({ ...pay, min: e.target.value })} /></div>
          <div><Label htmlFor="sx" hint="optional">Pay max</Label><Input id="sx" inputMode="decimal" value={pay.max} onChange={(e) => setPay({ ...pay, max: e.target.value })} /></div>
        </div>
        <div><Label htmlFor="jd">Job description</Label><Textarea id="jd" rows={8} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Paste the full job description" required /></div>
        {(() => { const d = f.title.trim() && findDuplicate(existing, f); return d ? <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">Looks like a job you already track: <b>{d.title}</b> at {d.company} (added {d.createdAt}). You can still add it.</p> : null; })()}
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!ok}>Add job</Button></div>
      </form>
    </Dialog>
  );
}

export function JobDetail({ job, onClose, inline }: { job: Job; onClose: () => void; inline?: boolean }) {
  const { setJobs, go, hasResume } = useApp();
  const ai = useAiAction<JobScore>('score-job', job);
  const patch = (p: Partial<Job>) => setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, ...p } : j)));
  const s = job.score;
  const rv = useAiAction<RecruiterReview>('recruiter-review', job);
  const { profile } = useApp();
  const gap = hasResume ? keywordGap(profile.resumeText, jobKeywordText(job)) : null;
  const score = async () => { const r = await ai.run(); if (r) patch({ score: r }); };

  return (
    <Wrap inline={inline} onClose={onClose} title={job.title}>
      {job.found && !inline && (
        <div className="mb-4 rounded-xl border border-gold/50 bg-gold/10 p-3 text-sm">
          {job.found.govt
            ? <><b>Government job notice</b> · last date to apply: <b>{job.found.govt.lastDate}</b> ({daysLeftLabel(job.found.govt.lastDate)}). {(() => { const n = parseNotice(job.description); const parts = [n.notificationNo && `Notice no. ${n.notificationNo}`, n.pay && `Pay stated: ${n.pay}`, n.age && `Age: ${n.age}`, n.minYears != null && `Experience: ${n.minYears}+ years`].filter(Boolean); return parts.length ? <>{parts.join(' · ')}. </> : null; })()} {job.found.govt.official ? <>The link opens the <b>official notification</b>.</> : <>The link opens {job.found.govt.via}, a news site that lists notices. Check the official notification there before applying.</>} Found via {job.found.source}{job.found.postedAt ? `, posted ${job.found.postedAt}` : ''}.</>
            : <><b>Real posting found via {job.found.source === 'Himalayas' || job.found.source === 'Remote OK' ? job.found.source : 'FreeHire'}</b> (source: {job.found.source}{job.found.postedAt ? `, posted ${job.found.postedAt}` : ''}). Listings can go stale, so confirm it is still open on the employer's page before applying.</>}
          {job.found.decision && <p className="mt-1" data-testid="elig-reason"><b>{job.found.decision.badge}.</b> {job.found.decision.reason}</p>}
          {job.found.fit && <p className="mt-1">{job.found.fit.kind === 'ai' ? `AI fit ${job.found.fit.score}/100` : `Keyword match ${gap ? gap.pct : job.found.fit.score}%`}: {job.found.fit.summary}</p>}
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>{job.company}</span>
        {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline"><ExternalLink size={13} /> Open posting</a>}
        <Select className="ml-auto h-9 w-40" aria-label="Status" value={job.status}
          onChange={(e) => patch({ ...setStage(job, e.target.value as JobStatus) })}>
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

      {gap && (
        <section className="mb-5">
          <h3 className="mb-1 text-lg font-medium">Keyword match <span className="font-mono text-gold">{gap.pct}%</span></h3>
          <p className="mb-2 text-sm text-muted-foreground">Top terms in the posting that appear in your resume (green) or not (outlined). Add the missing ones only where true.</p>
          <div className="flex flex-wrap gap-1.5">{gap.hit.map((k) => <Badge key={k} tone="primary">{k}</Badge>)}{gap.miss.map((k) => <span key={k} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{k}</span>)}</div>
        </section>
      )}

      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-medium">Recruiter's read</h3>
          <RunButton loading={rv.loading} disabled={!hasResume} onClick={async () => { const r = await rv.run(); if (r) patch({ recruiterReview: r }); }}>{job.recruiterReview ? 'Re-run' : 'Simulate screen'}</RunButton>
        </div>
        <AiError_ error={rv.error} go={go} />
        {job.recruiterReview && (() => { const r = job.recruiterReview!; return (
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2"><Badge tone={r.shortlist === 'Yes' ? 'primary' : r.shortlist === 'Maybe' ? 'gold' : 'danger'}>Shortlist: {r.shortlist}</Badge></div>
            <p>{r.sixSecondRead}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><div className="mb-1 font-medium">Concerns</div><ul className="list-disc space-y-1 pl-5">{r.concerns.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              <div><div className="mb-1 font-medium">ATS risks</div><ul className="list-disc space-y-1 pl-5">{r.atsRisks.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            </div>
            <div><div className="mb-1 font-medium">Fixes</div><ul className="list-disc space-y-1 pl-5">{r.fixes.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          </div>); })()}
      </section>

      <div className="mb-5 flex flex-wrap gap-2">
        {!inline && <Button onClick={() => go('job', job.id)}>Open job page: apply, tailor resume, cover letter, outreach</Button>}
      </div>

      <JobFollowUp job={job} patch={patch} go={go} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {([['salaryMin', 'Pay min'], ['salaryMax', 'Pay max'], ['offerAmount', 'Offer received']] as const).map(([k, l]) => (
          <div key={k}><Label htmlFor={k}>{l}</Label><Input id={k} inputMode="decimal" value={job[k] ?? ''} onChange={(e) => patch({ [k]: num(e.target.value) })} /></div>
        ))}
      </div>
      <div className="mb-5"><Label htmlFor="nt">Notes</Label><Textarea id="nt" rows={3} value={job.notes} onChange={(e) => patch({ notes: e.target.value })} /></div>
      <details className="mb-5 text-sm"><summary className="cursor-pointer text-muted-foreground">Job description</summary><p className="mt-2 whitespace-pre-wrap">{job.description}</p></details>
      <div className="flex justify-between">
        <Button variant="danger" onClick={() => { if (confirm('Delete this job?')) { setJobs((js) => js.filter((j) => j.id !== job.id)); onClose(); } }}><Trash2 size={16} /> Delete</Button>
        {!inline && <Button variant="outline" onClick={onClose}>Done</Button>}
      </div>
    </Wrap>
  );
}

export default function Jobs() {
  const { jobs, setJobs, go, profile } = useApp();
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<'list' | 'board'>('list');
  const [filter, setFilter] = useState<'All' | JobStatus>('All');
  const shown = jobs.filter((j) => filter === 'All' || j.status === filter);

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
                className={`min-h-11 rounded-full px-4 text-sm cursor-pointer ${filter === st ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {st}{st !== 'All' && ` · ${jobs.filter((j) => j.status === st).length}`}
              </button>
            ))}
          </div>
          <div className="mb-4 flex gap-2">{(['list', 'board'] as const).map((v) => <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`label rounded-full border px-3 py-1.5 cursor-pointer ${view === v ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>{v}</button>)}</div>
          {view === 'board' ? (
            <div className="grid gap-3 overflow-x-auto md:grid-cols-5">
              {JOB_STATUSES.map((st) => (
                <div key={st} className="min-w-[200px]"><div className="label mb-2 text-muted-foreground">{st} · {jobs.filter((j) => j.status === st).length}</div>
                  <div className="grid gap-2">{jobs.filter((j) => j.status === st).map((j) => (
                    <button key={j.id} onClick={() => go('job', j.id)} className="glass rounded-2xl p-3 text-left cursor-pointer hover:border-primary"><div className="truncate text-sm font-medium">{j.title}</div><div className="truncate text-xs text-muted-foreground">{j.company}</div>{j.score && <div className="mt-1 font-mono text-gold">{j.score.score}</div>}</button>
                  ))}</div></div>
              ))}
            </div>
          ) : (
          <div className="grid gap-3">
            {shown.map((j) => (
              <Card key={j.id} className="flex flex-wrap items-center gap-3 p-4">
                <button onClick={() => go('job', j.id)} className="min-w-0 flex-1 text-left cursor-pointer">
                  <div className="truncate font-medium">{j.title}</div>
                  <div className="truncate text-sm text-muted-foreground">{j.company} · added {j.createdAt}</div>
                </button>
                {(() => { const f = jobFit(j, profile.resumeText); return f && <span className="font-mono text-lg text-gold" title={f.kind === 'ai' ? 'AI fit score' : 'Keyword match %'}>{f.score}{f.kind === 'keyword' ? '%' : ''}</span>; })()}
                {j.found?.decision && <Badge tone={j.found.decision.kind === 'remote-unclear' ? 'muted' : 'primary'}><span data-testid="elig-badge" title={j.found.decision.reason}>{j.found.decision.badge}</span></Badge>}
                {j.found && daysOld(j.found.postedAt) > 30 && <Badge tone="danger">Older than 30 days · may be closed</Badge>}
                {j.found && <Badge tone="gold">{j.found.govt ? `Govt · last date ${j.found.govt.lastDate}` : `${j.found.source === 'Himalayas' || j.found.source === 'Remote OK' ? '' : 'FreeHire · '}${j.found.source}${j.found.postedAt ? ` · ${j.found.postedAt}` : ''}`}</Badge>}
                <JobTruth job={j} compact />
                {isGhosted(j, todayStr()) && <Badge tone="danger">Ghosted</Badge>}
                <Badge tone={j.status === 'Offer' ? 'primary' : 'muted'}>{j.status}</Badge>
                {(j.tailoredResume || j.coverLetter || j.outreach) && <Badge tone="primary">{[j.tailoredResume && 'Resume', j.coverLetter && 'Letter', j.outreach && 'Outreach'].filter(Boolean).join(' · ')}</Badge>}
                <Button size="sm" variant="outline" onClick={() => go('job', j.id)}>Open job</Button>
                <div className="basis-full"><JobFacts job={j} compact /></div>
              </Card>
            ))}
            {shown.length === 0 && <p className="text-muted-foreground">No jobs with this status.</p>}
          </div>
          )}
        </>
      )}
      <AddJob open={adding} existing={jobs} onClose={() => setAdding(false)} onAdd={(j) => setJobs((js) => [j, ...js])} />
    </>
  );
}
