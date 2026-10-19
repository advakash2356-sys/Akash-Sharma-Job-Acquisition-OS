import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Loader2, RotateCw } from 'lucide-react';
import { Button, Card, PageHeader } from '../components/ui';
import ResumeDrop from '../components/ResumeDrop';
import ApiKeyCard from '../components/ApiKeyCard';
import { useApp } from '../lib/state';
import { useAiReady } from '../lib/aiReady';
import { callAi } from '../lib/api';
import { boardLinks } from '../lib/boards';
import { COUNTRY_NAMES, dedupeAgainst, deriveCountries, keywordFit, searchJobsApi, splitTitles, type FoundJob } from '../lib/jobSearch';
import type { Job, Profile } from '../types';

type St = 'idle' | 'running' | 'done' | 'error';
const STAGES = [
  { id: 'parse', label: 'Reading your resume and filling your profile' },
  { id: 'research', label: 'Searching real postings on FreeHire' },
  { id: 'fill', label: 'Scoring fit and adding postings to Jobs' },
] as const;

const fill = (cur: string | undefined, next: string) => (cur && cur.trim() ? cur : next || '');

export default function Setup() {
  const { profile, setProfile, jobs: allJobs, setJobs, hasResume, go } = useApp();
  const jobsNow = useRef(allJobs); jobsNow.current = allJobs;
  const { ready } = useAiReady();
  const [st, setSt] = useState<Record<string, St>>({ parse: 'idle', research: 'idle', fill: 'idle' });
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [scope, setScope] = useState<{ countries: string[]; titles: string[] } | null>(null);
  const running = useRef(false);
  const auto = useRef(false);
  const set = (id: string, v: St) => setSt((s) => ({ ...s, [id]: v }));

  const run = async () => {
    if (running.current) return;
    running.current = true; setErr(''); setNote(''); setSummary(''); setLinks([]);
    setSt({ parse: 'running', research: 'idle', fill: 'idle' });
    let stage = 'parse'; let fbTitles: string[] = []; let fbLoc = '';
    try {
      const p: any = await callAi('parse-resume', { resume: profile.resumeText });
      const titles: string[] = (p.targetTitles || []).filter(Boolean);
      const next: Profile = { ...profile };
      next.name = fill(profile.name, p.name); next.headline = fill(profile.headline, p.headline);
      next.email = fill(profile.email, p.email); next.phone = fill(profile.phone, p.phone);
      next.location = fill(profile.location, p.location); next.links = fill(profile.links, p.links);
      next.targetRoles = fill(profile.targetRoles, titles.join(', ')); next.minCtc = fill(profile.minCtc, p.minPay);
      next.skills = fill(profile.skills, (p.skills || []).join(', '));
      next.experience = fill(profile.experience, (p.experience || []).map((e: any) => `${e.role}${e.company ? ` at ${e.company}` : ''}${e.period ? ` (${e.period})` : ''}`).join('\n'));
      setProfile((cur) => ({ ...cur, ...Object.fromEntries(Object.entries(next).filter(([k]) => k !== 'resumeText' && k !== 'dailyTarget' && k !== 'aiInstructions')) }));
      set('parse', 'done'); stage = 'research'; set('research', 'running');

      const qTitles = splitTitles(next.targetRoles);
      const countries = deriveCountries(next.location);
      fbTitles = qTitles; fbLoc = next.location;
      setScope({ countries, titles: qTitles });
      const r = await searchJobsApi(qTitles, countries, true);
      const msgs: string[] = [];
      if (r.warnings.length) msgs.push(`Some searches failed: ${r.warnings.join('; ')}.`);
      if (!r.jobs.length) {
        set('research', 'done'); set('fill', 'done');
        setLinks(qTitles.flatMap((t) => boardLinks(t, next.location).map((l) => ({ ...l, label: `${t}: ${l.label}` }))));
        setNote(`FreeHire found no open postings for ${qTitles.map((t) => `"${t}"`).join(', ')}${countries.length ? ` in ${countries.map((c) => COUNTRY_NAMES[c] || c).join('/')}` : ''} or remote. Edit your target roles on My resume, or use the job-board links below.`);
        setProfile((cur) => ({ ...cur, setupDone: new Date().toISOString() }));
        setSummary('No postings added.');
        return;
      }
      set('research', 'done'); stage = 'fill'; set('fill', 'running');

      const fresh = dedupeAgainst(r.jobs, jobsNow.current);
      const fits = new Map<string, { score: number; kind: 'ai' | 'keyword'; summary: string }>();
      let aiFailed = '';
      for (let i = 0; i < fresh.length && !aiFailed; i += 10) {
        try {
          const out: any = await callAi('fit-jobs', { resume: profile.resumeText, jobs: fresh.slice(i, i + 10).map((j) => ({ id: j.id, title: j.title, company: j.company, description: j.description })) });
          (out.fits || []).forEach((f: any) => fits.set(f.id, { score: f.score, kind: 'ai', summary: f.summary }));
        } catch (e: any) { aiFailed = e.message || 'Gemini failed'; }
      }
      if (aiFailed) msgs.push(`Gemini fit scoring was not available (${aiFailed.slice(0, 200)}). Jobs without an AI score show a plain keyword-match score instead.`);
      const now = new Date().toISOString().slice(0, 10);
      const jobs: Job[] = fresh.map((j: FoundJob, i: number) => {
        const fit = fits.get(j.id) || { ...keywordFit(profile.resumeText, j), kind: 'keyword' as const };
        return {
          id: `fh-${Date.now()}-${i}`, title: j.title, company: j.company, url: j.url,
          description: j.description || `${j.title} at ${j.company}. ${j.location}`,
          status: 'Saved' as const, createdAt: now, notes: '', interviews: [], source: 'Other',
          found: { provider: 'freehire' as const, id: j.id, source: j.source, postedAt: j.postedAt, location: j.location, fit },
        };
      }).sort((a, b) => (b.found!.fit!.score - a.found!.fit!.score));
      setJobs((js) => [...jobs, ...js]);
      setProfile((cur) => ({ ...cur, setupDone: new Date().toISOString() }));
      set('fill', 'done');
      setNote(msgs.join(' '));
      setSummary(`${jobs.length} real postings added to Jobs (of ${r.total} FreeHire matches${r.cached ? ', cached' : ''}), best fit first.`);
    } catch (e: any) {
      set(stage, 'error'); setErr(e.message || 'Something went wrong.');
      if (stage === 'research') { const t = fbTitles; if (t.length) setLinks(t.flatMap((x) => boardLinks(x, fbLoc).map((l) => ({ ...l, label: `${x}: ${l.label}` })))); }
    } finally { running.current = false; }
  };

  // Everything automated: once the resume and key are in, start by itself (once).
  useEffect(() => {
    if (hasResume && ready && !profile.setupDone && !auto.current && !running.current) { auto.current = true; run(); }
  }, [hasResume, ready, profile.setupDone]);

  const step1 = hasResume, step2 = ready;
  const Dot = ({ done, n }: { done: boolean; n: number }) => (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${done ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>{done ? <CheckCircle2 size={16} /> : n}</span>
  );

  return (
    <>
      <PageHeader title="Guided setup" subtitle="Two steps from you. Then your profile and real job postings that fit you are found and scored for you." />
      <ol className="grid gap-5">
        <li><Card className={step1 ? 'opacity-90' : 'ring-1 ring-primary/30'}>
          <div className="mb-3 flex items-center gap-3"><Dot done={step1} n={1} /><h2 className="text-2xl">Upload your resume</h2></div>
          <ResumeDrop hasText={hasResume} onText={(t) => setProfile((p) => ({ ...p, resumeText: t, setupDone: undefined }))} />
          <p className="mt-2 text-xs text-muted-foreground">Read in your browser. It leaves your device only when an AI step runs, and then only to Google's Gemini API.</p>
        </Card></li>
        <li><div className={step1 ? '' : 'pointer-events-none opacity-50'}>
          <div className="mb-2 flex items-center gap-3"><Dot done={step2} n={2} /><h2 className="text-2xl">Add your free Gemini key</h2></div>
          <ApiKeyCard prominent={step1 && !step2} />
        </div></li>
        <li><Card>
          <div className="mb-3 flex items-center gap-3"><Dot done={st.fill === 'done'} n={3} /><h2 className="text-2xl">Automatic</h2></div>
          {!(step1 && step2) && <p className="text-sm text-muted-foreground">Starts by itself when steps 1 and 2 are done.</p>}
          <ul className="grid gap-2 text-sm" aria-live="polite">
            {STAGES.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                {st[s.id] === 'running' ? <Loader2 size={16} className="animate-spin text-primary" /> : st[s.id] === 'done' ? <CheckCircle2 size={16} className="text-primary" /> : st[s.id] === 'error' ? <AlertTriangle size={16} className="text-danger" /> : <Circle size={16} className="text-muted-foreground" />}
                <span className={st[s.id] === 'idle' ? 'text-muted-foreground' : ''}>{s.label}</span>
              </li>
            ))}
          </ul>
          {err && <p role="alert" className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-danger">{err}</p>}
          {note && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">{note}</p>}
          {links.length > 0 && <div className="mt-3 text-sm"><p className="mb-1 text-muted-foreground">Real job-board searches (not postings), open them yourself:</p><div className="flex flex-wrap gap-2">{links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1 underline">{l.label}</a>)}</div></div>}
          {scope && <p className="mt-2 text-xs text-muted-foreground">Searched FreeHire for {scope.titles.join(', ')} in {scope.countries.length ? scope.countries.map((c) => COUNTRY_NAMES[c] || c).join('/') : 'no specific country'} and remote (global/APAC). Only these keywords and places are sent to FreeHire, never your resume.</p>}
          {summary && <p role="status" className="mt-3 text-sm font-medium">{summary} Everything above is editable on My resume.</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {step1 && step2 && st.parse !== 'running' && st.research !== 'running' && st.fill !== 'running' && (
              <Button variant={err ? 'primary' : 'outline'} onClick={run}><RotateCw size={15} /> {err ? 'Try again' : profile.setupDone ? 'Run again' : 'Start now'}</Button>
            )}
            {st.fill === 'done' && <Button onClick={() => go('jobs')}>See my jobs</Button>}
            {st.parse === 'done' && <Button variant="outline" onClick={() => go('resume')}>Review my profile</Button>}
          </div>
        </Card></li>
      </ol>
    </>
  );
}
