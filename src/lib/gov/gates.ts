// Government Jobs matching gates (Akash's JAOS Gov Matching Spec, rules 1-5). Pure functions, fixture-tested.
// They read ONLY what the posting text states plus the one-time profile. An unknown never blocks: it becomes
// "Check notice" with the exact clause to verify. Not legal advice. Akash Sync Agent.
import type { Profile } from '../govJobs';
import { CLERICAL_RE, EXP_NAME, EXP_SHORT, LEVEL_PAY, LICENCE_NAME, OFFICER_RE, SUPPORT_RE, factsOf, payInfo, postLevelOf, splitEligibility, type NoticeFacts, type Licence } from './notice';
export { LEVEL_PAY, payInfo, factsOf, postLevelOf } from './notice';

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
  ['LAW', /\b(l\.?\s?l\.?\s?b|l\.?\s?l\.?\s?m|degree in law|law graduate|bachelor of laws?|enrol(?:l)?ed as (?:an )?advocate|bar council|practi[cs]ing advocate|practice (?:at|in) the bar|as an advocate)\b/i],
  ['MEDICAL', /\b(mbbs|m\.?d\.?\b|m\.?s\.?\b(?= ?\()|nmc|national medical commission|medical council|mci\b)\b/i], ['DENTAL', /\b(bds|mds)\b/i], ['NURSING', /\b(b\.?sc\.? nursing|gnm|anm|nursing council)\b/i], ['PHARMACY', /\b(b\.?\s?pharm|d\.?\s?pharm|m\.?\s?pharm|pharmacy council)\b/i],
  ['ENGINEERING', /\b(b\.?\s?e\.?\b|b\.?\s?tech|m\.?\s?tech|degree in engineering|engineering degree|gate score|be\/btech)\b/i],
  ['CA', /\b(icai|chartered accountant|cma\b|icwa|icmai|company secretary|icsi)\b/i], ['TEACHING', /\b(b\.?\s?ed|ctet|tet\b|ugc[- ]net|net\/set|slet)\b/i],
  ['ENV', /\b(environmental (?:science|studies|engineering)|ecology)\b/i], ['LIFE', /\b(life sciences?|biolog\w*|zoology|botany|microbiology|biotechnology|bio[- ]?science)\b/i],
  ['AGRI', /\b(agricultur\w*|forestry|horticultur\w*|veterinary)\b/i], ['CHEM', /\bchemistry\b/i], ['PHYSICS', /\bphysics\b/i],
  ['COMPUTER', /\b(computer science|computer applications|mca\b|bca\b|information technology)\b/i], ['STATS', /\b(statistics|mathematics|economics|econometrics)\b/i],
  ['COMMERCE', /\b(commerce|b\.?\s?com|m\.?\s?com|accountancy|finance)\b/i], ['MGMT', /\b(mba|pgdm|management degree)\b/i],
  ['CA', /\bCA\b(?![- ]?(?:Inter|Foundation))/], // "CA / MBA Finance": upper-case CA only
];
/** Disciplines a post asks for (title first; eligibility text adds). Menial titles ask for none. */
/** Eligibility text without the preferred / desirable phrases: only the phrase is dropped, not the whole comma clause.
 *  Catches "X preferred", "preferably X", "(desirable)", "Desirable: X", "preference will be given to X", "X will be given weightage",
 *  "X is an added advantage", "desirable but not essential". */
