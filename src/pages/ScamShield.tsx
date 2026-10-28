import { useState } from 'react';
import { ShieldAlert, Share2, Download, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Input, Label, PageHeader, Textarea } from '../components/ui';
import { normPhone, scanMessage, shareText, waLink, type ScamResult } from '../lib/scamShield';
import { CREDIT } from '../lib/brand';
import { checkCin, checkGstin, lookups } from '../lib/employerCheck';

const SAMPLE = 'SAMPLE (made up): Hello, this is HR Kavya from Naukri. You are shortlisted for Tata Motors, salary double. Pay ₹1,800 registration fee by UPI to schedule 2 interviews today only. Contact on WhatsApp. Email: hr.kavya@naukri-jobs.in';
const KEY = 'jaos_reported_numbers';
const load = (): { n: string; note: string; at: string }[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const COLORS = { red: '#b42318', amber: '#b54708', green: '#067647' };

/** Draws a shareable PNG card. Contains the verdict and sign names only: never the message, numbers or emails. */
function cardPng(r: ScamResult): Promise<Blob | null> {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1080; const g = c.getContext('2d')!;
  g.fillStyle = '#f6f4ef'; g.fillRect(0, 0, 1080, 1080);
  g.fillStyle = COLORS[r.verdict]; g.fillRect(0, 0, 1080, 24);
  g.fillStyle = '#1c1917'; g.font = '600 64px system-ui, sans-serif'; g.fillText('Job offer check', 80, 150);
  g.fillStyle = COLORS[r.verdict]; g.font = '700 56px system-ui, sans-serif'; g.fillText(r.verdict === 'red' ? 'Serious warning signs' : r.verdict === 'amber' ? 'Warning signs' : 'No warning signs found', 80, 250);
  g.fillStyle = '#1c1917'; g.font = '40px system-ui, sans-serif'; r.signs.slice(0, 6).forEach((s, i) => g.fillText(`•  ${s.title}`, 80, 360 + i * 70));
  g.font = '600 42px system-ui, sans-serif'; g.fillText('Real employers never ask you to pay for a job.', 80, 860);
  g.fillStyle = '#57534e'; g.font = '32px system-ui, sans-serif'; g.fillText('Check a message free: akash-sharma-job-acquisition-os.vercel.app/scam-shield', 80, 940); g.fillText(CREDIT, 80, 995);
  return new Promise((res) => c.toBlob(res, 'image/png'));
}

export default function ScamShield() {
  const [msg, setMsg] = useState(''); const [email, setEmail] = useState(''); const [company, setCompany] = useState(''); const [phone, setPhone] = useState('');
  const [cin, setCin] = useState(''); const [gst, setGst] = useState(''); const [site, setSite] = useState('');
  const [r, setR] = useState<ScamResult | null>(null); const [list, setList] = useState(load);
  const p = normPhone(phone); const mine = p ? list.filter((x) => x.n === p) : [];
  const save = (l: typeof list) => { setList(l); localStorage.setItem(KEY, JSON.stringify(l)); };
  const shareCard = async () => { if (!r) return; const b = await cardPng(r); if (!b) return; const f = new File([b], 'job-offer-check.png', { type: 'image/png' });
    if ((navigator as any).canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], text: shareText(r) }); return; } catch { /* cancelled */ } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = f.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  return (
    <>
      <PageHeader eyebrow="Free · runs in your browser" title="Scam Shield: check a recruiter's message" subtitle="Paste a job offer, call notes or email. It looks for warning signs such as fees, look-alike emails, pressure and chat-only contact, in English, Hindi and Hinglish. Nothing you paste leaves this device." />
      <Card className="mb-5 grid gap-3" data-testid="scam-form">
        <div><Label htmlFor="sm">Message</Label><Textarea id="sm" rows={6} value={msg} onChange={(e) => { setMsg(e.target.value); setR(null); }} placeholder="Paste the message or what the caller said" /></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label htmlFor="se" hint="optional">Their email</Label><Input id="se" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label htmlFor="sc" hint="optional">Company they claim</Label><Input id="sc" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div><Label htmlFor="sp" hint="optional">Their phone</Label><Input id="sp" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        <div className="flex flex-wrap gap-2"><Button disabled={msg.trim().length < 10} onClick={() => setR(scanMessage({ message: msg, email, company, phone }))}><ShieldAlert size={16} /> Check for warning signs</Button>
          <Button variant="ghost" onClick={() => { setMsg(SAMPLE); setEmail(''); setCompany(''); setPhone('+91 98xxx xxxxx'); setR(null); }}>Try a sample (made up)</Button></div>
      </Card>
      {r && <Card className="mb-5 grid gap-3" data-testid="scam-result">
        <div className="flex flex-wrap items-center gap-3"><span className="h-4 w-4 rounded-full" style={{ background: COLORS[r.verdict] }} /><Badge tone={r.verdict === 'red' ? 'danger' : r.verdict === 'amber' ? 'gold' : 'primary'}><span data-testid="scam-verdict">{r.verdict === 'red' ? 'Red' : r.verdict === 'amber' ? 'Amber' : 'Green'}</span></Badge><p className="font-medium">{r.headline}</p></div>
        {r.signs.length > 0 && <ul className="grid gap-2">{r.signs.map((s, i) => <li key={i} className="rounded-lg border border-border p-3 text-sm"><b style={{ color: COLORS[s.level] }}>{s.title}</b> · {s.detail}{s.match && <span className="mt-1 block text-xs text-muted-foreground">Found: "{s.match}"</span>}</li>)}</ul>}
        <div className="text-sm"><b>What to do</b><ul className="mt-1 list-disc pl-5">{r.advice.map((a) => <li key={a}>{a}</li>)}</ul></div>
        <div className="flex flex-wrap gap-2"><a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm" href={waLink(shareText(r))} target="_blank" rel="noreferrer"><Share2 size={15} /> Warn friends on WhatsApp</a>
          <Button variant="outline" onClick={shareCard}><Download size={15} /> Share card (image)</Button></div>
        <p className="text-xs text-muted-foreground">These are warning signs from simple rules, not a finding that anyone is a fraud. The share text and card never include the message, numbers or emails.</p>
      </Card>}
      <Card className="mb-5 grid gap-3" data-testid="employer-check">
        <h2 className="text-xl font-medium">Employer Reality Check</h2>
        <p className="text-sm text-muted-foreground">Check the company is real on official registers. These links open the official sites; nothing is fetched or stored by this app.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label htmlFor="ec">CIN (from the offer or website)</Label><Input id="ec" value={cin} onChange={(e) => setCin(e.target.value)} placeholder="U72200KA2015PTC123456" /></div>
          <div><Label htmlFor="eg" hint="optional">GSTIN</Label><Input id="eg" value={gst} onChange={(e) => setGst(e.target.value)} /></div>
          <div><Label htmlFor="ew" hint="optional">Company website</Label><Input id="ew" value={site} onChange={(e) => setSite(e.target.value)} /></div>
        </div>
        {[checkCin(cin), checkGstin(gst)].filter(Boolean).map((c, i) => <p key={i} className="text-sm" data-testid="format-check"><Badge tone={c!.ok ? 'primary' : 'danger'}>{c!.ok ? 'Format OK' : 'Check this'}</Badge> {c!.note}</p>)}
        <ul className="grid gap-2 text-sm">{lookups(company || 'the company', site).map((l) => <li key={l.href}><a className="text-primary underline" href={l.href} target="_blank" rel="noreferrer">{l.label}</a> <span className="text-muted-foreground">· {l.tip}</span></li>)}</ul>
        <p className="text-xs text-muted-foreground">Fee-scam signs to look for: asked to pay for training, kits, laptops or "refundable" deposits; offer without interview; a company that is not on MCA or is "Struck off".</p>
      </Card>
      <Card className="grid gap-3" data-testid="my-numbers">
        <h2 className="text-xl font-medium">Numbers I've flagged</h2>
        <p className="text-sm text-muted-foreground">Keep your own list of numbers that asked you for money. Stored only in this browser. {p && (mine.length ? <b className="text-foreground">You flagged this number {mine.length} time{mine.length > 1 ? 's' : ''} before.</b> : 'This number is not in your list.')}</p>
        {p && <Button size="sm" variant="outline" className="w-fit" onClick={() => save([{ n: p, note: r?.signs[0]?.title || 'Flagged', at: new Date().toISOString().slice(0, 10) }, ...list])}>Add ••••{p.slice(-4)} to my list</Button>}
        {list.length > 0 && <ul className="grid gap-1 text-sm">{list.map((x, i) => <li key={i} className="flex items-center gap-3">••••••{x.n.slice(-4)} · {x.note} · {x.at}<button aria-label="Remove" className="cursor-pointer" onClick={() => save(list.filter((_, j) => j !== i))}><Trash2 size={14} /></button></li>)}</ul>}
        <p className="text-xs text-muted-foreground">To report fraud in India: cybercrime.gov.in or call 1930.</p>
      </Card>
    </>
  );
}
