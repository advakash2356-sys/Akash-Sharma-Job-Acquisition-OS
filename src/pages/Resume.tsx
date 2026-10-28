import { today } from '../lib/utils';
import { normaliseJob } from '../lib/docShape';
import { download, jobsCsv } from '../lib/merged';
import React, { useRef, useState } from 'react';
import { Upload, Download, FileJson, Trash2, UserRound } from 'lucide-react';
import { Button, Card, Input, Label, PageHeader, Textarea } from '../components/ui';
import EligibilityCard from '../components/EligibilityCard';
import { useApp } from '../lib/state';
import ResumeDrop from '../components/ResumeDrop';
import { emptyProfile, type Profile } from '../types';
import { callAi } from '../lib/api';
import { useAiReady } from '../lib/aiReady';
import { Sparkles, Loader2 } from 'lucide-react';

export default function ResumePage() {
  const { profile, setProfile, jobs, setJobs, hasResume } = useApp();
  const [msg, setMsg] = useState('');
  const { hasKey } = useAiReady();
  const [filling, setFilling] = useState(false);
  const fillv = (cur: string | undefined, v: unknown) => (cur && cur.trim()) ? cur : (typeof v === 'string' ? v.trim() : '');
  const aiFill = async (text = profile.resumeText) => {
    if (!text.trim() || filling) return;
    setFilling(true); setMsg('Reading your resume with Gemini to fill the empty fields…');
    try {
      const p: any = await callAi('parse-resume', { resume: text });
      setProfile((cur) => ({ ...cur,
        name: fillv(cur.name, p.name), headline: fillv(cur.headline, p.headline), email: fillv(cur.email, p.email), phone: fillv(cur.phone, p.phone),
        location: fillv(cur.location, p.location), links: fillv(cur.links, p.links), minCtc: fillv(cur.minCtc, p.minPay),
        targetRoles: fillv(cur.targetRoles, (p.targetTitles || []).filter(Boolean).join(', ')),
        skills: fillv(cur.skills, (p.skills || []).join(', ')),
        experience: fillv(cur.experience, (p.experience || []).map((e: any) => `${e.role}${e.company ? ` at ${e.company}` : ''}${e.period ? ` (${e.period})` : ''}`).join('\n')) }));
      setMsg('Filled the empty fields from your resume. Fields you already typed were left as they were. Check them.');
    } catch (e: any) { setMsg(`Could not fill the fields: ${e.message || 'the AI request failed'}. You can type them in.`); }
    finally { setFilling(false); }
  };
  const tidySkills = (v: string) => v.split(',').map((x) => x.trim()).filter(Boolean).join(', ');
  const importRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProfile({ ...profile, [k]: e.target.value });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ version: 1, profile, jobs }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'job-os-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setMsg(`Backup saved as job-os-backup.json (${jobs.length} job${jobs.length === 1 ? '' : 's'}). Check your Downloads folder.`);
  };

  const importJson = async (f?: File) => {
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d || typeof d.profile !== 'object') throw new Error('bad');
      setProfile({ ...emptyProfile, ...d.profile });
      if (Array.isArray(d.jobs)) setJobs(d.jobs.filter((x: unknown) => x && typeof x === 'object').map(normaliseJob));
      setMsg('Backup imported.');
    } catch { setMsg('That file is not a valid Job Acquisition OS backup.'); }
  };

  return (
    <>
      <PageHeader
        title="My resume"
        subtitle="Your resume is saved only in this browser. Every AI feature (score, tailor, cover letter, outreach) reads it."
      />
      {msg && <p role="status" className="mb-4 rounded-lg bg-accent px-3 py-2 text-sm text-primary">{msg}</p>}

      <div className="grid gap-5">
        {hasKey && profile.resumeText.trim() && <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => aiFill()} disabled={filling} data-testid="ai-fill">{filling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Fill empty fields from my resume (AI)</Button></div>}
        <Card className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="n">Full name</Label><Input id="n" value={profile.name} onChange={set('name')} placeholder="Your name" /></div>
          <div><Label htmlFor="h">Headline</Label><Input id="h" value={profile.headline} onChange={set('headline')} placeholder="e.g. Senior Operations Manager" /></div>
          <div><Label htmlFor="e">Email</Label><Input id="e" type="email" value={profile.email} onChange={set('email')} /></div>
          <div><Label htmlFor="p">Phone</Label><Input id="p" value={profile.phone} onChange={set('phone')} /></div>
          <div><Label htmlFor="l">Location</Label><Input id="l" value={profile.location} onChange={set('location')} /></div>
          <div><Label htmlFor="k">Links</Label><Input id="k" value={profile.links} onChange={set('links')} placeholder="LinkedIn, portfolio" /></div>
          <div><Label htmlFor="t" hint="optional">Target roles</Label><Input id="t" value={profile.targetRoles} onChange={set('targetRoles')} placeholder="e.g. Product Manager, Ops Lead" /></div>
          <div><Label htmlFor="c" hint="optional">Minimum pay</Label><Input id="c" value={profile.minCtc} onChange={set('minCtc')} placeholder="e.g. 18 LPA" /></div>
          <div><Label htmlFor="np" hint="optional">Notice period</Label><Input id="np" value={profile.noticePeriod || ''} onChange={(e) => setProfile((p) => ({ ...p, noticePeriod: e.target.value }))} placeholder="e.g. 30 days, or none" /></div>
          <div><Label htmlFor="af" hint="optional">Available from</Label><Input id="af" value={profile.availableFrom || ''} onChange={(e) => setProfile((p) => ({ ...p, availableFrom: e.target.value }))} placeholder="e.g. 1 Dec 2026, or immediately" /></div>
        </Card>

        <EligibilityCard />
        <Card className="grid gap-4">
          <div><Label htmlFor="sk" hint="comma separated">Skills</Label><Input id="sk" value={profile.skills || ''} onChange={set('skills')} onBlur={(e) => setProfile((p) => ({ ...p, skills: tidySkills(e.target.value) }))} placeholder="Filled by guided setup, edit freely" /></div>
          <div><Label htmlFor="ex" hint="short summary">Experience</Label><Textarea id="ex" rows={3} value={profile.experience || ''} onChange={set('experience')} placeholder="Roles, companies and years" /></div>
        </Card>

        <Card>
          <ResumeDrop hasText={hasResume} onText={(t, n) => { setProfile({ ...profile, resumeText: t }); setMsg(`Loaded ${n}. Check the text below and fix anything the parser got wrong.`); if (hasKey) void aiFill(t); }} />
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="r">Resume text</Label>
            <div className="flex gap-2">
            </div>
          </div>
          <Textarea id="r" rows={18} value={profile.resumeText} onChange={set('resumeText')} placeholder="Paste your full resume here: summary, experience, skills, education." className="font-mono text-[13px]" />
          <p className="mt-2 text-sm text-muted-foreground">
            {hasResume ? `${profile.resumeText.trim().split(/\s+/).length} words saved. Edits save automatically.` : 'Paste at least a few lines so the AI has something real to work from.'}
          </p>
        </Card>

        <Card>
          <h2 className="mb-1 text-xl font-medium">Backup</h2>
          <p className="mb-4 text-sm text-muted-foreground">Export your resume and jobs as a JSON file, or restore them on another device.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportJson}><Download size={16} /> Export JSON</Button>
            <Button variant="outline" disabled={!jobs.length} onClick={() => download(jobsCsv(jobs), `jobs-${today()}.csv`, 'text/csv')}><Download size={16} /> Export jobs (CSV)</Button>
            <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(e) => { importJson(e.target.files?.[0]); e.target.value = ''; }} />
            <Button variant="outline" onClick={() => importRef.current?.click()}><FileJson size={16} /> Import JSON</Button>
            <Button variant="danger" onClick={() => { if (confirm('Delete your resume and all jobs from this browser?')) { setProfile(emptyProfile); setJobs([]); setMsg('All data cleared.'); } }}><Trash2 size={16} /> Clear all data</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
