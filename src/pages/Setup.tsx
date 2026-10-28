import { today } from '../lib/utils';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Loader2, RotateCw, SkipForward, XCircle } from 'lucide-react';
import { Button, Card, Input, Label, PageHeader } from '../components/ui';
import ResumeDrop from '../components/ResumeDrop';
import ApiKeyCard from '../components/ApiKeyCard';
import { useApp } from '../lib/state';
import { useAiReady } from '../lib/aiReady';
import { callAi } from '../lib/api';
import { boardLinks, GOVT_PORTALS } from '../lib/boards';
import ManualProfile from '../components/ManualProfile';
import { eligSummary } from '../components/EligibilityCard';
import { COUNTRY_NAMES, dedupeAgainst, deriveCountries, guessLocation, guessTitles, candidateOf, keywordFit, locationAdjust, manualQuery, placeQuery, searchJobsApi, splitTitles, type FoundJob, type SearchQuery } from '../lib/jobSearch';
import type { Job } from '../types';

type St = 'idle' | 'running' | 'done' | 'error' | 'skipped';
// Hard limits per step (ms). The server has its own, shorter, limits too. No step can spin longer than this.
const LIMIT = { parse: 50000, research: 30000, fit: 45000 };
const FIT_TOTAL_MS = 70000;
const STAGES = [
  { id: 'parse', label: 'Reading your resume and filling your profile', max: LIMIT.parse },
  { id: 'research', label: 'Searching real postings on FreeHire', max: LIMIT.research },
  { id: 'fill', label: 'Scoring fit and adding postings to Jobs', max: FIT_TOTAL_MS },
] as const;

const fill = (cur: string | undefined, next: string) => (cur && cur.trim() ? cur : next || '');
const initial = { parse: 'idle', research: 'idle', fill: 'idle' } as Record<string, St>;

