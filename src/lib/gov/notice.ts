// Structured notice facts (t386u retest 3 redesign). Every notice is parsed ONCE into fields; the level gate, the
// qualification gates and ranking read only these fields, never raw title words. Pure and deterministic: the server
// may refine the same fields from the notice PDF (text or Gemini) and ship them with the posting. Akash Sync Agent.

export type NoticeType = 'open_call' | 'result_list' | 'admit_schedule' | 'appointment' | 'retiree_only' | 'other';
export type Qual = 'VIII' | 'X' | 'ITI' | 'XII' | 'DIPLOMA' | 'GRAD' | 'BA' | 'BSC' | 'BCOM' | 'LLB' | 'BE' | 'MBBS' | 'BDS' | 'NURSING' | 'PHARM' | 'CA' | 'CA_INTER' | 'CMA' | 'CS' | 'BED'
  | 'PG' | 'MA' | 'MSC' | 'MCOM' | 'MBA' | 'LLM' | 'ME' | 'MD' | 'MPH' | 'NET' | 'PHD';
/** Kind of experience a notice asks for, and the person's own kinds (one-time profile). */
export type ExpType = 'litigation' | 'judicial' | 'corporate_legal' | 'clinical' | 'public_health' | 'teaching' | 'research' | 'audit_accounts' | 'engineering' | 'administrative' | 'any';
export const EXP_NAME: Record<ExpType, string> = { litigation: 'litigation / court practice', judicial: 'judicial service', corporate_legal: 'corporate / in-house legal', clinical: 'clinical (hospital)', public_health: 'public health', teaching: 'teaching', research: 'research', audit_accounts: 'audit / accounts', engineering: 'engineering (design / construction / maintenance)', administrative: 'administration', any: 'relevant' };
export const EXP_SHORT: Record<ExpType, string> = { litigation: 'litigation', judicial: 'judicial', corporate_legal: 'corporate legal', clinical: 'clinical', public_health: 'public health', teaching: 'teaching', research: 'research', audit_accounts: 'audit / accounts', engineering: 'engineering', administrative: 'administrative', any: '' };
export type Licence = 'bar' | 'medReg' | 'icai';
export const LICENCE_NAME: Record<Licence, string> = { bar: 'Bar Council enrolment', medReg: 'NMC / State Medical Council registration', icai: 'ICAI membership' };
export type TitleClass = 'officer' | 'support' | 'clerical' | 'other';
export type PostLevel = 'support' | 'subgrad' | 'clerical' | 'grad' | 'officer' | null;
export interface NoticeFacts {
  v: 2; source: 'rules' | 'pdf' | 'gemini';
  noticeType: NoticeType;
  /** Degrees / levels from the ESSENTIAL text only; preferred ones never gate. */
  essential: Qual[]; preferred: Qual[]; essentialText: string; preferredText: string;
  /** 0 = 8th or below, 1 = 10th / ITI, 2 = 12th / diploma, 3 = graduate, 4 = postgraduate, 5 = PhD; null = not stated. */
  minEdu: number | null;
  group: 'A' | 'B' | 'C' | 'D' | null; payLevel: number | null; basic: number | null;
  titleClass: TitleClass; isOfficer: boolean;
  experience: { years: number; type: ExpType } | null; licences: Licence[];
  ageMin: number | null; ageMax: number | null;
  /** The feed text states some eligibility (otherwise every condition is "unknown", never "not required"). */
  stated: boolean;
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
  ['CA_INTER', /\bC\.?\s?A\.?\s*[-(]?\s*(?:inter(?:mediate)?|ipcc|foundation)\b/i],
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
  const s = (t || '').replace(SUBJECT_LEVEL, ' '); const out: Qual[] = [];
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
const BACK = /\b(?:preferred|preferable|desirable|desired|(?:would|will|shall) be (?:an? )?(?:added |big |distinct )?(?:asset|advantage|plus|preference)|is an? (?:added |big |distinct )?(?:asset|advantage|plus)|an? (?:added )?(?:advantage|asset)|added qualification|(?:will|shall|would|may) (?:get|be given|receive) (?:preference|priority|weightage)|(?:given|get) (?:preference|priority|weightage)|optional|preference)\b/i;
const FWD = /\b(?:preferably|preference (?:will |shall |would |may )?(?:be )?(?:given )?(?:to|for)|priority (?:will |shall )?(?:be )?(?:given )?(?:to|for)|weightage (?:will |shall )?(?:be )?(?:given )?(?:to|for)|ideally(?: with)?|optionally|desirable\s*[:\-–])/i;
const HDR = /\b(essential|required|mandatory|minimum|desirable|preferred|preferable|optional|additional)\s*(?:educational\s*)?(?:qualifications?|eligibility|criteria)?\s*[:\-–]\s*/gi;
const BOUND = /,|;|\s+with\s+|\s+along with\s+|\s+and\s+|\s+plus\s+(?=\w)/gi;
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
  for (const m of t.matchAll(HDR)) { secs.push({ kind, text: t.slice(last, m.index) }); kind = /^(desirable|preferred|preferable|optional|additional)/i.test(m[1]) ? 'p' : 'e'; last = m.index! + m[0].length; }
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
const EXP_TYPES: [ExpType, RegExp][] = [
  ['litigation', /\b(?:practi[cs]e as an? advocate|practi[cs]ing advocate|practice at the bar|bar practice|litigation|court practice|standing (?:at|of|in) the bar|as an advocate|advocates? with|appearing before)\b|वकालत|अधिवक्ता के रूप में/i],
  ['judicial', /\bjudicial (?:service|officer|experience)\b|\bserved as (?:a )?judge\b/i],
  ['corporate_legal', /\b(?:corporate (?:law|legal)|in-house|legal (?:department|cell|work) (?:of|in) (?:a )?(?:psu|company|bank|corporation)|legal work in (?:a )?(?:psu|company|bank)|drafting (?:and vetting )?of (?:contracts|agreements)|contract (?:drafting|management))\b/i],
  ['clinical', /\b(?:clinical|hospital experience|house job|patient care|senior residency|junior residency|casualty)\b/i],
  ['public_health', /\b(?:public health|epidemiolog\w*|national health (?:programmes?|mission)|community health|NHM|immuni[sz]ation programme)\b/i],
  ['teaching', /\b(?:teaching experience|experience (?:of|in) teaching|teaching at|taught)\b/i],
  ['research', /\b(?:research experience|post[- ]?doc\w*|research and development|R&D|publications?)\b/i],
  ['audit_accounts', /\b(?:audit\w*|accounts|accounting|taxation|financial management|finance and accounts)\b/i],
  ['engineering', /\b(?:design|construction|execution|maintenance|site|field) (?:experience|work)\b|\bexperience in (?:design|construction|execution|maintenance)\b/i],
  ['administrative', /\b(?:administrative|administration|establishment matters|office management)\b/i],
];
/** Essential experience (largest stated years) and its type, from the essential text only. HJS / ADJ direct from Bar = 7 yrs litigation. */
export function experienceOf(title: string, essential: string): { years: number; type: ExpType } | null {
  let best: { years: number; type: ExpType } | null = null;
  for (const clause of (essential || '').split(/;|\.\s+/)) {
    const m = clause.match(/(\d{1,2})\s*(?:\+\s*)?(?:years?|yrs?)\.?\s*(?:of\s*)?(?:\w+\s+){0,4}?(?:practice|experience|standing|service)\b|(?:practice|experience|standing)[^.;]{0,40}?(?:for|of|minimum|at least)?\s*(\d{1,2})\s*(?:years?|yrs?)\b|(\d{1,2})\s*वर्ष(?:ों)?\s*(?:का|की)?\s*(?:अनुभव|वकालत|प्रैक्टिस)/i);
    if (!m) continue; const years = Number(m[1] || m[2] || m[3]); if (!(years > 0 && years <= 30)) continue;
    const type = (EXP_TYPES.find(([, re]) => re.test(clause))?.[0]) || 'any';
    if (!best || years > best.years) best = { years, type };
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
  const mx = s.match(/\b(?:not (?:be )?(?:more than|above|exceed\w*)|below|upper age(?: limit)?(?: is| of)?|maximum age(?: limit)?(?: is| of)?|age limit(?: is| of)?|under)\s*:?\s*(\d{2})\s*(?:years?|yrs?)/i); if (mx) max = Number(mx[1]);
  const mn = s.match(/\b(?:minimum age(?: is| of)?|not (?:be )?less than|at least)\s*:?\s*(\d{2})\s*(?:years?|yrs?)/i); if (mn) min = Number(mn[1]);
  if (max !== null && (max < 18 || max > 70)) max = null; if (min !== null && (min < 14 || min > 60)) min = null;
  return { min, max };
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
const OFFICER_EN = /\b(officers?|commandants?|managers?|directors?|superintendents?|inspectors?|engineers?|scientists?|judges?|magistrates?|prosecutors?|counsel|registrars?|commissioners?|controllers?|secretar(?:y|ies)|professors?|lecturers?|teachers?|principals?|doctors?|physicians?|surgeons?|specialists?|consultants?|accountants?|auditors?|wardens?|executives?|administrators?|chairm[ae]n|members? \(|advis[eo]rs?|pilots?|attorneys?|commanders?|lieutenants?|captains?|examiners?|analysts? \(senior\))\b/i;
const OFFICER_HI = hi(['अधिकारी', 'संचालक', 'निदेशक', 'प्रबंधक', 'अभियंता', 'निरीक्षक', 'अधीक्षक', 'न्यायाधीश', 'आयुक्त', 'सचिव', 'वैज्ञानिक', 'प्राध्यापक', 'व्याख्याता', 'शिक्षक', 'चिकित्सक', 'अभियोजक', 'लेखाकार', 'सलाहकार', 'कुलसचिव', 'कमांडेंट', 'मैनेजर', 'ऑफिसर', 'अध्यापक']);
// Canonical low-level roles (support staff), as stems so morphology and compounds match: peon, attendant, messenger, sweeper,
// guard, porter, driver, cook, watchman, gardener, daftri, record lifter, helper, labourer, waterman, orderly, MTS...
const SUPPORT_EN = /\b(peons?|attendants?|messengers?|sweep\w*|cleaners?|sanitation (?:workers?|staff)|sanitary (?:workers?|staff)|safai\w*|scaveng\w*|mehtar|jamadars?|jamedars?|guards?|watch ?m[ae]n|watch and ward|chowkidars?|chaukidars?|gate ?(?:keepers?|m[ae]n)|porters?|coolies?|kulis?|hamals?|bearers?|helpers?|khalasis?|labou?rers?|beldars?|mazdoors?|drivers?|cooks?|kitchen (?:boys?|helpers?|staff)|mess (?:servants?|boys?|helpers?)|masalchis?|khansamas?|malis?|malees?|maalis?|gardeners?|bagwans?|daftr?(?:y|i|ies|ys|is)|daftar[iy]|record (?:lifters?|sorters?)|gestetner(?: operators?)?|duplicating (?:machine )?operators?|cyclostyle\w*|office (?:subordinates?|boys?)|subordinate staff|orderl(?:y|ies)|chaprasis?|farr?ash\w*|water ?(?:m[ae]n|carriers?)|bhistis?|lift ?(?:m[ae]n|operators?)|liftm[ae]n|washerm[ae]n|dhobis?|barbers?|multi[- ]?(?:tasking|purpose)(?: staff| workers?| employees?)?|mts|se[wv]aks?|servants?|table boys?|lab boys?|mukadd?ams?|warders?|ward ?(?:boys?|attendants?)|aayas?|ayahs?|runners?|dak runners?|process servers?|bailiffs?|constables?|home ?guards?|agniveers?|forest guards?|trackm[ae]n|track maintainers?|chainm[ae]n|lascars?|lashkars?|nightwatch\w*|night watch\w*|tradesm[ae]n|room attendants?|support staff)\b/i;
const SUPPORT_HI = hi(['चपरासी', 'भृत्य', 'अनुसेवक', 'आदेशपाल', 'आदेशवाहक', 'संदेशवाहक', 'परिचर', 'परिचारक', 'अर्दली', 'सेवक', 'चालक', 'वाहन ?चालक', 'वाहनचालक', 'ड्राइवर', 'ड्राईवर', 'ड्रायवर', 'ड्रायव्हर', 'स्वीपर', 'झाडूवाला', 'झाड़ूवाला', 'झाडू', 'सफाई', 'सफाईवाला', 'सफाईकर्मी', 'सफाई ?कर्म', 'सफाई ?कर्मचार', 'स्वच्छता', 'स्वच्छताकर्मी', 'स्वच्छक', 'मेहतर', 'जमादार', 'रसोइया', 'रसोईया', 'रसोई', 'बावर्ची', 'खानसामा', 'कुक', 'गार्ड', 'होम ?गार्ड', 'होमगार्ड', 'सुरक्षाकर्मी', 'चौकीदार', 'पहरेदार', 'पहरेवाला', 'पहारेकरी', 'रखवालदार', 'गेटमैन', 'वॉचमैन', 'वाचमैन', 'माली', 'माळी', 'बागवान', 'हमाल', 'कुली', 'मजदूर', 'श्रमिक', 'बेलदार', 'खलासी', 'धोबी', 'नाई', 'जलवाहक', 'पानीवाला', 'पानी ?वाला', 'भिश्ती', 'लश्कर', 'मसालची', 'फर्राश', 'फराश', 'दफ्तरी', 'दफ़्तरी', 'शिपाई', 'रनर', 'बॉय', 'हेल्पर', 'मदतनीस', 'स्वयंपाकी', 'स्वयंपाक', 'पट्टेवाला', 'कामगार', 'सिपाही', 'आरक्षी', 'अग्निवीर', 'वनरक्षक', 'वन ?रक्षक', 'पत्रवाहक', 'प्रोसेस ?सर्वर', 'आदेशिका ?वाहक', 'तामील\\S*', 'आया', 'जल ?पुरुष']);
const CLERICAL_EN = /\b(clerks?|ldcs?|udcs?|lower division|upper division|typists?|steno\w*|data entry(?: operators?)?|deos?|computer operators?|copyists?|record keepers?|assistant grade|junior assistants?|office assistants?|court assistants?|junior court assistants?|receptionists?|para[- ]?legal volunteers?|plvs?|supportive staff|ministerial staff)\b/i;
const CLERICAL_HI = hi(['लिपिक', 'टंकक', 'टंकलेखक', 'आशुलिपिक', 'लघुलेखक', 'डाटा ?एंट्री', 'डेटा ?एंट्री', 'कंप्यूटर ?ऑपरेटर', 'संगणक ?चालक', 'कनिष्ठ ?सहायक', 'कार्यालय ?सहायक', 'सहायक ?ग्रेड\\S*', 'प्रतिलिपिक', 'नाजिर', 'नाज़िर', 'पारा ?विधिक', 'विधिक ?स्वयंसेवक']);
export function titleClass(title: string): TitleClass {
  const t = title || '';
  if (OFFICER_EN.test(t) || new RegExp(OFFICER_HI).test(t)) return 'officer';
  if (SUPPORT_EN.test(t) || new RegExp(SUPPORT_HI).test(t)) return 'support';
  if (CLERICAL_EN.test(t) || new RegExp(CLERICAL_HI).test(t)) return 'clerical';
  return 'other';
}
/** Exported for other modules that need the canonical role sets. */
export const SUPPORT_RE = new RegExp(`${SUPPORT_EN.source}|${SUPPORT_HI}`, 'i');
export const CLERICAL_RE = new RegExp(`${CLERICAL_EN.source}|${CLERICAL_HI}`, 'i');

// ---------- Notice type ----------
const RET_WHO = String.raw`(?:retired|retd\.?|superannuated|former|ex[- ](?!servicem[ae]n|army|defence)|सेवा[- ]?निवृत्त\S*|सेवानिवृत\S*|रिटायर्ड|निवृत्त)`;
const RET_STAFF = String.raw`(?:\S+\s+){0,3}?(?:employees?|officers?|officials?|personnel|persons?|staff|judges?|teachers?|professors?|faculty|govt\.? servants?|government servants?|court employees?|bankers?|कर्मचारि\S*|कर्मचारी|अधिकारि\S*|अधिकारी|शिक्षक\S*|न्यायिक)`;
const RET_AIM = new RegExp(String.raw`\b(?:engagement|engaging|appointment|empanelment|hiring|hire|re-?employment|re-?engagement|inviting applications|applications? (?:are )?(?:hereby )?invited)\s+(?:\S+\s+){0,3}?(?:of|from)\s+(?:the\s+)?(?:\S+\s+){0,3}?(?:retired|retd\.?|pensioners?|superannuated|former)|${RET_WHO}\s*${RET_STAFF}|\bre-?employment\b|\bre-?engagement of\b|must be a retired|who (?:have )?retired (?:as|from)(?! (?:the )?(?:army|armed|defence|navy|air force|military|forces))|\bpension (?:notice|adalat|revision|papers?|cases?|sanction)s?\b|\bpensioners?'?\s+(?:meet|grievance|adalat|life certificates?|notice)|\blife certificates?\b|पेंशन (?:अदालत|सूचना)|पुनर्नियोजन|पुनर्नियुक्ति`, 'i');
const RET_NEG = /\b(?:not eligible|ineligible|need not apply|should not be|must not be|shall not be|not be (?:a )?retired|other than retired|not (?:be )?considered|not allowed|are excluded|cannot apply|may also apply|can also apply|are also eligible|also eligible)\b|पात्र नहीं|आवेदन नहीं कर सकते/i;
export function retireeOnly(t: string): boolean {
  const s = t || ''; const m = RET_AIM.exec(s); if (!m) return false;
  const near = s.slice(Math.max(0, m.index - 20), m.index + m[0].length + 80); return !RET_NEG.test(near);
}
const RESULT = /\b(results?|merit lists?|select(?:ed|ion)? (?:lists?|candidates?|notification)|final (?:select )?lists?|lists? of (?:applicants?|candidates?|eligible|ineligible|selected|shortlisted|provisional\w*|qualified|successful|roll numbers?)|wait(?:ing)? ?lists?|eligible (?:applications?|candidates?)|ineligible|rejected|shortlist\w*|provisional(?:ly)?|marks|roll (?:numbers?|nos?\.?)|status of (?:the )?applications?|application status|key answers?|answer[- ]?keys?|objections?|passing benchmark|seniority|cancel\w*|postpone\w*)\b|परिणाम|प्रतीक्षा|चयन सूची|सूची/i;
const SCHEDULE = /\b(admit[- ]?cards?|hall[- ]?tickets?|call[- ]?letters?|called for (?:the )?interview|interview (?:lists?|schedules?|notices?|dates?|calls?|programme)|dates? of (?:the )?(?:exam\w*|interview|test|skill test|typing test)|exam(?:ination)? (?:schedules?|dates?|programme|time ?table)|time ?table|schedule of|skill test|typing test|driving test|written test|viva|document verification|syllabus|walk[- ]?in interview schedule)\b|प्रवेश पत्र/i;
const APPOINT = /\b(appointment (?:orders?|letters?)|posting orders?|joining(?: report)?|receipt of appointment|selected for appointment|resolution of applications|in pursuan\w*|promotion|by way of promotion|transfer)\b|नियुक्ति पत्र|पदोन्नति/i;
const OPEN = /\b(applications? (?:are |is )?(?:hereby )?invited|inviting applications?|invites? applications?|recruitment (?:notices?|notifications?|advertisements?|process)|advertisements?|advt\.?|employment notices?|notification (?:no\.?|for (?:the )?(?:post|recruitment))|application call\w*|walk[- ]?in|vacanc(?:y|ies)|engagement of|empanelment of|filling up of|for the posts? of|recruitment of|recruitment for|recruitment to|appointment (?:to|in) (?:the )?posts?|on contract basis)\b|आवेदन (?:पत्र )?आमंत्रित|विज्ञापन|भर्ती|रिक्ति|पदभरती|पदों पर|चयन हेतु/i;
/** Notice type from the row text (title + description). "Recruitment of X" counts as an open call only when nothing marks it as a list, schedule, status or appointment. */
export function noticeTypeOf(text: string): NoticeType {
  const t = text || '';
  if (retireeOnly(t)) return 'retiree_only';
  if (APPOINT.test(t)) return 'appointment';
  if (RESULT.test(t)) return 'result_list';
  if (SCHEDULE.test(t)) return 'admit_schedule';
  if (OPEN.test(t)) return 'open_call';
  return 'other';
}
/** Strong signals read from the notice PDF text (first pages). Only categories that a real open call never states. */
export function noticeTypeFromPdf(text: string): NoticeType | null {
  const t = (text || '').slice(0, 4000);
  if (!t.trim()) return null;
  if (retireeOnly(t)) return 'retiree_only';
  if (/\b(selected for appointment|appointment letters? of the (?:selected )?candidates?|collect (?:his|her|their)?\s*(?:respective )?appointment letters?)\b/i.test(t)) return 'appointment';
  return null;
}

// ---------- One-stop parse ----------
const NO_TEXT = /^\s*(?:qualification as stated in the official notice\.?|as per (?:the )?(?:official )?notice\.?|see (?:the )?notice\.?|-)?\s*$/i;
export function parseNotice(p: { title: string; eligibility?: string; pay?: string; org?: string; maxAge?: number; minAge?: number }): NoticeFacts {
  const elig = NO_TEXT.test(p.eligibility || '') ? '' : (p.eligibility || '');
  const sp = splitEligibility(elig);
  const essential = qualsIn(sp.essential); const preferred = qualsIn(sp.preferred).filter((q) => !essential.includes(q));
  const pi = payInfo(p.pay || ''); const pt = payInfo(`${p.title} ${elig}`);
  const tc = titleClass(p.title); const ages = agesOf(elig);
  return {
    v: 2, source: 'rules', noticeType: noticeTypeOf(`${p.title} ${elig}`),
    essential, preferred, essentialText: sp.essential, preferredText: sp.preferred,
    minEdu: minEduOf(sp.essential), group: groupOf(`${p.title} ${elig} ${p.pay || ''}`),
    payLevel: pi.level ?? pt.level ?? null, basic: pi.basic ?? null,
    titleClass: tc, isOfficer: tc === 'officer',
    experience: experienceOf(p.title, sp.essential), licences: licencesOf(p.title, sp.essential),
    ageMin: p.minAge ?? ages.min, ageMax: p.maxAge ?? ages.max, stated: !!sp.essential.trim(),
  };
}
/** Level of a post from its fields. Officer head nouns are never low-level; unknown stays null (shown, ranked lower). */
export function postLevelOf(f: NoticeFacts): PostLevel {
  if (f.isOfficer) return 'officer';
  if (f.titleClass === 'support') return 'support';
  if (f.group === 'D' || f.payLevel === 1 || (f.minEdu !== null && f.minEdu <= 1)) return 'support';
  if (f.titleClass === 'clerical') return f.minEdu !== null && f.minEdu <= 2 ? 'subgrad' : 'clerical';
  if (f.minEdu === 2) return 'subgrad';
  if (f.minEdu !== null && f.minEdu >= 3) return 'grad';
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
    if (!f.stated && p.eduTags?.length) { const t = p.eduTags.map((x) => TAG_TEXT[x]).filter(Boolean).join(' or '); if (t) { const g = parseNotice({ ...p, eligibility: `${p.eligibility || ''}; ${t}` }); f = { ...f, essential: g.essential, essentialText: g.essentialText, minEdu: g.minEdu, stated: true }; } }
    CACHE.set(k + (p.eduTags || []).join(','), f); }
  return f;
}
/** Plain names for the essential qualification, for reasons and check clauses. */
export const QUAL_NAME: Record<Qual, string> = { VIII: '8th pass', X: '10th pass', ITI: 'ITI', XII: '12th pass', DIPLOMA: 'diploma', GRAD: 'graduate degree', BA: 'BA', BSC: 'BSc', BCOM: 'BCom', LLB: 'LLB', BE: 'BE / BTech', MBBS: 'MBBS', BDS: 'BDS', NURSING: 'nursing', PHARM: 'pharmacy', CA: 'CA (ICAI)', CA_INTER: 'CA Inter', CMA: 'CMA', CS: 'CS', BED: 'B.Ed', PG: 'postgraduate degree', MA: 'MA', MSC: 'MSc', MCOM: 'MCom', MBA: 'MBA / PGDM', LLM: 'LLM', ME: 'ME / MTech', MD: 'MD / MS', MPH: 'MPH', NET: 'NET', PHD: 'PhD' };
export function essentialSummary(f: NoticeFacts): string {
  const named = f.essential.filter((q) => !(q === 'GRAD' && f.essential.some((x) => QUAL_LEVEL[x] >= 3 && x !== 'GRAD')));
  const q = named.length ? named.slice(0, 3).map((x) => QUAL_NAME[x]).join(' / ') : 'the stated qualification';
  const any = /\bany (?:discipline|degree|stream|subject|graduate)\b|\bgraduat\w* in any\b/i.test(f.essentialText);
  const x = f.experience ? ` + ${f.experience.years} yrs ${f.experience.type === 'any' ? '' : `${EXP_NAME[f.experience.type]} `}${f.experience.type === 'litigation' ? 'practice' : 'experience'}` : '';
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
