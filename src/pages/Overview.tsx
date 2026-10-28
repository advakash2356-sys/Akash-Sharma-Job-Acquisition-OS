import React from 'react';
import { ArrowRight, Check, Circle, Flame } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Button, Card, PageHeader } from '../components/ui';
import FocusTimer from '../components/FocusTimer';
import PricePulse from '../components/PricePulse';
import { useAiReady } from '../lib/aiReady';
import { useApp } from '../lib/state';
import { getUserApiKey } from '../lib/userApiKey';
import { funnel, projection, sprintStats, todayStr } from '../lib/insights';
import { cadence, milestones } from '../lib/merged';

export default function Overview() {
  const { profile, jobs, go, hasResume } = useApp();
  const hasKey = !!getUserApiKey();
  const { ready, checking } = useAiReady();
  const scored = jobs.filter((j) => j.score).length;
  const steps = [
    { done: hasResume, label: 'Add your resume', page: 'resume' as const },
    { done: hasKey, label: 'Add your free Gemini API key', page: 'settings' as const },
    { done: jobs.length > 0, label: 'Add a job you want', page: 'jobs' as const },
    { done: scored > 0, label: 'Score it against your resume', page: 'jobs' as const },
  ];
  const next = steps.find((s) => !s.done);
  const target = parseInt(profile.dailyTarget) || 0;
  const sp = sprintStats(jobs, target);
  const f = funnel(jobs);
  const pr = projection(jobs);
  const due = jobs.filter((j) => { const c = cadence(j)[0]; return c && c.date <= todayStr(); }).sort((a, b) => (a.appliedAt! < b.appliedAt! ? -1 : 1));
  const ms = milestones(jobs);
  const upcoming = jobs.flatMap((j) => j.interviews.map((i) => ({ ...i, job: j }))).filter((i) => i.date && new Date(i.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const pct = target ? Math.min(100, Math.round((sp.today / target) * 100)) : 0;

  return (
    <>
      <section className="grain relative mb-8 overflow-hidden rounded-[28px] fade-up">
        <img src="/hero-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
        <div className="relative px-6 pb-8 pt-28 text-[#f4ede2] sm:px-10 sm:pt-40">
          <p className="label mb-2 text-[#ffb089]">{new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="display text-5xl leading-[0.95] sm:text-7xl">{profile.name ? `Keep going, ${profile.name.split(' ')[0]}.` : 'Your path starts here.'}</h1>
          <p className="mt-3 max-w-xl text-white/75">{target ? `Applications you marked as sent today: ${sp.today} of ${target}. You apply on each employer's site; the app does not apply for you.` : 'Set a daily target in Settings.'} {sp.streak > 0 && `${sp.streak}-day streak.`}</p>
        </div>
      </section>
      {jobs.length > 0 && <div className="mb-8"><PricePulse /></div>}

      {!ready && !checking && (
        <Card className="mb-6 border-primary/50 ring-1 ring-primary/30">
          <div className="label mb-1 text-primary">Step one</div>
          <h2 className="text-4xl">Add your free API key</h2>
          <p className="mt-1 mb-4 max-w-2xl text-sm text-muted-foreground">A free Gemini key from Google AI Studio powers tailoring, the recruiter read, interview prep and outreach. Takes a minute, no card. Until then the AI buttons stay disabled.</p>
          <div className="flex flex-wrap gap-2"><Button onClick={() => go('setup')}>Start guided setup <ArrowRight size={16} /></Button><a className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm hover:bg-muted" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Get a free key</a></div>
        </Card>
      )}

      {next && (
        <Card className="mb-6">
          <div className="label mb-2 text-muted-foreground">Get set up</div>
          <ol className="mb-4 grid gap-2 sm:grid-cols-2">
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

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Saved', f.saved], ['Applied', f.applied], ['Interviewing', f.interviewing], ['Offers', f.offers]].map(([l, n]) => (
          <Card key={l as string} className="p-5"><div className="display text-6xl leading-none">{n}</div><div className="label mt-2 text-muted-foreground">{l}</div></Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-3xl">This week</h2>
            {sp.streak > 0 && <span className="inline-flex items-center gap-1 text-sm text-primary"><Flame size={16} /> {sp.streak}-day streak</span>}
          </div>
          {target > 0 && (
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-sm text-muted-foreground"><span>Today</span><span>{sp.today} / {target}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
            </div>
          )}
          <div className="h-36" role="img" aria-label="Applications per day this week">
            <ResponsiveContainer><BarChart data={sp.week}><XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: 8 }} /><Bar dataKey="count" name="Applications" fill="var(--primary)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </Card>
        <Card><FocusTimer /></Card>

        <Card>
          <h2 className="mb-2 text-3xl">Time to interview</h2>
          {pr.ok ? (
            <div className="grid gap-1 text-sm">
              <p><span className="display text-5xl text-gold">{pr.rate}%</span> of your applications reach an interview.</p>
              <p className="text-muted-foreground">About {pr.appsPerInterview} applications per interview{pr.daysToNext ? `; at ${pr.perDay} a day, roughly ${pr.daysToNext} days to the next one.` : '.'}</p>
            </div>
          ) : <p className="text-sm text-muted-foreground">{pr.reason}</p>}
        </Card>
        <Card>
          <h2 className="mb-2 text-3xl">Follow up</h2>
          {due.length === 0 ? <p className="text-sm text-muted-foreground">Nothing due. A follow-up is due 5 working days after applying, a second after 10, then stop.</p> : (
            <ul className="grid gap-2 text-sm">{due.slice(0, 4).map((j) => <li key={j.id}><button className="text-left hover:underline cursor-pointer" onClick={() => go('outreach', j.id)}><b>{j.company}</b> <span className="text-muted-foreground">applied {j.appliedAt}</span></button></li>)}</ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-2 text-3xl">Upcoming</h2>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No interviews scheduled.</p> : (
            <ul className="grid gap-2 text-sm">{upcoming.map((i) => <li key={i.id}><b>{i.round}</b> · {i.job.company}<div className="text-muted-foreground">{new Date(i.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div></li>)}</ul>
          )}
        </Card>
      </div>
      <Card className="mt-5">
        <h2 className="mb-1 text-3xl">Milestones</h2>
        <p className="mb-3 text-sm text-muted-foreground">Counted from your own jobs in this browser.</p>
        <ul className="grid gap-2 sm:grid-cols-3">{ms.map((m) => <li key={m.id} className={`rounded-lg border px-3 py-2 text-sm ${m.done ? 'border-primary bg-accent text-primary' : 'border-border text-muted-foreground'}`}><b>{m.done ? '✓ ' : ''}{m.label}</b> <span className="float-right">{m.progress}</span></li>)}</ul>
      </Card>
    </>
  );
}
