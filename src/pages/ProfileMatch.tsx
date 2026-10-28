import RealityCheck from '../components/RealityCheck';
import React, { useState } from 'react';
import { Fingerprint, Upload } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Label, PageHeader, Textarea } from '../components/ui';
import { useApp } from '../lib/state';
import { callAi } from '../lib/api';
import type { MatchScore } from '../lib/matchScore';
import { compare, parsePastedProfile, parsePositionsCsv, parseSkills, type MatchReport, type Role } from '../lib/profileMatch';

export default function ProfileMatch() {
  const { profile, hasResume, go } = useApp();
  const [text, setText] = useState(''); const [skills, setSkills] = useState(''); const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<Role[] | null>(null); const [r, setR] = useState<MatchReport | null>(null); const [err, setErr] = useState('');
  const [job, setJob] = useState(''); const [ms, setMs] = useState<MatchScore | null>(null); const [busy, setBusy] = useState(false); const [msErr, setMsErr] = useState('');
  const score = async () => {
    setBusy(true); setMsErr(''); setMs(null);
    try { setMs(await callAi<MatchScore>('match-score', { resume: profile.resumeText, job, linkedin: text })); }
    catch (e: any) { setMsErr(e?.message || 'Scoring failed.'); } finally { setBusy(false); }
  };
  const load = async (e: React.ChangeEvent<HTMLInputElement>) => {
    for (const f of Array.from(e.target.files || [])) {
      const t = await f.text(); const n = f.name.toLowerCase();
      if (n.includes('skills')) setSkills(t); else if (n.includes('email')) setEmail(t); else setText(t);
    }
    e.target.value = '';
  };
  const run = () => {
    setErr('');
    const rs = parsePositionsCsv(text) ?? parsePastedProfile(text);
    if (!rs.length) { setRoles(null); setR(null); setErr('No jobs with dates found. Paste the Experience section (with its dates) or upload Positions.csv from your LinkedIn data export.'); return; }
    setRoles(rs); setR(compare(rs, profile.resumeText, { skills: parseSkills(skills), linkedinEmail: email }));
  };
  if (!hasResume) return (<><PageHeader title="Profile match" /><EmptyState icon={<Fingerprint size={32} />} title="Add your resume first" body="Profile match compares your LinkedIn profile with your resume, so it needs your resume." action={<Button onClick={() => go('resume')}>Go to My resume</Button>} /></>);
  return (
    <>
      <PageHeader title="Profile match" subtitle="Recruiters often open your LinkedIn next to your resume. This finds jobs, dates, email and skills that differ, so you can fix them before they ask." />
      <Card className="mb-5">
        <h2 className="mb-2 text-xl">How to use it</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li><b>Quick way:</b> open your own LinkedIn profile, go to Experience → "Show all", select the page (Ctrl+A), copy and paste it below.</li>
          <li><b>Most accurate:</b> on LinkedIn go to Settings → Data privacy → Get a copy of your data, pick "Positions", "Skills" and "Email addresses", and upload the CSV files you get by email.</li>
          <li>Press <b>Compare</b>. Fix whichever side is wrong; there is no need to list every job in both places, but dates and titles should agree.</li>
        </ol>
        <p className="mt-3 text-sm text-muted-foreground">This runs only in your browser on text you give it. It does not log in to LinkedIn, read any profile for you, use AI or save what you paste. Only the optional match score below uses AI.</p>
      </Card>
      <Card className="grid gap-4">
        <div><Label htmlFor="pm-text">LinkedIn Experience text or Positions.csv</Label><Textarea id="pm-text" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your Experience section here" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="pm-sk" hint="optional">Skills (Skills.csv or "Skills: a, b, c")</Label><Textarea id="pm-sk" rows={3} value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
          <div><Label htmlFor="pm-em" hint="optional">Email on LinkedIn</Label><Textarea id="pm-em" rows={3} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-sm hover:bg-muted"><Upload size={15} /> Upload CSV files<input type="file" accept=".csv,.txt" multiple className="sr-only" onChange={load} data-testid="pm-file" /></label>
          <Button onClick={run} disabled={!text.trim()}>Compare</Button>
        </div>
        {err && <p role="alert" className="text-sm text-danger">{err}</p>}
      </Card>
      {r && roles && (
        <Card className="mt-5 grid gap-3 text-sm" data-testid="pm-report">
          <div className="flex items-center gap-3"><span className="font-mono text-3xl text-gold">{r.score}</span><span className="text-muted-foreground">match · {r.matched} of {roles.length} LinkedIn jobs also on your resume</span></div>
          {r.dateMismatch.map((d, i) => <p key={i}><Badge tone="gold">Dates</Badge> {d.role.title} at {d.role.company}: LinkedIn says {d.role.start} – {d.role.end}, resume shows {d.resumeYears.join(', ')}.</p>)}
          {r.onlyLinkedIn.map((x, i) => <p key={i}><Badge>Only on LinkedIn</Badge> {x.title} at {x.company}{x.start ? ` (${x.start} – ${x.end || ''})` : ''}. Add it to your resume if it is relevant, or leave it out on purpose.</p>)}
          {r.onlyResume.length > 0 && <p><Badge>Maybe only on resume</Badge> {r.onlyResume.join('; ')}. Check these appear on LinkedIn.</p>}
          {r.emailMismatch && <p><Badge tone="danger">Email</Badge> LinkedIn has {r.emailMismatch.linkedin}, resume has {r.emailMismatch.resume}. Recruiters may write to either.</p>}
          {r.skillsMissing.length > 0 && <p><Badge>Skills not on resume</Badge> {r.skillsMissing.join(', ')}. Add the ones you can back up.</p>}
          {!r.dateMismatch.length && !r.onlyLinkedIn.length && !r.emailMismatch && <p>No differences found in jobs, dates or email.</p>}
          <p className="text-muted-foreground">Matching is by company name and year, so check each item yourself; it can miss renamed companies.</p>
        </Card>
      )}
      <Card className="mt-5 grid gap-4" data-testid="ms-card">
        <div><h2 className="text-xl">Match score for a job</h2><p className="text-sm text-muted-foreground">Paste a job description. Gemini scores your resume (and the LinkedIn text above, if any) on skills, experience and keywords. This part uses AI with your Gemini key and sends the texts to Google.</p></div>
        <div><Label htmlFor="ms-job">Job description</Label><Textarea id="ms-job" rows={6} value={job} onChange={(e) => setJob(e.target.value)} placeholder="Paste the full job post" /></div>
        <div><Button onClick={score} disabled={busy || job.trim().length < 50}>{busy ? 'Scoring…' : 'Score match'}</Button></div>
        {msErr && <p role="alert" className="text-sm text-danger">{msErr}</p>}
        {ms && (
          <div className="grid gap-3 text-sm" data-testid="ms-report">
            <div className="flex items-center gap-3"><span className="font-mono text-3xl text-gold">{ms.overall}</span><span className="text-muted-foreground">overall · skills 40%, experience 35%, keywords 25%</span></div>
            {([['Skills', ms.skills], ['Experience', ms.experience], ['Keywords', ms.keywords]] as const).map(([k, v]) => (
              <div key={k}><div className="flex justify-between"><span>{k}</span><span className="font-mono">{v}</span></div><div className="h-2 rounded-full bg-muted" role="meter" aria-label={k} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded-full bg-primary" style={{ width: `${v}%` }} /></div></div>
            ))}
            {ms.experienceNote && <p>{ms.experienceNote}</p>}
            {ms.matchedSkills.length > 0 && <p><Badge tone="gold">Matched skills</Badge> {ms.matchedSkills.join(', ')}</p>}
            {ms.missingSkills.length > 0 && <p><Badge tone="danger">Missing skills</Badge> {ms.missingSkills.join(', ')}</p>}
            {ms.missingKeywords.length > 0 && <p><Badge>Keyword gaps</Badge> {ms.missingKeywords.join(', ')}. Add only the ones that are true for you.</p>}
            {ms.fixes.length > 0 && <ul className="list-disc pl-5">{ms.fixes.map((f, i) => <li key={i}>{f}</li>)}</ul>}
            <p className="text-muted-foreground">AI estimate. Check it yourself; never add a skill you do not have.</p>
            <RealityCheck score={ms.overall} gaps={[...ms.missingSkills, ...ms.missingKeywords]} fixes={ms.fixes} />
          </div>
        )}
      </Card>
    </>
  );
}
