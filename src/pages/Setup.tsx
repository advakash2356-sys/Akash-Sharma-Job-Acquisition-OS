import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Loader2, RotateCw } from 'lucide-react';
import { Button, Card, PageHeader } from '../components/ui';
import ResumeDrop from '../components/ResumeDrop';
import ApiKeyCard from '../components/ApiKeyCard';
import { useApp } from '../lib/state';
import { useAiReady } from '../lib/aiReady';
import { callAi } from '../lib/api';
import { boardLinks } from '../lib/boards';
import type { Job, Profile } from '../types';

type St = 'idle' | 'running' | 'done' | 'error';
const STAGES = [
  { id: 'parse', label: 'Reading your resume and filling your profile' },
  { id: 'research', label: 'Researching roles that fit you' },
  { id: 'fill', label: 'Adding suggestions to your Jobs list' },
] as const;

const fill = (cur: string | undefined, next: string) => (cur && cur.trim() ? cur : next || '');

export default function Setup() {
  const { profile, setProfile, setJobs, hasResume, go } = useApp();
  const { ready } = useAiReady();
  const [st, setSt] = useState<Record<string, St>>({ parse: 'idle', research: 'idle', fill: 'idle' });
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const running = useRef(false);
  const auto = useRef(false);
  const set = (id: string, v: St) => setSt((s) => ({ ...s, [id]: v }));

  const run = async () => {
    if (running.current) return;
    running.current = true; setErr(''); setNote(''); setSummary('');
    setSt({ parse: 'running', research: 'idle', fill: 'idle' });
    let stage = 'parse';
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

      const r: any = await callAi('suggest-jobs', { resume: profile.resumeText, targetRoles: next.targetRoles, location: next.location, minCtc: next.minCtc });
      setNote(r.note || ''); set('research', 'done'); stage = 'fill'; set('fill', 'running');

      const now = new Date().toISOString().slice(0, 10);
      const jobs: Job[] = (r.suggestions || []).map((s: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        title: s.title,
        company: s.company || 'Company to be found',
        url: '',
        description: `${s.why}${s.location ? `\n\nLocation: ${s.location}` : ''}\n\nAI-suggested, verify before applying. This is not a verified posting. Paste the real job description here to score it.`,
        status: 'Saved', createdAt: now, notes: '', interviews: [],
        aiSuggested: true,
        sourceUrl: r.grounded && s.url ? s.url : undefined,
        boardLinks: boardLinks(s.title, s.location || next.location),
      }));
      setJobs((js) => [...jobs, ...js]);
      setProfile((cur) => ({ ...cur, setupDone: new Date().toISOString() }));
      set('fill', 'done');
      setSummary(`${jobs.length} AI-suggested ${r.grounded ? 'roles' : 'role titles'} added to Jobs.`);
    } catch (e: any) {
      set(stage, 'error'); setErr(e.message || 'Something went wrong.');
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
      <PageHeader title="Guided setup" subtitle="Two steps from you. Then your profile and a first list of roles to look at fill themselves in." />
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
