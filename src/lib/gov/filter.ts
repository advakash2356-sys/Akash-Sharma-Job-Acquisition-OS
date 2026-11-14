// Pure filter for live postings (so CI can test it with fixtures). Akash Sync Agent.
import { daysLeft } from './rank';
export interface Filter { q: string; state: string; lesser: boolean; official: boolean; soon: boolean; deputation: boolean }
export interface Filterable { title: string; org: string; location: string; eligibility: string; state: string; lesserKnown: boolean; official: boolean; lastDate: string; employmentType?: string }
export function filterPostings<T extends Filterable>(list: T[], f: Filter, today?: string): T[] {
  return list.filter((p) => (!f.state || p.state === f.state || p.state === 'All India') && (!f.lesser || p.lesserKnown) && (!f.official || p.official) && (!f.soon || daysLeft(p.lastDate, today) <= 7)
    && (f.deputation || p.employmentType !== 'deputation')
    && (!f.q || `${p.title} ${p.org} ${p.location} ${p.eligibility}`.toLowerCase().includes(f.q.toLowerCase())));
}

// ---- Advanced search (t385u): every qualification level, sector, department, place, job level, type and category. ----
// Pure and fixture-tested. Uses only what the posting text states; an unknown field never hides a post unless asked.
import { EDU_RANK, TAG_RANK, relaxation, tierOf, type RankInput } from './rank';
import { ageOn, type Cat, type Profile } from '../govJobs';
import { disciplineGate, experienceGate, licenceGate } from './gates';
import { factsOf, qualGate } from './notice';
export const QUALS: [string, string][] = [['10TH', '10th'], ['12TH', '12th'], ['ITI', 'ITI'], ['DIPLOMA', 'Diploma'], ['GRADUATE', 'Graduate'], ['ENGINEERING', 'Engineering (BE/BTech)'], ['LAW', 'Law (LLB/LLM)'], ['MEDICAL', 'Medical / Nursing / Pharmacy'], ['PG', 'Postgraduate'], ['PHD', 'PhD']];
export const SECTORS: [string, string][] = [['central', 'Central government'], ['state', 'State government'], ['psu', 'PSU / public bank'], ['autonomous', 'Research, universities, institutes'], ['judiciary', 'Courts / judiciary'], ['defence', 'Defence / police forces'], ['regulator', 'Regulators (RBI, SEBI…)'], ['local', 'Municipal / district']];
export const TIERS: [string, string][] = [['junior', 'Entry (Group C/D, MTS, clerk)'], ['mid', 'Middle (assistant, technical, JE)'], ['senior', 'Officer / specialist (Group A/B)']];
export const EMP: [string, string][] = [['permanent', 'Permanent'], ['contractual', 'Contract'], ['apprenticeship', 'Apprenticeship'], ['fellowship', 'Fellowship / Young Professional']];
export interface Adv { quals: string[]; unstated: boolean; sectors: string[]; tiers: string[]; emp: string[]; dept: string; city: string; cat: '' | Cat; ageFit: boolean; qualFit: boolean }
export const ADV0: Adv = { quals: [], unstated: true, sectors: [], tiers: [], emp: [], dept: '', city: '', cat: '', ageFit: false, qualFit: false };
type AdvPost = Filterable & RankInput & { location: string; level?: string };
/** Profile with the advanced-search category override applied (blank = use "Your details"). */
export const withCat = (prof: Profile | null | undefined, a: Partial<Adv>): Profile | null => (prof ? { ...prof, cat: a.cat || prof.cat } : null);
/** Age on the last date vs the stated limit with category relaxation; null when the notice states no limit or DOB is missing. */
export function ageFits(p: AdvPost, prof: Profile | null, today = new Date().toISOString().slice(0, 10)): boolean | null {
  if (!prof?.dob || (!p.maxAge && !p.minAge)) return null;
  const age = ageOn(prof.dob, p.lastDate || today);
  const stateMismatch = p.level === 'state' && prof.state && p.state && p.state !== 'All India' && p.state.toLowerCase() !== prof.state.toLowerCase();
  const cap = (p.maxAge || 99) + relaxation(prof, !stateMismatch);
  return age <= cap && (!p.minAge || age >= p.minAge);
}
/** Lowest qualification the notice asks for is at or below the user's (null when not stated). */
/** t386u M1: subject-aware. False when the post needs a professional degree / discipline the person does not hold, a licence
 *  they said they do not hold, or more experience than they have. Unknowns never hide (null). */
