import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Badge, Button, Card, Input, Label, Select } from './ui';
import { usePersisted } from '../lib/persist';
import { downloadText } from '../lib/exportResult';
import { filterPostings } from '../lib/gov/filter';
import { BADGE_TEXT, eligibilityBadge, profileFit, rankScore } from '../lib/gov/rank';
import type { Profile } from '../lib/govJobs';

/** Live government job POSTINGS (not just exams): last date, state, pay, vacancies, official notice. Akash Sync Agent. */
export interface GovPosting { id: string; title: string; org: string; state: string; location: string; lastDate: string; startDate?: string; pay: string; vacancies: string; eligibility: string; noticeUrl: string; official: boolean; applyUrl?: string; postedAt: string; source: string; lesserKnown: boolean; verifiedAt: string; level?: string; employmentType?: string; trust?: string; maxAge?: number; minAge?: number; eduTags?: string[] }
interface Feed { postings: GovPosting[]; checkedAt: string; warnings: string[]; sources: string[] }
const daysLeft = (d: string) => Math.ceil((Date.parse(d) - Date.parse(new Date().toISOString().slice(0, 10))) / 864e5);
const fmt = (d: string) => (d ? new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');

export function GovPostings({ homeState, profile }: { homeState?: string; profile?: Profile | null }) {
  const [feed, setFeed] = useState<Feed | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [ack, setAck] = usePersisted<string>('jaos_gov_postings_ack', '');
  const [f, setF] = usePersisted('jaos_gov_postings_filter', { q: '', state: '', lesser: false, official: false, soon: false, sort: 'rank', deputation: false });
  const load = async () => { setBusy(true); setErr(''); try { const r = await fetch('/api/gov/postings', { cache: 'no-store' }); const j = await r.json(); if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`); setFeed(j); } catch (e: any) { setErr(`The official government portals and feeds are temporarily slow or under maintenance (${e.message}). Servers are busiest near closing hours (5 pm to midnight IST); try again in the morning. The eligibility checker below still works.`); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const states = useMemo(() => [...new Set((feed?.postings || []).map((p) => p.state).filter(Boolean))].sort(), [feed]);
  const list = filterPostings(feed?.postings || [], f)
    .map((p) => { const fit = profileFit(p, profile); return { p, fit, score: rankScore(p, f.q.split(/[\s,]+/)) + fit.pts }; })
    .sort((a, b) => (f.sort === 'rank' ? b.score - a.score : 0) || a.p.lastDate.localeCompare(b.p.lastDate)).filter((x) => f.sort !== 'rank' || !x.fit.belowLevel).map((x) => x.p);
  const hidden = f.sort === 'rank' ? (feed?.postings || []).filter((p) => profileFit(p, profile).belowLevel).length : 0;
  const csv = () => downloadText('gov-postings.csv', ['title,org,state,location,last_date,pay,vacancies,notice'].concat(list.map((p) => [p.title, p.org, p.state, p.location, p.lastDate, p.pay, p.vacancies, p.noticeUrl].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','))).join('\n'), 'text/csv');
  return (
    <Card className="mb-5 grid min-w-0 gap-3" data-testid="gov-postings">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-medium">Live government job postings</h2>
        <div className="flex gap-2"><Button variant="outline" onClick={load} disabled={busy} data-testid="gov-postings-refresh"><RefreshCw size={15} /> {busy ? 'Checking…' : 'Refresh'}</Button>{list.length > 0 && <Button variant="outline" onClick={csv}>Download CSV</Button>}</div></div>
      <p className="text-sm text-muted-foreground">Open vacancies with a last date that has not passed, read from public notice feeds on our server (your browser only talks to this site). <b>Always verify on the official notice before applying. Not legal advice.</b> Lesser-known = PSUs, courts, research labs, institutes, regulators and similar roles people often miss.</p>
      <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm" data-testid="gov-declaration" role="note"><b>Before you use this list</b>
        <ul className="ml-5 mt-1 list-disc">
          <li><b>Scraped from public sources, not an official government website.</b> We are not affiliated with or endorsed by the Government of India, any State Government, UPSC, SSC or any PSU. Pay estimates and eligibility hints are for convenience only. These postings are automatically collected (scraped and aggregated) from public government notices and aggregator feeds. Job Acquisition OS does not collect your personal data for this feed.</li>
          <li><b>Applying takes time; patience is normal.</b> Expect one-time registration, photo and signature size limits, and multi-stage exams over several months. Check the crucial date for age, and apply at least 48 hours before the deadline to avoid server rush.</li>
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
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.soon} onChange={(e) => setF({ ...f, soon: e.target.checked })} /> Closing in 7 days</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.deputation} onChange={(e) => setF({ ...f, deputation: e.target.checked })} data-testid="gp-deputation" /> Show deputation-only posts</label></div>
        <div className="min-w-0"><Label htmlFor="gpo">Sort</Label><Select id="gpo" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })} data-testid="gp-sort"><option value="rank">Best match (closing soon, lesser-known, clear pay)</option><option value="date">Last date first</option></Select></div>
      </div>
      {hidden > 0 && <p className="text-xs text-muted-foreground" data-testid="gp-hidden">{hidden} junior / entry-level posts are hidden from Best match because they are below your experience. Switch Sort to "Last date first" to see everything.</p>}
      <p className="text-xs text-muted-foreground" data-testid="gp-elig-help"><b>About the eligibility hint:</b> it uses your <b>date of birth</b>, <b>education</b>, <b>category</b> (and PwBD) <b>state</b>, <b>years of experience</b> and <b>professional degree</b> from "Your details" below, saved only in this browser. "Likely eligible" appears only when the posting states both an age limit and a qualification level and you meet them (with standard OBC +3, SC/ST +5, PwBD +10 years). If either is missing from the notice text you see "Needs verification"; deputation-only posts and posts you seem to miss show "May not qualify". It is a hint, not legal advice.</p>
      {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      {feed && <p className="text-xs text-muted-foreground" data-testid="gov-postings-meta">{list.length} of {feed.postings.length} open postings · checked {new Date(feed.checkedAt).toLocaleString('en-IN')} · sources: {feed.sources.join('; ')}{feed.warnings.length ? ` · some sources unavailable: ${feed.warnings.join('; ')}` : ''}</p>}
      {!feed && !err && <div className="h-40 animate-pulse rounded-lg bg-muted" aria-label="Loading postings" />}
      <ul className="grid gap-3">{list.slice(0, 120).map((p) => { const left = daysLeft(p.lastDate); return (
        <li key={p.id} className="min-w-0 rounded-lg border border-border p-3 [overflow-wrap:anywhere]" data-testid="gov-posting">
          <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><div className="font-medium">{p.title}</div><div className="text-sm text-muted-foreground">{p.org}{p.location ? ` · ${p.location}` : ''}</div></div>
            <div className="flex flex-wrap gap-1">{p.lesserKnown && <Badge tone="primary">Lesser-known</Badge>}{p.level && <Badge tone="muted">{p.level}</Badge>}{p.employmentType && p.employmentType !== 'permanent' && <Badge tone="gold">{p.employmentType}</Badge>}<Badge tone={left <= 3 ? 'danger' : 'muted'}>{left <= 0 ? 'Closes today' : `${left} day${left === 1 ? '' : 's'} left`}</Badge></div></div>
          {(() => { const e = eligibilityBadge(p, profile || null); return <p className="mt-2 text-sm" data-testid="gp-elig"><Badge tone={e.badge === 'likely' ? 'primary' : e.badge === 'maynot' ? 'danger' : 'muted'}>{BADGE_TEXT[e.badge]}</Badge> <span className="text-xs text-muted-foreground">{e.why.join(' ')}</span></p>; })()}
          <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <div><dt className="inline text-muted-foreground">Last date: </dt><dd className="inline font-medium" data-testid="gp-last">{fmt(p.lastDate)}</dd></div>
            <div><dt className="inline text-muted-foreground">State: </dt><dd className="inline">{p.state || 'see notice'}</dd></div>
            <div><dt className="inline text-muted-foreground">Pay: </dt><dd className="inline">{p.pay || 'see notice'}</dd></div>
            <div><dt className="inline text-muted-foreground">Vacancies: </dt><dd className="inline">{p.vacancies || 'see notice'}</dd></div>
            {p.eligibility && <div className="sm:col-span-2"><dt className="inline text-muted-foreground">Eligibility: </dt><dd className="inline">{p.eligibility}</dd></div>}
          </dl>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm"><a className="inline-flex items-center gap-1 text-primary underline" href={p.noticeUrl} target="_blank" rel="noopener noreferrer">{p.official ? ((p as any).linkKind === 'site' ? 'Official site (find the advert there)' : 'Read official notice') : 'Notice page (aggregator, find the official link there)'} <ExternalLink size={13} /></a>{p.official && <span className="text-xs text-primary" data-testid="gp-verified">✓ Official domain ({p.trust === 'WHITELIST_PSU' ? 'listed public-sector site' : '.gov.in / .nic.in / .ac.in'})</span>}
            {p.applyUrl && <a className="text-primary underline" href={p.applyUrl} target="_blank" rel="noopener noreferrer">Apply link</a>}
            <span className="text-xs text-muted-foreground">via {p.source} · last verified {fmt(p.verifiedAt)}</span></div>
        </li>); })}</ul>
      {feed && !list.length && <p className="text-sm text-muted-foreground" data-testid="gp-empty"><b>No open notifications match your exact filters right now.</b> Government bodies release notices in waves (often on Fridays and Saturdays with Employment News). Try clearing your keyword filter, turning off "Lesser-known only", or checking your category's age relaxation.</p>}
    </Card>
  );
}
