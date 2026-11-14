// Facts read from the posting text only. Anything not found is "Not disclosed" / "Not stated"; nothing is guessed.
export interface JobFacts { salary: string; employment: string; experience: string; shift: string }
const CUR = String.raw`(?:₹|rs\.?|inr|\$|usd|us\$|€|eur|£|gbp|cad|aud)`;
const NUM = String.raw`\d[\d,]*(?:\.\d+)?\s*(?:k|lpa|lakhs?|lacs?|crore|cr|l)?`;
const PAY_WORDS = /\b(?:salary|salaries|ctc|lpa|stipend|package|pay|compensation|wages?|remuneration|per (?:month|annum|year|hour)|a (?:month|year)|p\.?a\.?|lakhs? per annum)\b|\/\s?(?:month|mo|year|yr|hour|hr)\b/i;
const FEE_WORDS = /\b(?:fees?|registration|deposits?|charges?|pay us|security|training cost|refundable|processing)\b/i;
export function parseSalary(text: string): string {
  const t = text.replace(/\s+/g, ' ');
  const pats = [
  // Safe: CUR and NUM are fixed constant patterns defined in this file, never user input (semgrep regex-from-var reviewed).
    new RegExp(String.raw`${CUR}\s?${NUM}\s*(?:-|–|to)\s*${CUR}?\s?${NUM}(?:\s*(?:per|/|a)\s*(?:year|annum|yr|month|mo|hour|hr))?`, 'i'), // nosemgrep: detect-non-literal-regexp -- reviewed: input escaped or a fixed constant pattern
    new RegExp(String.raw`\b${NUM}\s*(?:-|–|to)\s*${NUM}\s*(?:lpa|lakhs? per annum|lakhs?|ctc)\b`, 'i'), // nosemgrep: detect-non-literal-regexp -- reviewed: input escaped or a fixed constant pattern
    new RegExp(String.raw`(?:salary|ctc|compensation|pay|stipend|package|wages?)[^.]{0,25}?${CUR}\s?${NUM}(?:\s*(?:per|/|a)\s*(?:year|annum|yr|month|mo|hour|hr))?`, 'i'), // nosemgrep: detect-non-literal-regexp -- reviewed: input escaped or a fixed constant pattern
    new RegExp(String.raw`\b${NUM}\s*lpa\b`, 'i'), // nosemgrep: detect-non-literal-regexp -- reviewed: input escaped or a fixed constant pattern
  ];
  for (const p of pats) for (const m of t.matchAll(new RegExp(p.source, 'gi'))) { // nosemgrep: detect-non-literal-regexp -- reviewed: fixed constant patterns above
    if (!/\d{2,}|\d\s*(?:k|lpa|l\b|lakh)/i.test(m[0])) continue;
    const near = t.slice(Math.max(0, m.index! - 40), m.index! + m[0].length + 30);
    // Count it only next to pay words, and never next to fee words ("Pay Rs 1500 registration fee" is a fee, not a salary).
    if (!PAY_WORDS.test(near) || FEE_WORDS.test(near)) continue;
    return m[0].replace(/^(?:salary|ctc|compensation|pay|stipend|package|wages?)[^₹$€£\d]*/i, '').trim();
  }
  return 'Not disclosed';
}
export function parseEmployment(text: string): string {
  const t = text.toLowerCase(); const out: string[] = [];
  if (/\bfull[- ]time\b/.test(t)) out.push('Full-time'); if (/\bpart[- ]time\b/.test(t)) out.push('Part-time');
  if (/\b(contract|contractor|fixed[- ]term|freelance)\b/.test(t)) out.push('Contract'); if (/\b(intern|internship)\b/.test(t)) out.push('Internship');
  if (/\b(temporary|temp role|seasonal)\b/.test(t)) out.push('Temporary');
  return out.length ? out.join(' / ') : 'Not stated';
}
export function parseExperience(text: string): string {
  const t = text.replace(/\s+/g, ' ');
  const m = t.match(/\b(\d{1,2})\s*(?:\+|plus)?\s*(?:-|–|to)\s*(\d{1,2})\s*\+?\s*years?\b/i) || t.match(/\b(?:at least|minimum(?: of)?|min\.?)\s*(\d{1,2})\s*\+?\s*years?\b/i) || t.match(/\b(\d{1,2})\s*\+\s*years?\b/i) || t.match(/\b(\d{1,2})\s*years?(?:'|’)? (?:of )?(?:relevant |professional |work )?experience\b/i);
  if (m) return m[2] ? `${m[1]}–${m[2]} years` : `${m[1]}+ years`;
  if (/\b(fresher|freshers|no experience (?:needed|required)|entry[- ]level|graduate scheme)\b/i.test(t)) return 'Entry level / freshers';
  return 'Not stated';
}
export function parseShift(text: string, tz: string[] = []): string {
  const t = text.toLowerCase(); const out: string[] = [];
  if (/\b(night shift|us shift|us hours|us time ?zone|est hours|pst hours|overlap with (?:us|est|pst))\b/.test(t)) out.push('US / night shift');
  if (/\b(uk shift|uk hours|gmt hours|bst)\b/.test(t)) out.push('UK hours');
  if (/\b(rotational shift|rotating shift)\b/.test(t)) out.push('Rotational');
  if (/\b(day shift|general shift)\b/.test(t)) out.push('Day shift');
  if (tz.length) out.push(`Time zone: ${tz.slice(0, 3).join(', ')}`);
  return out.length ? out.join(' · ') : 'Not stated';
}
export function jobFacts(description: string, tz: string[] = []): JobFacts {
  const d = String(description || '');
  return { salary: parseSalary(d), employment: parseEmployment(d), experience: parseExperience(d), shift: parseShift(d, tz) };
}