export function requiredPart(t: string): string { return splitEligibility(t || '').essential; }
export function postDiscs(title: string, eligibility = ''): Disc[] {
  eligibility = requiredPart(eligibility);
  if (SUPPORT_RE.test(title) && !OFFICER_RE.test(title) && !/law clerk/i.test(title)) return [];
  const s = new Set<Disc>(); for (const [d, re] of POST_TITLE) if (re.test(title)) s.add(d);
  // "Graduate in any discipline" opens a non-professional title (Data Analyst, Research Associate) to every degree.
  if (/\bany (?:discipline|degree|graduat\w*|stream|subject)\b|\bgraduat\w* in any\b/i.test(eligibility)) for (const d of [...s]) if (!PROFESSIONAL.includes(d)) s.delete(d);
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
/** The post names one of the person's own disciplines directly (not via a cross-fit). prof=true limits it to professional degrees (CA, LLB, MBBS, BE...). */
export function directMatch(p: { title: string; eligibility: string }, prof?: Profile | null, professionalOnly = false): boolean {
  const have = new Set(userDiscs(prof)); return postDiscs(p.title, p.eligibility).some((d) => have.has(d) && (!professionalOnly || PROFESSIONAL.includes(d)));
}
/** Fair cross-fits: a degree in the key family is accepted for posts asking for any family in the list. */
export const CROSS: Partial<Record<Disc, Disc[]>> = {
  ENV: ['ENV', 'LIFE', 'AGRI', 'CHEM', 'STATS'], LIFE: ['LIFE', 'ENV', 'AGRI'], AGRI: ['AGRI', 'ENV', 'LIFE'], CHEM: ['CHEM', 'ENV'], PHYSICS: ['PHYSICS', 'STATS'],
  ENGINEERING: ['ENGINEERING', 'COMPUTER', 'STATS'], COMPUTER: ['COMPUTER', 'STATS'], STATS: ['STATS'], CA: ['CA', 'COMMERCE'], COMMERCE: ['COMMERCE'], MEDICAL: ['MEDICAL', 'LIFE'], MGMT: ['MGMT', 'COMMERCE'],
};
/** Exact degree & discipline gate. ok=null when the post names no discipline (any graduate) or the person's degree is unknown. */
// ---------- Related fit (adjacent roles the person's degree AND experience suit, beyond the exact profession) ----------
/** [role regex on the post title, plain role name]. Only posts at or above the level floor are ever offered as related. */
export type RelatedRole = [RegExp, string, string];
/** [title regex, role, reason]. Reason placeholders: {deg} = your degree, {exp} = " and N years of experience". First match wins, so specific roles come first
 *  (Policy Analyst gets the policy reason, not the analyst one). Only posts at or above the level floor are ever offered as related. */
export const RELATED: Partial<Record<Disc | 'SCHOOL', RelatedRole[]>> = {
  LAW: [[/\bcompliance\b/i, 'compliance', 'compliance work applies the statutes and regulations you know from your {deg} degree{exp}'],
    [/\bpolicy\b|\bregulatory\b|\bgovernance\b/i, 'policy / regulatory', 'policy and regulatory work uses your reading of laws and rules from your {deg} degree{exp}'],
    [/\bcompany secretary\b|\bcontract (?:manager|management|officer)|\bvigilance officer\b|\bethics\b/i, 'contracts / vigilance', 'contracts and vigilance work relies on legal drafting and inquiry skills from your {deg} degree{exp}'],
    [/\bhuman rights\b|\bconsumer (?:affairs|protection)\b/i, 'rights / consumer protection', 'rights and consumer-protection work builds on your {deg} degree{exp}'],
    [/\bresearch (?:officer|associate|fellow)\b|\bresearch analyst\b/i, 'research', 'research posts use the legal research and writing skills of your {deg} degree{exp}'],
    [/\bdata analyst\b|\b(?:policy|research|legal|business|programme|program|management|compliance|risk) analyst\b/i, 'data / analysis', 'analyst posts use the analytical and research skills of your {deg} degree{exp}'],
    [/\blabou?r (?:welfare |enforcement )?officer\b|\bwelfare officer\b|\bconciliation officer\b|कल्याण अधिकारी/i, 'labour / welfare', 'labour and welfare officers enforce labour laws and settle disputes, which your {deg} training covers{exp}'],
    [/\bprotection officer\b|\bchild (?:welfare|protection)\b|\bjuvenile\b|\bwomen(?:'s)? (?:commission|cell)\b/i, 'protection / welfare', 'protection officers act under the DV, POCSO and JJ Acts, which your {deg} degree covers{exp}'],
    [/\b(?:public information|rti)\b|\bassistant registrar\b|\bdeputy registrar\b|\bcourt manager\b|\bestate officer\b|\badministrative officer\b|\bsection officer\b/i, 'administration / registry', 'registry and administrative posts apply service rules, RTI and procedure law from your {deg} degree{exp}'],
    [/\bland (?:acquisition|records|revenue)\b|\brevenue officer\b|\btehsildar\b|\bnaib tehsildar\b|\brent controller\b/i, 'land / revenue', 'land and revenue posts decide disputes under land and revenue codes, close to your {deg} training{exp}'],
    [/\b(?:income )?tax (?:officer|inspector)\b|\bgst\b|\bcustoms\b|\bexcise\b|\benforcement officer\b/i, 'tax / enforcement', 'tax and enforcement posts apply statutes and adjudicate cases, which your {deg} degree prepares you for{exp}'],
    [/\bmediat\w*|\barbitrat\w*|\binsolvency\b|\bcsr\b|\bhuman resources?\b|\bhr officer\b|\bpersonnel officer\b|\belection officer\b/i, 'ADR / HR / insolvency', 'mediation, insolvency and HR posts rely on statutes and drafting from your {deg} degree{exp}']],
  ENV: [[/\bpolicy\b|\bclimate\b|\bsustainab\w*|\besg\b/i, 'policy / climate', 'climate and environment policy draws on your {deg} degree{exp}'],
    [/\bgis\b|remote sensing/i, 'GIS / remote sensing', 'GIS and remote-sensing work uses the mapping skills of your {deg} degree{exp}'],
    [/\bresearch (?:officer|associate|fellow|scientist|assistant)|\bproject (?:associate|scientist|fellow)|\bscientist\b|\bjrf\b|\bsrf\b/i, 'research', 'research posts match the lab and field work of your {deg} degree{exp}'],
    [/\bpollution\b|\bwaste\b|\bwater quality\b|\bforest\w*|\bwildlife\b|\bbiodiversity\b|\becolog\w*/i, 'pollution / natural resources', 'pollution and natural-resource work is core to your {deg} degree{exp}'],
    [/\bdata analyst\b|\b(?:environment\w*|research|policy|data|water|climate) analyst\b|\bstatistic\w*|\bconsultant\b/i, 'data / analysis', 'analyst posts use the data and analytical skills of your {deg} degree{exp}'],
    [/\bdisaster (?:management|risk)\b|\bwater resources?\b|\bwatershed\b|\bsanitation (?:officer|specialist|expert)\b|\bsolid waste\b/i, 'disaster / water / sanitation', 'disaster, water and sanitation programmes use the environmental systems knowledge of your {deg} degree{exp}'],
    [/\b(?:junior |senior )?(?:scientific|science) (?:officer|assistant)\b|\b(?:chemist|analyst) \(|\blaboratory (?:officer|analyst)\b|\bfield (?:officer|investigator)\b/i, 'lab / field science', 'lab and field science posts use the sampling and analysis skills of your {deg} degree{exp}']],
  ENGINEERING: [[/\bpolicy\b|\bregulatory\b/i, 'technical policy', 'technical policy and regulation work draws on your {deg} degree{exp}'],
    [/\bproject (?:manager|officer)|\bplanning officer\b/i, 'projects / planning', 'project and planning work uses your {deg} degree{exp}'],
    [/\btechnical officer\b|\bquality (?:assurance|control)\b|\bqc\b|\bsafety officer\b/i, 'technical / QA / safety', 'QA, safety and technical posts use your {deg} degree{exp}'],
    [/\bdata analyst\b|\b(?:systems?|technical|data|operations|business) analyst\b/i, 'data / analysis', 'analyst posts use the quantitative skills of your {deg} degree{exp}'],
    [/\bit officer\b|\bsystems? officer\b|\bcyber\b|\bdigital\b|\be-governance\b/i, 'IT / e-governance', 'IT and e-governance posts use the technical problem-solving of your {deg} degree{exp}'],
    [/\benergy (?:auditor|manager|officer)\b|\bpatent (?:examiner|officer)\b|\bstandards?\b|\bbis\b|\bproduction officer\b|\bmaintenance officer\b/i, 'energy / patents / standards', 'energy audit, patent and standards work needs the engineering grounding of your {deg} degree{exp}']],
  CA: [[/\bdata analyst\b/i, 'data / analysis', 'analyst posts use the financial-analysis and audit skills of your CA training{exp}'],
    [/\bcompliance\b|\brisk\b|\binternal audit/i, 'risk / compliance', 'risk, audit and compliance work is close to your CA practice{exp}'],
    [/\bpolicy\b|\bregulatory\b/i, 'policy / regulatory', 'financial policy and regulation draws on your CA training{exp}'],
    [/\bfinancial analyst|\bcredit (?:officer|analyst)\b|\b(?:investment|risk|business|treasury|budget) analyst\b/i, 'financial analysis / credit', 'credit and financial analysis use your CA training{exp}'],
    [/\b(?:income )?tax (?:officer|inspector)\b|\bgst\b|\bcustoms\b|\bexcise\b|\bvaluation officer\b|\binsolvency\b/i, 'tax / valuation / insolvency', 'tax, valuation and insolvency work applies the tax and accounting standards of your CA training{exp}'],
    [/\bbank(?:ing)? officer\b|\bprobationary officer\b|\bmanagement trainee\b|\bstartup\b|\bmsme\b|\bproject finance\b|\bco-?operative (?:inspector|officer)\b/i, 'banking / MSME finance', 'bank and MSME finance posts use the credit appraisal skills of your CA training{exp}']],
  MEDICAL: [[/\bpublic health\b|\bepidemiolog\w*|\bhealth (?:officer|programme|program)\b/i, 'public health', 'public-health work builds on your {deg} degree{exp}'],
    [/\bpolicy\b|\bconsultant\b/i, 'health policy', 'health policy and consulting draw on your {deg} degree{exp}'],
    [/\bresearch (?:officer|associate|scientist)|\bscientist\b/i, 'medical research', 'research posts use the clinical knowledge of your {deg} degree{exp}'],
    [/\bhospital (?:administrator|manager)\b|\bhealth (?:insurance|manager)\b|\bmedical (?:records|audit)\b|\bquality (?:manager|officer)\b/i, 'hospital / insurance administration', 'hospital and health-insurance administration needs the clinical judgement of your {deg} degree{exp}'],
    [/\bdrug (?:controller|safety)\b|\bpharmacovigilance\b|\bmedical (?:referee|board|examiner)\b|\bforensic\b/i, 'drug safety / medico-legal', 'drug-safety and medico-legal posts rely on the medical training of your {deg} degree{exp}']],
  // 10th / 12th / ITI: adjacent office posts at their own level; never officer posts.
  SCHOOL: [[/\b(lower division|ldc|upper division|udc|clerk|data entry|deo|computer operator|office assistant|junior assistant|junior court assistant|court assistant|typist|steno\w*|copyist|record keeper|store keeper|library attendant|receptionist|accounts? (?:clerk|assistant)|cashier|tax assistant)\b|लिपिक|टंकक|आशुलिपिक|डाटा एंट्री|कंप्यूटर ऑपरेटर|कनिष्ठ सहायक/i, 'office / clerical', 'office and data-entry work at your level ({deg}){exp}']],
};
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
  // A science-subject mismatch for a science graduate (Statistics asked, B.Sc Chemistry listed) is a check: the profile may not list
  // every subject studied. A professional degree the person does not hold (LLB, MBBS, BE...) or arts vs science is a clear fail.
  const SCI: Disc[] = ['ENV', 'LIFE', 'AGRI', 'CHEM', 'PHYSICS', 'COMPUTER', 'STATS'];
  // A non-professional subject read only from the TITLE ("Data Analyst" -> Statistics) is not an essential the notice states: check.
  const fromText = new Set(postDiscs('', p.eligibility));
  if (ok === false && okProf !== false && subj.every((d) => !fromText.has(d))) return { ok: null, need, have, why: `Check notice: the title suggests ${subj.map((d) => DISC_NAME[d]).join(' / ')}; confirm the essential subject in the notice.` };
  if (ok === false && okProf !== false && have.every((d) => SCI.includes(d)) && subj.every((d) => SCI.includes(d))) return { ok: null, need, have, why: `Check notice: asks for ${need.map((d) => DISC_NAME[d]).join(' / ')}; your profile lists ${have.map((d) => DISC_NAME[d]).join(', ')}. Confirm your degree subjects match.` };
  return { ok, need, have, why: ok === false ? `Needs ${need.map((d) => DISC_NAME[d]).join(' / ')}; your degree (${have.map((d) => DISC_NAME[d]).join(', ')}) does not match.` : undefined };
}

// ---------- Licence & experience ----------
export function licenceGate(p: { title: string; eligibility: string; facts?: NoticeFacts }, prof?: Profile | null): { ok: boolean | null; why?: string } {
  const f = factsOf(p); const held: Record<Licence, boolean | undefined> = { bar: prof?.bar, medReg: prof?.medReg, icai: prof?.icai };
  const req = f.licences.map((l) => [LICENCE_NAME[l], held[l]] as const);
  if (!req.length) return { ok: null };
  const missing = req.filter(([, v]) => v === false); if (missing.length) return { ok: false, why: `Needs ${missing.map(([n]) => n).join(' and ')}; you said you do not hold it.` };
  const unknown = req.filter(([, v]) => v === undefined); if (unknown.length) return { ok: null, why: `Check notice: ${unknown.map(([n]) => n).join(' and ')} required. Add it in "Your details".` };
  return { ok: true, why: `${req.map(([n]) => n).join(' and ')} held.` };
}
/** Years of practice/experience a notice asks for (largest stated); HJS / ADJ direct from Bar = 7 by Article 233. */
export function expNeeded(p: { title: string; eligibility: string; facts?: NoticeFacts }): number | undefined { return factsOf(p).experience?.years; }
/** Essential experience: years AND type (litigation is not corporate legal work; clinical is not public health). A type the profile does
 *  not show is never "met": it becomes Check notice naming the clause. Too few years is a clear fail. */
export function experienceGate(p: { title: string; eligibility: string; facts?: NoticeFacts }, prof?: Profile | null): { ok: boolean | null; need?: number; type?: string; why?: string } {
  const x = factsOf(p).experience; if (!x) return { ok: null };
  const kind = x.type === 'any' ? '' : `${EXP_SHORT[x.type]} `; const noun = x.type === 'litigation' ? 'practice' : 'experience';
  const clause = `${x.years} yrs ${kind}${noun} required`;
  if (prof?.expYears === undefined) return { ok: null, need: x.years, type: x.type, why: `Check notice: ${clause} on the cut-off date; add your years of experience in "Your details".` };
  if (prof.expYears < x.years) return { ok: false, need: x.years, type: x.type, why: `Needs ${x.years} years' ${kind}${noun}; you have ${prof.expYears}.` };
  if (x.type === 'any') return { ok: true, need: x.years, why: `${prof.expYears} yrs experience vs ${x.years} needed.` };
  const have = prof.expType || [];
  if (have.includes(x.type)) return { ok: true, need: x.years, type: x.type, why: `${prof.expYears} yrs ${EXP_SHORT[x.type]} ${noun} vs ${x.years} needed.` };
  return { ok: null, need: x.years, type: x.type, why: `Check notice: ${clause}; your profile shows ${have.length ? have.map((t) => EXP_SHORT[t] || 'other').join(' / ') : 'no experience type (add it in "Your details")'}.` };
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
/** Whole-token match for Devanagari (JS \b does not work there): no Devanagari letter or sign on either side,
 *  with an optional plural / oblique ending (चालकों, सहायकों). So चालक never matches inside संचालक (Director). */
const DEV = '\\u0900-\\u097F';
export const hiTokens = (words: string[]) => `(?<![${DEV}])(?:${words.join('|')})(?:ों|ो|ें|े|ाें)?(?![${DEV}])`;
/** Support-staff titles (canonical taxonomy in notice.ts: peon, attendant, messenger, sweeper, guard, porter, driver, cook,
 *  watchman, daftri, record lifter... in English, Hindi and Marathi, whole tokens). Officer head nouns are excluded by titleClass. */
export const MENIAL_ANY = SUPPORT_RE;
export const CLERICAL = CLERICAL_RE;
/** Officer / professional head nouns anywhere in the WHOLE title (Coast Guard Assistant Commandant, Guard (Train Manager), कामगार कल्याण अधिकारी). */
export const OFFICER_TITLE = OFFICER_RE;
/** Lowest qualification the notice states: 1 = 8th / 10th / ITI, 2 = 12th / diploma, 3 = graduate or higher, null = not stated. From the ESSENTIAL text only. */
export function minQual(p: { title: string; eligibility: string; eduTags?: string[]; facts?: NoticeFacts }): 1 | 2 | 3 | null {
  const m = factsOf(p).minEdu; if (m === null) return null; return m <= 1 ? 1 : m === 2 ? 2 : 3;
}
const LEVEL_WHY = (f: NoticeFacts): string => f.group === 'D' ? 'Group D / Class IV post' : f.payLevel === 1 ? 'pay level 1 post' : f.titleClass === 'support' ? 'support-staff post (peon / attendant / driver / guard level)' : f.minEdu !== null && f.minEdu <= 1 ? '8th / 10th / ITI-level post' : '10th / ITI-level post';
/** Structural floor reason for degree profiles, or null: support level or a below-graduate minimum. Officer posts are never blocked. */
export function structuralFloor(p: { title: string; eligibility: string; pay?: string; eduTags?: string[]; facts?: NoticeFacts }): string | null {
  const f = factsOf(p); const lv = postLevelOf(f);
  if (lv === 'support') return LEVEL_WHY(f);
  if (lv === 'subgrad') return `${f.group === 'C' || (f.payLevel ?? 0) >= 2 ? 'Group C / Class III post' : 'post'} with a 12th-pass / diploma minimum`;
  return null;
}
export type Tier = 'school' | 'graduate' | 'professional' | 'senior';
/** Spec table: senior professional (PhD, or PG/professional + 5 yrs), professional graduate (LLB, BTech, MBBS, CA, PG), general graduate, school. */
export function userTier(prof?: Profile | null): Tier | null {
  if (!prof) return null; const pro = (!!prof.spec && prof.spec !== 'other') || prof.edu === 'eng';
  if (prof.edu === 'phd' || ((pro || prof.edu === 'pg') && (prof.expYears ?? 0) >= 5)) return 'senior';
  if (pro || prof.edu === 'pg') return 'professional';
  if (prof.edu === 'grad') return 'graduate';
  return 'school';
}
/** Does the floor block this post for this person? Reads the notice FIELDS only (level, group, pay level, minimum education, title class).
 *  Own-profession clerical posts (Law Clerk, Legal Assistant) are never blocked; an unknown level never blocks. */
export function floorBlocks(p: { title: string; eligibility: string; eduTags?: string[]; pay?: string; facts?: NoticeFacts }, prof?: Profile | null, ownProfession = false): string | null {
  const tier = userTier(prof); if (!tier || tier === 'school') return null;
  const f = factsOf(p); const lv = postLevelOf(f);
  if (lv === 'officer') return tier === 'senior' && /\b(trainee|apprentice|graduate engineer trainee|management trainee)\b/i.test(p.title) ? 'fresh-graduate trainee post' : null;
  if (lv === 'support') return LEVEL_WHY(f);
  if (ownProfession) return null;
  // General graduates: support / 10th-level posts, and Group C / pay level 2-5 posts whose minimum is below graduation (structural).
  if (tier === 'graduate') return lv === 'subgrad' && (f.group === 'C' || (f.payLevel !== null && f.payLevel >= 2 && f.payLevel <= 5)) ? structuralFloor(p) : null;
  if (lv === 'subgrad') return structuralFloor(p);
  if (lv === 'clerical') return 'clerical / Group C post';
  if (tier === 'senior' && /\b(trainee|apprentice|graduate engineer trainee|management trainee|group\s*b non[- ]gazetted)\b/i.test(p.title)) return 'fresh-graduate trainee / Group B non-gazetted post';
  return null;
}

// ---------- Pay ----------
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
