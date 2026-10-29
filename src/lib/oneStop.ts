// Offer letter + covering email, checked together in the browser. Rules only. Akash Sync Agent.
import { findCtc, scanOffer, type Clause } from './offerShield';
import { scanMessage, type ScamResult } from './scamShield';
export interface OneStop { letter: Clause[]; email: ScamResult; cross: { level: 'red' | 'amber'; title: string; detail: string }[]; verdict: 'red' | 'amber' | 'green' }
const FREE = /@(gmail|yahoo|outlook|hotmail|rediffmail|proton(mail)?|ymail|icloud)\./i;
export function checkOneStop(letter: string, email: string, sender = '', company = ''): OneStop {
  const L = scanOffer(letter), E = scanMessage({ message: email, email: sender, company }), cross: OneStop['cross'] = [];
  const a = findCtc(letter), b = findCtc(email);
  if (a && b && Math.abs(a - b) / Math.max(a, b) > 0.02) cross.push({ level: 'red', title: 'CTC differs between letter and email', detail: `Letter ₹${a.toLocaleString('en-IN')}, email ₹${b.toLocaleString('en-IN')}. Ask for one written figure.` });
  if (FREE.test(sender)) cross.push({ level: 'amber', title: 'Offer sent from a free email account', detail: 'Real companies usually send offers from their own domain. Check the sender with the company directly.' });
  const dom = sender.split('@')[1]?.toLowerCase(), co = company.toLowerCase().replace(/\b(pvt|private|ltd|limited|llp|inc|india)\b|[^a-z]/g, '');
  if (dom && co.length > 3 && !FREE.test(sender) && !dom.replace(/[^a-z]/g, '').includes(co.slice(0, 5))) cross.push({ level: 'amber', title: "Sender domain doesn't match the company name", detail: `Email from ${dom}, company "${company}". Look-alike domains are a common trick; check the company's real website.` });
  if (/\b(pay|deposit|fee|charges?)\b/i.test(letter) && /\b(registration|training|security|document|verification|kit)\b/i.test(letter)) cross.push({ level: 'red', title: 'Letter asks you to pay', detail: 'A genuine employer does not charge you to join.' });
  const reds = L.some((c) => c.risk === 'red') || E.verdict === 'red' || cross.some((c) => c.level === 'red');
  const ambers = L.some((c) => c.risk === 'amber') || E.verdict === 'amber' || cross.length > 0;
  return { letter: L, email: E, cross, verdict: reds ? 'red' : ambers ? 'amber' : 'green' };
}
