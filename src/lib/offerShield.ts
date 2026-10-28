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
/** Pulls a CTC figure like "CTC of ₹12,00,000" or "12 LPA" from the letter, if stated. */
export function findCtc(text: string): number | null {
  const t = (text || '').replace(/\s+/g, ' ');
  const lpa = t.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakhs? per annum)/i); if (lpa) return Math.round(Number(lpa[1]) * 100_000);
  const m = t.match(/(?:ctc|cost to (?:the )?company|annual (?:gross )?(?:salary|compensation))[^₹\d]{0,40}(?:₹|rs\.?|inr)?\s?(\d[\d,]{4,})/i);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}
/** Pulls a variable-pay percentage like "Variable pay of 15%" or "15% variable" from the letter, if stated. */
export function findVariablePct(text: string): number | null {
  const t = (text || '').replace(/\s+/g, ' ');
  const m = t.match(/variable(?: pay| component| bonus)?[^%\d.]{0,40}(\d{1,2}(?:\.\d+)?)\s*%/i) || t.match(/(\d{1,2}(?:\.\d+)?)\s*%\s*(?:of (?:the |your )?(?:ctc|salary) )?(?:as |is )?variable/i);
  const n = m ? Number(m[1]) : NaN; return n > 0 && n <= 60 ? n : null;
}
export const DISCLAIMER = 'Information, not legal advice. Rules-based reading in your browser can miss or misread clauses. For a binding view, ask a qualified professional of your choice.';
