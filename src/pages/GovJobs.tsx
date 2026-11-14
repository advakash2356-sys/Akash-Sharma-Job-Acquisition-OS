import { CountryComingSoon, SourceDirectory } from '../components/GovCountry';
import { COUNTRIES, PROVIDERS, type CountryCode } from '../lib/gov/providers';
import { GovPostings } from '../components/GovPostings';
import { ConsentBoxes } from '../components/ConsentBoxes';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../lib/state';
import { prefillGov, profileKeywords } from '../lib/gov/shared';
import { RefreshCw } from 'lucide-react';
import { LocalNote } from '../components/LocalNote';
import { Steps } from '../components/Steps';
import { usePersisted, clearPersisted } from '../lib/persist';
import { Badge, Button, Card, Input, Label, PageHeader, Select } from '../components/ui';
import { daysSince, STALE_DAYS, dobInvalid, DISCLAIMER, EXAMS, VERIFIED, match, type Cat, type Edu, type Gender, type Profile , type Spec, RANK} from '../lib/govJobs';
import { userLevel } from '../lib/gov/rank';
import { CREDIT } from '../lib/brand';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Other UT'];

export default function GovJobs() {
  const [p, setP] = usePersisted<Profile>('jaos_gov_profile', { dob: '', edu: 'grad', stream12: 'other', cat: 'GEN', pwbd: false, esm: false, gender: 'male', state: '' });
  const app = useApp()?.profile; // main JAOS job-search profile (same browser storage)
  useEffect(() => { if (app) setP((g) => prefillGov(g, app, STATES)); }, [app?.resumeText, app?.experience, app?.headline, app?.location, app?.skills]); // eslint-disable-line react-hooks/exhaustive-deps
  const kws = useMemo(() => profileKeywords(app || {}), [app?.targetRoles, app?.headline, app?.skills]); // eslint-disable-line react-hooks/exhaustive-deps
  const [country, setCountry] = usePersisted<CountryCode>('jaos_gov_country', 'IN'); const prov = PROVIDERS[country] || PROVIDERS.IN;
  const [lesserOnly, setLesserOnly] = useState(false); const [fresh, setFresh] = useState('');
  const freshRun = async () => { setFresh('Checking…'); try { const r = await fetch('/data/gov-jobs-version.json', { cache: 'no-store' }); const j = await r.json(); if (j.verified > VERIFIED) { setFresh(`Newer data (${j.verified}) is available. Reloading…`); setTimeout(() => location.reload(), 800); } else setFresh(`Fresh run done ${new Date().toLocaleString('en-IN')}. You have the latest data on this site (verified ${VERIFIED}). Check each official notice for updates after that date.`); } catch { setFresh('Could not check for newer data. Your results use the data verified ' + VERIFIED + '.'); } }; const [showAll, setShowAll] = useState(false);
  const set = (k: keyof Profile) => (e: any) => setP({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const res = useMemo(() => (p.dob && !dobInvalid(p.dob) ? match(p) : []), [p]);
  // t385u: graduates and professionals do not see exams far below their level (10th/12th-only entry exams) unless they ask.
  const [allLevels, setAllLevels] = useState(false); const far = (e: (typeof EXAMS)[number]) => userLevel(p) >= 3 && !e.edu.includes('eng') && Math.min(...e.edu.map((x) => RANK[x])) <= 1;
  const list = res.filter((m) => (!lesserOnly || m.exam.lesser) && (showAll || m.ok) && (allLevels || !far(m.exam))); const farN = res.filter((m) => m.ok && far(m.exam)).length;
  const n = res.filter((m) => m.ok).length, nl = res.filter((m) => m.ok && m.exam.lesser).length;
  return (
    <>
      <PageHeader eyebrow="Free · runs in your browser" title="Government Jobs" subtitle={prov.live ? prov.headline : 'Choose a country. India is live; more countries are being added.'} />
      <div className="mb-5 flex flex-wrap items-end gap-3" data-testid="gov-country"><div className="min-w-0"><Label htmlFor="gcountry">Country</Label><Select id="gcountry" value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} data-testid="gov-country-select">{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}{c.live ? '' : ' (coming soon)'}</option>)}</Select></div>{prov.live && <p className="min-w-0 flex-1 text-sm text-muted-foreground">{prov.sub}</p>}</div>
      {!prov.live ? <><CountryComingSoon p={prov} /><p className="text-xs text-muted-foreground">{CREDIT}</p></> : <>
      <p className="mb-5 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm" data-testid="gov-disclaimer"><b>Check the official notification before you apply.</b> {DISCLAIMER}</p>
      {app && (app.targetRoles || app.skills || app.headline) && <p className="mb-2 text-xs text-muted-foreground" data-testid="gov-shared">Using your JAOS job-search profile{app.targetRoles ? <> (roles: <b>{app.targetRoles.slice(0, 80)}</b>)</> : null} to rank these postings, the same as your other job suggestions. Experience, degree and state below were filled from it where empty; change them any time. Saved only in your browser.</p>}
      <GovPostings homeState={p.state} profile={p} keywords={kws} />
      <SourceDirectory p={prov} />
      <LocalNote onClear={() => { clearPersisted('jaos_gov_profile', 'jaos_gov_postings_filter', 'jaos_gov_postings_ack', 'jaos_gov_country'); location.reload(); }} />
      <div className="mb-5"><ConsentBoxes where="gov-jobs" /></div>
      <Steps id="gov" title="Find your government jobs in 4 steps" steps={[{ title: 'Enter your profile below', body: 'Fill once: date of birth, education, professional degree, category, gender, state and city. It is saved in this browser and pre-fills every search.' }, { title: 'Review your matches', body: 'Check the age pass/fail badge, qualification and pay for each exam. Then use the Lesser-known filter.' }, { title: 'Press Fresh run', body: 'Then open the official notification of each exam you like and check for updates.' }, { title: 'Save or share your shortlist', body: 'Note the exams you will apply for and their official links, then share this page with a friend.' }]} />
      <Card className="mb-5 grid min-w-0 gap-3" data-testid="gov-form"><h2 className="text-xl font-medium">Your details (fill once)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="min-w-0"><Label htmlFor="gd">Date of birth</Label><Input id="gd" type="date" value={p.dob} onChange={set('dob')} /></div>
          <div className="min-w-0"><Label htmlFor="ge">Highest education</Label><Select id="ge" className="w-full" value={p.edu} onChange={(e) => setP({ ...p, edu: e.target.value as Edu, eduSet: true })}>
            {([['10','Class 10'],['12','Class 12'],['iti','ITI'],['diploma','Diploma (engineering)'],['grad','Graduate (any)'],['eng','Engineering graduate (BE/BTech)'],['pg','Postgraduate (MA/MSc/MCom/MBA/LLM/MTech)'],['phd','PhD / doctorate']] as [Edu,string][]).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</Select></div>
          <div className="min-w-0"><Label htmlFor="gs" hint="Class 12">Stream</Label><Select id="gs" className="w-full" value={p.stream12} onChange={set('stream12')}><option value="pcm">Science with Physics & Maths</option><option value="other">Other</option></Select></div>
          <div className="min-w-0"><Label htmlFor="gc">Category</Label><Select id="gc" className="w-full" value={p.cat} onChange={set('cat')}>{(['GEN','EWS','OBC','SC','ST'] as Cat[]).map((c) => <option key={c} value={c}>{c === 'GEN' ? 'General' : c === 'OBC' ? 'OBC (non-creamy layer)' : c}</option>)}</Select></div>
          <div className="min-w-0"><Label htmlFor="gg">Gender</Label><Select id="gg" className="w-full" value={p.gender} onChange={set('gender')}>{(['male','female','other'] as Gender[]).map((g) => <option key={g} value={g}>{g === 'other' ? 'Transgender / other' : g[0].toUpperCase() + g.slice(1)}</option>)}</Select></div>
          <div className="min-w-0"><Label htmlFor="gx" hint="total, all jobs">Years of experience</Label><Input id="gx" type="number" min={0} max={45} value={p.expYears ?? ''} onChange={(e) => setP({ ...p, expYears: e.target.value === '' ? undefined : Math.max(0, Math.min(45, Number(e.target.value))) })} data-testid="gov-exp" /></div>
          <div className="min-w-0"><Label htmlFor="gsp" hint="e.g. LLB = Law">Professional degree</Label><Select id="gsp" className="w-full" value={p.spec || ''} onChange={(e) => setP({ ...p, spec: e.target.value as Spec })} data-testid="gov-spec"><option value="">None</option><option value="law">Law (LLB / LLM)</option><option value="engineering">Engineering / Tech</option><option value="medical">Medical / Health</option><option value="finance">CA / CS / CMA / Finance</option><option value="teaching">Teaching (B.Ed / NET / faculty)</option><option value="other">Other professional</option></Select></div>
          <div className="min-w-0"><Label htmlFor="gst">State</Label><Select id="gst" className="w-full" value={p.state} onChange={set('state')}><option value="">Choose</option>{STATES.map((s) => <option key={s}>{s}</option>)}</Select></div>
          <div className="min-w-0"><Label htmlFor="gcity" hint="optional">City or district</Label><Input id="gcity" value={p.city || ''} onChange={set('city')} placeholder="e.g. Lucknow" data-testid="gov-city" /></div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={p.pwbd} onChange={set('pwbd')} /> Person with benchmark disability (PwBD)</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={p.esm} onChange={set('esm')} /> Ex-serviceman</label>
        </div>
        <div className="flex flex-wrap gap-2"><Button onClick={freshRun} data-testid="gov-fresh"><RefreshCw size={15} /> Fresh run</Button><Button variant="ghost" className="w-fit" onClick={() => setP({ ...p, dob: '2001-05-10', edu: 'grad', cat: 'OBC' })}>Try a sample profile (made up)</Button></div>
        {fresh && <p className="text-sm" role="status" data-testid="gov-fresh-msg">{fresh}</p>}
        <p className="text-xs text-muted-foreground">Fill these once: they are saved in this browser, filled in when you come back, and used to pre-fill every search above (advanced search, labels and ranking).</p>
      </Card>
      {dobInvalid(p.dob) && <p className="mb-5 text-sm text-red-700" role="alert" data-testid="gov-dob-invalid">Invalid date: date of birth must be in the past.</p>}
      {p.dob && !dobInvalid(p.dob) && <Card className="mb-5 grid min-w-0 gap-3" data-testid="gov-results">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-medium">You may be eligible for {n} of {EXAMS.length}</h2><Badge tone="gold">{nl} lesser-known</Badge></div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={lesserOnly} onChange={(e) => setLesserOnly(e.target.checked)} data-testid="gov-lesser" /> Lesser-known only</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Also show ones I don't qualify for</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={allLevels} onChange={(e) => setAllLevels(e.target.checked)} data-testid="gov-exam-all-levels" /> Show all levels</label>
        </div>
        {!allLevels && farN > 0 && <p className="text-xs text-muted-foreground" data-testid="gov-exam-hidden">{farN} entry-level exam{farN === 1 ? '' : 's'} for Class 10 / 12 (MTS, GD constable, clerk, Group D) hidden because they are far below your qualification. Tick "Show all levels" to see them.</p>}
        {p.esm && <p className="text-sm text-muted-foreground">Ex-servicemen relaxation is calculated from your service period, so it is not added below. See the note on each exam and the notification.</p>}
        <ul className="grid gap-3">{list.map(({ exam: e, age, upper, ok, why }) => <li key={e.id} className="min-w-0 rounded-lg border border-border p-3 [overflow-wrap:anywhere]" data-testid="gov-exam">
          <div className="flex flex-wrap items-center gap-2"><b>{e.name}</b>{e.lesser && <Badge tone="gold">Lesser-known</Badge>}<Badge tone={ok ? 'primary' : 'danger'}>{ok ? 'Likely eligible' : 'Not eligible'}</Badge><span className="text-xs text-muted-foreground">{e.group} · {e.body}</span></div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3" data-testid="gov-age">
            <div className="rounded-lg bg-muted/50 p-2"><div className="text-xs text-muted-foreground">Your age (on {e.asOn})</div><div className="font-mono text-lg">{age} yrs</div></div>
            <div className="rounded-lg bg-muted/50 p-2"><div className="text-xs text-muted-foreground">Eligible age limit</div><div className="font-mono text-lg">{e.minAge} to {upper} yrs</div><div className="text-xs text-muted-foreground">{upper - e.maxAge > 0 ? `after ${upper - e.maxAge} yrs relaxation` : 'no relaxation applied'}</div></div>
            <div className="flex items-center rounded-lg bg-muted/50 p-2"><Badge tone={age >= e.minAge && age <= upper ? 'primary' : 'danger'}>{age >= e.minAge && age <= upper ? '✓ Age: pass' : '✗ Age: fail'}</Badge></div>
          </div>
          <div className="mt-1 text-sm">Qualification: {e.qual}.</div>
          <div className="text-sm" data-testid="gov-pay">Pay: {e.pay ? <>{e.pay.text} <a className="text-primary underline" href={e.pay.src} target="_blank" rel="noopener noreferrer">source</a></> : <span className="text-muted-foreground">see the official notification (not yet verified here)</span>}</div>
          {ok && <div className={upper - age <= 1 ? 'text-sm font-medium text-red-700' : 'text-sm'} data-testid="gov-radar">Deadline radar (beta): {upper - age <= 0 ? 'this is your last eligible cycle by age' : `about ${upper - age} more year${upper - age === 1 ? '' : 's'} before you cross the age limit`}, counted on this notification's date.</div>}
          {e.note && <div className="text-sm text-muted-foreground">{e.note}</div>}
          {p.esm && e.esmNote && <div className="text-sm text-muted-foreground">{e.esmNote}</div>}
          {!ok && <ul className="mt-1 list-disc pl-5 text-sm text-red-700">{why.map((w) => <li key={w}>{w}</li>)}</ul>}
          <div className="mt-1 flex flex-wrap gap-3 text-sm"><a className="text-primary underline" href={e.src} target="_blank" rel="noopener noreferrer">Official notification / source</a><a className="text-primary underline" href={e.site} target="_blank" rel="noopener noreferrer">Official site</a><span className="text-xs text-muted-foreground">Last verified {e.verified}{daysSince(e.verified) > STALE_DAYS && <b className="text-red-700"> · may be out of date</b>}. Check the official notice for updates.</span></div>
        </li>)}</ul>
        {list.length === 0 && <p className="text-sm">Nothing matches these filters.</p>}
      </Card>}
      <Card className="grid min-w-0 gap-2"><h2 className="text-xl font-medium">How this works</h2>
        <p className="text-sm">Age limits and qualifications are copied by hand from each body's latest notification (checked {VERIFIED}). Age is worked out on the date that notification uses, so the next cycle may differ. Relaxation shown: OBC 3, SC/ST 5, PwBD 10 years where the notice allows it. State PSC exams{p.state ? ` for ${p.state}` : ''} are not listed yet because we only add exams we have verified; check your state Public Service Commission's site.</p>
        <p className="text-xs text-muted-foreground">{CREDIT}.</p></Card>
      </>}
    </>
  );
}
