// Ranking and eligibility hints for live postings (playbook §2 and §6, simplified). Not legal advice. Akash Sync Agent.
import { ageOn, type Profile } from '../govJobs';
import { CLERICAL, MENIAL_ANY, RELATED, disciplineGate, domicileGate, experienceGate, floorBlocks, licenceGate, payBelow, payInfo, relaxYears, userDiscs, DISC_NAME } from './gates';
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
export function relaxation(p: Pick<Profile, 'cat' | 'pwbd'> & Partial<Pick<Profile, 'esm' | 'esmYears'>>, homeState = true) { return relaxYears(p, homeState).years; }
export const EDU_RANK: Record<string, number> = { '10': 1, '12': 2, iti: 2, diploma: 2, grad: 3, eng: 3, pg: 4, phd: 5 };
export const TAG_RANK: Record<string, number> = { '10TH': 1, '12TH': 2, ITI: 2, DIPLOMA: 2, GRADUATE: 3, ENGINEERING: 3, LAW: 3, MEDICAL: 3, PG: 4, PHD: 5 };
export type Badge = 'likely' | 'verify' | 'maynot';
export const BADGE_TEXT: Record<Badge, string> = { likely: 'Likely eligible: check official notification', verify: 'Needs verification (check sub-clauses)', maynot: 'May not qualify: check relaxations in notice' };
/** Three states only, never "100% eligible". Uses only what the notice text states; unknowns mean "verify". Spec rule 3: six gates. */
export function eligibilityBadge(p: RankInput, prof: Profile | null, today = new Date().toISOString().slice(0, 10)): { badge: Badge; why: string[]; checks: string[] } {
  const why: string[] = []; const checks: string[] = [];
  if (p.employmentType === 'deputation') return { badge: 'maynot', why: ['Deputation posts are only for serving government employees.'], checks };
  const fit = prof ? profileFit(p, prof) : null;
  if (fit?.belowLevel) return { badge: 'maynot', why: [`${fit.floor === 'pay' ? 'Pay below your minimum pay level' : `Junior / entry-level post (${fit.floor})`}: below your ${prof!.expYears ? `${prof!.expYears} yrs experience and ` : ''}${prof!.spec === 'law' ? 'law degree' : prof!.spec ? `${prof!.spec} degree` : 'graduate'} profile. Hidden unless you tick "Show all levels".`], checks };
  if (!prof) return { badge: 'verify', why: ['Add your details below to get a hint.'], checks };
  let bad = false, known = 0;
  // Gate 2: exact degree & discipline.
  const dg = disciplineGate(p, prof); if (dg.ok === false) { bad = true; why.push(dg.why!); } else if (dg.ok) { known++; why.push(`Degree match: ${dg.need.map((d) => DISC_NAME[d]).slice(0, 2).join(' / ')}.`); } else if (dg.why) checks.push(dg.why.replace(/^Check notice: /, ''));
  // Gate 3: licence. Gate 4: experience to cut-off.
  const lg = licenceGate(p, prof); if (lg.ok === false) { bad = true; why.push(lg.why!); } else if (lg.ok) why.push(lg.why!); else if (lg.why) checks.push(lg.why.replace(/^Check notice: /, ''));
  const xg = experienceGate(p, prof); if (xg.ok === false) { bad = true; why.push(xg.why!); } else if (xg.ok) why.push(xg.why!); else if (xg.why) checks.push(xg.why.replace(/^Check notice: /, ''));
  // Gate 5: domicile & regional language.
  const dm = domicileGate(p, prof); if (dm.ok === false) { bad = true; why.push(dm.why!.replace(/^Check notice: /, '')); } else if (dm.why && dm.ok === null) checks.push(dm.why.replace(/^Check notice: /, '').replace(/\.$/, '')); else if (dm.why) why.push(dm.why);
  // Gate 6: age with statutory relaxation (category relaxation needs the recruiting state's domicile for state posts).
  if (!prof.dob) checks.push('add your date of birth to check the age limit');
  else {
    const age = ageOn(prof.dob, p.lastDate || today);
    const stateMismatch = p.level === 'state' && prof.state && p.state && p.state !== 'All India' && p.state.toLowerCase() !== prof.state.toLowerCase();
    const r = relaxYears(prof, !stateMismatch); const relax = r.years;
    if (p.maxAge) { known++; const cap = p.maxAge + relax; if (age > cap) { bad = true; why.push(`Your age on the last date is about ${age}; stated limit ${p.maxAge}${relax ? ` (+${relax} relaxation, ${r.note} = ${cap})` : ''}.`); } else why.push(`Age ${age}: ${cap - age} yr margin under ${p.maxAge}${relax ? ` + ${relax} (${r.note})` : ''}.`); }
    else checks.push('age limit (not in the feed text)');
    if (p.minAge && age < p.minAge) { bad = true; why.push(`Minimum age ${p.minAge}.`); }
  }
  if (p.eduTags?.length && dg.ok !== false) { known++; const need = Math.min(...p.eduTags.map((t) => TAG_RANK[t] || 3)); const have = EDU_RANK[prof.edu] || 0; if (have < need) { bad = true; why.push('The notice seems to need a higher qualification than yours.'); } else if (dg.ok === null) why.push('Your education level looks enough.'); }
  if (fit?.field) why.push(`Matches your ${prof!.spec} background.`);
  if (fit && isExperienced(prof) && fit.tier === 'senior' && dg.ok !== false) why.push('Officer / specialist level post: suits your experience.');
  if (bad) return { badge: 'maynot', why, checks };
  return { badge: known >= 2 && !checks.filter((c) => !/age limit \(not/.test(c)).length ? 'likely' : 'verify', why: why.length ? why : ['Age or qualification not stated in the feed text.'], checks };
}
// ---- Profile fit (t326u): experience, degree and career level drive "Best match". Uses only the posting's own text. ----
export type Tier = 'junior' | 'mid' | 'senior';
const JUNIOR = /\b(group\s*[cd]|multi[- ]?tasking|mts|gds|gramin dak|dak sevak|constable|peon|sweeper|safai|chowkidar|watchman|helper|attendant|driver|cook|mali|apprentice|trainee clerk|clerk|lower division|ldc|udc|typist|data entry|deo|stenographer|steno|junior assistant|office assistant|record keeper|process server|bailiff|chaprasi|orderly|daftary|home guard|agniveer|tradesman|khalasi|track maintainer|lab attendant)\b|10th pass|12th pass|matric|ssc\s*\(?10/i;
const SENIOR_TITLE = /\b(gazetted|judge|judicial|magistrate|public prosecutor|prosecutor|counsel|legal (?:advisor|adviser|officer|consultant|manager)|law officer|scientist|professor|director|deputy|commissioner|registrar|under secretary|secretary|controller|superintendent of police|lateral)\b/i;
const NOT_SENIOR = /\b(junior|clerk|mts|gds|constable|peon|stenographer|typist|trainee|train manager|guard|ticket|commercial cum|station master|loco pilot|goods)\b|group\s*[cd]\b/i;
// t385u profession-first families: every open post of the user's profession, matched on title + eligibility (never org name).
// Law: judicial services, prosecutors, law officers, standing counsel, PSU/bank law officers, tribunal members, legal aid, law faculty.
const LAW_RE = /\b(law|laws|legal|llb|ll\.\s?b|llm|ll\.\s?m|advocates?|bar council|enrol(?:l)?ment as an advocate|judicial|judge|judges|judiciary|civil judge|pcs[- ]?\(?j\)?|hjs|higher judicial|munsif|magistrate|prosecutors?|prosecution|public prosecutor|standing counsel|counsel|law officer|so[- ]?\(?law\)?|legal aid|dlsa|slsa|nalsa|legal services authority|notary|solicitor|attorney|judicial member|member \(judicial\)|nclt|nclat|itat|drt|drat|cestat|consumer (?:disputes redressal )?commission|consumer forum)\b/i;
const TEACH_RE = /\b(teachers?|tgt|pgt|prt|b\.?\s?ed|ctet|tet|lecturer|assistant professor|associate professor|professor|faculty|principal|headmaster|head master)\b/i;
const MENIAL = /\b(constable|home ?guard|agniveer|gate ?keeper|forest guard|trackman|driver|peon|sweeper|safai|chowkidar|watchman|security guard|helper|attendant|cook|mali|gardener|mts|multi[- ]?tasking|orderly|daftary|daftari|chaprasi|process server|bailiff|typist|stenographer|steno|data entry|deo|ldc|udc|lower division|upper division|office assistant|junior assistant|record keeper|clerk|cleaner|sanitation)\b/i;
export const SPEC_RE: Record<string, RegExp> = { law: LAW_RE, engineering: /\b(engineer|engineering|b\.e\.|b\.?\s?tech|gate score)\b/i, medical: /\b(medical|mbbs|doctor|nurse|pharmac|health|dental|ayush)\b/i, finance: /\b(accounts?|accountant|finance|financial|chartered accountant|\bca\b|cma|icwa|company secretary|audit|auditor|treasury|actuar\w*)\b/i, teaching: TEACH_RE, other: /$^/ };
/** Pay level and lowest basic stated in the pay text, if any. */
export function payFacts(pay: string): { level?: number; basic?: number } {
  // t386u L2: a range like "Pay Level 2-10" uses its UPPER bound, so an Assistant Director post is not classed as junior.
  const i = payInfo(pay); return { level: i.level, basic: i.basic };
}
/** Senior = Group A/B, Gazetted, Level 10+ or basic >= Rs 56,100 when pay is known; otherwise only clear officer-grade titles. "Manager"/"supervisor" alone is not enough. */
export function tierOf(p: Pick<RankInput, 'title' | 'org' | 'eligibility' | 'pay'> & { eduTags?: string[] }): Tier {
  const t = `${p.title} ${p.eligibility} ${p.pay}`;
  const jr = JUNIOR.test(t) || NOT_SENIOR.test(p.title) && /group\s*[cd]\b/i.test(t) || (!!p.eduTags?.length && p.eduTags.every((x) => ['10TH', '12TH', 'ITI'].includes(x)));
  if (NOT_SENIOR.test(p.title) || /group\s*[cd]\b/i.test(t)) return jr ? 'junior' : 'mid';
  if (/group\s*[ab]\b|gazetted/i.test(t)) return 'senior';
  const { level, basic } = payFacts(p.pay);
  if (level !== undefined || basic !== undefined) return (level ?? 0) >= 10 || (basic ?? 0) >= 56100 ? 'senior' : jr || (level !== undefined && level <= 2) ? 'junior' : 'mid';
  if (SENIOR_TITLE.test(p.title)) return 'senior';
  return jr ? 'junior' : 'mid';
}
/** 1 school/ITI, 2 diploma/12th, 3 graduate, 4 postgraduate/professional/5+ years. */
export const userLevel = (prof?: Profile | null) => !prof ? 0 : Math.max(EDU_RANK[prof.edu] || 0, (prof.spec && prof.spec !== 'other') || (prof.expYears ?? 0) >= 5 ? 4 : 0);
export const isExperienced = (prof?: Profile | null) => !!prof && (prof.expYears ?? 0) >= 5 && (EDU_RANK[prof.edu] || 0) >= 3;
/** Points added to rankScore and a reason. Experienced graduates: junior posts sink hard, senior/field-matched posts rise. Juniors/freshers: entry posts stay. */
export function profileFit(p: RankInput, prof?: Profile | null): { pts: number; tier: Tier; field: boolean; belowLevel: boolean; subjects?: string[]; floor?: string } {
  // org name never counts (t326u NO-GO); a menial title (e.g. "DLSA Driver", "Constable (Legal Cell)") is never a profession match, except a Law Clerk.
  const tier = tierOf(p); const menial = (MENIAL.test(p.title) || MENIAL_ANY.test(p.title) || CLERICAL.test(p.title) || /\bpara[- ]?legal\b|\bretired (?:employees|officers|persons|judicial)\b/i.test(p.title)) && !/law clerk|legal assistant/i.test(p.title);
  const dg = prof ? disciplineGate(p, prof) : null;
  const field = !!prof?.spec && !!SPEC_RE[prof.spec]?.test(`${p.title} ${p.eligibility}`) && !menial && dg?.ok !== false;
  if (!prof) return { pts: 0, tier, field, belowLevel: false };
  const exp = prof.expYears ?? 0, senior = isExperienced(prof);
  // Floor first (t386u M1b): a clerical / menial post stays hidden even when it also fails the subject check.
  const floor0 = floorBlocks(p, prof, field) || (tier === 'junior' && userLevel(prof) >= 4 && !field && (CLERICAL.test(p.title) || /group\s*[cd]\b/i.test(`${p.title} ${p.eligibility} ${p.pay}`)) ? 'clerical / Group C-D post' : null);
  const lowPay0 = payBelow(p.pay || '', prof.minPayLevel) === true; const below = { belowLevel: !!floor0 || lowPay0, floor: floor0 || (lowPay0 ? 'pay' : undefined) };
  // t386u M1: exact degree & discipline gate (an engineer is not "eligible" for an APP post; a lawyer not for Medical Officer).
  if (dg?.ok === false) return { pts: -30, tier, field: false, ...below, subjects: dg.need.map((d) => DISC_NAME[d]) };
  const subj = subjectFit(p.eligibility, prof.spec); if (subj.fits === false && dg?.ok !== true) return { pts: -30, tier, field: false, ...below, subjects: subj.named };
  let pts = field ? 25 : 0;
  if (senior) pts += tier === 'senior' ? 30 + Math.min(10, exp) : tier === 'mid' ? 0 : -80;
  else if (exp <= 2) pts += tier === 'junior' ? 10 : tier === 'senior' && !field ? -5 : 0;
  const lateral = /\b(consultant|young professional|advis[eo]r|specialist|expert|fellow|lateral|deputation)\b/i.test(p.title);
  if (lateral && field) pts += 20;
  // Spec rule 2: level floor by tier. Professional graduates never see peon / MTS / driver / constable / home guard / agniveer /
  // DEO / LDC-UDC posts; general graduates never see 10th / ITI-level posts. Own-profession posts (Law Clerk) stay.
  // Minimum pay level (one-time profile) hides posts whose stated pay tops out below it. "Show all levels" brings all back.
  return { pts, tier, field, ...below };
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

// ---- t385u: one label per result and profession-first ordering. ----
export type Label = 'strong' | 'eligible' | 'related' | 'check';
export const LABEL_TEXT: Record<Label, string> = { strong: 'Strong match', eligible: 'Eligible', related: 'Related fit', check: 'Check notice' };
/** Related fit: an adjacent role (not the exact profession) that the person's degree AND experience suit, at or above their level floor.
 *  Returns the one-line reason, or null. Never offered for junior / below-floor posts or when a hard gate fails. */
export function relatedFit(p: RankInput, prof: Profile | null): string | null {
  if (!prof) return null; const fit = profileFit(p, prof); if (fit.field || fit.belowLevel || fit.tier === 'junior') return null;
  const tp = { title: p.title, eligibility: p.eligibility || '' };
  if (disciplineGate(tp, prof).ok === false || experienceGate(tp, prof).ok === false || licenceGate(tp, prof).ok === false) return null;
  const discs = new Set(userDiscs(prof)); if (prof.spec === 'law') discs.add('LAW'); if (prof.spec === 'engineering') discs.add('ENGINEERING'); if (prof.spec === 'medical') discs.add('MEDICAL'); if (prof.icai) discs.add('CA');
  for (const d of discs) for (const [re, role] of RELATED[d] || []) if (re.test(p.title)) {
    const exp = prof.expYears ?? 0;
    return `Related fit: ${role} work draws on your ${DISC_NAME[d].replace(/ \(.*\)$/, '')} degree${exp > 0 ? ` and ${exp} year${exp === 1 ? '' : 's'} of experience` : ''}.`;
  }
  return null;
}
const PROF_NAME: Record<string, string> = { law: 'law', engineering: 'engineering', medical: 'medical / health', finance: 'finance / accounts', teaching: 'teaching' };
/** Spec rules 4-5. Strong match = your profession + nothing to verify on your side + pay at/above your floor.
 *  Eligible = you meet everything stated, with a stated soft trade-off (place, contract/tenure, or a non-profession post).
 *  Check notice = one or two clauses to verify in the notice, named. */
export function matchLabel(p: RankInput, prof: Profile | null, today?: string): { label: Label; why: string[] } {
  const e = eligibilityBadge(p, prof, today); const fit = prof ? profileFit(p, prof) : null;
  const trade = tradeOffs(p, prof); const personal = e.checks.filter((c) => !/age limit \(not/.test(c));
  if (e.badge === 'maynot') return { label: 'check', why: ['May not qualify:', ...e.why] };
  const own = fit?.field ? [`${/^[aeiou]/i.test(PROF_NAME[prof!.spec || ''] || prof!.spec || '') ? 'An' : 'A'} ${PROF_NAME[prof!.spec || ''] || prof!.spec} post, your profession.`] : [];
  const rest = e.why.filter((w) => !/^Matches your/.test(w));
  const rel = !fit?.field ? relatedFit(p, prof) : null;
  if (rel) return { label: 'related', why: [rel, ...(personal.length ? [`Check notice: verify ${personal.slice(0, 2).map((c) => c.replace(/\.+$/, '')).join('; ')}.`] : []), ...(trade.length ? [`Trade-off: ${trade.join('; ')}.`] : []), ...rest] };
  if (personal.length) return { label: 'check', why: [...own, `Check notice: verify ${personal.slice(0, 2).map((c) => c.replace(/\.+$/, '')).join('; ')}.`, ...rest] };
  // t386u M5: Strong match needs the age confirmed against a stated limit. "Age: see notice" caps the label at Check notice.
  const ageOpen = e.checks.some((c) => /age limit \(not/.test(c));
  if (fit?.field && ageOpen) return { label: 'check', why: [...own, 'Check notice: verify the age limit (not stated in the feed text); everything else stated matches.', ...rest] };
  if (fit?.field && !trade.length) return { label: 'strong', why: [...own, ...rest] };
  if (fit?.field || e.badge === 'likely') return { label: 'eligible', why: [...own, `Eligible: ${trade.length ? trade.join('; ') : 'meets the stated age and qualification'}.`, ...rest] };
  return { label: 'check', why: ['Check notice: verify the age limit and qualification (not stated in the feed text).', ...rest.filter((w) => !/not stated/.test(w))] };
}
/** Soft trade-offs shown on "Eligible" (spec table 7): outside your place, contract / tenure, fellowship. */
export function tradeOffs(p: RankInput, prof: Profile | null): string[] {
  const out: string[] = []; const place = `${(p as { location?: string }).location || ''} ${p.state}`.trim();
  if (prof && (prof.city || prof.state) && p.state && p.state !== 'All India' && placeScore(p, prof) === 0) out.push(`posting in ${place}`);
  if (p.employmentType === 'contractual') out.push(`contractual / fixed tenure${p.pay ? ` at ${p.pay.slice(0, 40)}` : ''}`);
  if (p.employmentType === 'fellowship') out.push('fellowship / project tenure');
  return out;
}
/** 3 = your city, 2 = your state, 1 = All India / place not stated, 0 = elsewhere. */
export function placeScore(p: RankInput, prof: Profile | null): number {
  if (!prof || (!prof.city && !prof.state)) return 1; const place = `${p.state} ${(p as { location?: string }).location || ''} ${p.title} ${p.org}`.toLowerCase();
  if (prof.city && place.includes(prof.city.toLowerCase())) return 3;
  if (prof.state && p.state && p.state.toLowerCase() === prof.state.toLowerCase()) return 2;
  return !p.state || p.state === 'All India' ? 1 : 0;
}
const TIER_I: Record<Tier, number> = { junior: 0, mid: 1, senior: 2 };
/** 2 = right level for this person, 1 = one step off, 0 = far off. */
export function levelFit(p: RankInput, prof: Profile | null): number {
  if (!prof) return 1; const ul = userLevel(prof); const target = ul >= 4 || isExperienced(prof) ? 2 : ul === 3 ? 1 : 0;
  return 2 - Math.abs(TIER_I[tierOf(p)] - target);
}
/** Sort key for Best match with a profile: profession, level fit, eligibility, pay, location, days left (soonest first). */
export function profileSortKey(p: RankInput, prof: Profile | null, today?: string): number[] {
  const l = matchLabel(p, prof, today); const fit = prof ? profileFit(p, prof) : null; const { level, basic } = payFacts(p.pay || '');
  const pay = basic ?? (level ? level * 5000 : 0); const home = placeScore(p, prof);
  const cert = l.label === 'strong' ? 2 : l.label === 'eligible' || l.label === 'related' ? 2 : eligibilityBadge(p, prof, today).badge === 'maynot' ? 0 : 1;
  // Profession > level fit > eligibility certainty > pay > location > days left. Nearby posts first: with "not open to relocate"
  // (or a city set), location outranks pay so posts in your city / state come before far-away ones.
  const near = prof && (prof.relocate === false || !!prof.city);
  // Exact profession first, then Related fit, then the rest.
  return [fit?.field ? 2 : l.label === 'related' ? 1 : 0, levelFit(p, prof), cert, near ? home : pay, near ? pay : home, -daysLeft(p.lastDate, today)];
}
export function compareKeys(a: number[], b: number[]) { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (b[i] ?? 0) - (a[i] ?? 0); if (d) return d; } return 0; }
