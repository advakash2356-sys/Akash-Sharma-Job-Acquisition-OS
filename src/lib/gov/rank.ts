// Ranking and eligibility hints for live postings (playbook §2 and §6, simplified). Not legal advice. Akash Sync Agent.
import { ageOn, type Profile } from '../govJobs';
export interface RankInput { lastDate: string; lesserKnown: boolean; pay: string; vacancies: string; official: boolean; title: string; org: string; eligibility: string; state: string; level?: string; employmentType?: string; maxAge?: number; minAge?: number; eduTags?: string[] }
export const daysLeft = (d: string, today = new Date().toISOString().slice(0, 10)) => Math.ceil((Date.parse(d) - Date.parse(today)) / 864e5);
/** 0-100ish: urgency (closing within 14 days), lesser-known boost, data quality, keyword relevance. */
export function rankScore(p: RankInput, keywords: string[] = [], today?: string): number {
  const dl = daysLeft(p.lastDate, today);
  const urgency = dl <= 14 ? Math.max(0, 30 - dl) * 1.5 : 10;
  const discovery = p.lesserKnown ? 25 : 0;
  const quality = (/\d/.test(p.pay) ? 15 : 0) + (/\d/.test(p.vacancies) ? 10 : 0) + (p.official ? 5 : 0);
  const hay = `${p.title} ${p.org} ${p.eligibility}`.toLowerCase(); const ks = keywords.map((k) => k.toLowerCase()).filter(Boolean);
  const relevance = ks.length ? (ks.filter((k) => hay.includes(k)).length / ks.length) * 30 : 0;
  return Math.round(urgency + discovery + quality + relevance);
}
/** DoPT baseline upper-age relaxation (central posts; a notice can differ). */
export function relaxation(p: Pick<Profile, 'cat' | 'pwbd'>) { const base = p.cat === 'OBC' ? 3 : p.cat === 'SC' || p.cat === 'ST' ? 5 : 0; return base + (p.pwbd ? 10 : 0); }
const EDU_RANK: Record<string, number> = { '10': 1, '12': 2, iti: 2, diploma: 2, grad: 3, eng: 3, pg: 4 };
const TAG_RANK: Record<string, number> = { '10TH': 1, '12TH': 2, ITI: 2, DIPLOMA: 2, GRADUATE: 3, ENGINEERING: 3, LAW: 3, MEDICAL: 3, PG: 4, PHD: 5 };
export type Badge = 'likely' | 'verify' | 'maynot';
export const BADGE_TEXT: Record<Badge, string> = { likely: 'Likely eligible: check official notification', verify: 'Needs verification (check sub-clauses)', maynot: 'May not qualify: check relaxations in notice' };
/** Three states only, never "100% eligible". Uses only what the notice text states; unknowns mean "verify". */
export function eligibilityBadge(p: RankInput, prof: Profile | null, today = new Date().toISOString().slice(0, 10)): { badge: Badge; why: string[] } {
  const why: string[] = [];
  if (p.employmentType === 'deputation') return { badge: 'maynot', why: ['Deputation posts are only for serving government employees.'] };
  const fit = prof ? profileFit(p, prof) : null;
  if (fit?.belowLevel) return { badge: 'maynot', why: [`Junior / entry-level post: below your ${prof!.expYears} yrs experience and ${prof!.spec === 'law' ? 'law degree' : 'graduate'} profile. Hidden from Best match.`] };
  if (!prof?.dob) return { badge: 'verify', why: ['Add your date of birth and education below to get a hint.'] };
  let bad = false, known = 0;
  const age = ageOn(prof.dob, p.lastDate || today);
  const stateMismatch = p.level === 'state' && prof.state && p.state && p.state !== 'All India' && p.state.toLowerCase() !== prof.state.toLowerCase();
  const relax = stateMismatch ? (prof.pwbd ? 10 : 0) : relaxation(prof);
  if (p.maxAge) { known++; const cap = p.maxAge + relax; if (age > cap) { bad = true; why.push(`Your age on the last date is about ${age}; stated limit ${p.maxAge}${relax ? ` (+${relax} relaxation = ${cap})` : ''}.`); } else why.push(`Age ${age} within ${p.maxAge}${relax ? ` + ${relax}` : ''} yrs.`); }
  if (p.minAge && age < p.minAge) { bad = true; why.push(`Minimum age ${p.minAge}.`); }
  if (p.eduTags?.length) { known++; const need = Math.min(...p.eduTags.map((t) => TAG_RANK[t] || 3)); const have = EDU_RANK[prof.edu] || 0; if (have < need) { bad = true; why.push('The notice seems to need a higher qualification than yours.'); } else why.push('Your education level looks enough.'); }
  if (stateMismatch) why.push(`State post in ${p.state}: reserved-category relaxation usually needs that state's domicile.`);
  if (fit?.field) why.push(`Matches your ${prof!.spec} background.`);
  if (fit && isExperienced(prof) && fit.tier === 'senior') why.push('Officer / specialist level post: suits your experience. Check the experience clause in the notice.');
  if (bad) return { badge: 'maynot', why };
  return known >= 2 ? { badge: 'likely', why } : { badge: 'verify', why: why.length ? why : ['Age or qualification not stated in the feed text.'] };
}
// ---- Profile fit (t326u): experience, degree and career level drive "Best match". Uses only the posting's own text. ----
export type Tier = 'junior' | 'mid' | 'senior';
const JUNIOR = /\b(group\s*[cd]|multi[- ]?tasking|mts|gds|gramin dak|dak sevak|constable|peon|sweeper|safai|chowkidar|watchman|helper|attendant|driver|cook|mali|apprentice|trainee clerk|clerk|lower division|ldc|udc|typist|data entry|deo|stenographer|steno|junior assistant|office assistant|record keeper|process server|bailiff|chaprasi|orderly|daftary|home guard|agniveer|tradesman|khalasi|track maintainer|lab attendant)\b|10th pass|12th pass|matric|ssc\s*\(?10|level[- ]?[1-3]\b/i;
const SENIOR = /\b(group\s*a|gazetted|officer|manager|director|deputy|assistant (?:director|commissioner|professor|registrar|legal adviser|public prosecutor)|registrar|judge|judicial|magistrate|civil judge|public prosecutor|prosecutor|counsel|advocate|legal (?:advisor|adviser|officer|consultant|manager|assistant|associate)|law officer|standing counsel|consultant|specialist|scientist|engineer|professor|lecturer|member|commissioner|controller|superintendent|executive|head|chief|lateral)\b|level[- ]?(?:1[0-8]|[7-9])\b|post[- ]?qualification experience|years?(?:'|’)? (?:of )?experience/i;
const SPEC_RE: Record<string, RegExp> = { law: /\b(law|legal|llb|ll\.b|llm|advocate|judicial|judge|judiciary|court|tribunal|prosecutor|counsel|bar council|registrar|magistrate|notary|regulatory|compliance)\b/i, engineering: /\b(engineer|engineering|b\.?e\b|b\.?tech|technical|gate)\b/i, medical: /\b(medical|mbbs|doctor|nurse|pharmac|health|dental|ayush)\b/i, finance: /\b(accounts?|finance|chartered accountant|\bca\b|cma|icwa|company secretary|audit|treasury)\b/i, other: /$^/ };
export function tierOf(p: Pick<RankInput, 'title' | 'org' | 'eligibility' | 'pay'> & { eduTags?: string[] }): Tier {
  const t = `${p.title} ${p.eligibility} ${p.pay}`;
  const jr = JUNIOR.test(t) || (!!p.eduTags?.length && p.eduTags.every((x) => ['10TH', '12TH', 'ITI'].includes(x)));
  if (SENIOR.test(`${p.title} ${p.pay}`) && !/\b(junior|clerk|mts|gds|constable|peon|stenographer|typist|trainee)\b/i.test(p.title)) return 'senior';
  return jr ? 'junior' : 'mid';
}
export const isExperienced = (prof?: Profile | null) => !!prof && (prof.expYears ?? 0) >= 5 && (EDU_RANK[prof.edu] || 0) >= 3;
/** Points added to rankScore and a reason. Experienced graduates: junior posts sink hard, senior/field-matched posts rise. Juniors/freshers: entry posts stay. */
export function profileFit(p: RankInput, prof?: Profile | null): { pts: number; tier: Tier; field: boolean; belowLevel: boolean } {
  const tier = tierOf(p); const field = !!prof?.spec && !!SPEC_RE[prof.spec]?.test(`${p.title} ${p.org} ${p.eligibility}`);
  if (!prof) return { pts: 0, tier, field, belowLevel: false };
  const exp = prof.expYears ?? 0, senior = isExperienced(prof);
  let pts = field ? 25 : 0;
  if (senior) pts += tier === 'senior' ? 30 + Math.min(10, exp) : tier === 'mid' ? 0 : -80;
  else if (exp <= 2) pts += tier === 'junior' ? 10 : tier === 'senior' && !field ? -5 : 0;
  return { pts, tier, field, belowLevel: senior && tier === 'junior' };
}
