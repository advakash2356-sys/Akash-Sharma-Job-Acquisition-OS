import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Badge, Button } from './ui';
import type { Job } from '../types';
import { useApp } from '../lib/state';
import { jobFit } from '../lib/insights';
import { repostCount, truthScore } from '../lib/truthScore';
import { authedFetch } from '../lib/api';

export function truthFor(job: Job, jobs: Job[], resume: string) {
  const f = jobFit(job, resume);
  return truthScore({ postedAt: job.found?.postedAt || job.createdAt, alive: job.alive?.state, reposts: repostCount(job, jobs), description: job.description, fit: f ? f.score : null });
}
const tone = (v: string) => (v === 'skip' ? 'danger' : v === 'apply' ? 'primary' : 'gold') as 'danger' | 'primary' | 'gold';

/** Job Truth Score: evidence that the listing is real, open and worth your time. Every point is shown. Akash Sync Agent. */
export default function JobTruth({ job, patch, compact }: { job: Job; patch?: (p: Partial<Job>) => void; compact?: boolean }) {
  const { jobs, profile } = useApp();
  const [busy, setBusy] = useState(false);
  const t = truthFor(job, jobs, profile.resumeText);
  if (compact) return <Badge tone={tone(t.verdict)}><span data-testid="truth-badge" title={t.dontApply.join(' ') || t.parts.map((p) => `${p.label}: ${p.note}`).join(' · ')}>Truth {t.score} · {t.label}</span></Badge>;
  const check = async () => {
    if (!job.url || !patch) return; setBusy(true);
    try { const r = await authedFetch('/api/jobs/alive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: job.url }) }, {}, 'The link check');
      const d = await r.json(); patch({ alive: { state: r.ok ? d.alive : 'unknown', reason: r.ok ? d.reason : d.error || 'Check failed.', at: new Date().toISOString() } }); }
    catch (e: any) { patch({ alive: { state: 'unknown', reason: e?.message || 'Check failed.', at: new Date().toISOString() } }); }
    finally { setBusy(false); }
  };
  return (
    <section className="grid gap-3 rounded-xl border border-border p-4" data-testid="job-truth">
      <div className="flex flex-wrap items-center gap-3">
        <ShieldCheck size={18} className="text-primary" /><h3 className="text-lg font-medium">Job Truth Score</h3>
        <span className="font-mono text-2xl text-gold">{t.score}</span><span className="text-sm text-muted-foreground">/ 100</span>
        <Badge tone={tone(t.verdict)}>{t.label}</Badge>
        {job.url && patch && <Button size="sm" variant="outline" disabled={busy} onClick={check}>{busy ? 'Checking link…' : job.alive ? 'Check link again' : 'Check the link is still open'}</Button>}
      </div>
      <ul className="grid gap-1 text-sm sm:grid-cols-2">{t.parts.map((p) => <li key={p.label} className="flex justify-between gap-3 border-b border-border/60 py-1"><span>{p.label} <span className="text-muted-foreground">· {p.note}</span></span><span className="font-mono">{p.points}/{p.max}</span></li>)}</ul>
      {job.alive && <p className="text-xs text-muted-foreground">Link check: {job.alive.reason} ({job.alive.at.slice(0, 10)})</p>}
      {t.dontApply.length > 0 && <div className="rounded-lg bg-muted/60 p-3 text-sm"><b>Why we'd skip it:</b><ul className="mt-1 list-disc pl-5">{t.dontApply.map((d) => <li key={d}>{d}</li>)}</ul><p className="mt-1 text-xs text-muted-foreground">Advice only. You decide.</p></div>}
    </section>
  );
}