export default function Setup() {
  const { profile, setProfile, jobs: allJobs, setJobs, hasResume, go } = useApp();
  const jobsNow = useRef(allJobs); jobsNow.current = allJobs;
  const { ready } = useAiReady();
  const [st, setSt] = useState<Record<string, St>>(initial);
  const [err, setErr] = useState('');
  const [errStage, setErrStage] = useState('');
  const [note, setNote] = useState('');
  const [added, setAdded] = useState(-1);
  const [summary, setSummary] = useState('');
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [titlesIn, setTitlesIn] = useState('');
  const [locIn, setLocIn] = useState('');
  const [tick, setTick] = useState(0);
  const [form, setForm] = useState(false);
  const started = useRef<Record<string, number>>({});
  const ctl = useRef<AbortController | null>(null);
  const running = useRef(false);
  const auto = useRef(false);
  const edited = useRef(false);
  const set = (id: string, v: St) => { if (v === 'running') started.current[id] = Date.now(); setSt((s) => ({ ...s, [id]: v })); };
  const busy = Object.values(st).includes('running');

  useEffect(() => { if (!busy) return; const t = setInterval(() => setTick((n) => n + 1), 1000); return () => clearInterval(t); }, [busy]);
  // Suggest search settings from the profile, or from plain resume text when AI has not run. User edits win.
  useEffect(() => {
    if (edited.current) return;
    setTitlesIn(profile.targetRoles || guessTitles(profile.resumeText).join(', '));
    setLocIn(profile.location || guessLocation(profile.resumeText));
  }, [profile.targetRoles, profile.location, profile.resumeText]);

  const showLinks = (titles: string[], loc: string) => setLinks(titles.flatMap((t) => boardLinks(t, loc).map((l) => ({ ...l, label: `${t}: ${l.label}` }))));

  /** FreeHire search + (optional) Gemini scoring + add to Jobs. Does not need Gemini to work. */
  async function searchAndAdd(q: SearchQuery, location: string, useAi: boolean, signal: AbortSignal) {
    const { titles, countries } = q;
    set('research', 'running');
    const r = await searchJobsApi(q, { signal, timeoutMs: LIMIT.research });
    const msgs: string[] = [];
    if (r.warnings.length) msgs.push(`Some searches failed: ${r.warnings.join('; ')}.`);
    if (r.hidden?.total) msgs.push(`Hidden ${r.hidden.total} posting${r.hidden.total > 1 ? 's' : ''} you are not eligible for: ${r.hidden.reasons.slice(0, 4).map((h) => `${h.count} × ${h.badge.replace(/: hidden$/, '')}`).join('; ')}.`);
    if (r.sources?.length) msgs.push(`Sources: ${r.sources.join(', ')}.`);
    const where = `${q.cities?.length ? q.cities.join('/') : countries.length ? countries.map((c) => COUNTRY_NAMES[c] || c).join('/') : 'no specific country'}${q.remote ? ' and remote (global/APAC)' : ''}`;
    msgs.push(`Searched FreeHire${q.remote ? ', Himalayas and Remote OK (remote roles)' : ''}${q.govt ? ' and a public government-jobs feed (SarkariMap)' : ''} for ${titles.join(', ')} in ${where}${q.remote ? ' plus remote roles you are eligible for' : ''}. Job sources receive only titles and places (and your country, for remote eligibility), never your resume text, name, age or phone.`);
    if (q.govt) setLinks(GOVT_PORTALS);
    if (!r.jobs.length) {
      set('research', 'done'); set('fill', 'done'); if (!q.govt) showLinks(titles, location);
      setNote(`FreeHire found no open postings for ${titles.map((t) => `"${t}"`).join(', ')}. Change the titles below and search again, or use the job-board links.`);
      setProfile((cur) => ({ ...cur, setupDone: new Date().toISOString() }));
      setSummary('No postings added.'); setAdded(0);
      return;
    }
    set('research', 'done'); set('fill', 'running');
    const fresh = dedupeAgainst(r.jobs, jobsNow.current);
    if (!fresh.length) {
      set('fill', 'done');
      setProfile((cur) => ({ ...cur, setupDone: new Date().toISOString() }));
      setNote(msgs.join(' '));
      setSummary(`All ${r.jobs.length} matching postings are already in your Jobs list, so nothing new was added.`);
      return;
    }
    const fits = new Map<string, { score: number; kind: 'ai' | 'keyword'; summary: string }>();
    let aiNote = useAi ? '' : 'Scored by keyword match only (AI skipped).';
    const t0 = Date.now();
    for (let i = 0; useAi && i < fresh.length && !aiNote; i += 10) {
      if (Date.now() - t0 > FIT_TOTAL_MS - LIMIT.fit) { aiNote = 'Gemini scoring was stopped to avoid a long wait; the rest use keyword match.'; break; }
      try {
        const out: any = await callAi('fit-jobs', { resume: profile.resumeText, jobs: fresh.slice(i, i + 10).map((j) => ({ id: j.id, title: j.title, company: j.company, description: j.description })) }, { signal, timeoutMs: LIMIT.fit });
        (out.fits || []).forEach((f: any) => fits.set(f.id, { score: f.score, kind: 'ai', summary: f.summary }));
      } catch (e: any) {
        if (e.code === 'CANCELLED') throw e;
        aiNote = `Gemini scoring was not available (${String(e.message).slice(0, 220)}). Those jobs show a plain keyword-match score instead.`;
      }
    }
    if (aiNote) msgs.push(aiNote);
    const now = today();
    const jobs: Job[] = fresh.map((j: FoundJob, i: number) => {
      const base = fits.get(j.id) || { ...keywordFit(profile.resumeText, j), kind: 'keyword' as const };
      const la = locationAdjust(j.location, q, j.decision);
      const fit = { ...base, score: Math.max(0, Math.min(100, base.score + la.delta)), summary: `${base.summary} Location: ${j.location || 'not stated'} (${la.label}${la.delta ? `, ${la.delta}` : ''}).` };
      return {
        id: `fh-${Date.now()}-${i}`, title: j.title, company: j.company, url: j.url,
        description: j.description || `${j.title} at ${j.company}. ${j.location}`,
        status: 'Saved' as const, createdAt: now, notes: '', interviews: [], source: 'Other',
        found: { provider: 'freehire' as const, id: j.id, source: j.source, postedAt: j.postedAt, location: j.location, fit, mode: j.mode, decision: j.decision, evidence: j.eligibility?.evidence, ...(j.official || j.govtFeed ? { govt: { lastDate: (j.official?.lastDate || j.govtFeed?.lastDate) as string, official: !!j.official, via: j.official ? 'official notification' : 'SarkariMap (aggregator)' } } : {}) },
      };
    }).sort((a, b) => b.found!.fit!.score - a.found!.fit!.score);
    setJobs((js) => [...jobs, ...js]);
    setProfile((cur) => ({ ...cur, setupDone: new Date().toISOString() }));
    set('fill', 'done');
    setNote(msgs.join(' '));
    setAdded(jobs.length);
    setSummary(`${jobs.length} real postings added to Jobs (of ${r.total} FreeHire matches${r.cached ? ', cached' : ''}), best fit first.`);
  }

  async function run(mode0: 'ai' | 'skip' | 'manual') {
    if (running.current) return;
    const mode = profile.manual ? 'manual' : mode0;
    running.current = true; setAdded(-1); setErr(''); setErrStage(''); setNote(''); setSummary(''); setLinks([]);
    const c = new AbortController(); ctl.current = c;
    setSt(mode !== 'ai' ? { parse: 'skipped', research: 'idle', fill: 'idle' } : { ...initial, parse: 'idle' });
    let stage = 'parse'; let titles = splitTitles(titlesIn); let loc = locIn;
    try {
      if (mode === 'manual') {
        stage = 'research';
        await searchAndAdd(manualQuery(profile), profile.location, ready, c.signal);
        return;
      }
      if (mode === 'ai') {
        set('parse', 'running');
        let p: any;
        try { p = await callAi('parse-resume', { resume: profile.resumeText }, { signal: c.signal, timeoutMs: LIMIT.parse }); }
        catch (e: any) {
          const g = titles.length ? titles : guessTitles(profile.resumeText);
          if (e.code === 'CANCELLED' || !g.length) throw e;
          // Gemini busy or failing: keep going with titles read from the resume itself, keyword scoring only.
          set('parse', 'skipped'); stage = 'research';
          titles = g; if (!loc) loc = guessLocation(profile.resumeText);
          setProfile((cur) => ({ ...cur, targetRoles: fill(cur.targetRoles, titles.join(', ')), location: fill(cur.location, loc) }));
          await searchAndAdd(placeQuery(titles, loc, profile), loc, false, c.signal);
          setNote((n) => `Gemini could not read the resume (${String(e.message).slice(0, 160)}), so titles were taken from the resume text. ${n}`);
          return;
        }
        const aiTitles: string[] = (p.targetTitles || []).filter(Boolean);
        setProfile((cur) => ({
          ...cur,
          name: fill(cur.name, p.name), headline: fill(cur.headline, p.headline), email: fill(cur.email, p.email), phone: fill(cur.phone, p.phone),
          location: fill(cur.location, p.location), links: fill(cur.links, p.links), targetRoles: fill(cur.targetRoles, aiTitles.join(', ')), minCtc: fill(cur.minCtc, p.minPay),
          skills: fill(cur.skills, (p.skills || []).join(', ')),
          experience: fill(cur.experience, (p.experience || []).map((e: any) => `${e.role}${e.company ? ` at ${e.company}` : ''}${e.period ? ` (${e.period})` : ''}`).join('\n')),
        }));
        titles = splitTitles(edited.current ? titlesIn : profile.targetRoles || aiTitles.join(', '));
        loc = edited.current ? locIn : profile.location || p.location || '';
        set('parse', 'done');
      } else {
        if (!titles.length) titles = guessTitles(profile.resumeText);
        if (!loc) loc = guessLocation(profile.resumeText);
        if (!titles.length) throw Object.assign(new Error('No job titles to search for. Type one or more titles in "Job titles to search" below.'), { code: 'NO_TITLES' });
        setProfile((cur) => ({ ...cur, targetRoles: fill(cur.targetRoles, titles.join(', ')), location: fill(cur.location, loc) }));
      }
      stage = 'research';
      await searchAndAdd(placeQuery(titles, loc, profile), loc, mode === 'ai', c.signal);
    } catch (e: any) {
      const cancelled = e.code === 'CANCELLED';
      setSt((x) => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, v === 'running' ? (cancelled ? 'idle' : 'error') : v])) as Record<string, St>);
      setErrStage(stage);
      setErr(cancelled ? 'Cancelled. Nothing was changed.' : e.message || 'Something went wrong.');
      if (!cancelled && (titles.length || stage === 'parse')) showLinks(titles.length ? titles : guessTitles(profile.resumeText), loc || profile.location);
    } finally { running.current = false; ctl.current = null; }
  }

  // Everything automated: once the resume and key are in, start by itself (once).
  useEffect(() => {
    if (hasResume && !profile.setupDone && !auto.current && !running.current && (profile.manual || ready)) { auto.current = true; run(profile.manual ? 'manual' : 'ai'); }
  }, [hasResume, ready, profile.setupDone, profile.manual]);

  const step1 = hasResume, step2 = ready;
  const Dot = ({ done, n }: { done: boolean; n: number }) => (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${done ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>{done ? <CheckCircle2 size={16} /> : n}</span>
  );
  const elapsed = (id: string) => Math.round((Date.now() - (started.current[id] || Date.now())) / 1000);
  void tick;

  return (
    <>
      <PageHeader title="Guided setup" subtitle="Step 1 of the flow: upload your resume. Then matching real job postings are found and scored for you to review. Nothing is applied for or sent." />
      <ol className="grid gap-5">
        <li><Card className={step1 ? 'opacity-90' : 'ring-1 ring-primary/30'}>
          <div className="mb-3 flex flex-wrap items-center gap-3"><Dot done={step1} n={1} /><h2 className="text-2xl">{form ? 'Short form / छोटा फॉर्म' : 'Upload your resume'}</h2>
            <button className="ml-auto cursor-pointer text-sm underline" onClick={() => setForm(!form)}>{form ? 'I have a resume' : 'No resume? Short form / रिज़्यूमे नहीं है?'}</button></div>
          {form
            ? <ManualProfile initial={profile.manual ? profile : { location: profile.location }} onSave={(m) => { edited.current = false; auto.current = false; setForm(false); setProfile((p) => ({ ...p, ...m })); }} />
            : <ResumeDrop hasText={hasResume} onText={(t) => { edited.current = false; auto.current = false; setProfile((p) => ({ ...p, resumeText: t, setupDone: undefined, manual: false })); }} />}
          {!form && hasResume && <label className="mt-3 block text-sm" data-testid="parsed-resume"><span className="font-medium">This is what we read from your file. Fix anything that looks wrong:</span>
            <textarea className="mt-2 h-48 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs" value={profile.resumeText} onChange={(e) => { const t = e.target.value; setProfile((p) => ({ ...p, resumeText: t })); }} /></label>}
          <p className="mt-2 text-xs text-muted-foreground">Read in your browser. It leaves your device only when an AI step runs, and then only to Google's Gemini API.</p>
        </Card></li>
        <li><div className={step1 ? '' : 'pointer-events-none opacity-50'} inert={!step1} aria-disabled={!step1 || undefined}>
          <div className="mb-2 flex items-center gap-3"><Dot done={step2} n={2} /><h2 className="text-2xl">AI: no key needed</h2></div>
          <ApiKeyCard prominent={step1 && !step2} />
        </div></li>
        <li><Card>
          <div className="mb-3 flex items-center gap-3"><Dot done={st.fill === 'done'} n={3} /><h2 className="text-2xl">Find and score matching jobs</h2></div>
          {!(step1 && step2) && <p className="text-sm text-muted-foreground">{profile.manual ? 'Short form saved. Search runs by itself; a Gemini key (step 2) only adds fit scores.' : 'Starts by itself when steps 1 and 2 are done.'} No key? You can still <button className="underline cursor-pointer" disabled={!step1 || busy} onClick={() => run('skip')}>search jobs without AI</button>.</p>}
          <ul className="grid gap-2 text-sm" aria-live="polite">
            {STAGES.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                {st[s.id] === 'running' ? <Loader2 size={16} className="animate-spin text-primary" /> : st[s.id] === 'done' ? <CheckCircle2 size={16} className="text-primary" /> : st[s.id] === 'error' ? <AlertTriangle size={16} className="text-danger" /> : st[s.id] === 'skipped' ? <SkipForward size={16} className="text-muted-foreground" /> : <Circle size={16} className="text-muted-foreground" />}
                <span className={st[s.id] === 'idle' || st[s.id] === 'skipped' ? 'text-muted-foreground' : ''}>{s.label}{st[s.id] === 'skipped' ? ' (skipped)' : ''}</span>
                {st[s.id] === 'running' && <span className="text-xs text-muted-foreground">{elapsed(s.id)}s of at most {Math.round(s.max / 1000)}s</span>}
              </li>
            ))}
          </ul>
          {err && <p role="alert" className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-danger">{err}{errStage === 'parse' && ' You can continue without AI: FreeHire job search does not need Gemini.'}</p>}
          {note && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">{note}</p>}
          {links.length > 0 && <div className="mt-3 text-sm"><p className="mb-1 text-muted-foreground">Real job-board searches (not postings), open them yourself:</p><div className="flex flex-wrap gap-2">{links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1 underline">{l.label}</a>)}</div></div>}
          {added === 0 && <p className="mt-3 rounded-lg border border-border px-3 py-2 text-sm" data-testid="zero-jobs">No matching postings right now. Try a broader or English title (for example "Delivery Driver" instead of a full sentence), check the location, tick "Also include remote jobs" below, or open the job-board links above. Then press Run again.</p>}
          {summary && <p role="status" className="mt-3 text-sm font-medium">{summary} Everything above is editable on My resume.</p>}

          {step1 && !profile.manual && (
            <div className="mt-4 grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
              <div><Label htmlFor="st">Job titles to search</Label><Input id="st" value={titlesIn} onChange={(e) => { edited.current = true; setTitlesIn(e.target.value); }} placeholder="e.g. Contract Manager, Legal Operations" /></div>
              <div><Label htmlFor="sl">Location</Label><Input id="sl" value={locIn} onChange={(e) => { edited.current = true; setLocIn(e.target.value); }} placeholder="e.g. Bengaluru, India" /></div>
              <p className="text-sm sm:col-span-2" data-testid="elig-summary">{eligSummary(candidateOf(profile, locIn || profile.location))} <button className="cursor-pointer underline" onClick={() => go('resume')}>Change where you can work</button></p>
              <p className="text-xs text-muted-foreground sm:col-span-2">Only these titles, the country and a remote flag go to job sources (FreeHire, Himalayas, Remote OK). Not your resume text. Suggested from your resume text, edit freely.</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {busy && <Button variant="outline" onClick={() => ctl.current?.abort()}><XCircle size={15} /> Cancel</Button>}
            {step1 && (step2 || profile.manual) && !busy && <Button variant={err ? 'primary' : 'outline'} onClick={() => run('ai')}><RotateCw size={15} /> {err ? 'Try again' : profile.setupDone ? 'Run again' : 'Start now'}</Button>}
            {step1 && !busy && !profile.manual && <Button variant={err && errStage === 'parse' ? 'primary' : 'outline'} onClick={() => run('skip')}><SkipForward size={15} /> Skip AI, search jobs now</Button>}
            {allJobs.length > 0 && added !== 0 && (st.fill === 'done' || profile.setupDone) && <Button onClick={() => go('jobs')}>Next: review matched jobs</Button>}
            {st.parse === 'done' && <Button variant="outline" onClick={() => go('resume')}>Review my profile</Button>}
          </div>
        </Card></li>
      </ol>
    </>
  );
}
