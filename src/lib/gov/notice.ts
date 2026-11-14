// Structured notice facts (t386u retest 3 redesign). Every notice is parsed ONCE into fields; the level gate, the
// qualification gates and ranking read only these fields, never raw title words. Pure and deterministic: the server
// may refine the same fields from the notice PDF (text or Gemini) and ship them with the posting. Akash Sync Agent.

/** unclear = the title names a recruitment but shows no positive evidence of an open call (applications invited, last date, vacancies,
 *  advertisement); shown only as "Check notice: notice type unclear", never as an open post. */
export type NoticeType = 'open_call' | 'unclear' | 'result_list' | 'admit_schedule' | 'appointment' | 'retiree_only' | 'other';
export type Qual = 'VIII' | 'X' | 'ITI' | 'XII' | 'DIPLOMA' | 'GRAD' | 'BA' | 'BSC' | 'BCOM' | 'LLB' | 'BE' | 'MBBS' | 'BDS' | 'NURSING' | 'PHARM' | 'CA' | 'CA_INTER' | 'CMA' | 'CS' | 'BED'
  | 'PG' | 'MA' | 'MSC' | 'MCOM' | 'MBA' | 'LLM' | 'ME' | 'MD' | 'MPH' | 'NET' | 'PHD';
/** Kind of experience a notice asks for, and the person's own kinds (one-time profile). */
export type ExpType = 'litigation' | 'judicial' | 'corporate_legal' | 'clinical' | 'public_health' | 'teaching' | 'research' | 'audit_accounts' | 'taxation' | 'engineering' | 'software' | 'administrative' | 'other' | 'any';
export const EXP_NAME: Record<ExpType, string> = { litigation: 'litigation / court practice', judicial: 'judicial service', corporate_legal: 'corporate / in-house legal', clinical: 'clinical (hospital)', public_health: 'public health', teaching: 'teaching', research: 'research', audit_accounts: 'audit / accounts', taxation: 'taxation (direct tax / GST)', engineering: 'engineering (design / construction / maintenance)', software: 'software development / IT', administrative: 'administration', other: 'other (as stated)', any: 'relevant' };
export const EXP_SHORT: Record<ExpType, string> = { litigation: 'litigation', judicial: 'judicial', corporate_legal: 'corporate legal', clinical: 'clinical', public_health: 'public health', teaching: 'teaching', research: 'research', audit_accounts: 'audit / accounts', taxation: 'taxation', engineering: 'engineering', software: 'software development', administrative: 'administrative', other: '', any: '' };
export type Licence = 'bar' | 'medReg' | 'icai';
export const LICENCE_NAME: Record<Licence, string> = { bar: 'Bar Council enrolment', medReg: 'NMC / State Medical Council registration', icai: 'ICAI membership' };
export type TitleClass = 'officer' | 'professional' | 'support' | 'clerical' | 'other';
/** low = the title names no officer / professional role and the notice states no minimum above 12th (degree holders: Show all levels). */
export type PostLevel = 'support' | 'low' | 'subgrad' | 'clerical' | 'grad' | 'officer' | null;
export interface NoticeFacts {
  v: 2; source: 'rules' | 'pdf' | 'gemini';
  noticeType: NoticeType;
  /** Degrees / levels from the ESSENTIAL text only; preferred ones never gate. */
  essential: Qual[]; preferred: Qual[]; essentialText: string; preferredText: string;
  /** 0 = 8th or below, 1 = 10th / ITI, 2 = 12th / diploma, 3 = graduate, 4 = postgraduate, 5 = PhD; null = not stated. */
  minEdu: number | null;
  group: 'A' | 'B' | 'C' | 'D' | null; payLevel: number | null; basic: number | null;
  titleClass: TitleClass; isOfficer: boolean;
  /** years null = experience is essential but the feed text states no years. detail = the clause as written ("drafting and vetting of contracts"). */
  experience: { years: number | null; type: ExpType; detail?: string } | null; licences: Licence[];
  ageMin: number | null; ageMax: number | null;
  /** the official PDF text mentions an age limit but no upper limit could be read (OCR noise): Check, never "not stated" */
  ageUnreadable?: boolean;
  /** The feed text states some eligibility (otherwise every condition is "unknown", never "not required"). */
  stated: boolean;
  /** The title names no post at all ("posts in National Green Tribunal", "various posts"): never classed low by the title heuristic. */
  genericTitle?: boolean;
  /** How the official notice PDF was read: text layer, scanned (no text), unreadable (not fetched), or ai (the user's own key). */
  pdf?: 'text' | 'scanned' | 'unreadable' | 'ai';
  /** The essential qualification was inferred from tags (title / notice words), not stated as eligibility in the feed text. */
  inferred?: boolean;
}

// ---------- Devanagari-safe whole tokens ----------
const DEV = '\\u0900-\\u097F';
/** Whole Devanagari tokens with an optional vowel-sign / anusvara ending (चालकों), never inside a longer word (संचालक). */
export const hi = (words: string[]) => `(?<![${DEV}])(?:${words.join('|')})[\\u093E-\\u094D\\u0902\\u0903]{0,3}(?:यों|यो|ये|या|ों|ें|ने|नों)?(?![${DEV}])`;

