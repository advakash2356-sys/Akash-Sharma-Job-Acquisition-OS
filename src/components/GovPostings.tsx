import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Badge, Button, Card, Input, Label, Select } from './ui';
import { usePersisted } from '../lib/persist';
import { downloadText } from '../lib/exportResult';
import { ADV0, EMP, QUALS, SECTORS, TIERS, advCount, advFromProfile, govResults, hasDetails, type Adv } from '../lib/gov/filter';
import { lawStreams } from '../lib/gov/gates';
import { LABEL_TEXT, matchLabel, profileOverlap } from '../lib/gov/rank';
import type { Cat, Profile } from '../lib/govJobs';
import { classify } from '../lib/onestop/category';
/** t345u: split age-capped cadre exams from all-age lateral / consultant / Young Professional roles. */
export const govTrack = (p: { title: string; org: string; employmentType?: string }) => (p.employmentType && /contractual|deputation|fellowship/.test(p.employmentType)) || classify({ title: p.title, company: p.org, gov: true }) === 'gov-lateral' ? 'lateral' : 'cadre';

/** Live government job POSTINGS (not just exams): last date, state, pay, vacancies, official notice. Akash Sync Agent. */
export interface GovPosting { id: string; title: string; org: string; state: string; location: string; lastDate: string; startDate?: string; pay: string; vacancies: string; eligibility: string; noticeUrl: string; official: boolean; applyUrl?: string; postedAt: string; source: string; lesserKnown: boolean; verifiedAt: string; level?: string; employmentType?: string; trust?: string; dateKind?: 'last' | 'listing'; maxAge?: number; minAge?: number; eduTags?: string[] }
interface Feed { postings: GovPosting[]; checkedAt: string; warnings: string[]; sources: string[] }
const daysLeft = (d: string) => Math.ceil((Date.parse(d) - Date.parse(new Date().toISOString().slice(0, 10))) / 864e5);
const fmt = (d: string) => (d ? new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');

export function GovPostings({ homeState, profile, keywords = [] }: { homeState?: string; profile?: Profile | null; keywords?: string[] }) {
  const [feed, setFeed] = useState<Feed | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [ack, setAck] = usePersisted<string>('jaos_gov_postings_ack', '');
  const [f, setF] = usePersisted('jaos_gov_postings_filter', { q: '', state: '', lesser: false, official: false, soon: false, sort: 'rank', deputation: false, allLevels: false, adv: ADV0 as Partial<Adv>, advOpen: false, auto: false });
  const adv: Adv = { ...ADV0, ...(f.adv || {}) }; const setAdv = (patch: Partial<Adv>) => setF({ ...f, adv: { ...adv, ...patch } });
  const toggle = (k: 'quals' | 'sectors' | 'tiers' | 'emp', v: string) => setAdv({ [k]: adv[k].includes(v) ? adv[k].filter((x) => x !== v) : [...adv[k], v] });
  const applyMine = () => { const a = advFromProfile(profile, adv); const { state, ...rest } = a; setF({ ...f, state: state ?? f.state, adv: { ...adv, ...rest }, auto: true }); };
  // t385u: one-time details fill the search the first time they exist, so every later visit starts from the person's profile.
  useEffect(() => { if (!f.auto && profile && (profile.dob || profile.state)) applyMine(); }, [profile?.dob, profile?.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const load = async () => { setBusy(true); setErr(''); try { const r = await fetch('/api/gov/postings', { cache: 'no-store' }); const j = await r.json(); if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`); setFeed(j); } catch (e: any) { setErr(`The official government portals and feeds are temporarily slow or under maintenance (${e.message}). Servers are busiest near closing hours (5 pm to midnight IST); try again in the morning. The eligibility checker below still works.`); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const states = useMemo(() => [...new Set((feed?.postings || []).map((p) => p.state).filter(Boolean))].sort(), [feed]);
  const [track, setTrack] = useState<'all' | 'cadre' | 'lateral'>('all');
  // t386u L3: a first-time visitor with no details is not silently treated as a graduate: show everything, with a prompt.
  const mine = hasDetails(profile) ? profile! : null;
  const res = govResults(feed?.postings || [], f, mine, keywords); const hidden = res.hidden; const far = res.far;
  const eff = mine ? { ...mine, cat: adv.cat || mine.cat } : null;
  const list = res.list.filter((p) => track === 'all' || govTrack(p) === track);
  const chip = (on: boolean, label: string, onClick: () => void, id?: string) => <button type="button" key={label} aria-pressed={on} onClick={onClick} data-testid={id} className={`min-h-9 cursor-pointer rounded-full border px-3 py-1 text-sm ${on ? 'border-primary bg-accent text-primary' : 'border-border hover:bg-muted'}`}>{label}</button>;
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
      <div className="grid gap-3 rounded-lg border border-border p-3" data-testid="gov-adv">
        <div className="flex flex-wrap items-center justify-between gap-2"><button type="button" className="min-h-11 cursor-pointer text-left font-medium text-primary underline" aria-expanded={!!f.advOpen} onClick={() => setF({ ...f, advOpen: !f.advOpen })} data-testid="gov-adv-toggle">{f.advOpen ? 'Hide' : 'Show'} advanced search{advCount(adv) ? ` (${advCount(adv)} in use)` : ''}</button>
          <div className="flex flex-wrap gap-2">{profile && <Button variant="outline" onClick={applyMine} data-testid="gov-adv-mine">Use my details</Button>}<Button variant="ghost" onClick={() => setF({ ...f, state: '', allLevels: false, adv: ADV0 })} data-testid="gov-adv-clear">Clear filters</Button></div></div>
        {f.auto && profile && <p className="text-xs text-muted-foreground" data-testid="gov-adv-auto">Filled from "Your details" below (saved in this browser): {[adv.ageFit ? 'age limit with your category' : '', adv.qualFit ? 'your qualification' : ''].filter(Boolean).join(' and ') || 'your profile'}{profile.spec ? `; ${profile.spec} posts first` : ''}{profile.state || profile.city ? `; ${[profile.city, profile.state].filter(Boolean).join(', ')} ranked higher` : ''}. Posts whose notice does not state these are kept. Change any filter, or press Clear filters to search everything.</p>}
        {f.advOpen && <div className="grid gap-3 text-sm">
          <div><div className="mb-1 font-medium">Qualification the post asks for</div><div className="flex flex-wrap gap-2" data-testid="gov-adv-quals">{QUALS.map(([v, l]) => chip(adv.quals.includes(v), l, () => toggle('quals', v)))}</div>
            <label className="mt-1 flex items-center gap-2"><input type="checkbox" checked={adv.unstated} onChange={(e) => setAdv({ unstated: e.target.checked })} /> Also include posts whose notice text does not state a qualification</label></div>
          <div><div className="mb-1 font-medium">Sector</div><div className="flex flex-wrap gap-2" data-testid="gov-adv-sectors">{SECTORS.map(([v, l]) => chip(adv.sectors.includes(v), l, () => toggle('sectors', v)))}</div></div>
          <div><div className="mb-1 font-medium">Job level</div><div className="flex flex-wrap gap-2" data-testid="gov-adv-tiers">{TIERS.map(([v, l]) => chip(adv.tiers.includes(v), l, () => toggle('tiers', v)))}</div>
            <label className="mt-1 flex items-center gap-2"><input type="checkbox" checked={!!f.allLevels} onChange={(e) => setF({ ...f, allLevels: e.target.checked })} data-testid="gp-all-levels" /> Show all levels (includes peon, MTS, clerk and driver posts far below your qualification)</label></div>
          <div><div className="mb-1 font-medium">Job type</div><div className="flex flex-wrap gap-2">{EMP.map(([v, l]) => chip(adv.emp.includes(v), l, () => toggle('emp', v)))}</div></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="min-w-0"><Label htmlFor="gad">Department or organisation</Label><Input id="gad" value={adv.dept} placeholder="e.g. Railways, High Court, ISRO" onChange={(e) => setAdv({ dept: e.target.value })} data-testid="gov-adv-dept" /></div>
            <div className="min-w-0"><Label htmlFor="gac">City or district</Label><Input id="gac" value={adv.city} placeholder="e.g. Lucknow" onChange={(e) => setAdv({ city: e.target.value })} data-testid="gov-adv-city" /></div>
            <div className="min-w-0"><Label htmlFor="gacat" hint="for age relaxation">Category</Label><Select id="gacat" value={adv.cat} onChange={(e) => setAdv({ cat: e.target.value as '' | Cat })} data-testid="gov-adv-cat"><option value="">From my details{profile ? ` (${profile.cat})` : ''}</option>{(['GEN', 'EWS', 'OBC', 'SC', 'ST'] as Cat[]).map((c) => <option key={c} value={c}>{c === 'GEN' ? 'General' : c === 'OBC' ? 'OBC (non-creamy layer)' : c}</option>)}</Select></div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={adv.ageFit} onChange={(e) => setAdv({ ageFit: e.target.checked })} data-testid="gov-adv-agefit" /> Only posts my age fits (with category relaxation)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={adv.qualFit} onChange={(e) => setAdv({ qualFit: e.target.checked })} data-testid="gov-adv-qualfit" /> Only posts my qualification meets</label></div>
          <p className="text-xs text-muted-foreground">Filters use only what each notice states. A post whose notice does not state an age limit or qualification is kept, marked "Check notice".</p>
        </div>}
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Government track" data-testid="gov-track-tabs">
        {([['all', 'All government'], ['cadre', 'Cadre exams (age-capped)'], ['lateral', 'Lateral / Consultant / Young Professional (all ages)']] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={track === k} onClick={() => setTrack(k)} className={`min-h-11 rounded-full px-4 text-sm cursor-pointer ${track === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{label} · {res.list.filter((p) => k === 'all' || govTrack(p) === k).length}</button>))}
      </div>
      {feed && !mine && <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm" data-testid="gp-add-details">Showing <b>every</b> open post. Add your education, degree and date of birth in <a className="text-primary underline" href="#gov-details">Your details</a> below to see only posts at your level, ranked for you.</p>}
      {hidden > 0 && <p className="text-xs text-muted-foreground" data-testid="gp-hidden">{hidden} posts are hidden: below your level or minimum pay (for example peon, MTS, driver, constable, home guard, agniveer, DEO, LDC/UDC for professional graduates; 10th / ITI-level posts for graduates), or the notice states an essential condition you do not meet (degree, years of experience, licence or age). Tick "Show all levels" in advanced search to see them with the reason.</p>}
      {far > 0 && <p className="text-xs text-muted-foreground" data-testid="gp-far">{far} posts in other states are left out because you ticked "Only near me". Untick it in your details to see them.</p>}
      {feed && mine?.spec === 'law' && (() => { const st = lawStreams(res.list); const none = st.filter((x) => !x.n && !x.uncovered); const gap = st.filter((x) => !x.n && x.uncovered); return <p className="text-xs text-muted-foreground" data-testid="gp-law-streams"><b>Law posts open now:</b> {st.map((x) => `${x.name.split(' (')[0]} ${x.n}`).join(' · ')}.{none.length ? <> No open notice right now for: <b>{none.map((x) => x.name).join('; ')}</b>.</> : null}{gap.length ? <> Not yet covered by our official sources (check the PSU, bank and regulator career pages directly): <b>{gap.map((x) => x.name).join('; ')}</b>.</> : null} We do not pad this list with unrelated posts.</p>; })()}
      <p className="text-xs text-muted-foreground" data-testid="gp-elig-help"><b>About the labels:</b> they use your <b>profession</b> (professional degree), <b>education</b>, <b>date of birth</b>, <b>category</b> (and PwBD), <b>state</b>, <b>years and kind of experience</b> and licences from "Your details" below, saved only in this browser. <b>Strong match</b> = a post in your profession that nothing in the notice rules you out of, with the age limit confirmed. <b>Related fit</b> = a close, adjacent role (for example compliance, policy, research or analyst posts) that your degree and experience suit, at or above your level, and whose every essential condition the notice states you meet; the card names what the notice asks for and how you meet it. Listed after posts in your exact profession. <b>Eligible</b> = the notice states both an age limit and a qualification and you meet them (standard OBC +3, SC/ST +5, PwBD +10 / +13 / +15 years, Ex-SM service + 3; category relaxation for state posts needs that state's domicile). <b>Check notice</b> = an essential condition the notice does not state, or your details do not answer (for example "7 yrs litigation practice required; your profile shows corporate legal"), named on the card. Never Strong or Eligible while one is open. A post whose stated essential condition you clearly do not meet is hidden unless you tick "Show all levels". Strong match also needs your degree to match the post's discipline and the pay to meet your minimum pay level; Eligible names its trade-off (place, contract tenure). Best match ranks by profession, then level fit, eligibility, pay, your state and days left. It is a hint, not legal advice.</p>
      {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      {feed && <p className="text-xs text-muted-foreground" data-testid="gov-postings-meta">{list.length} of {feed.postings.length} open postings · checked {new Date(feed.checkedAt).toLocaleString('en-IN')} · sources: {feed.sources.join('; ')}{feed.warnings.length ? ` · some sources unavailable: ${feed.warnings.join('; ')}` : ''}</p>}
      {!feed && !err && <div className="h-40 animate-pulse rounded-lg bg-muted" aria-label="Loading postings" />}
      <ul className="grid gap-3">{list.slice(0, 120).map((p) => { const left = daysLeft(p.lastDate); return (
        <li key={p.id} className="min-w-0 rounded-lg border border-border p-3 [overflow-wrap:anywhere]" data-testid="gov-posting">
          <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><div className="font-medium">{p.title}</div><div className="text-sm text-muted-foreground">{p.org}{p.location ? ` · ${p.location}` : ''}</div></div>
            <div className="flex flex-wrap gap-1">{p.lesserKnown && <Badge tone="primary">Lesser-known</Badge>}{p.level && <Badge tone="muted">{p.level}</Badge>}{p.employmentType && p.employmentType !== 'permanent' && <Badge tone="gold">{p.employmentType}</Badge>}<Badge tone={left <= 3 ? 'danger' : 'muted'}>{left <= 0 ? 'Closes today' : `${left} day${left === 1 ? '' : 's'} left`}</Badge></div></div>
          {(() => { const o = profileOverlap(p, keywords); return o.hits.length ? <p className="mt-1 text-xs text-muted-foreground" data-testid="gp-match">Matches your profile: {o.hits.join(', ')}</p> : null; })()}
          {(() => { const e = matchLabel(p, eff); return <p className="mt-2 text-sm" data-testid="gp-elig"><Badge tone={e.label === 'strong' ? 'primary' : e.label === 'eligible' || e.label === 'related' ? 'gold' : 'muted'}>{LABEL_TEXT[e.label]}</Badge> <span className="text-xs text-muted-foreground">{e.why.join(' ')}</span></p>; })()}
          <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <div><dt className="inline text-muted-foreground">{p.dateKind === 'listing' ? 'Listing ends: ' : 'Last date: '}</dt><dd className="inline font-medium" data-testid="gp-last">{fmt(p.lastDate)}{p.dateKind === 'listing' ? <span className="text-muted-foreground" data-testid="gp-listing-note"> (confirm the last date in the notice)</span> : null}</dd></div>
            <div><dt className="inline text-muted-foreground">State: </dt><dd className="inline">{p.state || 'see notice'}</dd></div>
            <div><dt className="inline text-muted-foreground">Pay: </dt><dd className="inline">{p.pay || 'see notice'}</dd></div>
            <div><dt className="inline text-muted-foreground">Vacancies: </dt><dd className="inline">{p.vacancies || 'see notice'}</dd></div>
            {p.eligibility && <div className="sm:col-span-2"><dt className="inline text-muted-foreground">Eligibility: </dt><dd className="inline">{p.eligibility}</dd></div>}
          </dl>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm"><a className="inline-flex items-center gap-1 text-primary underline" href={p.noticeUrl} target="_blank" rel="noopener noreferrer">{p.official ? ((p as any).linkKind === 'site' ? 'Official site (find the advert there)' : 'Read official notice') : 'Notice page (aggregator, find the official link there)'} <ExternalLink size={13} /></a>{p.official && <span className="text-xs text-primary" data-testid="gp-verified">✓ Official domain ({p.trust === 'WHITELIST_PSU' ? 'listed public-sector site' : '.gov.in / .nic.in / .ac.in'})</span>}
            {p.applyUrl && <a className="text-primary underline" href={p.applyUrl} target="_blank" rel="noopener noreferrer">Apply link</a>}
            <span className="text-xs text-muted-foreground">via {p.source} · last verified {fmt(p.verifiedAt)}</span></div>
        </li>); })}</ul>
      {feed && !list.length && <p className="text-sm text-muted-foreground" data-testid="gp-empty"><b>No open government posts match your profile and filters right now.</b> We never make up posts, so this list stays empty until an official notice is open. Government bodies release notices in waves (often on Fridays and Saturdays with Employment News). Try clearing your keyword filter, turning off "Lesser-known only", or checking your category's age relaxation.</p>}
    </Card>
  );
}
