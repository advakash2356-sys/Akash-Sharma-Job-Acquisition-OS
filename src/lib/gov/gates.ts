// Government Jobs matching gates (Akash's JAOS Gov Matching Spec, rules 1-5). Pure functions, fixture-tested.
// They read ONLY what the posting text states plus the one-time profile. An unknown never blocks: it becomes
// "Check notice" with the exact clause to verify. Not legal advice. Akash Sync Agent.
import type { Profile } from '../govJobs';

// ---------- Disciplines ----------
/** Discipline families. Professional ones (LAW, MEDICAL, DENTAL, NURSING, PHARMACY, ENGINEERING, CA, TEACHING) are hard gates. */
export type Disc = 'LAW' | 'MEDICAL' | 'DENTAL' | 'NURSING' | 'PHARMACY' | 'ENGINEERING' | 'CA' | 'TEACHING' | 'COMMERCE' | 'ENV' | 'LIFE' | 'AGRI' | 'CHEM' | 'PHYSICS' | 'COMPUTER' | 'STATS' | 'ARTS' | 'MGMT';
export const PROFESSIONAL: Disc[] = ['LAW', 'MEDICAL', 'DENTAL', 'NURSING', 'PHARMACY', 'ENGINEERING', 'CA', 'TEACHING'];
export const DISC_NAME: Record<Disc, string> = { LAW: 'Law (LLB)', MEDICAL: 'Medicine (MBBS/MD)', DENTAL: 'Dental (BDS/MDS)', NURSING: 'Nursing', PHARMACY: 'Pharmacy', ENGINEERING: 'Engineering (BE/BTech)', CA: 'CA / CMA / CS', TEACHING: 'Teaching (B.Ed / NET)', COMMERCE: 'Commerce / Finance', ENV: 'Environmental Science', LIFE: 'Life Sciences', AGRI: 'Agriculture / Forestry', CHEM: 'Chemistry', PHYSICS: 'Physics', COMPUTER: 'Computer Science / IT', STATS: 'Statistics / Mathematics / Economics', ARTS: 'Arts / Humanities', MGMT: 'Management (MBA)' };
/** What a POST asks for. Title words are strong signals; eligibility text names degrees. */
const POST_TITLE: [Disc, RegExp][] = [
  ['LAW', /\b(law officer|legal (?:officer|advis[eo]r|assistant|consultant|manager|counsel|retainer)|so[- ]?\(?law\)?|\(law\)|\blaw\b(?! enforcement)|prosecutor|prosecution|judge|judicial (?:magistrate|member|service|officer)|magistrate|civil judge|pcs[- ]?\(?j\)?|hjs|munsif|standing counsel|panel (?:counsel|lawyer|advocate)|legal aid (?:defen[cs]e )?counsel|ladc|government pleader|notary|oath commissioner|law clerk|drafting counsel)\b/i],
  ['MEDICAL', /\b(medical officer|gdmo|doctor|physician|surgeon|specialist \(|senior resident|junior resident|casualty medical|imo\b|radiologist|anaesthet\w*|paediatric\w*|gynae\w*|psychiatrist|pathologist|medical superintendent|chief medical|cmo\b)\b/i],
  ['DENTAL', /\b(dental surgeon|dentist|dental officer)\b/i], ['NURSING', /\b(staff nurse|nursing officer|nurse|anm\b|gnm\b|nursing tutor)\b/i], ['PHARMACY', /\b(pharmacist|drug inspector|pharmacy officer)\b/i],
  ['ENGINEERING', /\b(engineer|engineering|\bje\b|\bae\b|\bsde\b|graduate engineer trainee|technical officer|draughtsman|town planner)\b/i],
  ['CA', /\b(chartered accountant|cost accountant|company secretary|internal auditor|finance (?:officer|manager)|accounts officer)\b/i],
  ['TEACHING', /\b(teacher|tgt|pgt|prt|lecturer|assistant professor|associate professor|professor|faculty|principal(?! (?:district|secretary|scientist|judge|chief|private|accountant|magistrate))|headmaster|guest faculty)\b/i],
  ['ENV', /\b(environment\w*|pollution|ecolog\w*|climate|forest(?:ry)? (?:research|ecology)|wildlife|biodiversity)\b/i],
  ['AGRI', /\b(agricultur\w*|horticultur\w*|forest (?:officer|ranger|range officer)|range forest officer|acf\b|agronomist|veterinar\w*)\b/i],
  ['STATS', /\b(data analyst|statistic\w*|economist|economic (?:officer|investigator)|research officer \(economics\))\b/i],
  ['COMPUTER', /\b(programmer|software|system analyst|it officer|network|database|cyber)\b/i],
];
const POST_ELIG: [Disc, RegExp][] = [
  ['LAW', /\b(ll\.?\s?b|ll\.?\s?m|degree in law|law graduate|bachelor of laws?|enrol(?:l)?ed as (?:an )?advocate|bar council|practi[cs]ing advocate|practice (?:at|in) the bar|as an advocate)\b/i],
  ['MEDICAL', /\b(mbbs|m\.?d\.?\b|m\.?s\.?\b(?= ?\()|nmc|national medical commission|medical council|mci\b)\b/i], ['DENTAL', /\b(bds|mds)\b/i], ['NURSING', /\b(b\.?sc\.? nursing|gnm|anm|nursing council)\b/i], ['PHARMACY', /\b(b\.?\s?pharm|d\.?\s?pharm|m\.?\s?pharm|pharmacy council)\b/i],
  ['ENGINEERING', /\b(b\.?\s?e\.?\b|b\.?\s?tech|m\.?\s?tech|degree in engineering|engineering degree|gate score|be\/btech)\b/i],
  ['CA', /\b(icai|chartered accountant|cma\b|icwa|icmai|company secretary|icsi)\b/i], ['TEACHING', /\b(b\.?\s?ed|ctet|tet\b|ugc[- ]net|net\/set|slet)\b/i],
  ['ENV', /\b(environmental (?:science|studies|engineering)|ecology)\b/i], ['LIFE', /\b(life sciences?|biolog\w*|zoology|botany|microbiology|biotechnology|bio[- ]?science)\b/i],
  ['AGRI', /\b(agricultur\w*|forestry|horticultur\w*|veterinary)\b/i], ['CHEM', /\bchemistry\b/i], ['PHYSICS', /\bphysics\b/i],
  ['COMPUTER', /\b(computer science|computer applications|mca\b|bca\b|information technology)\b/i], ['STATS', /\b(statistics|mathematics|economics|econometrics)\b/i],
  ['COMMERCE', /\b(commerce|b\.?\s?com|m\.?\s?com|accountancy|finance)\b/i], ['MGMT', /\b(mba|pgdm|management degree)\b/i],
];
/** Disciplines a post asks for (title first; eligibility text adds). Menial titles ask for none. */
export function postDiscs(title: string, eligibility = ''): Disc[] {
  if (MENIAL_ANY.test(title) && !/law clerk/i.test(title)) return [];
  const s = new Set<Disc>(); for (const [d, re] of POST_TITLE) if (re.test(title)) s.add(d);
  for (const [d, re] of POST_ELIG) if (re.test(eligibility)) s.add(d);
  // "Assistant Professor (Law)" is a law post that also needs NET: keep both. A "Legal Assistant" is never an engineering post.
  if (s.has('LAW') && /\b(assistant|technical)\b/i.test(title) && !POST_ELIG[5][1].test(eligibility)) s.delete('ENGINEERING');
  return [...s];
}
/** Disciplines the PERSON holds: professional degree + free-text subjects (e.g. "MSc Environmental Science"). */
export function userDiscs(prof?: Profile | null): Disc[] {
  if (!prof) return []; const s = new Set<Disc>();
  const m: Record<string, Disc> = { law: 'LAW', engineering: 'ENGINEERING', medical: 'MEDICAL', finance: 'CA', teaching: 'TEACHING' }; if (prof.spec && m[prof.spec]) s.add(m[prof.spec]);
  if (prof.edu === 'eng') s.add('ENGINEERING');
  const t = `${prof.subject || ''}`; for (const [d, re] of POST_ELIG) if (re.test(t)) s.add(d);
  if (/\b(environment\w*|ecolog\w*)\b/i.test(t)) s.add('ENV'); if (/\b(nurs\w*)\b/i.test(t)) s.add('NURSING'); if (/\b(dental|bds)\b/i.test(t)) s.add('DENTAL');
  if (/\b(b\.?a\.?|m\.?a\.?|arts|history|political science|sociology|english|hindi|psychology)\b/i.test(t)) s.add('ARTS');
  if (/\b(b\.?\s?sc|m\.?\s?sc|science)\b/i.test(t) && ![...s].some((d) => ['ENV', 'LIFE', 'CHEM', 'PHYSICS', 'COMPUTER', 'STATS', 'AGRI'].includes(d))) s.add('LIFE');
  return [...s];
}
/** Fair cross-fits: a degree in the key family is accepted for posts asking for any family in the list. */
export const CROSS: Partial<Record<Disc, Disc[]>> = {
  ENV: ['ENV', 'LIFE', 'AGRI', 'CHEM', 'STATS'], LIFE: ['LIFE', 'ENV', 'AGRI'], AGRI: ['AGRI', 'ENV', 'LIFE'], CHEM: ['CHEM', 'ENV'], PHYSICS: ['PHYSICS', 'STATS'],
  ENGINEERING: ['ENGINEERING', 'COMPUTER', 'STATS'], COMPUTER: ['COMPUTER', 'STATS'], STATS: ['STATS'], CA: ['CA', 'COMMERCE'], COMMERCE: ['COMMERCE'], MEDICAL: ['MEDICAL', 'LIFE'], MGMT: ['MGMT', 'COMMERCE'],
};
/** Exact degree & discipline gate. ok=null when the post names no discipline (any graduate) or the person's degree is unknown. */
// ---------- Engineering branches (spec Gate 2: "specific engineering branch codes") ----------
export type Branch = 'CIVIL' | 'MECH' | 'ELEC' | 'ECE' | 'CSE' | 'CHEM' | 'ENV' | 'INSTR' | 'MINING' | 'METAL' | 'AERO' | 'BIOTECH' | 'AGRI';
const BRANCH: [Branch, RegExp][] = [['CIVIL', /\bcivil\b/i], ['MECH', /\bmech\w*|production engineering|industrial engineering/i], ['ELEC', /\belectrical\b|\beee\b|electrical (?:and|&) electronics/i],
  ['ECE', /\belectronics\b|\bece\b|telecommunication|communication engineering/i], ['CSE', /\bcse\b|computer science|computer engineering|information technology|\bit\b(?= engineering|\))|software engineering/i],
  ['CHEM', /\bchemical engineering|\bchemical\b(?= \w*\s*engineer)/i], ['ENV', /\benvironment\w*/i], ['INSTR', /\binstrumentation\b/i], ['MINING', /\bmining\b/i], ['METAL', /\bmetallurg\w*/i], ['AERO', /\baero\w*/i], ['BIOTECH', /\bbiotech\w*/i], ['AGRI', /agricultural engineering/i]];
/** Close branches accepted for each other. */
const BRANCH_OK: Partial<Record<Branch, Branch[]>> = { ELEC: ['ELEC', 'ECE', 'INSTR'], ECE: ['ECE', 'ELEC', 'INSTR', 'CSE'], CSE: ['CSE', 'ECE'], INSTR: ['INSTR', 'ECE', 'ELEC'], MECH: ['MECH', 'AERO'], AERO: ['AERO', 'MECH'], CHEM: ['CHEM', 'ENV'], ENV: ['ENV', 'CIVIL', 'CHEM'], CIVIL: ['CIVIL', 'ENV'] };
export const branchesOf = (t: string): Branch[] => BRANCH.filter(([, re]) => re.test(t)).map(([b]) => b);
/** null = the post names no branch or the person's branch is unknown. */
export function branchGate(p: { title: string; eligibility: string }, prof?: Profile | null): { ok: boolean | null; need: Branch[]; why?: string } {
  const need = branchesOf(`${p.title} ${p.eligibility}`); if (!need.length) return { ok: null, need };
  const have = branchesOf(prof?.subject || ''); if (!have.length) return { ok: null, need, why: `verify your engineering branch (post asks for ${need.join(' / ')})` };
  const acc = new Set(have.flatMap((b) => BRANCH_OK[b] || [b]));
  return need.some((b) => acc.has(b)) ? { ok: true, need } : { ok: false, need, why: `Needs ${need.join(' / ')} engineering; your branch is ${have.join(' / ')}.` };
}
const SCHOOL = new Set(['10', '12', 'iti', 'diploma']);
export function disciplineGate(p: { title: string; eligibility: string }, prof?: Profile | null): { ok: boolean | null; need: Disc[]; have: Disc[]; why?: string } {
  const need = postDiscs(p.title, p.eligibility); const have = userDiscs(prof);
  if (!need.length) return { ok: null, need, have };
  // M6: a degree-family post is not open to 10th / 12th / ITI profiles (diploma holders keep diploma-level engineering posts).
  if (prof && SCHOOL.has(prof.edu) && !have.length && !(prof.edu === 'diploma' && /\bdiploma\b/i.test(p.eligibility) && need.includes('ENGINEERING')))
    return { ok: false, need, have, why: `Needs a degree (${need.map((d) => DISC_NAME[d]).join(' / ')}); your highest education is below graduate.` };
  if (!have.length) return { ok: null, need, have, why: `Check notice: needs ${need.map((d) => DISC_NAME[d]).join(' / ')}. Add your degree subject in "Your details".` };
  const accepts = new Set<Disc>(have.flatMap((d) => CROSS[d] || [d]));
  // Professional posts need the professional degree itself; non-professional subject posts accept fair cross-fits.
  const prof_ = need.filter((d) => PROFESSIONAL.includes(d)); const subj = need.filter((d) => !PROFESSIONAL.includes(d));
  const okProf = prof_.length ? prof_.some((d) => have.includes(d)) : null; const okSubj = subj.length ? subj.some((d) => accepts.has(d)) : null;
  // A post that names both (e.g. "Environmental Engineer": ENGINEERING + ENV) is open to either.
  let ok = okProf === true || okSubj === true ? true : okProf === false || okSubj === false ? false : null;
  // Branch gate: an engineering match counts only for the right branch (CSE is not Civil or Environmental).
  if (ok && need.includes('ENGINEERING') && have.includes('ENGINEERING')) { const bg = branchGate(p, prof); if (bg.ok === false) return { ok: false, need, have, why: bg.why }; }
  return { ok, need, have, why: ok === false ? `Needs ${need.map((d) => DISC_NAME[d]).join(' / ')}; your degree (${have.map((d) => DISC_NAME[d]).join(', ')}) does not match.` : undefined };
}

// ---------- Licence & experience ----------
export function licenceGate(p: { title: string; eligibility: string }, prof?: Profile | null): { ok: boolean | null; why?: string } {
  const t = `${p.title} ${p.eligibility}`;
  const needBar = /\b(enrol(?:l)?ed as (?:an )?advocate|bar council|practi[cs]ing advocate|practice (?:at|in) the bar|certificate of practice|as an advocate)\b/i.test(t) || /\b(higher judicial|hjs|district judge \(entry|public prosecutor|standing counsel|panel (?:counsel|lawyer)|legal aid (?:defen[cs]e )?counsel|government pleader)\b/i.test(p.title);
  const needNmc = /\b(nmc|national medical commission|medical council|mci\b)\b/i.test(t) || /\b(medical officer|gdmo|senior resident|specialist \()\b/i.test(p.title);
  const needIcai = /\b(icai|associate member|fca|aca)\b/i.test(t) && /\b(chartered accountant|icai)\b/i.test(t);
  const req = [needBar && ['Bar Council enrolment', prof?.bar] as const, needNmc && ['NMC / State Medical Council registration', prof?.medReg] as const, needIcai && ['ICAI membership', prof?.icai] as const].filter(Boolean) as (readonly [string, boolean | undefined])[];
  if (!req.length) return { ok: null };
  const missing = req.filter(([, v]) => v === false); if (missing.length) return { ok: false, why: `Needs ${missing.map(([n]) => n).join(' and ')}; you said you do not hold it.` };
  const unknown = req.filter(([, v]) => v === undefined); if (unknown.length) return { ok: null, why: `Check notice: ${unknown.map(([n]) => n).join(' and ')} required. Add it in "Your details".` };
  return { ok: true, why: `${req.map(([n]) => n).join(' and ')} held.` };
}
/** Years of practice/experience a notice asks for (largest stated); HJS / ADJ direct from Bar = 7 by Article 233. */
export function expNeeded(p: { title: string; eligibility: string }): number | undefined {
  const ys = [...`${p.eligibility} ${p.title}`.matchAll(/(\d{1,2})\s*(?:\+\s*)?(?:years?|yrs?)\s*(?:of\s*)?(?:continuous\s*|post[- ]qualification\s*|relevant\s*|regular\s*)?(?:practice|experience|standing)/gi)].map((m) => Number(m[1])).filter((n) => n > 0 && n <= 30);
  if (ys.length) return Math.max(...ys);
  if (/\b(higher judicial|hjs|additional district judge|district judge)\b/i.test(p.title)) return 7;
  return undefined;
}
export function experienceGate(p: { title: string; eligibility: string }, prof?: Profile | null): { ok: boolean | null; need?: number; why?: string } {
  const need = expNeeded(p); if (need === undefined) return { ok: null };
  if (prof?.expYears === undefined) return { ok: null, need, why: `Check notice: needs ${need} years' experience/practice on the cut-off date.` };
  return prof.expYears >= need ? { ok: true, need, why: `${prof.expYears} yrs experience vs ${need} needed.` } : { ok: false, need, why: `Needs ${need} years' experience/practice; you have ${prof.expYears}.` };
}

// ---------- Domicile & regional language ----------
export const STATE_LANG: Record<string, string> = { Punjab: 'Punjabi', Maharashtra: 'Marathi', 'Uttar Pradesh': 'Hindi', 'Madhya Pradesh': 'Hindi', Bihar: 'Hindi', Rajasthan: 'Hindi', Haryana: 'Hindi', Uttarakhand: 'Hindi', 'Himachal Pradesh': 'Hindi', Chhattisgarh: 'Hindi', Jharkhand: 'Hindi', Delhi: 'Hindi',
  'Tamil Nadu': 'Tamil', Karnataka: 'Kannada', Kerala: 'Malayalam', 'Andhra Pradesh': 'Telugu', Telangana: 'Telugu', 'West Bengal': 'Bengali', Odisha: 'Odia', Gujarat: 'Gujarati', Assam: 'Assamese', Goa: 'Konkani', Manipur: 'Manipuri', Tripura: 'Bengali / Kokborok', Puducherry: 'Tamil', 'Jammu and Kashmir': 'Urdu', 'Jammu & Kashmir': 'Urdu' };
const STATE_LEVEL = new Set(['state', 'local', 'judiciary']);
export function domicileGate(p: { title: string; eligibility: string; state: string; level?: string }, prof?: Profile | null): { ok: boolean | null; why?: string } {
  if (!p.state || p.state === 'All India' || !STATE_LEVEL.has(p.level || 'state')) return { ok: null };
  const home = !!prof?.state && prof.state.toLowerCase().replace('&', 'and') === p.state.toLowerCase().replace('&', 'and');
  const lang = STATE_LANG[p.state]; const knows = !!lang && (prof?.languages || []).some((l) => lang.toLowerCase().split(/\s*\/\s*/).includes(l.trim().toLowerCase()));
  const needsDom = /\bdomicile|bona ?fide resident|permanent resident\b/i.test(p.eligibility);
  const parts: string[] = [];
  if (!home || prof?.domicile === false) parts.push(`${p.state} state post: domicile${needsDom ? ' is required' : ' may be required'} and reserved-category relaxation usually needs it`);
  if (lang && !knows && (!home || (prof?.languages?.length ?? 0) > 0)) parts.push(`${lang} language paper/knowledge may be compulsory`);
  if (!parts.length) return { ok: true, why: home ? `Your home state${lang && knows ? `; you know ${lang}` : ''}.` : undefined };
  return { ok: needsDom && !home ? false : null, why: `Check notice: ${parts.join('; ')}.` };
}

// ---------- Age relaxation (DoPT baseline; a notice can differ) ----------
/** OBC +3, SC/ST +5; PwBD +10 (UR/EWS) / +13 (OBC) / +15 (SC/ST) in total; Ex-SM: military service + 3 years. */
export function relaxYears(p: Pick<Profile, 'cat' | 'pwbd'> & Partial<Pick<Profile, 'esm' | 'esmYears'>>, homeState = true): { years: number; note: string } {
  const cat = homeState ? (p.cat === 'OBC' ? 3 : p.cat === 'SC' || p.cat === 'ST' ? 5 : 0) : 0;
  const pw = p.pwbd ? 10 : 0; const esm = p.esm ? (p.esmYears ?? 0) + 3 : 0;
  const years = Math.max(cat + pw, esm); const bits = [cat ? `${p.cat} +${cat}` : '', pw ? `PwBD +${pw}` : '', esm ? `Ex-SM ${p.esmYears ? `${p.esmYears} yrs service ` : ''}+3` : ''].filter(Boolean);
  return { years, note: bits.join(', ') };
}

// ---------- Level floor by tier ----------
/** 10th/ITI-level and support posts. */
export const MENIAL_ANY = /\b(peon|sweeper|safai|chowkidar|watchman|security guard|gate ?keeper|helper|attendant|cook|mali|gardener|mts|multi[- ]?tasking|orderly|daftary|daftari|chaprasi|process server|bailiff|cleaner|sanitation|trackman|track maintainer|khalasi|driver|constable|home ?guard|agniveer|agnipath|forest guard|van rakshak|gds|gramin dak sevak|dak sevak|lab attendant|park(?:ing)? attendant|porter|dhobi|barber|tradesman)(?:s|es)?\b|चपरासी|अनुसेवक|आदेशपाल|चालक|वाहन चालक|चौकीदार|माली|सफाई|स्वच्छक|परिचारक|सिपाही|आरक्षी|होम ?गार्ड|अग्निवीर|वनरक्षक|पत्रवाहक|फर्राश|दफ्तरी|प्रोसेस सर्वर|आदेशिका वाहक/i;
/** Clerical posts: blocked for professional graduates, not for general graduates. */
export const CLERICAL = /\b(ldc|udc|lower division|upper division|clerk|data entry|deo|typist|stenographer|steno|office assistant|junior assistant|record keeper|copyist|junior court assistant|court assistant|assistant grade|computer operator|receptionist|supportive staff|para[- ]?legal volunteer|plv)(?:s|es)?\b|पारा ?विधिक|विधिक स्वयंसेवक|लिपिक|टंकक|आशुलिपिक|डाटा एंट्री|कनिष्ठ सहायक|सहायक ग्रेड|प्रतिलिपिक|कंप्यूटर ऑपरेटर|नाजिर|नाज़िर/i;
export type Tier = 'school' | 'graduate' | 'professional' | 'senior';
/** Spec table: senior professional (PhD, or PG/professional + 5 yrs), professional graduate (LLB, BTech, MBBS, CA, PG), general graduate, school. */
export function userTier(prof?: Profile | null): Tier | null {
  if (!prof) return null; const pro = (!!prof.spec && prof.spec !== 'other') || prof.edu === 'eng';
  if (prof.edu === 'phd' || ((pro || prof.edu === 'pg') && (prof.expYears ?? 0) >= 5)) return 'senior';
  if (pro || prof.edu === 'pg') return 'professional';
  if (prof.edu === 'grad') return 'graduate';
  return 'school';
}
/** Does the floor block this post for this person? Own-profession posts (e.g. Law Clerk-cum-Research Assistant) are never blocked. */
export function floorBlocks(p: { title: string; eligibility: string; eduTags?: string[] }, prof?: Profile | null, ownProfession = false): string | null {
  const tier = userTier(prof); if (!tier || tier === 'school' || ownProfession && !MENIAL_ANY.test(p.title)) return null;
  const lowEdu = !!p.eduTags?.length && p.eduTags.every((t) => ['10TH', '12TH', 'ITI'].includes(t));
  if (MENIAL_ANY.test(p.title) || /\b(10th|matric(?:ulation)?|class (?:x|10)|8th) pass\b/i.test(`${p.title} ${p.eligibility}`) || lowEdu && !CLERICAL.test(p.title) && p.eduTags!.every((t) => t !== '12TH')) return '10th / 12th / ITI-level post';
  if (tier === 'graduate') return lowEdu && p.eduTags!.every((t) => t !== '12TH') ? '10th / ITI-level post' : null;
  if (CLERICAL.test(p.title) || lowEdu || /\bgroup\s*[cd]\b/i.test(`${p.title} ${p.eligibility}`)) return 'clerical / Group C-D post';
  if (tier === 'senior' && /\b(trainee|apprentice|graduate engineer trainee|management trainee|group\s*b non[- ]gazetted)\b/i.test(p.title)) return 'fresh-graduate trainee / Group B non-gazetted post';
  return null;
}

// ---------- Pay ----------
/** 7th CPC Pay Matrix entry pay by level (basic, Rs). */
export const LEVEL_PAY: Record<number, number> = { 1: 18000, 2: 19900, 3: 21700, 4: 25500, 5: 29200, 6: 35400, 7: 44900, 8: 47600, 9: 53100, 10: 56100, 11: 67700, 12: 78800, 13: 123100, 14: 144200, 15: 182200, 16: 205400, 17: 225000, 18: 250000 };
/** Pay level and basic stated in the pay text. A range ("Level 2-10", "Rs 25,500 - 81,100") uses its UPPER bound for level and LOWER for entry basic. */
export function payInfo(pay: string): { level?: number; levelMin?: number; basic?: number; basicMax?: number } {
  const r = pay.match(/level[- ]?(\d{1,2})\s*(?:-|to|–|&|and|\/)\s*(?:level[- ]?)?(\d{1,2})\b/i); const l = pay.match(/level[- ]?(\d{1,2})\b/i) || pay.match(/\b(\d{1,2})(?:st|nd|rd|th)? level of pay/i);
  const nums = (pay.match(/\d{1,3}(?:,\d{2,3})+|\d{5,6}/g) || []).map((x) => Number(x.replace(/,/g, ''))).filter((x) => x >= 5000);
  const lv = r ? [Number(r[1]), Number(r[2])].filter((n) => n >= 1 && n <= 18) : l ? [Number(l[1])] : [];
  return { level: lv.length ? Math.max(...lv) : undefined, levelMin: lv.length ? Math.min(...lv) : undefined, basic: nums.length ? Math.min(...nums) : undefined, basicMax: nums.length ? Math.max(...nums) : undefined };
}
/** Below the person's minimum pay level? null = pay not stated (never hides). Uses the TOP of a stated range. */
export function payBelow(pay: string, minLevel?: number): boolean | null {
  if (!minLevel) return null; const { level, basicMax } = payInfo(pay || '');
  if (level !== undefined) return level < minLevel;
  if (basicMax !== undefined) return basicMax < (LEVEL_PAY[minLevel] || 0);
  return null;
}

// ---------- Lawyer completeness ----------
const LAW_POST = /\b(law officer|legal (?:officer|advis[eo]r|assistant|consultant|manager|counsel|retainer)|so[- ]?\(?law\)?|\(law\)|standing counsel|panel (?:counsel|lawyer|advocate)|legal aid (?:defen[cs]e )?counsel|ladc|government pleader|drafting counsel|oath commissioner|judicial member|member \(judicial\))\b/i;
const BANK = /\b(bank|sbi|ibps|nabard|sidbi|exim|nhb)\b/i; const REG = /\b(rbi|reserve bank|sebi|irdai|pfrda|ifsca|cci|trai|nclt|nclat|itat|drt|drat|cestat|tribunal|commission(?! for)|aptel|ngt|green tribunal)\b/i;
const PSU = /\b(limited|ltd|corporation|ntpc|ongc|iocl|gail|bhel|powergrid|coal india|sail|hal|bel)\b/i;
/** Spec QA2: judicial, prosecutor, and law-officer posts across courts & ministries, PSUs, banks and regulators/tribunals, each counted separately. */
export const LAW_STREAMS: [string, (p: { title: string; org?: string }) => boolean][] = [
  ['Judicial (Civil Judge / HJS / Magistrate / Law Clerk)', (p) => /\b(civil judge|judicial (?:service|magistrate|officer)|magistrate|hjs|higher judicial|district judge|munsif|pcs[- ]?\(?j\)?|law clerk)\b/i.test(p.title)],
  ['Prosecutor (APP / PP / Special PP)', (p) => /\b(prosecutor|prosecution)\b/i.test(p.title)],
  ['Law officer / counsel: courts & ministries', (p) => LAW_POST.test(p.title) && !BANK.test(`${p.title} ${p.org || ''}`) && !REG.test(`${p.title} ${p.org || ''}`) && !PSU.test(p.org || '')],
  ['Law officer: PSUs', (p) => LAW_POST.test(p.title) && PSU.test(p.org || '') && !BANK.test(`${p.title} ${p.org || ''}`)],
  ['Law officer: public sector banks', (p) => LAW_POST.test(p.title) && BANK.test(`${p.title} ${p.org || ''}`)],
  ['Legal: regulators & tribunals', (p) => LAW_POST.test(p.title) && REG.test(`${p.title} ${p.org || ''}`)],
];
/** Streams our sources do not read yet, named so an empty count is not mistaken for "nothing open anywhere". */
export const LAW_UNCOVERED = ['Law officer: PSUs', 'Law officer: public sector banks', 'Legal: regulators & tribunals'];
export function lawStreams(list: { title: string; org?: string; eligibility?: string }[]): { name: string; n: number; uncovered: boolean }[] {
  return LAW_STREAMS.map(([name, f]) => ({ name, n: list.filter(f).length, uncovered: LAW_UNCOVERED.includes(name) }));
}
