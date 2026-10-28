/** Agent Check: overseas recruitment fee vs the Emigration Rules cap. Warning signs only; never a finding that a named agent is a fraud. Akash Sync Agent. */
export const CAP = 30_000, GST = 0.18, CAP_WITH_GST = Math.round(CAP * (1 + GST)); // 35,400
export const SOURCES = [
  { label: 'Emigration Rules, 1983, rule 25 (as substituted by the Emigration (Amendment) Rules, 2017, G.S.R. 1510(E), 14 Dec 2017)', href: 'https://indiacode.ecourtsindia.com/rules/04d98962/' },
  { label: 'Embassy of India, Riyadh (MEA): advisory on overcharging by recruiting agents (Rs 30,000 + 18% GST)', href: 'https://www.eoiriyadh.gov.in/section/public-advisories/advisory-on-overcharging-by-agents-for-overseas-recruitment-offering-fake-overseas-jobs-and-illegal-recruitment/' },
  { label: 'MEA FAQ for intending emigrants: complain on eMigrate or call OWRC 1800 11 3090', href: 'https://fsi.mea.gov.in/issues-of-intending-emigrants.htm' },
  { label: 'eMigrate (MEA): open "List of active RA" to check an agent\'s registration', href: 'https://emigrate.gov.in/' },
];
export const RA_LINK = 'https://emigrate.gov.in/';
export interface AgentSign { level: 'red' | 'amber'; title: string; detail: string; match?: string }
export interface AgentResult { overseas: boolean; maxFee: number; signs: AgentSign[]; advice: string[] }
const num = (s: string) => { const m = /([\d][\d,]*(?:\.\d+)?)\s*(lakh|lac|l\b|k\b)?/i.exec(s); if (!m) return 0; let v = parseFloat(m[1].replace(/,/g, '')); const u = (m[2] || '').toLowerCase(); if (u.startsWith('la') || u === 'l') v *= 100_000; else if (u === 'k') v *= 1000; return v; };
const AMT = /(?:₹|rs\.?|inr|rupees?)\s*[\d][\d,]*(?:\.\d+)?\s*(?:lakh|lac|l\b|k\b)?|[\d][\d,]*(?:\.\d+)?\s*(?:lakh|lac|k)?\s*(?:₹|rs\.?|rupees?|\/-)|[\d][\d,]*(?:\.\d+)?\s*(?:lakh|lac)\b/gi;
const FEE = /(fee|fees|charge|charges|payment|pay|deposit|cost|amount|fees?\s*total|service|processing|package)/i;
const EXCLUDED = /(visa\s*(fee|stamping)|medical|air\s*ticket|ticket|flight)/i;
const OVERSEAS = /(abroad|overseas|gulf|dubai|uae|saudi|ksa|qatar|kuwait|oman|bahrain|malaysia|singapore|israel|russia|poland|europe|canada|uk\b|work\s*visa|emigrat|ecr|ecnr|विदेश)/i;
const RA_NO = /\b[A-Z]-?\d{2,5}\/[A-Z]{2,4}\/[A-Z]{2,4}\/\d/i;
export function checkAgent(text: string): AgentResult {
  const t = (text || '').replace(/\s+/g, ' '); const signs: AgentSign[] = []; const overseas = OVERSEAS.test(t);
  let maxFee = 0, maxMatch = ''; const excluded: string[] = [];
  for (const m of t.matchAll(AMT)) { const i = m.index || 0, pre = t.slice(Math.max(0, i - 50), i).split(/[,.;!?]\s/).pop() || '', ctx = (pre + m[0]).trim(); if (!EXCLUDED.test(pre) && !FEE.test(ctx + t.slice(i + m[0].length, i + m[0].length + 15))) continue; const v = num(m[0]);
    if (EXCLUDED.test(pre)) excluded.push(m[0].trim()); else if (v > maxFee) { maxFee = v; maxMatch = ctx.trim(); } }
  if (maxFee > CAP_WITH_GST) signs.push({ level: 'red', title: 'Fee above the legal cap', detail: `A registered recruiting agent may charge at most ₹${CAP.toLocaleString('en-IN')} plus 18% GST (₹${CAP_WITH_GST.toLocaleString('en-IN')}) for its services under rule 25 of the Emigration Rules, 1983. This message mentions ₹${maxFee.toLocaleString('en-IN')}.`, match: maxMatch });
  else if (maxFee > 0) signs.push({ level: 'amber', title: 'Fee asked', detail: `₹${maxFee.toLocaleString('en-IN')} is within the ₹${CAP_WITH_GST.toLocaleString('en-IN')} cap. Pay only a registered agent, and get a receipt.`, match: maxMatch });
  if (excluded.length) signs.push({ level: 'amber', title: 'Visa, medical or ticket costs charged to you', detail: 'Under rule 25(3), visa fees, the pre-employment medical, the air ticket and pre-departure stay are to be borne by the foreign employer, not the worker.', match: excluded.join(', ') });
  if (/\bcash\b|नकद/i.test(t) && maxFee + excluded.length > 0) signs.push({ level: 'amber', title: 'Cash payment', detail: 'Rule 25(4): service charges may be collected only by digital payment or bank draft.' });
  if (overseas && !RA_NO.test(t)) signs.push({ level: 'amber', title: 'No recruiting agent registration number', detail: 'Registered agents show their RA licence number in ads. Ask for it and check it on eMigrate.' });
  if (/(passport).{0,40}(submit|send|courier|deposit|jama)|(submit|send|courier|deposit|jama).{0,20}passport/i.test(t)) signs.push({ level: 'amber', title: 'Asked to hand over your passport', detail: 'Keep your passport until you have checked the agent and the job.' });
  return { overseas, maxFee, signs, advice: ['Check the agent\'s registration on eMigrate ("List of active RA") before paying.', 'Pay only by bank transfer or draft, and ask for a receipt.', 'If unsure, call the MEA 24x7 helpline 1800-11-3090 or the Protector of Emigrants office.', 'These are warning signs from simple rules, not a finding about any agent.'] };
}
