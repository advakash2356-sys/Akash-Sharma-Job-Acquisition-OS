import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Badge, Button, Card, Input, Label, Select } from './ui';
import { usePersisted } from '../lib/persist';
import { downloadText } from '../lib/exportResult';

/** Live government job POSTINGS (not just exams): last date, state, pay, vacancies, official notice. Akash Sync Agent. */
export interface GovPosting { id: string; title: string; org: string; state: string; location: string; lastDate: string; startDate?: string; pay: string; vacancies: string; eligibility: string; noticeUrl: string; official: boolean; applyUrl?: string; postedAt: string; source: string; lesserKnown: boolean; verifiedAt: string }
interface Feed { postings: GovPosting[]; checkedAt: string; warnings: string[]; sources: string[] }
const daysLeft = (d: string) => Math.ceil((Date.parse(d) - Date.parse(new Date().toISOString().slice(0, 10))) / 864e5);
const fmt = (d: string) => (d ? new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');

export function GovPostings({ homeState }: { homeState?: string }) {
  const [feed, setFeed] = useState<Feed | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [ack, setAck] = usePersisted<string>('jaos_gov_postings_ack', '');
  const [f, setF] = usePersisted('jaos_gov_postings_filter', { q: '', state: '', lesser: false, official: false, soon: false });
  const load = async () => { setBusy(true); setErr(''); try { const r = await fetch('/api/gov/postings', { cache: 'no-store' }); const j = await r.json(); if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`); setFeed(j); } catch (e: any) { setErr(`Could not load live postings right now (${e.message}). The eligibility checker below still works.`); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const states = useMemo(() => [...new Set((feed?.postings || []).map((p) => p.state).filter(Boolean))].sort(), [feed]);
  const list = (feed?.postings || []).filter((p) => (!f.state || p.state === f.state || (f.state && p.state === 'All India')) && (!f.lesser || p.lesserKnown) && (!f.official || p.official) && (!f.soon || daysLeft(p.lastDate) <= 7)
    && (!f.q || `${p.title} ${p.org} ${p.location} ${p.eligibility}`.toLowerCase().includes(f.q.toLowerCase())));
  const csv = () => downloadText('gov-postings.csv', ['title,org,state,location,last_date,pay,vacancies,notice'].concat(list.map((p) => [p.title, p.org, p.state, p.location, p.lastDate, p.pay, p.vacancies, p.noticeUrl].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','))).join('\n'), 'text/csv');
  return (
    <Card className="mb-5 grid min-w-0 gap-3" data-testid="gov-postings">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-medium">Live government job postings</h2>
        <div className="flex gap-2"><Button variant="outline" onClick={load} disabled={busy} data-testid="gov-postings-refresh"><RefreshCw size={15} /> {busy ? 'Checking…' : 'Refresh'}</Button>{list.length > 0 && <Button variant="outline" onClick={csv}>Download CSV</Button>}</div></div>
      <p className="text-sm text-muted-foreground">Open vacancies with a last date that has not passed, read from public notice feeds on our server (your browser only talks to this site). <b>Always verify on the official notice before applying. Not legal advice.</b> Lesser-known = PSUs, courts, research labs, institutes, regulators and similar roles people often miss.</p>
      <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm" data-testid="gov-declaration" role="note"><b>Before you use this list</b>
        <ul className="ml-5 mt-1 list-disc">
          <li>These postings come from public government and aggregator feeds. Job Acquisition OS does not collect your personal data for this feed.</li>
          <li>To protect the service we limit how often the feed can be requested and keep a copy for about 30 minutes, so a new notice can take a while to appear. Heavy automated misuse could still add hosting costs for us.</li>
          <li><b>Always verify on the official notice before applying.</b> Dates, pay and eligibility can change. Not legal advice.</li>
        </ul>
        <label className="mt-2 flex items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={!!ack} onChange={(e) => setAck(e.target.checked ? new Date().toISOString() : '')} data-testid="gov-ack" /> <span>I have read this (optional; saved only in this browser{ack ? `, ${new Date(ack).toLocaleString('en-IN')}` : ''}). You can browse the postings either way.</span></label>
        <p className="mt-1 text-xs text-muted-foreground">Akash Sync Agent</p></div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="min-w-0 sm:col-span-2"><Label htmlFor="gpq">Search title, organisation or place</Label><Input id="gpq" value={f.q} placeholder="e.g. clerk, court, engineer, Kerala" onChange={(e) => setF({ ...f, q: e.target.value })} /></div>
        <div className="min-w-0"><Label htmlFor="gps">State</Label><Select id="gps" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })}><option value="">All states</option>{homeState && !states.includes(homeState) && <option value={homeState}>{homeState}</option>}{states.map((s) => <option key={s}>{s}</option>)}</Select></div>
        <div className="flex flex-col justify-end gap-1 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.lesser} onChange={(e) => setF({ ...f, lesser: e.target.checked })} data-testid="gp-lesser" /> Lesser-known only</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.official} onChange={(e) => setF({ ...f, official: e.target.checked })} /> Official link only</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.soon} onChange={(e) => setF({ ...f, soon: e.target.checked })} /> Closing in 7 days</label></div>
      </div>
      {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      {feed && <p className="text-xs text-muted-foreground" data-testid="gov-postings-meta">{list.length} of {feed.postings.length} open postings · checked {new Date(feed.checkedAt).toLocaleString('en-IN')} · sources: {feed.sources.join('; ')}{feed.warnings.length ? ` · some sources unavailable: ${feed.warnings.join('; ')}` : ''}</p>}
      {!feed && !err && <div className="h-40 animate-pulse rounded-lg bg-muted" aria-label="Loading postings" />}
      <ul className="grid gap-3">{list.slice(0, 120).map((p) => { const left = daysLeft(p.lastDate); return (
        <li key={p.id} className="min-w-0 rounded-lg border border-border p-3 [overflow-wrap:anywhere]" data-testid="gov-posting">
          <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><div className="font-medium">{p.title}</div><div className="text-sm text-muted-foreground">{p.org}{p.location ? ` · ${p.location}` : ''}</div></div>
            <div className="flex flex-wrap gap-1">{p.lesserKnown && <Badge tone="primary">Lesser-known</Badge>}<Badge tone={left <= 3 ? 'danger' : 'muted'}>{left <= 0 ? 'Closes today' : `${left} day${left === 1 ? '' : 's'} left`}</Badge></div></div>
          <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <div><dt className="inline text-muted-foreground">Last date: </dt><dd className="inline font-medium" data-testid="gp-last">{fmt(p.lastDate)}</dd></div>
            <div><dt className="inline text-muted-foreground">State: </dt><dd className="inline">{p.state || 'see notice'}</dd></div>
            <div><dt className="inline text-muted-foreground">Pay: </dt><dd className="inline">{p.pay || 'see notice'}</dd></div>
            <div><dt className="inline text-muted-foreground">Vacancies: </dt><dd className="inline">{p.vacancies || 'see notice'}</dd></div>
            {p.eligibility && <div className="sm:col-span-2"><dt className="inline text-muted-foreground">Eligibility: </dt><dd className="inline">{p.eligibility}</dd></div>}
          </dl>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm"><a className="inline-flex items-center gap-1 text-primary underline" href={p.noticeUrl} target="_blank" rel="noopener noreferrer">{p.official ? 'Official notification' : 'Notice page (aggregator, find the official link there)'} <ExternalLink size={13} /></a>
            {p.applyUrl && <a className="text-primary underline" href={p.applyUrl} target="_blank" rel="noopener noreferrer">Apply link</a>}
            <span className="text-xs text-muted-foreground">via {p.source} · last verified {fmt(p.verifiedAt)}</span></div>
        </li>); })}</ul>
      {feed && !list.length && <p className="text-sm text-muted-foreground">No open postings match these filters. Clear a filter or press Refresh.</p>}
    </Card>
  );
}
