// Ranking and eligibility hints for live postings (playbook §2 and §6, simplified). Not legal advice. Akash Sync Agent.
import { ageOn, type Profile } from '../govJobs';
import { factsOf, postLevelOf, qualGate, essentialSummary, EXP_NAME, type NoticeFacts } from './notice';
import { RELATED, directMatch, requiredPart, postDiscs, PROFESSIONAL, type Disc, disciplineGate, subjectGate, domicileGate, experienceGate, floorBlocks, licenceGate, payBelow, payInfo, relaxYears, userDiscs, DISC_NAME } from './gates';
export interface RankInput { lastDate: string; lesserKnown: boolean; pay: string; vacancies: string; official: boolean; title: string; org: string; eligibility: string; state: string; level?: string; employmentType?: string; maxAge?: number; minAge?: number; eduTags?: string[]; facts?: NoticeFacts }
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
/** Three states only, never "100% eligible". No false hope: every ESSENTIAL condition the notice states (qualification, discipline,
 *  experience years AND type, licence / enrolment, age, domicile) is compared with the profile. A stated condition that clearly
 *  fails gives "maynot" (hidden unless "Show all levels"); any condition not stated in the notice or not answered in the profile
 *  becomes a named check (label "Check notice", never Strong or Eligible). */
export function eligibilityBadge(p: RankInput, prof: Profile | null, today = new Date().toISOString().slice(0, 10)): { badge: Badge; why: string[]; checks: string[]; notes: string[]; ageConfirmed?: boolean } {
  const why: string[] = []; const checks: string[] = []; const fails: string[] = []; const notes: string[] = []; let ageConfirmed = false;
  if (p.employmentType === 'deputation') return { badge: 'maynot', why: ['Deputation posts are only for serving government employees.'], checks, notes };
  const fit = prof ? profileFit(p, prof) : null;
  if (fit?.belowLevel) return { badge: 'maynot', why: [`${fit.floor === 'pay' ? 'Pay below your minimum pay level' : `Junior / entry-level post (${fit.floor})`}: below your ${prof!.expYears ? `${prof!.expYears} yrs experience and ` : ''}${prof!.spec === 'law' ? 'law degree' : prof!.spec ? `${prof!.spec} degree` : 'graduate'} profile. Hidden unless you tick "Show all levels".`], checks, notes };
  const f = factsOf(p); const strip = (w: string) => w.replace(/^Check notice: /, '').replace(/\.$/, '');
  // Before anything else (and with no profile too): a scanned / unreadable notice (no text layer, not read with the user's own
  // key) is never Strong / Eligible / Related; a recruitment title with no positive evidence of an open call is never an open post.
  if (f.pdf === 'scanned' || f.pdf === 'unreadable') checks.push('scanned notice, verify manually (the official PDF has no readable text; add your own Gemini key in Settings to have it read)');
  else if (f.noticeType === 'unclear') checks.push('notice type unclear (the title names a recruitment but shows no application invitation, last date or vacancies; open the notice to confirm it is an open call and not a list, test or result)');
  if (f.ageUnreadable && f.ageMax === null) checks.push('age: unreadable in PDF (the notice states an age limit that could not be read)');
  if (!prof) return { badge: 'verify', why: ['Set up your profile to see your fit.'], checks, notes };
  const gate = (g: { ok: boolean | null; why?: string }) => { if (g.ok === false) fails.push(g.why!); else if (g.ok) { if (g.why) why.push(g.why); } else if (g.why) checks.push(strip(g.why)); };
  // Essential qualification (satisfaction against the person's degrees), then discipline, licence, experience, domicile.
  gate(qualGate(f, prof));
  // Subject (whole terms, compound subjects first) before the discipline family: a specific required subject must be the profile's.
  const sg = subjectGate(p, prof); gate(sg);
  const dg = disciplineGate(p, prof); if (dg.ok === true) { if (sg.ok !== true) why.push(`Degree match: ${dg.need.map((d) => DISC_NAME[d]).slice(0, 2).join(' / ')}.`); } else if (!(sg.ok === true && dg.need.every((d) => !PROFESSIONAL.includes(d)))) gate(dg);
  gate(licenceGate(p, prof)); gate(experienceGate(p, prof)); gate(domicileGate(p, prof));
  // Age with statutory relaxation (category relaxation needs the recruiting state's domicile for state posts).
  // Age alone never downgrades the label (an unstated age limit is common): it becomes a sub-note on the card.
  if (!prof.dob) notes.push('Age not checked — add your date of birth.');
  else if (f.ageUnreadable && f.ageMax === null) { /* already a Check: verify age, unreadable in PDF */ }
  else if (f.ageMax === null && f.ageMin === null) notes.push('Age limit not stated — check notice.');
  else {
    const age = ageOn(prof.dob, p.lastDate || today);
    const stateMismatch = p.level === 'state' && prof.state && p.state && p.state !== 'All India' && p.state.toLowerCase() !== prof.state.toLowerCase();
    const r = relaxYears(prof, !stateMismatch); const relax = r.years;
    if (f.ageMax !== null) { const cap = f.ageMax + relax; if (age > cap) fails.push(`Your age on the last date is about ${age}; stated limit ${f.ageMax}${relax ? ` (+${relax} relaxation, ${r.note} = ${cap})` : ''}.`); else { ageConfirmed = true; why.push(`Age ${age}: ${cap - age} yr margin under ${f.ageMax}${relax ? ` + ${relax} (${r.note})` : ''}.`); } }
    else if (!f.ageUnreadable) notes.push('Upper age limit not stated — check notice.');
    if (f.ageMin !== null && age < f.ageMin) fails.push(`Minimum age ${f.ageMin}.`);
  }
  if (fit?.field) why.push(`Matches your ${prof!.spec} background.`);
  if (fit && isExperienced(prof) && fit.tier === 'senior' && !fails.length) why.push('Officer / specialist level post: suits your experience.');
  if (fails.length) return { badge: 'maynot', why: fails, checks, notes };
  return { badge: checks.length ? 'verify' : 'likely', why: why.length ? why : ['Age or qualification not stated in the feed text.'], checks, notes, ageConfirmed };
}
// ---- Profile fit (t326u): experience, degree and career level drive "Best match". Uses only the posting's own text. ----
export type Tier = 'junior' | 'mid' | 'senior';
const JUNIOR = /\b(group\s*[cd]|multi[- ]?tasking|mts|gds|gramin dak|dak sevak|constable|peon|sweeper|safai|chowkidar|watchman|helper|attendant|driver|cook|mali|apprentice|trainee clerk|clerk|lower division|ldc|udc|typist|data entry|deo|stenographer|steno|junior assistant|office assistant|record keeper|process server|bailiff|chaprasi|orderly|daftary|home guard|agniveer|tradesman|khalasi|track maintainer|lab attendant)\b|10th pass|12th pass|matric|ssc\s*\(?10/i;
const SENIOR_TITLE = /\b(gazetted|judge|judicial|magistrate|public prosecutor|prosecutor|counsel|legal (?:advisor|adviser|officer|consultant|manager)|law officer|scientist|professor|director|deputy|commissioner|registrar|under secretary|secretary|controller|superintendent of police|lateral)\b/i;
const NOT_SENIOR = /\b(junior|clerk|mts|gds|constable|peon|stenographer|typist|trainee|train manager|guard|ticket|commercial cum|station master|loco pilot|goods)\b|group\s*[cd]\b/i;
// t385u profession-first families: every open post of the user's profession, matched on title + eligibility (never org name).
// Law: judicial services, prosecutors, law officers, standing counsel, PSU/bank law officers, tribunal members, legal aid, law faculty.
const LAW_RE = /\b(law|laws|legal|llb|l\.?\s?l\.\s?b|llm|l\.?\s?l\.\s?m|advocates?|bar council|enrol(?:l)?ment as an advocate|judicial|judge|judges|judiciary|civil judge|pcs[- ]?\(?j\)?|hjs|higher judicial|munsif|magistrate|prosecutors?|prosecution|public prosecutor|standing counsel|counsel|law officer|so[- ]?\(?law\)?|legal aid|dlsa|slsa|nalsa|legal services authority|notary|solicitor|attorney|judicial member|member \(judicial\)|nclt|nclat|itat|drt|drat|cestat|consumer (?:disputes redressal )?commission|consumer forum)\b/i;
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
  const f = factsOf(p as RankInput); const lv = postLevelOf(f);
  if (lv === 'support' || lv === 'low' || lv === 'subgrad') return 'junior';
  if (f.group === 'A' || f.group === 'B') return 'senior';
  if (lv === 'officer' && ((f.payLevel ?? 0) >= 10 || (f.basic ?? 0) >= 56100)) return 'senior';
  const t = `${p.title} ${p.eligibility} ${p.pay}`;
  const jr = lv !== 'officer' && ( JUNIOR.test(t) || NOT_SENIOR.test(p.title) && /group\s*[cd]\b/i.test(t) || (!!p.eduTags?.length && p.eduTags.every((x) => ['10TH', '12TH', 'ITI'].includes(x))));
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
export { requiredPart } from './gates';
export function profileFit(p: RankInput, prof?: Profile | null): { pts: number; tier: Tier; field: boolean; belowLevel: boolean; subjects?: string[]; floor?: string } {
  // org name never counts (t326u NO-GO); a menial title (e.g. "DLSA Driver", "Constable (Legal Cell)") is never a profession match, except a Law Clerk.
  const tier = tierOf(p); const lv = postLevelOf(factsOf(p)); const menial = (lv === 'support' || lv === 'low' || lv === 'subgrad' || lv === 'clerical' || /\bpara[- ]?legal\b/i.test(p.title)) && !/law clerk|legal assistant/i.test(p.title);
  const dg = prof ? disciplineGate(p, prof) : null;
  // Exact profession = the core title is the profession, or the notice REQUIRES the profession for a title that is not an adjacent role.
  // A degree named only as "preferred" / "desirable" never makes a post exact (it may still be a Related fit).
  const re = prof?.spec ? SPEC_RE[prof.spec] : undefined; const required = factsOf(p).essentialText;
  const field = !!re && (re.test(p.title) || (!relatedRole(p.title, prof || null) && re.test(required))) && !menial && dg?.ok !== false;
  if (!prof) return { pts: 0, tier, field, belowLevel: false };
  const exp = prof.expYears ?? 0, senior = isExperienced(prof);
  // Floor first (t386u M1b): a clerical / menial post stays hidden even when it also fails the subject check.
  const floor0 = floorBlocks(p, prof, field);
  const lowPay0 = payBelow(p.pay || '', prof.minPayLevel) === true; const below = { belowLevel: !!floor0 || lowPay0, floor: floor0 || (lowPay0 ? 'pay' : undefined) };
  // t386u M1: exact degree & discipline gate (an engineer is not "eligible" for an APP post; a lawyer not for Medical Officer).
  if (dg?.ok === false) return { pts: -30, tier, field: false, ...below, subjects: dg.need.map((d) => DISC_NAME[d]) };
  const subj = subjectFit(required, prof.spec); if (subj.fits === false && dg?.ok !== true) return { pts: -30, tier, field: false, ...below, subjects: subj.named };
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
export type Label = 'strong' | 'eligible' | 'related' | 'check' | 'setup';
export const LABEL_TEXT: Record<Label, string> = { strong: 'Strong match', eligible: 'Eligible', related: 'Related fit', check: 'Check notice', setup: 'Set up your profile to see your fit' };
/** Related fit: an adjacent role (not the exact profession) that the person's degree AND experience suit, at or above their level floor.
 *  Returns the one-line reason, or null. Never offered for junior / below-floor posts or when a hard gate fails. */
/** A no-profession profile (e.g. MSc Env Sci) whose own subject the post asks for: that is its exact bucket, ranked above Related fit. */
export function subjectExact(p: RankInput, prof: Profile | null): boolean {
  if (!prof || (prof.spec && prof.spec !== 'other')) return false; const tp = { title: p.title, eligibility: p.eligibility || '' };
  return disciplineGate(tp, prof).ok === true && directMatch(tp, prof);
}
const SCHOOL_EDU: Record<string, string> = { '10': '10th pass', '12': '12th pass', iti: 'ITI' };
/** The adjacent role a title belongs to for this person, if any (used to keep "preferred degree" posts out of the exact bucket). */
export function relatedRole(title: string, prof: Profile | null): { d: string; role: string; reason: string } | null {
  if (!prof) return null; const discs = new Set<string>(userDiscs(prof));
  if (prof.spec === 'law') discs.add('LAW'); if (prof.spec === 'engineering') discs.add('ENGINEERING'); if (prof.spec === 'medical') discs.add('MEDICAL'); if (prof.icai) discs.add('CA'); if (SCHOOL_EDU[prof.edu]) discs.add('SCHOOL');
  for (const d of discs) for (const [re, role, reason] of RELATED[d as keyof typeof RELATED] || []) if (re.test(title)) return { d, role, reason };
  return null;
}
/** Related fit: an adjacent role (not the exact profession) that the person's degree AND experience suit, at or above their level floor.
 *  Returns the one-line reason, or null. Never offered for below-floor posts, when a hard gate fails, or (for 10th / 12th / ITI) for officer posts. */
export function relatedFit(p: RankInput, prof: Profile | null, today?: string): string | null {
  if (!prof) return null; const fit = profileFit(p, prof); if (fit.field || fit.belowLevel) return null;
  const school = !!SCHOOL_EDU[prof.edu]; if (!school && fit.tier === 'junior') return null;
  const f = factsOf(p);
  // 12th pass / 10th / ITI: only posts at their own level (pay level 5 or below, basic under Rs 35,400), never officer or degree posts.
  if (school) { const lv = f.payLevel ?? undefined; if ((lv !== undefined && lv >= 6) || (f.basic !== null && f.basic >= 35400) || /\bgrade[- ]?['"]?a\b/i.test(p.title)) return null;
    if (f.isOfficer || fit.tier === 'senior' || (f.minEdu !== null && f.minEdu > (EDU_RANK[prof.edu] || 0))) return null; }
  // Degree holders: never a 12th-pass / diploma-level post as Related fit (Data Analyst (Junior), Level 4, 12th pass).
  if (!school) { const lv = postLevelOf(f); if (lv === 'support' || lv === 'low' || lv === 'subgrad' || lv === 'clerical') return null; }
  const r = relatedRole(p.title, prof); if (!r || (school !== (r.d === 'SCHOOL'))) return null;
  // No false hope: a Related fit must meet every ESSENTIAL condition the notice states, with nothing left unknown.
  if (eligibilityBadge(p, prof, today).badge !== 'likely') return null;
  const exp = prof.expYears ?? 0; const deg = r.d === 'SCHOOL' ? SCHOOL_EDU[prof.edu] : (prof.subject?.trim() || DISC_NAME[r.d as Disc].replace(/ \(.*\)$/, ''));
  const kinds = (prof.expType || []).filter((t) => t !== 'any').map((t) => EXP_NAME[t]);
  const expTxt = exp > 0 ? ` and ${exp} yr${exp === 1 ? '' : 's'} of ${kinds.length ? kinds.join(' / ') : 'work'} experience` : '';
  const tie = r.reason.replace('{deg}', r.d === 'SCHOOL' ? deg : DISC_NAME[r.d as Disc].replace(/ \(.*\)$/, '')).replace('{exp}', '');
  return `Related fit: the notice asks for ${essentialSummary(f)}; your ${deg}${expTxt} meet${exp > 0 ? '' : 's'} it. ${tie.charAt(0).toUpperCase()}${tie.slice(1)}.`;
}
const PROF_NAME: Record<string, string> = { law: 'law', engineering: 'engineering', medical: 'medical / health', finance: 'finance / accounts', teaching: 'teaching' };
/** Spec rules 4-5. Strong match = your profession + nothing to verify on your side + pay at/above your floor.
 *  Eligible = you meet everything stated, with a stated soft trade-off (place, contract/tenure, or a non-profession post).
 *  Check notice = one or two clauses to verify in the notice, named. */
export function matchLabel(p: RankInput, prof: Profile | null, today?: string): { label: Label; why: string[] } {
  const e = eligibilityBadge(p, prof, today); const fit = prof ? profileFit(p, prof) : null; const trade = tradeOffs(p, prof);
  if (e.badge === 'maynot') return { label: 'check', why: ['May not qualify:', ...e.why] };
  // No profile: never Eligible / Related / Strong. Scanned or unclear notices still say Check notice.
  if (!prof) return e.checks.length ? { label: 'check', why: [`Check notice: verify ${e.checks.slice(0, 3).map((c) => c.replace(/\.+$/, '')).join('; ')}.`, 'Set up your profile to see your fit.'] } : { label: 'setup', why: ['Add your details below (saved only in this browser) to see whether you meet the notice\'s conditions.'] };
  const own = fit?.field ? [`${/^[aeiou]/i.test(PROF_NAME[prof!.spec || ''] || prof!.spec || '') ? 'An' : 'A'} ${PROF_NAME[prof!.spec || ''] || prof!.spec} post, your profession.`] : [];
  const rest = [...e.why.filter((w) => !/^Matches your/.test(w)), ...e.notes];
  // Any essential condition unknown (not in the notice text, or not answered in the profile): Check notice, naming the clause.
  if (e.checks.length) { const role = !fit?.field && prof ? relatedRole(p.title, prof) : null;
    return { label: 'check', why: [...own, ...(role ? [`Adjacent role (${role.role}) for your background, but not confirmed yet.`] : []), `Check notice: verify ${e.checks.slice(0, 3).map((c) => c.replace(/\.+$/, '')).join('; ')}.`, ...rest] }; }
  // Strong needs every hard condition confirmed, the age limit included (spec table 7): with the age not stated in the notice (or no
  // date of birth saved) an exact-profession post is at most "Eligible, verify age".
  if (fit?.field && !e.ageConfirmed) { const v = prof!.dob ? 'verify age (not stated in the notice)' : 'verify age (add your date of birth)';
    return { label: 'eligible', why: [...own, `Eligible, ${v}${trade.length ? `; ${trade.join('; ')}` : ''}.`, ...rest.filter((w) => !/^Age (?:limit|not checked)|^Upper age limit/.test(w))] }; }
  if (fit?.field) return trade.length ? { label: 'eligible', why: [...own, `Eligible: ${trade.join('; ')}.`, ...rest] } : { label: 'strong', why: [...own, ...rest] };
  const rel = relatedFit(p, prof, today);
  if (rel) return { label: 'related', why: [rel, ...(trade.length ? [`Trade-off: ${trade.join('; ')}.`] : []), ...rest] };
  return { label: 'eligible', why: [`Eligible: ${trade.length ? trade.join('; ') : 'meets every essential condition the notice states'}.`, ...rest] };
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
  return [fit?.field || subjectExact(p, prof) ? 2 : l.label === 'related' ? 1 : 0, levelFit(p, prof), cert, near ? home : pay, near ? pay : home, -daysLeft(p.lastDate, today)];
}
export function compareKeys(a: number[], b: number[]) { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (b[i] ?? 0) - (a[i] ?? 0); if (d) return d; } return 0; }
