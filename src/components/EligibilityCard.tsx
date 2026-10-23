import { Globe2 } from 'lucide-react';
import { Card, Label } from './ui';
import { useApp } from '../lib/state';
import { candidateOf } from '../lib/jobSearch';
import { ALL_COUNTRIES, COUNTRY_NAME, homeTz, type Candidate, type Shift, type WorkMode } from '../lib/eligibility';

const SHIFTS: { id: Shift; label: string }[] = [{ id: 'local', label: 'My local hours' }, { id: 'us', label: 'US hours (night shift from India)' }, { id: 'uk-eu', label: 'UK / Europe hours' }, { id: 'any', label: 'Any hours' }];
const MODES: { id: WorkMode; label: string }[] = [{ id: 'onsite', label: 'On-site' }, { id: 'hybrid', label: 'Hybrid' }, { id: 'remote', label: 'Remote' }];
const n = (c: string) => COUNTRY_NAME[c] || c;

export function eligSummary(c: Candidate) {
  return `Searching for: ${c.modes.map((m) => (m === 'onsite' ? 'on-site' : m)).join(', ') || 'nothing'} work${c.modes.some((m) => m !== 'remote') ? ` in ${c.city ? `${c.city}, ` : ''}${n(c.residence)}${c.relocate && c.relocateCountries.length ? ` (or relocating to ${c.relocateCountries.map(n).join(', ')})` : ''}` : ''}${c.modes.includes('remote') ? `; remote roles that accept people in ${n(c.residence)}${c.authorizedIn.filter((x) => x !== c.residence).length ? ` or authorised in ${c.authorizedIn.filter((x) => x !== c.residence).map(n).join(', ')}` : ''}${c.shift === 'us' ? ', US hours preferred' : c.shift === 'uk-eu' ? ', UK/EU hours preferred' : ''}` : ''}.`;
}

/** "Where you can work": residence, work authorisation, relocation, modes, shift. Pre-filled from the resume; every field is editable. */
export default function EligibilityCard() {
  const { profile, setProfile } = useApp();
  const c = candidateOf(profile);
  const set = (patch: Partial<Candidate>) => setProfile((p) => ({ ...p, elig: { ...candidateOf(p), ...patch }, setupDone: p.setupDone }));
  const toggle = (list: string[], x: string) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
  const sel = 'h-11 w-full rounded-lg border border-border bg-background px-3 text-sm';
  return (
    <Card className="grid gap-4" data-testid="eligibility-card">
      <div className="flex items-center gap-2"><Globe2 size={18} className="text-primary" /><h2 className="text-2xl">Where you can work</h2></div>
      <p className="text-sm text-muted-foreground">{profile.elig ? 'Your choices.' : 'Suggested from your resume; change anything.'} Jobs are matched on what each posting says about remote, hybrid or on-site work and who may apply from where. Postings that do not say are shown and marked “eligibility unclear”.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="el-res">Country you live in</Label>
          <select id="el-res" className={sel} value={c.residence} onChange={(e) => set({ residence: e.target.value, authorizedIn: [...new Set([e.target.value, ...c.authorizedIn.filter((x) => x !== c.residence)])], tzOffset: homeTz(e.target.value) })}>
            {ALL_COUNTRIES.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}</select></div>
        <div><Label htmlFor="el-city">City</Label><input id="el-city" className={sel} value={c.city || ''} onChange={(e) => set({ city: e.target.value.slice(0, 40) })} placeholder="e.g. Gurugram" /></div>
        <div><Label htmlFor="el-auth">Also authorised to work in (hold a visa, citizenship or permit)</Label>
          <select id="el-auth" multiple size={4} className={`${sel} h-auto`} value={c.authorizedIn.filter((x) => x !== c.residence)} onChange={(e) => set({ authorizedIn: [c.residence, ...[...e.target.selectedOptions].map((o) => o.value)] })}>
            {ALL_COUNTRIES.filter((x) => x.code !== c.residence).map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}</select>
          <p className="mt-1 text-xs text-muted-foreground">Ctrl/Cmd-click to pick several. Leave empty if you only have the right to work where you live.</p></div>
        <div><Label htmlFor="el-shift">Hours you can work</Label>
          <select id="el-shift" className={sel} value={c.shift} onChange={(e) => set({ shift: e.target.value as Shift })}>{SHIFTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
      </div>
      <fieldset className="flex flex-wrap gap-4 text-sm"><legend className="mb-1 text-sm font-medium">Work modes you want</legend>
        {MODES.map((m) => <label key={m.id} className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={c.modes.includes(m.id)} onChange={() => set({ modes: toggle(c.modes, m.id) as WorkMode[] })} /> {m.label}</label>)}</fieldset>
      <div className="grid gap-2 text-sm">
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={c.relocate} onChange={(e) => set({ relocate: e.target.checked })} /> Open to relocating for on-site or hybrid roles</label>
        {c.relocate && <div><Label htmlFor="el-rel">Countries you would move to</Label>
          <select id="el-rel" multiple size={4} className={`${sel} h-auto`} value={c.relocateCountries} onChange={(e) => set({ relocateCountries: [...e.target.selectedOptions].map((o) => o.value) })}>
            {ALL_COUNTRIES.filter((x) => x.code !== c.residence).map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}</select></div>}
      </div>
      <p className="rounded-lg bg-muted p-3 text-sm" data-testid="elig-card-summary">{eligSummary(c)} New searches use this; run the search again on Guided setup to refresh your list.</p>
    </Card>
  );
}
