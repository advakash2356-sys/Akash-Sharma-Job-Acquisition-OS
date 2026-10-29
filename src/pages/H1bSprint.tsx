import { useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { Badge, Button, Card, Input, Label, PageHeader } from '../components/ui';
import { CHECKLIST, DISCLAIMER, SAMPLE_CSV, SOURCES, filterEmployers, parseLcaCsv, sprint, type Lca } from '../lib/h1b';
import { CREDIT } from '../lib/brand';
import { Steps } from '../components/Steps';
import { LocalNote } from '../components/LocalNote';
import { usePersisted, clearPersisted } from '../lib/persist';

const today = () => new Date().toISOString().slice(0, 10);
const usd = (n: number) => (n ? `$${n.toLocaleString('en-US')}` : '—');

export default function H1bSprint() {
  const [dates, setDates] = usePersisted('jaos_h1b_dates', { lw: '', oe: '', i94: '' }); const { lw, oe, i94 } = dates;
  const setLw = (v: string) => setDates((d) => ({ ...d, lw: v })), setOe = (v: string) => setDates((d) => ({ ...d, oe: v })), setI94 = (v: string) => setDates((d) => ({ ...d, i94: v }));
  const [rows, setRows] = useState<Lca[]>([]); const [src, setSrc] = useState(''); const [err, setErr] = useState('');
  const [title, setTitle] = useState(''); const [state, setState] = useState(''); const [city, setCity] = useState(''); const [minWage, setMinWage] = useState(''); const [skip, setSkip] = useState(true);
  const d = sprint({ lastWorked: lw, officialEnd: oe, i94End: i94, today: today() });
  const emps = useMemo(() => filterEmployers(rows, { title, state, city, skipStaffing: skip, minWage: Number(minWage) || 0 }).slice(0, 50), [rows, title, state, city, skip, minWage]);
  const load = (text: string, name: string) => { try { setRows(parseLcaCsv(text)); setSrc(name); setErr(''); } catch (e: any) { setErr(e.message); setRows([]); } };
  return (
    <>
      <PageHeader eyebrow="Free · runs in your browser" title="H-1B 60-day sprint" subtitle="Lost an H-1B job? Count down the up to 60-day grace period from both possible end dates, work through a checklist with official USCIS links, and find employers that file LCAs for your role." />
      <p className="mb-5 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm" data-testid="h1b-disclaimer"><b>Confirm with an immigration attorney. Information only.</b> {DISCLAIMER}</p>
      <LocalNote onClear={() => { clearPersisted('jaos_h1b_dates', 'jaos_steps_h1b'); location.reload(); }} />
      <Card className="mb-5 grid min-w-0 gap-3" data-testid="h1b-countdown"><h2 className="text-xl font-medium">Countdown</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="min-w-0"><Label htmlFor="hl">Last day you worked</Label><Input id="hl" type="date" value={lw} onChange={(e) => setLw(e.target.value)} /></div>
          <div className="min-w-0"><Label htmlFor="ho">Official employment end date</Label><Input id="ho" type="date" value={oe} onChange={(e) => setOe(e.target.value)} /></div>
          <div className="min-w-0"><Label htmlFor="hi" hint="optional">I-94 end date</Label><Input id="hi" type="date" value={i94} onChange={(e) => setI94(e.target.value)} /></div>
        </div>
        <Button variant="ghost" className="w-fit" onClick={() => { const t = Date.now(); const f = (n: number) => new Date(t - n * 864e5).toISOString().slice(0, 10); setLw(f(20)); setOe(f(6)); setI94(''); }}>Try sample dates (made up)</Button>
        {d.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{d.map((x) => <div key={x.basis} className="min-w-0 rounded-lg border border-border p-3" data-testid="h1b-deadline">
          <div className="text-xs text-muted-foreground">{x.basis}</div>
          <div className="font-mono text-3xl">{x.daysLeft >= 0 ? `${x.daysLeft} days left` : `${-x.daysLeft} days past`}</div>
          <div className="text-sm">Last day: <b>{x.lastDay}</b>{x.cappedByI94 && <Badge tone="gold">I-94 ends first</Badge>}</div></div>)}</div>}
        {d.length === 2 && d[0].lastDay !== d[1].lastDay && <p className="text-sm"><b>Plan to the earlier date ({[d[0].lastDay, d[1].lastDay].sort()[0]})</b> until an attorney confirms which end date applies to you.</p>}
      </Card>
      <div data-testid="h1b-checklist"><Steps id="h1b" title="Your sprint, step by step" steps={[{ title: 'Enter your dates above', body: 'Your last day worked and official end date start the countdown. They stay saved in this browser.' }, ...CHECKLIST.map((c) => ({ title: <>{c.days}: {c.task}</>, body: <a className="text-primary underline" href={SOURCES[c.src].href} target="_blank" rel="noopener noreferrer">Official source</a> })), { title: 'Shortlist employers that file LCAs (below)', body: 'Open the DOL CSV in the next section and filter by your title and state.' }]} /></div>
      <Card className="mb-5 grid min-w-0 gap-3" data-testid="h1b-employers"><h2 className="text-xl font-medium">Employers that filed LCAs</h2>
        <p className="text-sm text-muted-foreground">Download the LCA disclosure file from the <a className="text-primary underline" href={SOURCES[6].href} target="_blank" rel="noreferrer">US Department of Labor</a>, save it as CSV, and open it here. It is read in your browser; only employer, job, place, status and wage columns are used. No personal contact columns are read.</p>
        <div className="flex flex-wrap gap-2"><label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-4 text-sm"><Upload size={15} /> Open DOL CSV<input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) load(await f.text(), f.name); }} /></label>
          <Button variant="ghost" onClick={() => load(SAMPLE_CSV, 'Sample data (made up)')}>Try sample data (made up)</Button></div>
        {err && <p className="text-sm text-red-700">{err}</p>}
        {rows.length > 0 && <>
          <p className="text-xs text-muted-foreground" data-testid="h1b-src">{src}: {rows.length.toLocaleString()} filings loaded.</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="min-w-0"><Label htmlFor="ft">Job title has</Label><Input id="ft" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="engineer" /></div>
            <div className="min-w-0"><Label htmlFor="fs">State</Label><Input id="fs" value={state} onChange={(e) => setState(e.target.value)} placeholder="WA" /></div>
            <div className="min-w-0"><Label htmlFor="fc">City</Label><Input id="fc" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className="min-w-0"><Label htmlFor="fw">Min yearly wage ($)</Label><Input id="fw" inputMode="numeric" value={minWage} onChange={(e) => setMinWage(e.target.value.replace(/\D/g, ''))} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} /> Hide likely staffing agencies (name-based guess)</label>
          <div className="overflow-x-auto"><table className="w-full text-sm" data-testid="h1b-table"><thead><tr className="text-left"><th className="p-2">Employer</th><th className="p-2">Certified LCAs</th><th className="p-2">Median wage</th><th className="p-2">Titles</th><th className="p-2">States</th></tr></thead>
            <tbody>{emps.map((e) => <tr key={e.employer} className="border-t border-border"><td className="p-2">{e.employer}</td><td className="p-2">{e.filings}</td><td className="p-2">{usd(e.medianWage)}</td><td className="p-2">{e.titles.join(', ')}</td><td className="p-2">{e.states.join(', ')}</td></tr>)}</tbody></table></div>
          <p className="text-xs text-muted-foreground">An LCA is not a job opening or a promise to sponsor. Check current openings on the employer's site.</p></>}
      </Card>
      <Card className="grid min-w-0 gap-2"><h2 className="text-xl font-medium">Official sources</h2>
        <ul className="grid gap-1 text-sm [overflow-wrap:anywhere]">{SOURCES.map((s) => <li key={s.href}><a className="text-primary underline" href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>
        <p className="text-xs text-muted-foreground">{CREDIT}. LCA filter idea adapted from aryaminus/h1b-job-search-mcp (MIT).</p></Card>
    </>
  );
}