// ---------- Qualifications (punctuation-tolerant: LL.B., L.L.B, M.B.B.S, B. Tech) ----------
const D = String.raw`\.?\s?`; // optional dot and space between acronym letters
const ac = (s: string) => s.split('').join(D);
const QUALS: [Qual, RegExp][] = [
  ['PHD', new RegExp(String.raw`\b${ac('PH')}${D}D\b|\bdoctorate\b|\bdoctoral degree\b|पीएचडी`, 'i')],
  ['LLM', new RegExp(String.raw`\b${ac('LLM')}\b|\bmaster of laws?\b`, 'i')],
  ['LLB', new RegExp(String.raw`\b${ac('LLB')}\b|\bbachelor(?:'?s)? (?:degree )?(?:of|in) laws?\b|\b(?:degree|graduat\w*) in law\b|\blaw (?:degree|graduate)s?\b|\bintegrated law\b|विधि स्नातक|एलएलबी`, 'i')],
  ['MBBS', new RegExp(String.raw`\b${ac('MBBS')}\b|एमबीबीएस`, 'i')],
  ['MD', /\b(?:M\.D\.?|MD|M\.S\.|DNB|MD\/MS)(?![\w.])/],
  ['MPH', new RegExp(String.raw`\b${ac('MPH')}\b|\bmaster(?:'?s)? (?:degree )?in public health\b`, 'i')],
  ['BDS', new RegExp(String.raw`\b${ac('BDS')}\b|\b${ac('MDS')}\b`, 'i')],
  ['NURSING', /\b(?:GNM|ANM|B\.?\s?Sc\.?\s?\(?\s?Nursing\)?|nursing)\b/i],
  ['PHARM', /\b[BDM]\.?\s?Pharm\w*|\bpharmacy\b/i],
  ['ME', /\bM\.?\s?Tech\b|\bM\.\s?E\.?(?![\w.])|\bME\b(?=[\s,/)]|$)|\bmaster of (?:engineering|technology)\b/],
  ['BE', /\b[Bb]\.?\s?[Tt][Ee][Cc][Hh]\b|\bB\.\s?E\.?(?![\w.])|\bBE\b(?=[\s,/)]|$)|\b[Bb]achelor of (?:[Ee]ngineering|[Tt]echnology)\b|\b(?:[Dd]egree|[Gg]raduat\w*) in (?:\w+\s){0,3}[Ee]ngineering\b|\b[Ee]ngineering (?:[Dd]egree|[Gg]raduate)\b|\bAMIE\b/],
  ['CA_INTER', /\b(?:C\.?\s?A|CMA|ICWAI?|C\.?\s?S)\.?\s*[-(]?\s*(?:inter(?:mediate)?|ipcc|foundation|executive)\b/i],
  ['CA', /\b[Cc]hartered [Aa]ccountan(?:t|cy)\b|\bICAI\b|\bC\.A\.(?!\s*\(?\s*inter)|\bCA\b(?![- ]?\(?\s*(?:inter|foundation|ipcc))|\bCA[- ]?Final\b|\b(?:ACA|FCA)\b/],
  ['CMA', /\b(?:CMA|ICWA|ICWAI|ICMAI)\b|\bcost (?:and management )?accountant\b/i],
  ['CS', /\bcompany secretary\b|\bICSI\b/i],
  ['MBA', /\bMBA\b|\bPGDM\b|\bPGDBM\b|\bmaster of business administration\b|\b(?:PG|post[- ]?graduate) diploma in (?:business )?management\b/i],
  ['MCOM', /\bM\.?\s?Com\b|\bmaster of commerce\b/i],
  ['MSC', /\bM\.?\s?Sc\b|\bmaster of science\b/i],
  ['MA', /\bM\.A\.?(?![\w])|\bMA\b(?=[\s,/(]|$)|\bmaster of arts\b/],
  ['NET', /\b(?:UGC|CSIR)[- ]?NET\b|\bNET\s?\/\s?(?:SET|SLET)\b/i],
  ['BED', /\bB\.?\s?Ed\b|\bbachelor of education\b/i],
  ['PG', /\bpost[- ]?graduat\w*|\bPG\b(?! ?diploma in (?:business )?management)|\bmaster'?s?(?: degree)?\b(?! of (?:laws?|business|engineering|technology|science|arts|commerce))|स्नातकोत्तर|पदव्युत्तर/i],
  ['BCOM', /\bB\.?\s?Com\b|\bbachelor of commerce\b/i],
  ['BSC', /\bB\.?\s?Sc\b(?!\.?\s?\(?\s?nursing)|\bbachelor of science\b/i],
  ['BA', /\bB\.A\.?(?![\w])|\bBA\b(?=[\s,/(]|$)|\bbachelor of arts\b/],
  ['GRAD', new RegExp(String.raw`(?<!post[- ]?)\bgraduat\w*|\bbachelor'?s?\b|\b(?:any|a recogni[sz]ed) degree\b|\bdegree\b|${hi(['स्नातक', 'पदवी', 'पदवीधर', 'उपाधि', 'डिग्री'])}`, 'i')],
  ['DIPLOMA', new RegExp(String.raw`\bdiploma\b|\bpolytechnic\b|${hi(['डिप्लोमा', 'पदविका'])}`, 'i')],
  ['XII', new RegExp(String.raw`\b(?:12th|XII|class (?:xii|12)|intermediate|higher secondary|H\.?S\.?C\.?|10\s?\+\s?2|senior secondary|plus two)\b|${hi(['बारहवीं', '12वीं', 'इंटरमीडिएट', 'इण्टरमीडिएट', 'उच्चतर माध्यमिक', 'उच्च माध्यमिक', 'बारावी'])}`, 'i')],
  ['ITI', new RegExp(String.raw`\b${ac('ITI')}\b|\bNCVT\b|\bSCVT\b|\btrade certificate\b|${hi(['आईटीआई'])}`, 'i')],
  ['X', new RegExp(String.raw`\b(?:10th|class (?:x|10))\b|\bmatric\w*|\bhigh school\b|\bS\.?S\.?C\.?\s?(?:pass|exam\w*|or|\/|$)|\bsecondary school (?:certificate|leaving)\b|${hi(['दसवीं', '10वीं', 'हाई ?स्कूल', 'हाईस्कूल', 'मैट्रिक', 'मैट्रिकुलेशन', 'दहावी'])}`, 'i')],
  ['VIII', new RegExp(String.raw`\b(?:5th|8th|VIII)\b|\bclass (?:v|viii|5|8)\b|\bmiddle(?: school| pass| standard)\b|\bliterate\b|\bread and write\b|${hi(['आठवीं', '8वीं', 'आठवी', 'पाचवी', 'पांचवीं', 'साक्षर'])}`, 'i')],
];
export const QUAL_LEVEL: Record<Qual, number> = { VIII: 0, X: 1, ITI: 1, XII: 2, DIPLOMA: 2, GRAD: 3, BA: 3, BSC: 3, BCOM: 3, LLB: 3, BE: 3, MBBS: 3, BDS: 3, NURSING: 2, PHARM: 2, CA: 3, CA_INTER: 3, CMA: 3, CS: 3, BED: 3, PG: 4, MA: 4, MSC: 4, MCOM: 4, MBA: 4, LLM: 4, ME: 4, MD: 4, MPH: 4, NET: 4, PHD: 5 };
/** "Hindi at matric level", "Hindi as a subject in 10th": a subject clause, not the minimum qualification. */
const SUBJECT_LEVEL = new RegExp(String.raw`\b(?:at|upto|up to|of|in|till)\s+(?:the\s+)?(?:matric\w*|10th|12th|high school|intermediate|class \w+|secondary|higher secondary|SSC|HSC)(?:\s+(?:level|standard|stage|examination))?\b|\b(?:matric\w*|10th|12th|high school|intermediate)\s+(?:level|standard)\b|as an? (?:compulsory |optional )?subject|(?:हाई ?स्कूल|इंटरमीडिएट|मैट्रिक)\s+स्तर`, 'gi');
export function qualsIn(t: string): Qual[] {
  // "CA/CMA Inter", "CA / ICWA (Inter)": the level word applies to every name in the slash list.
  const s = (t || '').replace(SUBJECT_LEVEL, ' ').replace(/\b((?:CA|CMA|ICWAI?|CS)(?:\s*\/\s*(?:CA|CMA|ICWAI?|CS))+)\s*[-(]?\s*(inter(?:mediate)?|foundation|ipcc)\b\)?/gi, (_m, list: string, lv: string) => list.split('/').map((x) => `${x.trim()} ${lv}`).join(' / ')); const out: Qual[] = [];
  let rest = s;
  for (const [q, re] of QUALS) { const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); if (g.test(rest)) { out.push(q); if (q === 'CA_INTER' || q === 'LLM' || q === 'MPH' || q === 'MBA') rest = rest.replace(g, ' '); } }
  // a named degree makes the bare "degree / graduate" token redundant
  return out;
}
/** Minimum education level: conjunctive parts ("Graduate with MBA") take the higher, alternatives ("Diploma or B.Tech") the lower. */
export function minEduOf(essentialText: string): number | null {
  const parts = (essentialText || '').replace(SUBJECT_LEVEL, ' ').split(/\s+(?:with|along with|and also|plus)\s+|;|\n/i);
  let best: number | null = null;
  for (const part of parts) { const qs = qualsIn(part); if (!qs.length) continue; const lv = Math.min(...qs.map((q) => QUAL_LEVEL[q])); best = best === null ? lv : Math.max(best, lv); }
  return best;
}

// ---------- Clause parser: Essential / Desirable sections, sentences, parentheses ----------
/** Preferred-marker lexicon (phrase-scoped): hard wording (preferred, desirable) and soft wording (an edge, welcome, extra marks,
 *  added weight, desirability, additional advantage, weightage, plus point, considered favourably). */
const ADV = String.raw`(?:added|additional|big|distinct|extra|special|definite)`;
const BACK = new RegExp(String.raw`\b(?:preferred|preferable|preferably|desirable|desired|desirability|advantageous|optional|preference|weightage|(?:would|will|shall|may|can) be (?:an? )?(?:${ADV} )?(?:asset|advantage|plus|preference|bonus|useful|welcome[d]?)|is an? (?:${ADV} )?(?:asset|advantage|plus|bonus)|an? (?:${ADV} )?(?:advantage|asset|plus(?: point)?|bonus)|${ADV} (?:qualification|advantage|weight|marks?|credit|points?)|(?:will|shall|would|may|can) (?:get|be given|receive|have|carry|earn) (?:an? )?(?:${ADV} )?(?:preference|priority|weightage|weight|edge|advantage|marks?|credit|points?|bonus)|(?:given|get|gets|getting|have|has|carry|carries|carrying) (?:an? )?(?:${ADV} )?(?:preference|priority|weightage|weight|edge|advantage|marks?|credit|bonus)|(?:an|the) edge|(?:is|are|will be|would be|shall be) (?:most |highly |also )?welcome[d]?|welcome to apply|plus point|bonus (?:marks?|points?)|(?:good|nice)[- ]to[- ]have|considered favou?rably|favou?rably considered|favou?rable consideration)\b`, 'i');
const FWD = /\b(?:preferably|preference (?:will |shall |would |may )?(?:be )?(?:given )?(?:to|for)|priority (?:will |shall )?(?:be )?(?:given )?(?:to|for)|weightage (?:will |shall )?(?:be )?(?:given )?(?:to|for)|ideally(?: with)?|optionally|desirable\s*[:\-–])/i;
const HDR = /\b(essential|required|mandatory|minimum|(?:good|nice)[- ]to[- ]have|desirable|desirability|desired|preferred|preferable|preferential|optional|additional|advantage(?:ous)?)\s*(?:educational\s*)?(?:qualifications?|eligibility|criteria)?\s*[:\-–]\s*/gi;
const BOUND = /,|;|\s+[—–]\s+|\s+-\s+|\s+with\s+|\s+along with\s+|\s+and\s+|(?<!\b(?:a|is|an?\s+added))\s+plus\s+(?=\w)/gi;
const MARK_ONLY = /^\s*(?:is\s+)?(?:an?\s+)?(?:added\s+)?(?:preferred|preferable|desirable|desired|optional|advantage|asset|plus)\s*\.?\s*$/i;
const ABBR = /^(?:[A-Za-z]|No|Rs|Dr|Mr|Ms|Smt|Sh|viz|etc|yrs?|Govt|Sc|Com|Tech|Ed|Pharm|Phil|Eng|Univ|approx|i\.e|e\.g)$/i;
/** Sentences: split at ". " unless the word before the dot is an acronym fragment (LL.B., B.Sc., M.) or a short abbreviation. "Qualified CA. MBA preferred." is two sentences. */
function sentencesOf(t: string): string[] {
  const out: string[] = []; let start = 0;
  for (const m of t.matchAll(/\.\s+|\s*\n\s*/g)) {
    if (m[0].startsWith('.')) { const word = t.slice(start, m.index).split(/\s+/).pop() || ''; if (word.includes('.') || ABBR.test(word.replace(/^[(\[]/, ''))) continue; }
    out.push(t.slice(start, m.index)); start = m.index! + m[0].length;
  }
  out.push(t.slice(start)); return out.filter((x) => x.trim());
}
/** Split the eligibility text into essential and preferred text. A preferred marker governs only its own phrase or parenthetical. */
export function splitEligibility(raw: string): { essential: string; preferred: string } {
  const ess: string[] = []; const pref: string[] = [];
  // 1) sections
  const secs: { kind: 'e' | 'p'; text: string }[] = []; let last = 0, kind: 'e' | 'p' = 'e'; const t = (raw || '').replace(/\s+/g, ' ');
  for (const m of t.matchAll(HDR)) { secs.push({ kind, text: t.slice(last, m.index) }); kind = /^(desir|prefer|optional|additional|advantage|good|nice)/i.test(m[1]) ? 'p' : 'e'; last = m.index! + m[0].length; }
  secs.push({ kind, text: t.slice(last) });
  for (const sec of secs) {
    if (!sec.text.trim()) continue;
    if (sec.kind === 'p') { pref.push(sec.text); continue; }
    // 2) parentheticals become placeholders
    const par: string[] = []; const body = sec.text.replace(/\(([^()]*)\)/g, (_m, x) => `§${par.push(x) - 1}§`);
    // 3) sentences (not after acronym fragments like LL.B. / B.Sc. / M.)
    const sentences = sentencesOf(body);
    for (const sent of sentences) {
      // 4) scope each marker to its phrase
      const segs: { s: string; p: boolean; sep: string }[] = [];
      const pieces: { s: string; sep: string }[] = []; let li = 0, sep = ''; for (const b of sent.matchAll(BOUND)) { pieces.push({ s: sent.slice(li, b.index), sep }); sep = b[0]; li = b.index! + b[0].length; } pieces.push({ s: sent.slice(li), sep });
      let carry = false;
      for (const { s: piece, sep: sp } of pieces) {
        const plain = piece.replace(/§\d+§/g, ' ');
        if (carry) { segs.push({ s: piece, p: true, sep: sp }); carry = !qualsIn(plain).length && !/\w{3,}/.test(plain.replace(FWD, '')); continue; }
        const f = FWD.exec(piece);
        if (f) { segs.push({ s: piece.slice(0, f.index), p: false, sep: sp }); const after = piece.slice(f.index); segs.push({ s: after, p: true, sep: ' ' }); carry = !qualsIn(after.replace(/§\d+§/g, ' ').replace(FWD, '')).length; continue; }
        segs.push({ s: piece, p: BACK.test(plain), sep: sp });
      }
      // rejoin consecutive same-kind segments with their original separators ("Degree in Law (LLB) with 3 years experience")
      let cur: { kind: boolean; text: string } | null = null; const flush = () => { if (cur && cur.text.trim()) (cur.kind ? pref : ess).push(cur.text); cur = null; };
      for (const seg of segs) {
        let s2 = seg.s; let p = seg.p;
        s2 = s2.replace(/§(\d+)§/g, (_m, i) => { const x = par[Number(i)]; if (MARK_ONLY.test(x)) { p = true; return ' '; }
          if (p) return `(${x})`; const inner = splitEligibility(x); if (inner.preferred) pref.push(inner.preferred); return inner.essential ? `(${inner.essential})` : ' '; });
        if (!s2.trim()) continue;
        if (cur && cur.kind === p) cur.text += `${seg.sep || ' '}${s2}`; else { flush(); cur = { kind: p, text: s2 }; }
      }
      flush();
    }
  }
  const j = (a: string[]) => a.map((x) => x.trim()).filter(Boolean).join('; ').replace(/\s{2,}/g, ' ');
  return { essential: j(ess), preferred: j(pref) };
}

// ---------- Experience, licence, age ----------
// Strict by default: litigation is not drafting / vetting / advisory / in-house / bank legal work; clinical is not surveillance /
// community medicine / public health; audit is not direct tax / GST; engineering is not software development. A stated kind that
// matches none of these is 'other' (always Check notice); only a bare "N years experience" is 'any'.
const EXP_TYPES: [ExpType, RegExp][] = [
  ['litigation', /\b(?:practi[cs]e as an? advocate|practi[cs]ing advocate|practi[cs]e (?:at|in|before) (?:the )?(?:bar|courts?|high court|district courts?)|bar practice|litigation|court practice|standing (?:at|of|in) the bar|as an advocate|advocates? with|appear(?:ed|ing|ance) (?:before|in) (?:the )?(?:civil |criminal |district |high |subordinate )?courts?|conduct(?:ed|ing)? (?:of )?cases|argu(?:e|es|ed|ing) (?:of )?cases|(?:civil|criminal) (?:and (?:civil|criminal) )?(?:courts?|cases|side)|trial courts?)\b|वकालत|अधिवक्ता के रूप में/i],
  ['judicial', /\bjudicial (?:service|officer|experience)\b|\bserved as (?:a )?judge\b/i],
  ['corporate_legal', /\b(?:corporate (?:law|legal)|in[- ]house|legal advis\w*|advisory|drafting|vetting|contracts? (?:drafting|management|vetting)|legal (?:matters|work|department|cell|affairs|opinions?)(?: \w+){0,3} (?:of|in|for|at) (?:an? |the )?(?:\w+ )?(?:psus?|compan(?:y|ies)|banks?|corporations?|undertakings?|organi[sz]ations?|financial institutions?|firms?|ministry|department)|banking law|company law|legal officer in|compliance)\b/i],
  ['public_health', /\b(?:public health|epidemiolog\w*|surveillance|outbreak\w*|community medicine|preventive (?:and social )?medicine|psm|disease control|national health (?:programmes?|mission)|health programmes?|community health|NHM|immuni[sz]ation)\b/i],
  ['clinical', /\b(?:clinical|hospital|house job|internship in a hospital|patient care|senior residency|junior residency|residency|casualty|emergency medicine|treating patients|medical practice)\b/i],
  ['teaching', /\b(?:teaching|taught|lecturer(?:ship)?|faculty)\b/i],
  ['research', /\b(?:research|post[- ]?doc\w*|R&D|publications?)\b/i],
  ['taxation', /\b(?:direct tax\w*|indirect tax\w*|income[- ]tax|gst|goods and services tax|taxation|tax (?:matters|laws?|assessments?|planning|compliance|audit)|customs|excise)\b/i],
  ['audit_accounts', /\b(?:audit\w*|accounts|accounting|book[- ]?keeping|financial management|finance and accounts|finance & accounts)\b/i],
  ['software', /\b(?:software|programming|coding|application development|web development|app development|full[- ]?stack|it (?:systems?|projects?|applications?)|data science|machine learning)\b/i],
  ['engineering', /\b(?:design|construction|execution|maintenance|site|field|erection|commissioning|civil works?|electrical works?|project execution) (?:experience|work|works)\b|\bexperience (?:in|of) (?:the )?(?:design|construction|execution|maintenance|erection|commissioning|civil|electrical|mechanical)\b|\bengineering (?:experience|work|projects?)\b/i],
  ['administrative', /\b(?:administrative|administration|establishment matters|office management)\b/i],
];
const NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20 };
const N = String.raw`(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty)`;
// "6 (six)", "six (6)", "6+", "06", "6-year"; units "years", "yrs.", "yr", "year's"
const NMOD = String.raw`\s*(?:\(\s*\w+\s*\)\s*)?(?:\+|plus)?\s*-?\s*`;
const UNIT = String.raw`(?:years?|yrs?|yr|saal|sal|varsh|varsha)\.?['’]{0,2}s?`;
// experience nouns: experience, exp. / exp, PQE, standing (at the Bar), practice, post-qualification, service
const EXPN = String.raw`(?:experience|exp(?:\.|\b)|p\.?\s?q\.?\s?e\b\.?|standing|practi[cs]e|practi[cs]ing|post[- ]?qualification|service)`;
const LIT_ACTS = String.raw`argu(?:e|es|ed|ing) (?:of )?cases|conduct(?:ed|ing)? (?:of )?cases|appear(?:ed|ing|ance) (?:before|in) (?:the )?(?:civil |criminal |district |high |subordinate )?courts?`;
const EXPB = EXPN.replace('|service', '').replace(/\)$/, `|${LIT_ACTS})`);
// "6 years post-qualification experience", "6 yrs. exp.", "6 years PQE", "5 yrs. standing at the Bar", "experience: 6 years",
// "post-qualification experience of 6 yrs", "experience of not less than 6 years", Hindi "5 वर्ष का अनुभव"
const YEARS = new RegExp(String.raw`\b${N}${NMOD}${UNIT}\s*(?:of\s*)?(?:[\w()/&-]+\s+){0,5}?${EXPN}|\b${EXPB}(?:(?!\b(?:age|aged|probation|period|tenure|contract)\b)[^.;]){0,60}?\b${N}${NMOD}${UNIT}(?![\w])|(\d{1,2})\s*वर्ष(?:ों)?\s*(?:का|की|के)?\s*(?:अनुभव|वकालत|प्रैक्टिस)`, 'i');
// Fail-closed: any mention of an experience requirement (when no years can be parsed) gives years: null, which is always Check.
const MENTION = /\b(?:argu(?:e|es|ed|ing) (?:of )?cases|conduct(?:ed|ing)? (?:of )?cases|experience[ds]?|exp(?:\.|\b)|p\.?\s?q\.?\s?e\b|standing (?:at|in|of|before) the bar|bar (?:standing|practice)|practi[cs]e (?:as|at|in|before|of law)|practi[cs]ing (?:advocate|lawyer|at|in)|post[- ]?qualification)|अनुभव|वकालत/i;
// fail-closed fallback: a number of years and an experience noun in the same clause, in a form YEARS can't read -> years: null
const YEARS_LOOSE = new RegExp(String.raw`(?=[^;]*\b${N}\s*\S{0,6}\s*(?:years?|yrs?|yr|saal|sal|varsh)\b)(?=[^;]*\b${EXPB})`, 'i');
const DETAIL = /\b(?:experience|practice)\s+(?:of\s+(?!\d|not\b|at\b|minimum\b)|in\s+|as\s+(?!stated|per|prescribed|specified)|with\s+|before\s+|at\s+)((?:(?!\b(?:and|or)\b\s+\d)[^,;.()])+)|\b(?:years?|yrs?)\.?['’]?\s+(?:of\s+)?((?:(?!experience|practice)[\w-]+\s+){1,4})(?:experience|practice)\b/i;
const GENERIC_DETAIL = /^(?:(?:the |a |an )?(?:relevant|requisite|post[- ]?qualification|working|work|professional|total|minimum|at least|not less than|not below|no less than|of|years?|yrs?|\d+|\s|the field|field|similar|related|concerned|area|any|adequate|sufficient|necessary|essential|required|experience|practice|with|having|and|plus|candidates?|in|on|as|cut[- ]?off|date|after|qualification|obtaining|degree|from|pqe|exp)\b\s*)*$/i;
// Clauses split on ";" and on sentence stops, but never after an abbreviation ("6 yrs. experience", "exp. of", "B. Tech").
const CLAUSE = /;|(?<!\b(?:yrs?|yr|exp|no|nos|viz|etc|approx|min|max|govt|dept|e\.g|i\.e|b|m|ph|d|sc|a|com|tech|ed|st|sr|jr|dr|mr|smt|shri|p\.q\.e|pqe))\.\s+/i;
/** Essential experience (largest stated years) and its type, from the essential text only. HJS / ADJ direct from Bar = 7 yrs litigation. */
export function experienceOf(title: string, essential: string): { years: number | null; type: ExpType; detail?: string } | null {
  let best: { years: number | null; type: ExpType; detail?: string } | null = null;
  for (const clause of (essential || '').split(CLAUSE)) {
    const m = clause.match(YEARS); const said = !m && (MENTION.test(clause) || YEARS_LOOSE.test(clause));
    if (!m && !said) continue;
    const raw = m ? (m[1] || m[2] || m[3]) : null; if (m && raw === null) continue; const years = raw === null ? null : NUM[raw.toLowerCase()] ?? Number(raw);
    if (years !== null && !(years > 0 && years <= 30)) continue;
    // the kind is read from the experience phrase itself (a little context before it), never from the degree named earlier
    const at = m ? m.index! : Math.max(0, clause.search(MENTION)); const seg = clause.slice(Math.max(0, at - 25));
    const d1 = seg.match(DETAIL); const d2 = seg.match(new RegExp(DETAIL.source.split('|\\b(?:years?')[0], 'i')); const det = (d2?.[1] || d1?.[1] || d1?.[2] || '').replace(/\s+/g, ' ').trim();
    let type: ExpType = (EXP_TYPES.find(([, re]) => re.test(seg))?.[0]) || 'any';
    if (type === 'any' && det && !GENERIC_DETAIL.test(det) && /[a-z]{4,}/i.test(det.replace(/\b(?:years?|experience|practice|relevant|post[- ]?qualification)\b/gi, ''))) type = 'other';
    const cand = { years, type, detail: det && !GENERIC_DETAIL.test(det) ? det.slice(0, 70) : undefined };
    if (!best || (years ?? -1) > (best.years ?? -1)) best = cand;
  }
  if (!best && /\b(higher judicial|hjs|additional district judge|district judge \(entry|district judge)\b/i.test(title)) best = { years: 7, type: 'litigation' };
  return best;
}
export function licencesOf(title: string, essential: string): Licence[] {
  const t = `${title} ${essential}`; const out: Licence[] = [];
  if (/\b(enrol(?:l)?ed as (?:an )?advocate|bar council|practi[cs]ing advocate|practice (?:at|in) the bar|certificate of practice|as an advocate)\b/i.test(t) || /\b(higher judicial|hjs|district judge \(entry|public prosecutor|standing counsel|panel (?:counsel|lawyer|advocate)|legal aid (?:defen[cs]e )?counsel|government pleader)\b/i.test(title)) out.push('bar');
  if (/\b(nmc|national medical commission|medical council|mci\b)\b/i.test(t) || /\b(medical officer|gdmo|senior resident|specialist \()\b/i.test(title)) out.push('medReg');
  if (/\b(icai|associate member|fca|aca)\b/i.test(t) && /\b(chartered accountant|icai)\b/i.test(t)) out.push('icai');
  return out;
}
export function agesOf(t: string): { min: number | null; max: number | null } {
  const s = t || ''; let min: number | null = null, max: number | null = null;
  const r = s.match(/\bage[^.;\d]{0,40}?(\d{2})\s*(?:-|to|–)\s*(\d{2})\s*(?:years?|yrs?)?/i) || s.match(/\bbetween\s*(\d{2})\s*(?:and|to|-)\s*(\d{2})\s*(?:years?|yrs?)/i);
  if (r) { min = Number(r[1]); max = Number(r[2]); }
  const mx = s.match(/\b(?:not (?:be )?(?:more than|above|exceed\w*)|below|upper age(?: limit)?(?: is| of)?|maximum age(?: limit)?(?: is| of)?|age limit(?: is| of)?|under|(?:must|should) not have (?:complet\S*|attain\S*|cross\S*) (?:\S{1,4}\s+)?a\S?ge of)\s*:?\s*(\d{2})\s*(?:years?|yrs?)/i); if (mx) max = Number(mx[1]);
  const mn = s.match(/\b(?:minimum age(?: is| of)?|not (?:be )?less than|at least|(?<!not )(?:must|should) have (?:complet\S*|attain\S*) (?:\S{1,4}\s+)?a\S?ge of)\s*:?\s*(\d{2})\s*(?:years?|yrs?)/i); if (mn) min = Number(mn[1]);
  const hi = s.match(/(?:आयु|उम्र|वय)[^.;\d]{0,40}?(\d{2})\s*(?:से|ते|-|–)\s*(\d{2})\s*(?:वर्ष|साल|वर्षे)/); if (hi && max === null) { min = min ?? Number(hi[1]); max = Number(hi[2]); }
  const hm = s.match(/(?:अधिकतम|कमाल)\s*(?:आयु|उम्र|वय)(?:\s*सीमा)?\s*[:\-–]?\s*(\d{2})/); if (hm && max === null) max = Number(hm[1]);
  if (max !== null && (max < 18 || max > 70)) max = null; if (min !== null && (min < 14 || min > 60)) min = null;
  return { min, max };
}

/** The notice text talks about an age limit (English / Hindi / Marathi), whether or not a number could be read. */
export function ageWordsIn(t: string): boolean { return /\b(?:age|aged)\b|आयु|उम्र|वय/i.test(t || ''); }

/** The qualification clauses of an official notice's text layer (verbatim), or '' when none is found. Used only when the feed row states none. */
export function eligibilityFromText(text: string): string {
  const t = (text || '').replace(/\s+/g, ' ').slice(0, 8000); const out: string[] = [];
  const HEAD = /\b(?:(?:minimum |essential |educational (?:and technical )?|required )?qualifications?(?: (?:and|&) experience)?|eligibility(?: criteria| conditions)?)\s*(?:required|for the posts?[^:]{0,40})?\s*[:\-–]?\s*/gi;
  const STOP = /\b(?:age(?: limit)?\s*[:\-–]|age limit|pay (?:scale|level|matrix)|remuneration|emoluments|salary|how to apply|last date|method of (?:selection|recruitment)|mode of selection|selection (?:process|procedure)|terms and conditions|general conditions|application fee|the filled|reservation)\b/i;
  for (const m of t.matchAll(HEAD)) { let seg = t.slice(m.index! + m[0].length, m.index! + m[0].length + 450); const st = seg.search(STOP); if (st > 0) seg = seg.slice(0, st);
    if (qualsIn(seg).length && !out.some((o) => o.includes(seg.slice(0, 40)))) out.push(seg.trim()); if (out.length >= 3) break; }
  return out.join('; ').slice(0, 900);
}

// ---------- Group / class and pay ----------
export const LEVEL_PAY: Record<number, number> = { 1: 18000, 2: 19900, 3: 21700, 4: 25500, 5: 29200, 6: 35400, 7: 44900, 8: 47600, 9: 53100, 10: 56100, 11: 67700, 12: 78800, 13: 123100, 14: 144200, 15: 182200, 16: 205400, 17: 225000, 18: 250000 };
/** Pay level and basic stated in the pay text. A range ("Level 2-10", "Rs 25,500 - 81,100") uses its UPPER bound for level and LOWER for entry basic. */
export function payInfo(pay: string): { level?: number; levelMin?: number; basic?: number; basicMax?: number } {
  const p = (pay || '').replace(/लेवल/g, 'level').replace(/स्तर/g, 'level');
  const r = p.match(/level[- ]?(\d{1,2})\s*(?:-|to|–|&|and|\/)\s*(?:level[- ]?)?(\d{1,2})\b/i); const l = p.match(/level[- ]?(\d{1,2})\b/i) || p.match(/\b(\d{1,2})(?:st|nd|rd|th)? level of pay/i);
  const nums = (p.match(/\d{1,3}(?:,\d{2,3})+|\d{5,6}/g) || []).map((x) => Number(x.replace(/,/g, ''))).filter((x) => x >= 5000);
  const lv = r ? [Number(r[1]), Number(r[2])].filter((n) => n >= 1 && n <= 18) : l ? [Number(l[1])] : [];
  return { level: lv.length ? Math.max(...lv) : undefined, levelMin: lv.length ? Math.min(...lv) : undefined, basic: nums.length ? Math.min(...nums) : undefined, basicMax: nums.length ? Math.max(...nums) : undefined };
}
const ROMAN: Record<string, 'A' | 'B' | 'C' | 'D'> = { a: 'A', b: 'B', c: 'C', d: 'D', i: 'A', ii: 'B', iii: 'C', iv: 'D', 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
export function groupOf(t: string): 'A' | 'B' | 'C' | 'D' | null {
  const s = t || '';
  const e = s.match(/\b(?:group|class|category|cat\.?)[- ]?['"‘’]?(a|b|c|d|iv|iii|ii|i|1|2|3|4)['"‘’]?(?![\w-])(?!\s*(?:pass|std|standard))/i); if (e) return ROMAN[e[1].toLowerCase()];
  if (/\bfourth (?:class|grade)\b|\bclass[- ]?four\b/i.test(s)) return 'D'; if (/\bthird (?:class|grade)\b/i.test(s)) return 'C';
  if (new RegExp(hi(['चतुर्थ ?श्रेणी', 'चतुर्थश्रेणी', 'चतुर्थ ?वर्ग'])).test(s)) return 'D'; if (new RegExp(hi(['तृतीय ?श्रेणी', 'तृतीयश्रेणी', 'तृतीय ?वर्ग'])).test(s)) return 'C';
  const m = s.match(/(?:गट)[- ]?(अ|ब|क|ड)(?![\u0900-\u097F])/); if (m) return ({ 'अ': 'A', 'ब': 'B', 'क': 'C', 'ड': 'D' } as const)[m[1] as 'अ'];
  const h = s.match(/(?:समूह|वर्ग|श्रेणी|ग्रुप)[- ]?(क|ख|ग|घ|ए|बी|सी|डी|[१२३४])(?![\u0900-\u097F])/); if (h) return ({ 'क': 'A', 'ख': 'B', 'ग': 'C', 'घ': 'D', 'ए': 'A', 'बी': 'B', 'सी': 'C', 'डी': 'D', '१': 'A', '२': 'B', '३': 'C', '४': 'D' } as Record<string, 'A' | 'B' | 'C' | 'D'>)[h[1]];
  return null;
}

// ---------- Title taxonomy (whole title; an officer head noun wins) ----------
const OFFICER_EN = /\b(officers?|commandants?|managers?|directors?|superintendents?|inspectors?|engineers?|scientists?|judges?|magistrates?|prosecutors?|counsel|registrars?|commissioners?|controllers?|secretar(?:y|ies)|professors?|lecturers?|teachers?|principals?|doctors?|physicians?|surgeons?|specialists?|consultants?|accountants?|auditors?|wardens?|executives?|administrators?|chairm[ae]n|members? \(|advis[eo]rs?|pilots?|attorneys?|commanders?|lieutenants?|captains?|examiners?|analysts? \(senior\)|judicial(?! (?:clerks?|assistants?|staff))|hjs|pcs[- ]?\(?j\)?|munsifs?|civil services?|services? (?:exam\w*|recruitment)|gazetted|ias|ips|ifs)\b/i;
const OFFICER_HI = hi(['अधिकारी', 'संचालक', 'निदेशक', 'प्रबंधक', 'अभियंता', 'निरीक्षक', 'अधीक्षक', 'न्यायाधीश', 'आयुक्त', 'सचिव', 'वैज्ञानिक', 'प्राध्यापक', 'व्याख्याता', 'शिक्षक', 'चिकित्सक', 'अभियोजक', 'लेखाकार', 'सलाहकार', 'कुलसचिव', 'कमांडेंट', 'मैनेजर', 'ऑफिसर', 'अध्यापक']);
// Canonical low-level roles (support staff), as stems so morphology and compounds match: peon, attendant, messenger, sweeper,
// guard, porter, driver, cook, watchman, gardener, daftri, record lifter, helper, labourer, waterman, orderly, MTS...
const SUPPORT_EN = /\b(peons?|attendants?|messengers?|sweep\w*|cleaners?|sanitation (?:workers?|staff)|sanitary (?:workers?|staff)|safai\w*|scaveng\w*|mehtar|jamadars?|jamedars?|guards?|watch ?m[ae]n|watch and ward|chowkidars?|chaukidars?|gate ?(?:keepers?|m[ae]n)|porters?|coolies?|kulis?|hamals?|bearers?|helpers?|khalasis?|labou?rers?|beldars?|mazdoors?|drivers?|cooks?|kitchen (?:boys?|helpers?|staff)|mess (?:servants?|boys?|helpers?)|masalchis?|khansamas?|malis?|malees?|maalis?|gardeners?|bagwans?|daftr?(?:y|i|ies|ys|is)|daftar[iy]|record (?:lifters?|sorters?)|gestetner(?: operators?)?|duplicating (?:machine )?operators?|cyclostyle\w*|office (?:subordinates?|boys?)|subordinate staff|orderl(?:y|ies)|chaprasis?|farr?ash\w*|water ?(?:m[ae]n|carriers?)|bhistis?|lift ?(?:m[ae]n|operators?)|liftm[ae]n|washerm[ae]n|dhobis?|barbers?|multi[- ]?(?:tasking|purpose)(?: staff| workers?| employees?)?|mts|se[wv]aks?|servants?|table boys?|lab boys?|mukadd?ams?|warders?|ward ?(?:boys?|attendants?)|aayas?|ayahs?|runners?|dak runners?|process servers?|bailiffs?|constables?|home ?guards?|agniveers?|forest guards?|trackm[ae]n|track maintainers?|chainm[ae]n|lascars?|lashkars?|nightwatch\w*|night watch\w*|tradesm[ae]n|room attendants?|support staff|tea ?boys?|canteen (?:boys?|attendants?|helpers?)|dressers?|gang ?m[ae]n|boatm[ae]n|boat ?m[ae]n|syces?|packers?|loaders?|duftr(?:y|i|ies|ys|is)|dufte?r(?:y|i)s?|ushers?|pump (?:operators?|drivers?|attendants?|men)|bundle (?:lifters?|carriers?|binders?)|(?:de|di)spatch riders?|khidmatgars?|linem[ae]n|plumbers?|masons?|carpenters?|blacksmiths?|cobblers?|tailors?|electricians?|wiremen|wireman|sanitary inspectors? \(helper\)|farm (?:labou?rers?|hands?)|field (?:workers?|helpers?)|ward servants?|water (?:boys?|girls?))\b/i;
const SUPPORT_HI = hi(['चपरासी', 'भृत्य', 'अनुसेवक', 'आदेशपाल', 'आदेशवाहक', 'संदेशवाहक', 'परिचर', 'परिचारक', 'अर्दली', 'सेवक', 'चालक', 'वाहन ?चालक', 'वाहनचालक', 'ड्राइवर', 'ड्राईवर', 'ड्रायवर', 'ड्रायव्हर', 'स्वीपर', 'झाडूवाला', 'झाड़ूवाला', 'झाडू', 'सफाई', 'सफाईवाला', 'सफाईकर्मी', 'सफाई ?कर्म', 'सफाई ?कर्मचार', 'स्वच्छता', 'स्वच्छताकर्मी', 'स्वच्छक', 'मेहतर', 'जमादार', 'रसोइया', 'रसोईया', 'रसोई', 'बावर्ची', 'खानसामा', 'कुक', 'गार्ड', 'होम ?गार्ड', 'होमगार्ड', 'सुरक्षाकर्मी', 'चौकीदार', 'पहरेदार', 'पहरेवाला', 'पहारेकरी', 'रखवालदार', 'गेटमैन', 'वॉचमैन', 'वाचमैन', 'माली', 'माळी', 'बागवान', 'हमाल', 'कुली', 'मजदूर', 'श्रमिक', 'बेलदार', 'खलासी', 'धोबी', 'नाई', 'जलवाहक', 'पानीवाला', 'पानी ?वाला', 'भिश्ती', 'लश्कर', 'मसालची', 'फर्राश', 'फराश', 'दफ्तरी', 'दफ़्तरी', 'शिपाई', 'रनर', 'बॉय', 'हेल्पर', 'मदतनीस', 'स्वयंपाकी', 'स्वयंपाक', 'पट्टेवाला', 'कामगार', 'सिपाही', 'आरक्षी', 'अग्निवीर', 'वनरक्षक', 'वन ?रक्षक', 'पत्रवाहक', 'प्रोसेस ?सर्वर', 'आदेशिका ?वाहक', 'तामील\\S*', 'आया', 'जल ?पुरुष', 'चपराशी', 'सुरक्षा ?रक्षक', 'सुरक्षारक्षक', 'मजूर', 'वाटर ?कैरियर', 'कैंटीन', 'टी ?बॉय', 'पंप ?ऑपरेटर', 'पम्प ?ऑपरेटर', 'नलकूप', 'लोडर', 'पैकर', 'दफ्तरी', 'डफ्तरी', 'प्लंबर', 'बढ़ई', 'राजमिस्त्री', 'ड्रेसर']);
const CLERICAL_EN = /\b(clerks?|ldcs?|udcs?|lower division|upper division|typists?|steno\w*|data entry(?: operators?)?|deos?|computer operators?|copyists?|record keepers?|assistant grade|junior assistants?|office assistants?|court assistants?|junior court assistants?|receptionists?|para[- ]?legal volunteers?|plvs?|supportive staff|ministerial staff)\b/i;
const CLERICAL_HI = hi(['लिपिक', 'टंकक', 'टंकलेखक', 'आशुलिपिक', 'लघुलेखक', 'डाटा ?एंट्री', 'डेटा ?एंट्री', 'कंप्यूटर ?ऑपरेटर', 'संगणक ?चालक', 'कनिष्ठ ?सहायक', 'कार्यालय ?सहायक', 'सहायक ?ग्रेड\\S*', 'प्रतिलिपिक', 'नाजिर', 'नाज़िर', 'पारा ?विधिक', 'विधिक ?स्वयंसेवक']);
/** Professional head nouns: a profession, but the level still comes from the stated minimum (a Junior Data Analyst with Higher Secondary is not an officer post). */
const PROF_EN = /\b(analysts?|counsell?ors?|researchers?|fellows?|associates?|programmers?|developers?|technologists?|statisticians?|economists?|planners?|architects?|chemists?|pharmacists?|nurses?|psychologists?|librarians?|translators?|interpreters?|editors?|journalists?|coordinators?|co-ordinators?|experts?|instructors?|trainers?|supervisors?|members?|tgts?|pgts?|prts?|young professionals?|law researchers?|law clerks?|lawyers?|advocates?|veterinar\w+|dietitians?|physiotherapists?|radiographers?|technical officers?)\b/i;
const PROF_HI = hi(['विश्लेषक', 'परामर्शदाता', 'शोधकर्ता', 'प्रशिक्षक', 'पर्यवेक्षक', 'सदस्य', 'अनुवादक', 'नर्स', 'फार्मासिस्ट', 'अधिवक्ता']);
export function titleClass(title: string): TitleClass {
  const t = title || '';
  if (OFFICER_EN.test(t) || new RegExp(OFFICER_HI).test(t)) return 'officer';
  if (SUPPORT_EN.test(t) || new RegExp(SUPPORT_HI).test(t)) return 'support';
  if (PROF_EN.test(t) || new RegExp(PROF_HI).test(t)) return 'professional';
  if (CLERICAL_EN.test(t) || new RegExp(CLERICAL_HI).test(t)) return 'clerical';
  return 'other';
}
/** Exported for other modules that need the canonical role sets. */
export const SUPPORT_RE = new RegExp(`${SUPPORT_EN.source}|${SUPPORT_HI}`, 'i');
export const CLERICAL_RE = new RegExp(`${CLERICAL_EN.source}|${CLERICAL_HI}`, 'i');

// ---------- Notice type ----------
const RET_WHO = String.raw`(?:retired|retd\.?|superannuated|former|ex[- ](?!servicem[ae]n|army|defence)|सेवा[- ]?निवृत्त\S*|सेवानिवृत\S*|रिटायर्ड|निवृत्त)`;
const RET_STAFF = String.raw`(?:\S+\s+){0,3}?(?:employees?|officers?|officials?|personnel|persons?|staff|judges?|teachers?|professors?|faculty|govt\.? servants?|government servants?|court employees?|bankers?|कर्मचा\S*|कर्मचारि\S*|कर्मचारी|अधिकारि\S*|अधिकारी|शिक्षक\S*|न्यायिक)`;
const RET_AIM = new RegExp(String.raw`\b(?:engagement|engaging|appointment|empanelment|hiring|hire|re-?employment|re-?engagement|inviting applications|applications? (?:are )?(?:hereby )?invited)\s+(?:\S+\s+){0,3}?(?:of|from)\s+(?:the\s+)?(?:\S+\s+){0,3}?(?:retired|retd\.?|pensioners?|superannuated|former)|${RET_WHO}\s*${RET_STAFF}|\bre-?employment\b|\bre-?engagement of\b|must be a retired|who (?:have )?retired (?:as|from)(?! (?:the )?(?:army|armed|defence|navy|air force|military|forces))|\bpension (?:notice|adalat|revision|papers?|cases?|sanction)s?\b|\bpensioners?'?\s+(?:meet|grievance|adalat|life certificates?|notice)|\blife certificates?\b|पेंशन (?:अदालत|सूचना)|पुनर्नियोजन|पुनर्नियुक्ति`, 'i');
const RET_NEG = /\b(?:not eligible|ineligible|need not apply|should not be|must not be|shall not be|not be (?:a )?retired|other than retired|not (?:be )?considered|not allowed|are excluded|cannot apply|may also apply|can also apply|are also eligible|also eligible)\b|पात्र नहीं|आवेदन नहीं कर सकते/i;
export function retireeOnly(t: string): boolean {
  const s = t || ''; const m = RET_AIM.exec(s); if (!m) return false;
  const near = s.slice(Math.max(0, m.index - 20), m.index + m[0].length + 80); return !RET_NEG.test(near);
}
// Open call needs POSITIVE evidence; negative signals override it. "for the post of" / "Recruitment of X" alone proves nothing (unclear).
const NEG_APPOINT = /\b(appointment (?:orders?|letters?)|posting orders?|joining(?: report)?|receipt of appointment|selected for appointment|resolution of applications|in pursuan\w*|promotion|by way of promotion|transfer)\b|नियुक्ति पत्र|पदोन्नति|नियुक्ती आदेश/i;
const NEG_RESULT = /\b(results?|merit(?: lists?)?|select(?:ed|ion)? (?:lists?|candidates?|notification)|selected|final (?:select )?lists?|lists?\b|wait(?:ing)? ?lists?|successful candidates?|qualified (?:in )?(?:the )?(?:written|preliminary|main|skill|typing|test|exam\w*)|candidates who (?:have )?qualified|eligible (?:applications?|candidates?)|ineligible|rejected|shortlist\w*|provisional(?:ly)?|marks|roll (?:numbers?|nos?\.?)|status of (?:the )?applications?|application status|key answers?|answer[- ]?keys?|objections?|passing benchmark|seniority|cancel\w*|postpone\w*|withdrawn|withdrawal)\b|परिणाम|प्रतीक्षा|चयन सूची|सूची|चयनित|निवड यादी|यादी/i;
const NEG_SCHED = /\b(admit[- ]?cards?|hall[- ]?tickets?|call[- ]?letters?|(?<!walk[- ]?in[- ])interviews?(?! basis)|viva(?:[- ]voce)?|(?:computer |typing |typewriting |shorthand |speed |practical |trade |driving |written |aptitude |physical |qualifying |screening |skill |proficiency |stenography )+(?:tests?|exam\w*)|proficiency|tests? venue|venue|exam(?:ination)? cent(?:re|er)s?|cent(?:re|er)s? of (?:the )?exam\w*|exam(?:ination)? (?:schedules?|dates?|programme|time ?table)|dates? of (?:the )?(?:exam\w*|interview|test|skill test|typing test)|time ?table|schedule|revised dates?|re-?scheduled?|document verification|syllabus|counsell?ing (?:schedule|date))\b|प्रवेश पत्र|साक्षात्कार|परीक्षा केंद्र|परीक्षा केन्द्र|कौशल परीक्षा|टंकण परीक्षा|मुलाखत/i;
const POS = /\b(applications? (?:are |is )?(?:hereby )?(?:invited|called|call\w*)|inviting applications?|invites? applications?|applications? for (?:the )?(?:posts?|engagement|appointment|recruitment|empanelment)|application call\w*|application forms?|last date|vacanc(?:y|ies)|no\.? of posts?|number of posts?|\d+ posts? of|filling up of|advertisement|advt\.?|walk[- ]?in|how to apply|apply (?:online|offline|before|by))\b|आवेदन (?:पत्र )?आमंत्रित|आवेदन|विज्ञापन|जाहिरात|रिक्ति|रिक्त पद|अर्ज मागव/i;
const WEAK = /\b(recruitment|engagement|empanelment|notification|employment notices?|for the posts? of|on contract basis|appointment (?:to|in|of|for) (?:the )?(?:posts?|vacanc\w*)|hiring|selection of)\b|भर्ती|पदभरती|पदों पर|पद पर|चयन हेतु|नियुक्ति हेतु|नियुक्ती/i;
/** Notice type from the row text (title + description): retiree-only, then the negative signals, then positive evidence of an open call. */
export function noticeTypeOf(text: string): NoticeType {
  const t = text || '';
  if (retireeOnly(t)) return 'retiree_only';
  if (NEG_APPOINT.test(t)) return 'appointment';
  if (NEG_SCHED.test(t)) return 'admit_schedule';
  if (NEG_RESULT.test(t)) return 'result_list';
  if (POS.test(t)) return 'open_call';
  if (WEAK.test(t)) return 'unclear';
  return 'other';
}
// PDF text (first pages). A fresh-candidate track (age 18-42, "for outsiders") means the notice is NOT retired-only (Kurnool).
const FRESH = /\bfor (?:outsiders|others|fresh(?:ers)?|general candidates|open (?:market|category)|other candidates|direct recruits?)\b|\bfresh (?:candidates|applicants)\b|\b(?:completed|attained|minimum) (?:the )?age of (?:18|19|20|21)\b|\bage[^.]{0,30}\b(?:18|21)\s*(?:-|to|–)\s*(?:3\d|4[0-5])\b/i;
const PDF_POS = /\b(applications? (?:are |is )?(?:hereby )?(?:invited|called)|inviting applications?|last date (?:for|of) (?:the )?(?:receipt|submission)|(?:filled[- ]in |duly filled )?applications? (?:should|must|shall) (?:be )?(?:addressed|reach|submitted|sent)|application (?:form|proforma)|prescribed (?:proforma|format)|how to apply|no\.? of (?:posts?|vacanc\w*)|number of (?:posts?|vacanc\w*)|vacancy position)\b|आवेदन (?:पत्र )?आमंत्रित|अंतिम तिथि|अर्ज मागव/i;
const PDF_NEG = /\b(list of (?:the )?(?:selected|successful|eligible|ineligible|shortlisted|qualified|provisionally)|selected candidates?|candidates? (?:are|is) (?:hereby )?(?:informed|directed|requested|called) to (?:appear|attend|report|collect)|results? of|admit cards?|interview (?:will|shall) be (?:held|conducted)|date of (?:the )?interview|(?:proficiency|skill|typing|shorthand|trade|practical) test (?:will|shall) be|appointment letters?|has been selected|have been selected|selected for appointment)\b|चयनित|परिणाम|साक्षात्कार की तिथि/i;
/** Signals read from the notice PDF text (first pages): non-open types, or 'open_call' when it shows positive evidence. null = no verdict. */
export function noticeTypeFromPdf(text: string): NoticeType | null {
  const t = (text || '').slice(0, 5000);
  if (t.replace(/\s/g, '').length < 80) return null; // scanned / image-only: no verdict
  if (retireeOnly(t) && !FRESH.test(t)) return 'retiree_only';
  if (/\b(selected for appointment|appointment letters? of the (?:selected )?candidates?|collect (?:his|her|their)?\s*(?:respective )?appointment letters?)\b/i.test(t)) return 'appointment';
  const pos = PDF_POS.test(t); const neg = PDF_NEG.exec(t.slice(0, 900));
  if (neg && !pos) return /interview|\btest|admit card|viva/i.test(t.slice(0, 900)) && !/\b(?:selected|successful|result)\b/i.test(neg[0]) ? 'admit_schedule' : 'result_list';
  return pos ? 'open_call' : null;
}

// ---------- One-stop parse ----------
const GENERIC_TITLE = /\b(?:posts? in|various|vacanc\w*|multiple posts|other posts|& others|and others|posts? under|posts? at)\b|विभिन्न पद/i;
const NO_TEXT = /^\s*(?:qualification as stated in the official notice\.?|as per (?:the )?(?:official )?notice\.?|see (?:the )?notice\.?|-)?\s*$/i;
export function parseNotice(p: { title: string; eligibility?: string; pay?: string; org?: string; maxAge?: number; minAge?: number }): NoticeFacts {
  const elig = NO_TEXT.test(p.eligibility || '') ? '' : (p.eligibility || '');
  const sp = splitEligibility(elig);
  const essential = qualsIn(sp.essential); const preferred = qualsIn(sp.preferred).filter((q) => !essential.includes(q));
  const pi = payInfo(p.pay || ''); const pt = payInfo(`${p.title} ${elig}`);
  const tc = titleClass(p.title); const ages = agesOf(elig);
  return {
    v: 2, source: 'rules', noticeType: noticeTypeOf(p.title), // the title decides; eligibility prose ("selection by interview") is not a notice type
    essential, preferred, essentialText: sp.essential, preferredText: sp.preferred,
    minEdu: minEduOf(sp.essential), group: groupOf(`${p.title} ${elig} ${p.pay || ''}`),
    payLevel: pi.level ?? pt.level ?? null, basic: pi.basic ?? null,
    titleClass: tc, isOfficer: tc === 'officer',
    experience: experienceOf(p.title, sp.essential), licences: licencesOf(p.title, sp.essential),
    ageMin: p.minAge ?? ages.min, ageMax: p.maxAge ?? ages.max, stated: !!sp.essential.trim(), genericTitle: GENERIC_TITLE.test(p.title || ''),
  };
}
/** Level of a post from its fields. Officer head nouns are never low-level; unknown stays null (shown, ranked lower). */
export function postLevelOf(f: NoticeFacts): PostLevel {
  if (f.isOfficer) return 'officer';
  if (f.titleClass === 'support') return 'support';
  if (f.group === 'D' || f.payLevel === 1 || (f.minEdu !== null && f.minEdu <= 1)) return 'support';
  if (f.titleClass === 'clerical') return f.minEdu !== null && f.minEdu <= 2 ? 'subgrad' : 'clerical';
  if (f.minEdu !== null && f.minEdu >= 3) return 'grad';
  // Heuristic for degree holders: no officer / professional head noun AND no stated minimum above 12th = low-level (Show all levels).
  if (f.titleClass === 'other' && !f.genericTitle) return 'low';
  if (f.minEdu === 2) return 'subgrad';
  return null;
}
export const OFFICER_RE = new RegExp(`${OFFICER_EN.source}|${OFFICER_HI}`, 'i');
type FactInput = { title: string; eligibility?: string; pay?: string; org?: string; maxAge?: number; minAge?: number; eduTags?: string[]; facts?: NoticeFacts | null };
const TAG_TEXT: Record<string, string> = { '10TH': '10th pass', '12TH': '12th pass', ITI: 'ITI', DIPLOMA: 'Diploma', GRADUATE: 'Graduate', ENGINEERING: 'B.Tech', LAW: 'LLB', MEDICAL: 'MBBS', PG: 'Post graduate', PHD: 'PhD' };
const CACHE = new Map<string, NoticeFacts>();
/** Facts shipped with the posting (server read the notice), else parsed here once and memoised. */
export function factsOf(p: FactInput): NoticeFacts {
  if (p.facts && p.facts.v === 2) return p.facts;
  const k = `${p.title}\u0001${p.eligibility || ''}\u0001${p.pay || ''}\u0001${p.maxAge ?? ''}\u0001${p.minAge ?? ''}`;
  let f = CACHE.get(k + (p.eduTags || []).join(','));
  if (!f) { if (CACHE.size > 5000) CACHE.clear(); f = parseNotice(p);
    // The feed text names no qualification but the server tagged the notice body (e.g. "Graduate"): use those tags as the stated minimum.
    // The tags only hint at the level (minEdu, essential tokens); the qualification itself stays "not in the feed text" (inferred), so it is a Check.
    if (!f.stated && p.eduTags?.length) { const t = p.eduTags.map((x) => TAG_TEXT[x]).filter(Boolean).join(' or '); if (t) { const g = parseNotice({ ...p, eligibility: `${p.eligibility || ''}; ${t}` }); f = { ...f, essential: g.essential, essentialText: g.essentialText, minEdu: g.minEdu, stated: true, inferred: true }; } }
    CACHE.set(k + (p.eduTags || []).join(','), f); }
  return f;
}
/** Plain names for the essential qualification, for reasons and check clauses. */
export const QUAL_NAME: Record<Qual, string> = { VIII: '8th pass', X: '10th pass', ITI: 'ITI', XII: '12th pass', DIPLOMA: 'diploma', GRAD: 'graduate degree', BA: 'BA', BSC: 'BSc', BCOM: 'BCom', LLB: 'LLB', BE: 'BE / BTech', MBBS: 'MBBS', BDS: 'BDS', NURSING: 'nursing', PHARM: 'pharmacy', CA: 'CA (ICAI)', CA_INTER: 'CA / CMA Inter', CMA: 'CMA', CS: 'CS', BED: 'B.Ed', PG: 'postgraduate degree', MA: 'MA', MSC: 'MSc', MCOM: 'MCom', MBA: 'MBA / PGDM', LLM: 'LLM', ME: 'ME / MTech', MD: 'MD / MS', MPH: 'MPH', NET: 'NET', PHD: 'PhD' };
export function essentialSummary(f: NoticeFacts): string {
  const named = f.essential.filter((q) => !(q === 'GRAD' && f.essential.some((x) => QUAL_LEVEL[x] >= 3 && x !== 'GRAD')));
  const q = named.length ? named.slice(0, 3).map((x) => QUAL_NAME[x]).join(' / ') : 'the stated qualification';
  const any = /\bany (?:discipline|degree|stream|subject|graduate)\b|\bgraduat\w* in any\b/i.test(f.essentialText);
  const x = f.experience ? ` + ${f.experience.years ?? 'stated'} yrs ${f.experience.type === 'any' || f.experience.type === 'other' ? (f.experience.detail ? `of ${f.experience.detail} ` : '') : `${EXP_NAME[f.experience.type]} `}${f.experience.type === 'litigation' ? 'practice' : 'experience'}` : '';
  return `${q}${any && named.length <= 1 ? ' in any discipline' : ''}${x}`;
}

// ---------- Essential qualification vs the person's degrees (satisfaction, not a coarse level) ----------
const EDU_LEVEL: Record<string, number> = { '10': 1, '12': 2, iti: 1, diploma: 2, grad: 3, eng: 3, pg: 4, phd: 5 };
/** Qualifications the person holds: education level, degree subjects ("BA LLB, CA"), profession and memberships. */
export function heldQuals(prof: { edu: string; spec?: string; subject?: string; icai?: boolean }): Set<Qual> {
  const s = new Set<Qual>(qualsIn(prof.subject || '').filter((q) => q !== 'GRAD' && q !== 'PG'));
  const lv = EDU_LEVEL[prof.edu] ?? 0;
  if (lv >= 1) s.add('X'); if (lv >= 2 || prof.edu === 'diploma') s.add(prof.edu === 'diploma' ? 'DIPLOMA' : 'XII'); if (prof.edu === 'iti') s.add('ITI');
  if (lv >= 3) { s.add('XII'); s.add('GRAD'); } if (lv >= 4) s.add('PG'); if (lv >= 5) s.add('PHD');
  if (prof.edu === 'eng') s.add('BE'); if (prof.spec === 'law') s.add('LLB'); if (prof.spec === 'medical' && !s.has('BDS') && !s.has('NURSING')) s.add('MBBS'); if (prof.spec === 'engineering') s.add('BE');
  if (prof.icai || (prof.spec === 'finance' && s.has('CA'))) s.add('CA');
  for (const q of ['MA', 'MSC', 'MCOM', 'MBA', 'LLM', 'ME', 'MD', 'MPH'] as Qual[]) if (s.has(q)) s.add('PG');
  if (s.has('MSC')) s.add('BSC'); if (s.has('MA')) s.add('BA'); if (s.has('MCOM')) s.add('BCOM'); if (s.has('ME')) s.add('BE'); if (s.has('LLM')) s.add('LLB'); if (s.has('MD')) s.add('MBBS');
  for (const q of s) if (QUAL_LEVEL[q] >= 3 && q !== 'CA_INTER') { s.add('GRAD'); s.add('XII'); s.add('X'); }
  if (s.has('XII') || s.has('DIPLOMA')) s.add('X');
  return s;
}
const GENERIC: Qual[] = ['VIII', 'X', 'XII', 'GRAD', 'PG', 'PHD'];
/** ok=true: every essential part is met. false: the person is below the level the notice states. null: at the level but the
 *  specific degree named is not in the profile (or the notice states no qualification) — "Check notice" naming the clause. */
export function qualGate(f: NoticeFacts, prof: { edu: string; spec?: string; subject?: string; icai?: boolean }): { ok: boolean | null; why?: string } {
  if (!f.stated) return { ok: null, why: 'Check notice: the essential qualification is not in the feed text.' };
  if (f.inferred) { const g = qualGate({ ...f, inferred: false }, prof); return g.ok === false ? g : { ok: null, why: `Check notice: the essential qualification is not in the feed text (the notice mentions ${essentialSummary({ ...f, experience: null })}).` }; }
  const held = heldQuals(prof); const lv = Math.max(EDU_LEVEL[prof.edu] ?? 0, ...[...held].map((q) => QUAL_LEVEL[q]));
  const parts = f.essentialText.replace(SUBJECT_LEVEL, ' ').split(/\s+(?:with|along with|and also|plus)\s+|;|\n/i).map((x) => qualsIn(x)).filter((x) => x.length);
  if (!parts.length) return { ok: null, why: 'Check notice: the essential qualification is not clear in the feed text.' };
  const sat = (q: Qual) => held.has(q) || (GENERIC.includes(q) && lv >= QUAL_LEVEL[q]) || (q === 'DIPLOMA' && held.has('BE'));
  const name = (qs: Qual[]) => qs.filter((q) => !(q === 'GRAD' && qs.length > 1)).map((q) => QUAL_NAME[q]).join(' / ');
  for (const alts of parts) {
    // a specific degree makes the bare "degree" token in the same part redundant ("Degree in Law" = LLB)
    const a = alts.some((q) => q !== 'GRAD' && QUAL_LEVEL[q] >= 3) ? alts.filter((q) => q !== 'GRAD') : alts;
    if (a.some(sat)) continue;
    const need = Math.min(...a.map((q) => QUAL_LEVEL[q]));
    if (lv < need) return { ok: false, why: `Needs a higher qualification (${name(a)}, essential); your highest is ${prof.edu === 'eng' ? 'BE / BTech' : prof.edu}.` };
    return { ok: null, why: `Check notice: asks for ${name(a)} (essential); this may need a higher qualification or a different one than your profile lists, so confirm yours is accepted.` };
  }
  return { ok: true, why: `Essential qualification met: ${name(parts.flat().filter((q, i, x) => x.indexOf(q) === i && sat(q)).slice(0, 3) as Qual[]) || 'as stated'}.` };
}
