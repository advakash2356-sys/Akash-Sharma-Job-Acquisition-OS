import React from 'react';
import { ArrowRight, Check, Circle } from 'lucide-react';
import { Button, Card, PageHeader } from '../components/ui';
import { useApp } from '../lib/state';
import { getUserApiKey } from '../lib/userApiKey';
import { JOB_STATUSES } from '../types';

export default function Overview() {
  const { profile, jobs, go, hasResume } = useApp();
  const hasKey = !!getUserApiKey();
  const scored = jobs.filter((j) => j.score).length;
  const steps = [
    { done: hasResume, label: 'Add your resume', page: 'resume' as const },
    { done: hasKey, label: 'Add your free Gemini API key', page: 'settings' as const },
    { done: jobs.length > 0, label: 'Add a job you want', page: 'jobs' as const },
    { done: scored > 0, label: 'Score it against your resume', page: 'jobs' as const },
  ];
  const next = steps.find((s) => !s.done);
  const upcoming = jobs.flatMap((j) => j.interviews.map((i) => ({ ...i, job: j }))).filter((i) => i.date && new Date(i.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const stats = JOB_STATUSES.map((s) => [s, jobs.filter((j) => j.status === s).length] as const);
  const max = Math.max(1, ...stats.map(([, n]) => n));

  return (
    <>
      <PageHeader title={profile.name ? `Welcome, ${profile.name.split(' ')[0]}` : 'Welcome'} subtitle="Everything here is your own data, saved in this browser. Nothing is made up." />

      {next && (
        <Card className="mb-6 fade-up">
          <h2 className="mb-3 text-xl font-medium">Get set up</h2>
          <ol className="mb-4 grid gap-2">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-sm">
                {s.done ? <Check size={16} className="text-primary" /> : <Circle size={16} className="text-muted-foreground" />}
                <span className={s.done ? 'text-muted-foreground line-through' : ''}>{s.label}</span>
              </li>
            ))}
          </ol>
          <Button onClick={() => go(next.page)}>{next.label} <ArrowRight size={16} /></Button>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([s, n]) => (
          <Card key={s} className="p-4"><div className="font-mono text-3xl font-medium">{n}</div><div className="text-sm text-muted-foreground">{s}</div></Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-xl font-medium">Pipeline</h2>
          {jobs.length === 0 ? <p className="text-sm text-muted-foreground">No jobs tracked yet.</p> : (
            <div className="grid gap-2.5">
              {stats.map(([s, n]) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-muted-foreground">{s}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(n / max) * 100}%` }} /></div>
                  <span className="w-5 text-right font-mono">{n}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 text-xl font-medium">Upcoming interviews</h2>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">None scheduled.</p> : (
            <ul className="grid gap-3">{upcoming.map((i) => (
              <li key={i.id} className="text-sm"><div className="font-medium">{i.round} · {i.job.company}</div><div className="text-muted-foreground">{new Date(i.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div></li>
            ))}</ul>
          )}
        </Card>
      </div>
    </>
  );
}
