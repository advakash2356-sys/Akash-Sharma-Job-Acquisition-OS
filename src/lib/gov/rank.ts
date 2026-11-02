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
  if (fit?.subjects?.length) why.push(`Check the required subject: ${fit.subjects.join(' / ')}. Your degree does not seem to match.`);
  if (fit?.field) why.push(`Matches your ${prof!.spec} background.`);
  if (fit && !fit.subjects && isExperienced(prof) && fit.tier === 'senior') why.push('Officer / specialist level post: suits your experience. Check the experience clause in the notice.');
  if (bad) return { badge: 'maynot', why };
  return known >= 2 ? { badge: 'likely', why } : { badge: 'verify', why: why.length ? why : ['Age or qualification not stated in the feed text.'] };
}
// ---- Profile fit (t326u): experience, degree and career level drive "Best match". Uses only the posting's own text. ----
export type Tier = 'junior' | 'mid' | 'senior';
const JUNIOR = /\b(group\s*[cd]|multi[- ]?tasking|mts|gds|gramin dak|dak sevak|constable|peon|sweeper|safai|chowkidar|watchman|helper|attendant|driver|cook|mali|apprentice|trainee clerk|clerk|lower division|ldc|udc|typist|data entry|deo|stenographer|steno|junior assistant|office assistant|record keeper|process server|bailiff|chaprasi|orderly|daftary|home guard|agniveer|tradesman|khalasi|track maintainer|lab attendant)\b|10th pass|12th pass|matric|ssc\s*\(?10|level[- ]?[1-3]\b/i;
const SENIOR_TITLE = /\b(gazetted|judge|judicial|magistrate|public prosecutor|prosecutor|counsel|legal (?:advisor|adviser|officer|consultant|manager)|law officer|scientist|professor|director|deputy|commissioner|registrar|under secretary|secretary|controller|superintendent of police|lateral)\b/i;
const NOT_SENIOR = /\b(junior|clerk|mts|gds|constable|peon|stenographer|typist|trainee|train manager|guard|ticket|commercial cum|station master|loco pilot|goods)\b|group\s*[cd]\b/i;
const LAW_RE = /\b(law|legal|llb|ll\.b|llm|advocate|judicial|judge|judiciary|court|tribunal|prosecutor|counsel|bar council|magistrate|notary)\b/i;
const SPEC_RE: Record<string, RegExp> = { law: LAW_RE, engineering: /\b(engineer|engineering|b\.?e\b|b\.?tech|technical|gate)\b/i, medical: /\b(medical|mbbs|doctor|nurse|pharmac|health|dental|ayush)\b/i, finance: /\b(accounts?|finance|chartered accountant|\bca\b|cma|icwa|company secretary|audit|treasury)\b/i, other: /$^/ };
/** Pay level and lowest basic stated in the pay text, if any. */
export function payFacts(pay: string): { level?: number; basic?: number } {
  const l = pay.match(/level[- ]?(\d{1,2})\b/i); const n = (pay.match(/\d{1,3}(?:,\d{2,3})+|\d{5,6}/g) || []).map((x) => Number(x.replace(/,/g, ''))).filter((x) => x >= 5000);
  return { level: l ? Number(l[1]) : undefined, basic: n.length ? Math.min(...n) : undefined };
}
/** Senior = Group A/B, Gazetted, Level 10+ or basic >= Rs 56,100 when pay is known; otherwise only clear officer-grade titles. "Manager"/"supervisor" alone is not enough. */
export function tierOf(p: Pick<RankInput, 'title' | 'org' | 'eligibility' | 'pay'> & { eduTags?: string[] }): Tier {
  const t = `${p.title} ${p.eligibility} ${p.pay}`;
  const jr = JUNIOR.test(t) || NOT_SENIOR.test(p.title) && /group\s*[cd]\b/i.test(t) || (!!p.eduTags?.length && p.eduTags.every((x) => ['10TH', '12TH', 'ITI'].includes(x)));
  if (NOT_SENIOR.test(p.title) || /group\s*[cd]\b/i.test(t)) return jr ? 'junior' : 'mid';
  if (/group\s*[ab]\b|gazetted/i.test(t)) return 'senior';
  const { level, basic } = payFacts(p.pay);
  if (level !== undefined || basic !== undefined) return (level ?? 0) >= 10 || (basic ?? 0) >= 56100 ? 'senior' : jr ? 'junior' : 'mid';
  if (SENIOR_TITLE.test(p.title)) return 'senior';
  return jr ? 'junior' : 'mid';
}
/** 1 school/ITI, 2 diploma/12th, 3 graduate, 4 postgraduate/professional/5+ years. */
export const userLevel = (prof?: Profile | null) => !prof ? 0 : Math.max(EDU_RANK[prof.edu] || 0, (prof.spec && prof.spec !== 'other') || (prof.expYears ?? 0) >= 5 ? 4 : 0);
export const isExperienced = (prof?: Profile | null) => !!prof && (prof.expYears ?? 0) >= 5 && (EDU_RANK[prof.edu] || 0) >= 3;
/** Points added to rankScore and a reason. Experienced graduates: junior posts sink hard, senior/field-matched posts rise. Juniors/freshers: entry posts stay. */
export function profileFit(p: RankInput, prof?: Profile | null): { pts: number; tier: Tier; field: boolean; belowLevel: boolean; subjects?: string[] } {
  const tier = tierOf(p); const field = !!prof?.spec && !!SPEC_RE[prof.spec]?.test(`${p.title} ${p.eligibility}`); // org name never counts (t326u NO-GO)
  if (!prof) return { pts: 0, tier, field, belowLevel: false };
  const exp = prof.expYears ?? 0, senior = isExperienced(prof);
  const subj = subjectFit(p.eligibility, prof.spec); if (subj.fits === false) return { pts: -30, tier, field: false, belowLevel: false, subjects: subj.named };
  let pts = field ? 25 : 0;
  if (senior) pts += tier === 'senior' ? 30 + Math.min(10, exp) : tier === 'mid' ? 0 : -80;
  else if (exp <= 2) pts += tier === 'junior' ? 10 : tier === 'senior' && !field ? -5 : 0;
  // t347u qualification-tier filter: postgraduates, professionals (law/medical/finance/engineering) or 5+ years never see
  // peon / MTS / Group C-D clerical posts unless they opt in to "Show all levels". Officer, specialist and lateral roles in
  // the user's subject rank higher.
  const lateral = /\b(consultant|young professional|advis[eo]r|specialist|expert|fellow|lateral|deputation)\b/i.test(p.title);
  if (lateral && field) pts += 20;
  return { pts, tier, field, belowLevel: tier === 'junior' && userLevel(prof) >= 4 };
}

// ---- Required-subject check (t329u): officer boost needs subject fit when the notice names subjects. ----
const SUBJECTS: [string, RegExp][] = [['Law', /\b(law|llb|ll\.b|llm|legal)\b/i], ['Engineering', /\b(engineering|b\.?e\b|b\.?tech|gate)\b/i], ['Medical', /\b(mbbs|md\b|medical|nursing|pharma\w*|dental)\b/i], ['Commerce / Finance', /\b(commerce|b\.?com|accounts?|chartered accountant|cma|icwa|finance|economics)\b/i],
  ['Biological Sciences', /\b(biolog\w*|bio[- ]?science|zoology|botany|microbiology|biotechnology)\b/i], ['Agriculture', /\b(agricultur\w*|agri|horticulture|forestry)\b/i], ['Science', /\b(chemistry|physics|phd in science|environmental sciences?|ecology)\b/i], ['Computer Science', /\b(computer science|mca|information technology)\b/i]];
const SPEC_SUBJ: Record<string, string[]> = { law: ['Law'], engineering: ['Engineering', 'Computer Science', 'Science'], medical: ['Medical', 'Biological Sciences', 'Science'], finance: ['Commerce / Finance'] };
/** Subjects named in the eligibility text, and whether the user's professional degree is among them (null = unknown). */
export function subjectFit(eligibility: string, spec?: string): { named: string[]; fits: boolean | null } {
  const named = SUBJECTS.filter(([, re]) => re.test(eligibility)).map(([n]) => n);
  if (!named.length || !spec || !SPEC_SUBJ[spec]) return { named, fits: null };
  return { named, fits: named.some((n) => SPEC_SUBJ[spec].includes(n)) };
}

/** Overlap between the shared JAOS profile (roles, headline, skills) and a posting's title + eligibility (never org). 0-30 pts. */
export function profileOverlap(p: Pick<RankInput, 'title' | 'eligibility'>, kws: string[]): { pts: number; hits: string[] } {
  if (!kws.length) return { pts: 0, hits: [] }; const hay = ` ${p.title} ${p.eligibility} `.toLowerCase();
  const hits = kws.filter((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(hay));
  const titleHits = kws.filter((k) => p.title.toLowerCase().includes(k)).length;
  return { pts: Math.min(30, hits.length * 8 + titleHits * 6), hits: hits.slice(0, 4) };
}
