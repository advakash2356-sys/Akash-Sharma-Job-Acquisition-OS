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
  if (!prof?.dob) return { badge: 'verify', why: ['Add your date of birth and education below to get a hint.'] };
  let bad = false, known = 0;
  const age = ageOn(prof.dob, p.lastDate || today);
  const stateMismatch = p.level === 'state' && prof.state && p.state && p.state !== 'All India' && p.state.toLowerCase() !== prof.state.toLowerCase();
  const relax = stateMismatch ? (prof.pwbd ? 10 : 0) : relaxation(prof);
  if (p.maxAge) { known++; const cap = p.maxAge + relax; if (age > cap) { bad = true; why.push(`Your age on the last date is about ${age}; stated limit ${p.maxAge}${relax ? ` (+${relax} relaxation = ${cap})` : ''}.`); } else why.push(`Age ${age} within ${p.maxAge}${relax ? ` + ${relax}` : ''} yrs.`); }
  if (p.minAge && age < p.minAge) { bad = true; why.push(`Minimum age ${p.minAge}.`); }
  if (p.eduTags?.length) { known++; const need = Math.min(...p.eduTags.map((t) => TAG_RANK[t] || 3)); const have = EDU_RANK[prof.edu] || 0; if (have < need) { bad = true; why.push('The notice seems to need a higher qualification than yours.'); } else why.push('Your education level looks enough.'); }
  if (stateMismatch) why.push(`State post in ${p.state}: reserved-category relaxation usually needs that state's domicile.`);
  if (bad) return { badge: 'maynot', why };
  return known >= 2 ? { badge: 'likely', why } : { badge: 'verify', why: why.length ? why : ['Age or qualification not stated in the feed text.'] };
}
