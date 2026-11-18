/** Offer Shield: finds clauses worth a second look in an offer letter. Rules only, in the browser. Information, not legal advice. Akash Sync Agent. */
export type Risk = 'red' | 'amber' | 'info';
export interface Clause { kind: string; risk: Risk; sentence: string; why: string; detail?: string }
const DUR = /(\d{1,3}|one|two|three|four|six|twelve|eighteen|twenty[- ]four)\s*(?:\(\d+\)\s*)?(days?|weeks?|months?|years?)/i;
const AMT = /(?:₹|rs\.?|inr)\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:lakhs?|lacs?|crores?|l|cr))?|\d[\d,]*\s*(?:lakhs?|lacs?)/i;
const W: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, six: 6, twelve: 12, eighteen: 18, 'twenty four': 24, 'twenty-four': 24 };
export function toDays(m: RegExpMatchArray | null): number | null {
  if (!m) return null; const n = W[m[1].toLowerCase()] ?? Number(m[1]); const u = m[2].toLowerCase();
  return u.startsWith('day') ? n : u.startsWith('week') ? n * 7 : u.startsWith('month') ? n * 30 : n * 365;
}
const RULES: { kind: string; re: RegExp; why: string; risk: (s: string) => Risk }[] = [
  { kind: 'Service bond', re: /\b(service (bond|agreement)|bond(?!\s+period)|minimum (service|tenure)|lock[- ]in)\b/i, why: 'You may have to pay money if you leave before a set time. Ask for the amount, how it reduces over time, and what it covers.', risk: (s) => (AMT.test(s) || /penalt/i.test(s) ? 'red' : 'amber') },
  { kind: 'Pay to join / deposit', re: /\b((refundable |security |caution )deposit|deposit (of|amount)|pay(ment)? (to|before) (join|joining)|joining (fee|charges?)|registration (fee|charges?)|kit (fee|charges?)|laptop (deposit|charges?))\b/i, why: 'Asking a new hire to pay a deposit or fee to join is a serious warning sign. Genuine employers do not charge candidates. Do not pay; ask for this in writing.', risk: () => 'red' },
  { kind: 'Non-compete', re: /\b(non[- ]?compete|shall not (join|work for|engage)|competitor|competing business)\b/i, why: 'Limits where you can work after leaving. In India, section 27 of the Indian Contract Act, 1872 generally makes restraints on trade after employment void, but read it and ask: https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf', risk: () => 'amber' },
  { kind: 'Non-solicit', re: /\bnon[- ]?solicit/i, why: 'Stops you approaching the company\'s clients or staff for a period. Check how long and how wide.', risk: () => 'info' },
  { kind: 'Notice period', re: /\b(notice period|(\d+|one|two|three|six)\s*(days?|months?)['’]?\s*(written )?notice|notice of (\d+|one|two|three))/i, why: 'Long notice periods make it harder to join your next job. 30 to 60 days is common; 90 days is long.', risk: (s) => { const d = toDays(s.match(DUR)); return d != null && d >= 90 ? 'red' : d != null && d > 60 ? 'amber' : 'info'; } },
  { kind: 'Clawback / repayment', re: /\b(claw ?back|repay|refund (the|any)|recover(y|ed)? (of|from)|reimburse the company|joining bonus|relocation (assistance|bonus|allowance)|sign[- ]on bonus)\b/i, why: 'Money you may have to return if you leave early. Ask for the exact amount and time period in writing.', risk: (s) => (/repay|claw|recover|refund|reimburse/i.test(s) ? 'amber' : 'info') },
  { kind: 'Training cost recovery', re: /\btraining (cost|fee|expense|charges)/i, why: 'Some employers recover training costs if you leave. Ask what the real cost is and how it is calculated.', risk: () => 'amber' },
  { kind: 'Original documents held', re: /\b(original (certificates?|documents?|mark ?sheets?|degree)|retain (your|the) (original|certificates))\b/i, why: 'Holding original certificates is a serious warning sign. Offer only copies, and ask for this in writing.', risk: (s) => (/submit|retain|deposit|keep|hold/i.test(s) ? 'red' : 'amber') },
  { kind: 'Liquidated damages', re: /\b(liquidated damages|penalty of|pay (a )?penalty|damages of)\b/i, why: 'A fixed sum payable if you break the terms. Ask how the figure was set.', risk: () => 'red' },
  { kind: 'Probation', re: /\bprobation/i, why: 'During probation notice is often shorter and confirmation is not automatic. Check the length and notice.', risk: (s) => { const d = toDays(s.match(DUR)); return d != null && d > 180 ? 'amber' : 'info'; } },
  { kind: 'Garden leave / notice buy-out', re: /\b(garden leave|buy[- ]?out|salary in lieu)\b/i, why: 'Check whether you can pay to leave early and how the amount is worked out.', risk: () => 'info' },
  { kind: 'Broad IP / moonlighting', re: /\b(all (inventions|intellectual property)|whether or not during working hours|outside (of )?working hours|moonlight|dual employment|side (business|project))\b/i, why: 'May cover side projects done in your own time. Ask for personal projects to be carved out.', risk: () => 'amber' },
  { kind: 'Variable pay', re: /\b(variable|performance (bonus|linked)|at the sole discretion)\b/i, why: 'Variable pay is not guaranteed. Count only fixed pay when comparing.', risk: () => 'info' },
];
const sentences = (t: string) => t.replace(/\r/g, '').replace(/([.;!?:])?[ \t]*\n{2,}/g, (_m, p) => (p ? p + ' ' : '. ')).replace(/(?<!\.)\.\s*\.(?!\.)/g, '.').replace(/\s+/g, ' ').split(/(?<=[.;!?])\s+(?=[A-Z0-9(•-])/).map((s) => s.trim()).filter((s) => s.length > 15);
export function scanOffer(text: string): Clause[] {
  const out: Clause[] = [];
  for (const s of sentences(text || '')) for (const r of RULES) if (r.re.test(s)) {
    if (out.some((c) => c.kind === r.kind && c.sentence === s)) continue;
    const d = s.match(DUR), a = s.match(AMT);
    out.push({ kind: r.kind, risk: r.risk(s), sentence: s.slice(0, 400), why: r.why, detail: [a?.[0], d?.[0]].filter(Boolean).join(' · ') || undefined });
  }
  const order = { red: 0, amber: 1, info: 2 } as const;
  return out.sort((x, y) => order[x.risk] - order[y.risk]);
}
/** Pulls a clearly stated annual CTC in INR. Ranges, ceilings, conflicts, other currencies and bonus/buyout figures return null. */
const CTC_CTX = /(?:\bctc\b|\bc\.t\.c\.|\bcost to (?:the )?company\b|\bpackage\b|\b(?:annual|gross)\s+(?:annual\s+)?(?:gross\s+)?(?:salary|compensation|pay)\b|\bannual ctc\b)/i;
const PREV_CTC = /\b(?:previous|last|earlier|existing|prior)\s+(?:ctc|package|salary|compensation|pay)\b/i;
const CTC_NOISE = /\b(?:retention|joining|sign[- ]?on|performance)?\s*(?:bonus|bond|buy[- ]?outs?|buyouts?|penalty|deposit|damages|claw\s?backs?|liquidated)\b/i;
const NON_INR = /\b(?:usd|eur|gbp|aed|sgd|cad|aud|dollars?|euros?|pounds?)\b|[$€£]/i;
const INR_MARK = /₹|\b(?:inr|rs\.?|rupees?|rupaye|lakhs?|lacs?|lpa|crores?|crs?\b|लाख|करोड़)\b/i;
const RANGE_BEFORE = /(?:\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*$/i;
const UPTO_BEFORE = /\b(?:up\s*to|upto|as high as)\s*$/i;
const parseNum = (s: string) => Number(s.replace(/,/g, ''));
const abbrevDot = (t: string, j: number) => /(?:\b(?:rs|mr|mrs|ms|dr|no|inr|pvt|ltd|inc|co)|c\.t\.c|ctc)\.$/i.test(t.slice(Math.max(0, j - 8), j + 1));
const clauseSpan = (t: string, i: number) => {
  let a = 0, b = t.length;
  for (const sep of ['. ', '! ', '? ', '\n']) {
    const j = t.lastIndexOf(sep, i);
    if (j >= a && !(sep === '. ' && abbrevDot(t, j))) a = j + sep.length;
  }
  for (const sep of ['. ', '! ', '? ', '\n']) {
    const j = t.indexOf(sep, i);
    if (j >= 0 && j < b && !(sep === '. ' && abbrevDot(t, j))) b = j;
  }
  return { a, b, text: t.slice(a, b) };
};
type CtcHit = { value: number; monthly: boolean; annual: boolean; currency: 'inr' | 'other' | 'unknown' };
function unitOf(after: string): { mul: number; annual: boolean } {
  if (/^\s*(?:lpa\b|lakhs?\s+per\s+annum|lacs?\s+per\s+annum|लाख(?:\s*रुपये)?(?:\s*प्रति\s*वर्ष)?)/i.test(after)) return { mul: 100_000, annual: true };
  if (/^\s*(?:crores?|crs?\b|करोड़)/i.test(after)) return { mul: 10_000_000, annual: /^\s*(?:crores?|crs?\b|करोड़)(?:\s+per\s+annum)?/i.test(after) };
  if (/^\s*(?:lakhs?|lacs?|लाख)/i.test(after)) return { mul: 100_000, annual: false };
  return { mul: 1, annual: false };
}
function ctcHits(t: string): CtcHit[] {
  const out: CtcHit[] = [];
  const re = /\d+(?:,\d{2,3})+|\d+(?:\.\d+)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const raw = m[0], start = m.index, end = start + raw.length;
    const { a, b, text: cl } = clauseSpan(t, start);
    const before = t.slice(a, start);
    const after = t.slice(end, b);
    const afterClose = after.slice(0, 22);
    if (RANGE_BEFORE.test(before) || UPTO_BEFORE.test(before)) continue;
    if (CTC_NOISE.test(before) || (CTC_NOISE.test(cl) && !CTC_CTX.test(before))) continue;
    if (PREV_CTC.test(cl) && !/\boffer(?:s|ed|ing)?\s+(?:a |you )?(?:ctc|package)\b/i.test(before) && !/\b(?:new|revised|proposed)\s+ctc\b/i.test(before)) continue;
    if (/\b(?:fixed(?:\s+pay)?|basic(?:\s+pay)?|basic\s+salary|in-?hand)\b/i.test(before) && !CTC_CTX.test(before.slice(Math.max(0, before.length - 28)))) continue;
    const unit = unitOf(after);
    const hasCtx = CTC_CTX.test(before) || /^(?:\s*(?:per\s+annum|p\.a\.?)?\s*)(?:ctc|cost to (?:the )?company|package)\b/i.test(after);
    if (!hasCtx) continue;
    const n = parseNum(raw);
    if (!Number.isFinite(n) || n <= 0) continue;
    const value = Math.round(n * unit.mul);
    if (value < 1000) continue;
    const currency: CtcHit['currency'] = NON_INR.test(before) || NON_INR.test(afterClose) ? 'other' : INR_MARK.test(before) || INR_MARK.test(after) || unit.mul > 1 ? 'inr' : 'unknown';
    const afterTimes = /(?:[x×*]\s*12\s*=\s*(?:₹|rs\.?|inr)?\s*)$/i.test(before);
    const monthly = !afterTimes && (/\b(?:per\s+month|monthly|\/\s*month|p\.?\s*m\.?)\b/i.test(afterClose) || /\s*[x×*]\s*12\b/i.test(afterClose) || /\bmonthly\s+ctc\b.{0,28}$/i.test(before));
    const annual = !monthly && (unit.annual || afterTimes || /\b(?:per\s+annum|per\s+year|p\.?\s*a\.?|annual\s+ctc)\b/i.test(afterClose) || /\bannual\s+ctc\b.{0,28}$/i.test(before));
    out.push({ value, monthly: monthly && !annual, annual, currency });
  }
  return out;
}
export function findCtc(text: string): number | null {
  const t = (text || '').replace(/\s+/g, ' ');
  const hits = ctcHits(t);
  if (!hits.length) return null;
  if (hits.some((h) => h.currency === 'other')) return null;
  const converted = [...new Set(hits.map((h) => (h.monthly ? h.value * 12 : h.value)))];
  return converted.length === 1 ? converted[0] : null;
}
export function findVariablePct(text: string): number | null {
  const t = (text || '').replace(/\s+/g, ' ');
  const pats = [
    /variable(?: pay| component| bonus)?[^%\d.]{0,40}(\d{1,2}(?:\.\d+)?)\s*%/ig,
    /(\d{1,2}(?:\.\d+)?)\s*%\s*(?:of (?:the |your )?(?:ctc|salary) )?(?:as |is )?variable/ig,
  ];
  const vals: number[] = [];
  for (const re of pats) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(t))) {
      const numAt = m.index + m[0].lastIndexOf(m[1]);
      const beforeNum = t.slice(Math.max(0, numAt - 16), numAt);
      if (RANGE_BEFORE.test(beforeNum) || UPTO_BEFORE.test(beforeNum)) continue;
      const n = Number(m[1]);
      if (n > 0 && n <= 60) vals.push(n);
    }
  }
  const uniq = [...new Set(vals)];
  return uniq.length === 1 ? uniq[0] : null;
}
/** Values to pre-fill from a pasted letter. Omits a field when the figure is not clearly stated. */
export function prefillPayFields(text: string): { ctc?: string; variable?: string } {
  const c = findCtc(text), v = findVariablePct(text);
  return { ...(c ? { ctc: String(c) } : {}), ...(v != null ? { variable: String(v) } : {}) };
}
export type PaySide = { text: string; ctc: string; variable: string; ctcEdited?: boolean; variableEdited?: boolean };
/** Merge pre-fill into offer fields. 'type' never changes pay; 'new' (fresh paste/upload) fills or clears; 'append' never overwrites a field the user edited. */
export function mergePayPrefill(prev: PaySide, text: string, kind: 'type' | 'new' | 'append'): PaySide {
  if (kind === 'type') return { ...prev, text };
  const pay = prefillPayFields(text);
  if (kind === 'new') return { text, ctc: pay.ctc ?? '', variable: pay.variable ?? '0', ctcEdited: false, variableEdited: false };
  return {
    text,
    ctc: prev.ctcEdited ? prev.ctc : (pay.ctc ?? prev.ctc),
    variable: prev.variableEdited ? prev.variable : (pay.variable ?? prev.variable),
    ctcEdited: prev.ctcEdited,
    variableEdited: prev.variableEdited,
  };
}
/** Short notice when a whole-document re-paste replaces a hand-edited CTC or variable %. */
export function payRefreshNotice(prev: PaySide, kind: 'type' | 'new' | 'append'): string | undefined {
  if (kind === 'new' && (prev.ctcEdited || prev.variableEdited)) return 'CTC and variable were refreshed from the new letter.';
}
export const DISCLAIMER = 'Information, not legal advice. Rules-based reading in your browser can miss or misread clauses. For a binding view, ask a qualified professional of your choice.';
