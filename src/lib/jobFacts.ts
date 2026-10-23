// Facts read from the posting text only. Anything not found is "Not disclosed" / "Not stated"; nothing is guessed.
export interface JobFacts { salary: string; employment: string; experience: string; shift: string }
const CUR = String.raw`(?:₹|rs\.?|inr|\$|usd|us\$|€|eur|£|gbp|cad|aud)`;
const NUM = String.raw`\d[\d,]*(?:\.\d+)?\s*(?:k|lpa|lakhs?|lacs?|crore|cr|l)?`;
export function parseSalary(text: string): string {
  const t = text.replace(/\s+/g, ' ');
  const pats = [
    new RegExp(String.raw`${CUR}\s?${NUM}\s*(?:-|–|to)\s*${CUR}?\s?${NUM}(?:\s*(?:per|/|a)\s*(?:year|annum|yr|month|mo|hour|hr))?`, 'i'),
    new RegExp(String.raw`\b${NUM}\s*(?:-|–|to)\s*${NUM}\s*(?:lpa|lakhs? per annum|lakhs?|ctc)\b`, 'i'),
    new RegExp(String.raw`(?:salary|ctc|compensation|pay)[^.]{0,25}?${CUR}\s?${NUM}(?:\s*(?:per|/|a)\s*(?:year|annum|yr|month|mo|hour|hr))?`, 'i'),
    new RegExp(String.raw`\b${NUM}\s*lpa\b`, 'i'),
  ];
  for (const p of pats) { const m = t.match(p); if (m && /\d{2,}|\d\s*(?:k|lpa|l\b|lakh)/i.test(m[0])) return m[0].replace(/^(?:salary|ctc|compensation|pay)[^₹$€£\d]*/i, '').trim(); }
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
