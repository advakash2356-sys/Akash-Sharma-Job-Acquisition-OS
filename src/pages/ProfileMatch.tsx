import React, { useState } from 'react';
import { Fingerprint, Upload } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Label, PageHeader, Textarea } from '../components/ui';
import { useApp } from '../lib/state';
import { compare, parsePastedProfile, parsePositionsCsv, parseSkills, type MatchReport, type Role } from '../lib/profileMatch';

export default function ProfileMatch() {
  const { profile, hasResume, go } = useApp();
  const [text, setText] = useState(''); const [skills, setSkills] = useState(''); const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<Role[] | null>(null); const [r, setR] = useState<MatchReport | null>(null); const [err, setErr] = useState('');
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
        <p className="mt-3 text-sm text-muted-foreground">This runs only in your browser on text you give it. It does not log in to LinkedIn, read any profile for you, use AI or save what you paste.</p>
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
    </>
  );
}
