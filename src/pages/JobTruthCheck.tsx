import { useState } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge, Button, Card, Input, Label, PageHeader, Select, Textarea } from '../components/ui';
import { truthScore, type Alive, type Truth } from '../lib/truthScore';
import { fitScore } from '../lib/fitScore';
import { scanMessage } from '../lib/scamShield';
import { useApp } from '../lib/state';
import { CREDIT } from '../lib/brand';
import { LocalNote } from '../components/LocalNote';
import { usePersisted, clearPersisted } from '../lib/persist';

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const SAMPLE = 'SAMPLE (made up): Sales Executive, Sample Foods Pvt Ltd, Pune. Manage B2B client accounts, CRM and Excel reporting. Salary ₹4-6 LPA. Apply on the company careers page.';
const tone = (v: Truth['verdict']) => (v === 'skip' ? 'danger' : v === 'apply' ? 'primary' : 'gold') as 'danger' | 'primary' | 'gold';

/** Public Job Truth Score: paste any job post and see if it is worth your time. Runs in the browser. Akash Sync Agent. */
export default function JobTruthCheck() {
  const resume = useApp()?.profile?.resumeText || '';
  const [f, setF] = usePersisted('jaos_truth_inputs', { post: '', posted: '', alive: 'unknown' as Alive, reposts: '0', fit: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF((x) => ({ ...x, [k]: e.target.value })); setT(null); };
  const [t, setT] = useState<Truth | null>(null); const [signs, setSigns] = useState(0);
  const autoFit = resume.trim().length >= 50 && f.post.trim() ? fitScore(resume, f.post).score : null;
  const run = (v = f) => {
    const fit = v.fit.trim() ? Number(v.fit) : autoFit;
    setT(truthScore({ postedAt: v.posted, alive: v.alive, reposts: Number(v.reposts) || 0, description: v.post, fit: fit == null || Number.isNaN(fit) ? null : fit }));
    setSigns(v.post.trim() ? scanMessage({ message: v.post }).signs.length : 0);
  };
  const sample = () => { const v = { post: SAMPLE, posted: daysAgo(5), alive: 'live' as Alive, reposts: '0', fit: '' }; setF(v); run(v); };
  return (
    <>
      <PageHeader eyebrow="Free · runs in your browser" title="Job Truth Score: is this job worth your time?" subtitle="Paste a job post. It scores how fresh the post is, whether the link still opens, repeat postings, whether salary is shown, and your fit, out of 100. Every point is shown. Nothing you paste leaves this device." />
      <LocalNote onClear={() => { clearPersisted('jaos_truth_inputs'); location.reload(); }} />
      <Card className="mb-5 grid gap-3" data-testid="truth-form">
        <div><Label htmlFor="tp">Job post</Label><Textarea id="tp" rows={6} value={f.post} onChange={set('post')} placeholder="Paste the job post text" /></div>
        <div className="grid gap-3 sm:grid-cols-4">
          <div><Label htmlFor="td" hint="optional">Date posted</Label><Input id="td" type="date" value={f.posted} onChange={set('posted')} /></div>
          <div><Label htmlFor="ta">Does the job link still open?</Label><Select id="ta" value={f.alive} onChange={set('alive')}><option value="unknown">Not checked</option><option value="live">Yes, it opens</option><option value="dead">No, closed or gone</option></Select></div>
          <div><Label htmlFor="tr" hint="optional">Times you've seen it reposted</Label><Input id="tr" inputMode="numeric" value={f.reposts} onChange={(e) => set('reposts')({ target: { value: e.target.value.replace(/\D/g, '').slice(0, 2) } })} /></div>
          <div><Label htmlFor="tf" hint={autoFit != null ? `from your resume: ${autoFit}%` : 'optional, 0-100'}>Your fit %</Label><Input id="tf" inputMode="numeric" value={f.fit} onChange={(e) => set('fit')({ target: { value: e.target.value.replace(/\D/g, '').slice(0, 3) } })} placeholder={autoFit != null ? String(autoFit) : ''} /></div>
        </div>
        <div className="flex flex-wrap gap-2"><Button disabled={f.post.trim().length < 20} onClick={() => run()} data-testid="truth-run"><ShieldCheck size={16} /> Get the Truth Score</Button><Button variant="ghost" onClick={sample}>Try a sample (made up)</Button></div>
      </Card>
      {t && <Card className="mb-5 grid gap-3" data-testid="truth-result">
        <div className="flex flex-wrap items-center gap-3"><ShieldCheck size={18} className="text-primary" /><h2 className="text-xl font-medium">Job Truth Score</h2>
          <span className="font-mono text-3xl text-gold" data-testid="truth-score">{t.score}</span><span className="text-sm text-muted-foreground">/ 100</span><Badge tone={tone(t.verdict)}>{t.label}</Badge></div>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">{t.parts.map((p) => <li key={p.label} className="flex justify-between gap-3 border-b border-border/60 py-1"><span>{p.label} <span className="text-muted-foreground">· {p.note}</span></span><span className="font-mono">{p.points}/{p.max}</span></li>)}</ul>
        {t.dontApply.length > 0 && <div className="rounded-lg bg-muted/60 p-3 text-sm"><b>Why we'd skip it:</b><ul className="mt-1 list-disc pl-5">{t.dontApply.map((d) => <li key={d}>{d}</li>)}</ul></div>}
        {signs > 0 && <p className="text-sm" data-testid="truth-scam-hint"><ShieldAlert size={14} className="mr-1 inline text-danger" />The post also has {signs} warning sign{signs > 1 ? 's' : ''} such as fees or pressure. <a className="text-primary underline" href="/scam-shield">Check it in Scam Shield</a>.</p>}
        <p className="text-xs text-muted-foreground">Information only. A score from simple rules, not a finding about any employer. Advice only, you decide. Check the official job page before you apply.</p>
      </Card>}
      <p className="text-xs text-muted-foreground">Got a message asking for money? Use <a className="underline" href="/scam-shield">Scam Shield</a>. Got an offer letter? Use <a className="underline" href="/offer-shield">Offer Shield</a>. {CREDIT}.</p>
    </>
  );
}