export function qualFits(p: Pick<RankInput, 'eduTags'> & Partial<Pick<RankInput, 'title' | 'eligibility' | 'pay' | 'facts'>>, prof: Profile | null): boolean | null {
  if (!prof) return null; const tp = { title: p.title || '', eligibility: p.eligibility || '', pay: p.pay || '', facts: p.facts, eduTags: p.eduTags }; const f = factsOf(tp);
  // A gate with ok=null and no reason means "not required by the notice"; with a reason it is an unknown to check.
  const gs = [qualGate(f, prof), disciplineGate(tp, prof), licenceGate(tp, prof), experienceGate(tp, prof)];
  const gates = gs.map((g) => (g.ok === null && !g.why ? true : g.ok));
  if (gates.includes(false)) return false;
  // t386u M6: officer / degree-level posts are not open to 10th / 12th / ITI profiles.
  const school = ['10', '12', 'iti'].includes(prof.edu);
  if (school && (f.isOfficer && (f.minEdu === null || f.minEdu >= 3) || (f.minEdu !== null && f.minEdu >= 3) || tierOf({ title: tp.title, org: '', eligibility: tp.eligibility, pay: tp.pay, eduTags: p.eduTags }) === 'senior')) return false;
  return gates.includes(null) ? null : true;
}
export function advancedFilter<T extends AdvPost>(list: T[], a: Partial<Adv>, prof?: Profile | null, today?: string): T[] {
  const x = { ...ADV0, ...a }; const pr = withCat(prof, x); const dept = x.dept.trim().toLowerCase(), city = x.city.trim().toLowerCase();
  return list.filter((p) => {
    const tags = p.eduTags || [];
    if (x.quals.length && !(tags.length ? tags.some((t) => x.quals.includes(t)) : x.unstated)) return false;
    if (x.sectors.length && !x.sectors.includes(p.level || 'state')) return false;
    if (x.tiers.length && !x.tiers.includes(tierOf(p))) return false;
    if (x.emp.length && !x.emp.includes(p.employmentType || 'permanent')) return false;
    if (dept && !p.org.toLowerCase().includes(dept)) return false;
    if (city && !`${p.location} ${p.title} ${p.org} ${p.state}`.toLowerCase().includes(city)) return false;
    if (x.ageFit && ageFits(p, pr, today) === false) return false;
    if (x.qualFit && qualFits(p, pr) === false) return false;
    return true;
  });
}
/** "Use my details": one-time profile fills the search (age with category relaxation, qualification). Level filtering stays automatic (no junior posts forced on graduates). */
export function advFromProfile(prof: Profile | null | undefined, cur: Partial<Adv> = {}): Partial<Adv> & { state?: string } {
  if (!prof) return cur;
  // State and city are NOT hard filters here: many notices do not state a place, so your state/city lift posts in Best match instead.
  return { ...cur, cat: '', ageFit: !!prof.dob, qualFit: true };
}
/** True once the person has told us anything that should shape results (education picked, DOB, degree, experience, subjects). */
export const hasDetails = (p?: Profile | null): boolean => !!p && (!!p.eduSet || !!p.dob || !!p.spec || p.expYears !== undefined || !!p.subject);
/** Number of advanced filters in use (for the toggle label). */
export const advCount = (a: Partial<Adv>) => { const x = { ...ADV0, ...a }; return [x.quals.length, x.sectors.length, x.tiers.length, x.emp.length, x.dept, x.city, x.cat, x.ageFit, x.qualFit].filter(Boolean).length; };

// ---- One pipeline for the page and the tests (t385u): basic filters → advanced filters → level hiding → profession-first order. ----
import { compareKeys, eligibilityBadge, placeScore, profileFit, profileOverlap, profileSortKey, rankScore } from './rank';
export interface Search extends Filter { sort: string; allLevels?: boolean; adv?: Partial<Adv> }
export function govResults<T extends AdvPost>(list: T[], f: Search, prof?: Profile | null, keywords: string[] = [], today?: string): { list: T[]; hidden: number; far: number } {
  const pr = withCat(prof, f.adv || {});
  const showAll = !!f.allLevels || !!f.adv?.tiers?.includes('junior');
  // A notice read (PDF / the user's own key) as a list, test, result, appointment or retired-only notice is never shown, even under Show all levels.
  const open = list.filter((p) => { const t = (p as { facts?: { noticeType?: string } }).facts?.noticeType; return !t || t === 'open_call' || t === 'unclear' || t === 'other'; });
  const base = advancedFilter(filterPostings(open, f, today), f.adv || {}, prof, today);
  // t386u L3: "Only near me" (relocate = false) really filters: posts tied to another state are left out (All India / unstated stay).
  const near = pr?.relocate === false ? base.filter((p) => placeScore(p, pr) > 0) : base;
  // Count only out-of-state posts that would otherwise be shown (not ones the level floor already hides).
  // No false hope: posts below the level floor, or failing a STATED essential condition (degree, experience, licence, age), are
  // hidden unless "Show all levels"; there they carry the reason. Unknown conditions never hide (they show as Check notice).
  const shown = (p: T) => !profileFit(p, pr).belowLevel && (!pr || p.employmentType === 'deputation' || eligibilityBadge(p, pr, today).badge !== 'maynot');
  const far = base.filter((p) => !near.includes(p) && (showAll || shown(p))).length;
  const kept = showAll ? near : near.filter(shown);
  const score = (p: T) => { const fit = profileFit(p, pr); return rankScore(p, f.q.split(/[\s,]+/), today) + fit.pts + (fit.subjects ? 0 : profileOverlap(p, keywords).pts); };
  const sorted = kept.map((p) => ({ p, s: score(p), k: pr ? profileSortKey(p, pr, today) : [] }))
    .sort((a, b) => (f.sort === 'rank' ? (pr ? compareKeys(a.k, b.k) : 0) || b.s - a.s : 0) || a.p.lastDate.localeCompare(b.p.lastDate)).map((x) => x.p);
  return { list: sorted, hidden: near.length - kept.length, far };
}
