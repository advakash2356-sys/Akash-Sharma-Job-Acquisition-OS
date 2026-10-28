/** Scam Shield: browser-only warning-sign checks on a recruiter message. Rules only, no AI, nothing sent anywhere.
 *  Built by Akash Sync Agent. Free-mail list: subset of Kikobeats/free-email-domains (MIT). */
import { FREE_MAIL } from './freeMailDomains';

export type Level = 'red' | 'amber';
export interface Sign { level: Level; title: string; detail: string; match?: string }
export interface ScamInput { message: string; email?: string; company?: string; phone?: string }
export interface ScamResult { verdict: 'red' | 'amber' | 'green'; signs: Sign[]; headline: string; advice: string[] }

const AMOUNT = /(?:₹|rs\.?|inr|rupees?|रु\.?|रुपये|rupaye|rupay)\s?\d[\d,]*|\d[\d,]*\s?(?:₹|\/-|rs\b|rupees?|रुपये|rupaye|rupay)/i;
const FEE = /\b(?:registration|security|refundable|processing|verification|training|kit|document(?:ation)?|interview|joining|uniform|laptop|onboarding|slot|booking|form)\s*(?:fee|fees|charges?|amount|deposit)\b|\b(?:fee|fees|charges?|deposit)\b|\bpay(?:ment)?\b.{0,40}\b(?:to (?:schedule|confirm|book|process|forward|release))|फीस|शुल्क|पैसे\s*(?:जमा|भेज|देने)|जमा\s*(?:करें|करना|करो)|paise\s*(?:jama|bhej|dene|do)|fees?\s*(?:bharo|bharna|bhare|jama|dena|deni|lagegi|lagega)|jama\s*(?:karo|karna|karein|karen)|amount\s*(?:bhejo|bhejna|transfer)/i;
const PAYCHAN = /\b(?:upi|gpay|google pay|phonepe|paytm|qr code|scan (?:and|&) pay|bank transfer|neft|imps)\b/i;
const SECRET = /\b(?:otp|cvv|pin|card number|net ?banking|bank password|aadhaar (?:otp|copy)|pan card copy)\b|ओटीपी/i;
const TASK = /\b(?:like (?:videos?|posts?)|subscribe (?:to )?(?:channels?|youtube)|rate (?:hotels?|products?)|google reviews?|daily tasks?|prepaid tasks?|telegram task|earn ₹?\d+ per (?:task|like|day))\b/i;
const PRESSURE = /\b(?:today only|within (?:\d+|one|two) (?:hours?|hrs?|minutes?|mins?)|immediately|urgent(?:ly)?|last (?:chance|date today)|limited (?:seats|slots)|before (?:\d+ ?(?:pm|am)|evening|tonight)|asap)\b|turant|abhi\s+(?:karo|bhejo|pay|jama)|aaj\s+hi|jaldi|तुरंत|आज ही|जल्दी/i;
const CHAT_ONLY = /\b(?:whats ?app|wa\.me|telegram|t\.me|signal)\b/i;
const NO_INTERVIEW = /\b(?:no interview|without (?:any )?interview|direct (?:joining|selection)|guaranteed (?:job|placement|selection)|100% (?:job|placement|selection)|selected without|offer letter (?:directly|ready))\b|bina\s+interview|बिना\s*इंटरव्यू/i;
const TOO_GOOD = /\b(?:earn|salary|income)\b.{0,30}(?:₹|rs\.?)\s?\d[\d,]*\s*(?:per|\/|a)\s*(?:day|hour)|\b(?:double|2x|3x) (?:your )?salary\b|ghar baithe|work from home.{0,30}earn/i;
const BRANDS = ['naukri', 'linkedin', 'indeed', 'tcs', 'infosys', 'wipro', 'amazon', 'google', 'microsoft', 'flipkart', 'reliance', 'hdfc', 'icici', 'accenture', 'deloitte', 'cipla', 'tata'];
const OFFICIAL: Record<string, string[]> = { naukri: ['naukri.com', 'infoedge.com', 'infoedge.in'], linkedin: ['linkedin.com'], indeed: ['indeed.com'], tcs: ['tcs.com'], infosys: ['infosys.com'], wipro: ['wipro.com'], amazon: ['amazon.com', 'amazon.in', 'amazon.jobs'], google: ['google.com'], microsoft: ['microsoft.com'], flipkart: ['flipkart.com'], reliance: ['ril.com', 'jio.com', 'relianceretail.com'], hdfc: ['hdfcbank.com', 'hdfc.com'], icici: ['icicibank.com'], accenture: ['accenture.com'], deloitte: ['deloitte.com'], cipla: ['cipla.com'], tata: ['tata.com', 'tcs.com', 'tatamotors.com', 'tatasteel.com'] };

const m = (re: RegExp, t: string) => t.match(re)?.[0];
const domainOf = (email = '') => (email.trim().toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2,})$/) || [])[1] || '';
export const emailsIn = (t: string) => t.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) || [];

export function scanMessage(input: ScamInput): ScamResult {
  const t = `${input.message || ''}`.replace(/\s+/g, ' ');
  const signs: Sign[] = [];
  const amt = m(AMOUNT, t), fee = m(FEE, t), pay = m(PAYCHAN, t);
  if (fee && (amt || pay)) signs.push({ level: 'red', title: 'Asks you to pay', detail: 'Real employers and job sites do not charge candidates for interviews, registration, training or documents.', match: [fee, amt].filter(Boolean).join(' · ') });
  else if (amt && pay) signs.push({ level: 'red', title: 'Asks for a payment', detail: 'An amount and a payment method appear together. Do not pay to get a job.', match: `${amt} · ${pay}` });
  else if (fee) signs.push({ level: 'amber', title: 'Mentions a fee', detail: 'Ask in writing who is paying and why. Candidates should not pay.', match: fee });
  const sec = m(SECRET, t); if (sec) signs.push({ level: 'red', title: 'Asks for OTP or bank details', detail: 'Never share an OTP, PIN, CVV or bank login with anyone.', match: sec });
  const task = m(TASK, t); if (task) signs.push({ level: 'red', title: 'Paid "task" job', detail: 'Liking videos or writing reviews for money is a common task-fraud pattern that later asks for a deposit.', match: task });
  const emails = [input.email || '', ...emailsIn(t)].filter(Boolean);
  const claimed = `${input.company || ''} ${t}`.toLowerCase();
  const brand = BRANDS.find((b) => new RegExp(`\\b${b}\\b`).test(claimed));
  for (const e of emails) {
    const d = domainOf(e); if (!d) continue;
    if (brand && OFFICIAL[brand] && !OFFICIAL[brand].some((o) => d === o || d.endsWith('.' + o))) {
      if (d.includes(brand)) signs.push({ level: 'red', title: 'Look-alike email domain', detail: `Mentions ${brand} but the email is from ${d}, not an official ${brand} domain.`, match: e });
      else if (FREE_MAIL.has(d)) signs.push({ level: 'amber', title: 'Free email for a big company', detail: `Mentions ${brand} but writes from a free ${d} address. Large employers use their own domain.`, match: e });
      else signs.push({ level: 'amber', title: 'Email domain does not match', detail: `Mentions ${brand}; ${d} is not one of its known domains. Check on the company's careers page.`, match: e });
    } else if (FREE_MAIL.has(d)) signs.push({ level: 'amber', title: 'Free email address', detail: `Sent from ${d}. Fine for a small firm, but confirm the company exists and the role is on its own site.`, match: e });
    break;
  }
  const pr = m(PRESSURE, t); if (pr) signs.push({ level: 'amber', title: 'Time pressure', detail: 'Pressure to act fast is used to stop you checking. A real offer can wait a day.', match: pr });
  const ch = m(CHAT_ONLY, t);
  if (ch) signs.push({ level: 'amber', title: 'Chat-app only contact', detail: 'Hiring only over WhatsApp or Telegram, with no company email, is a common warning sign.', match: ch });
  const ni = m(NO_INTERVIEW, t); if (ni) signs.push({ level: 'amber', title: 'Job without a proper interview', detail: 'Guaranteed jobs or offers without an interview are unusual.', match: ni });
  const tg = m(TOO_GOOD, t); if (tg) signs.push({ level: 'amber', title: 'Pay looks too good', detail: 'Very high pay for easy work is a common lure.', match: tg });
  const reds = signs.filter((s) => s.level === 'red').length, ambers = signs.length - reds;
  const verdict = reds ? 'red' : ambers ? 'amber' : 'green';
  const headline = verdict === 'red' ? `${reds + ambers} warning sign${reds + ambers > 1 ? 's' : ''}, including a serious one. Do not pay or share details.` : verdict === 'amber' ? `${ambers} warning sign${ambers > 1 ? 's' : ''} found. Check before you reply.` : 'No warning signs found by these rules. Still check the job on the company\'s own site.';
  const advice = verdict === 'green' ? ['Find the same job on the company\'s official careers page.', 'Never pay money to apply or attend an interview.']
    : ['Do not pay any fee or share OTP, bank or ID copies.', 'Find the job on the company\'s official careers page and contact them from there.', 'Report fraud at cybercrime.gov.in or call 1930 (India). For calls using Naukri\'s name, Naukri asks people to write to compliance@naukri.com.'];
  return { verdict, signs, headline, advice };
}

/** Plain text for a WhatsApp share. No message text or personal data is included. */
export function shareText(r: ScamResult, url = 'https://akash-sharma-job-acquisition-os.vercel.app/scam-shield') {
  const tag = r.verdict === 'red' ? '🔴 Serious warning signs' : r.verdict === 'amber' ? '🟠 Warning signs' : '🟢 No warning signs found';
  return `Job offer check: ${tag}\n${r.signs.slice(0, 4).map((s) => `• ${s.title}`).join('\n')}\nReal employers never ask you to pay for a job.\nCheck a message free: ${url}`;
}
export const waLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** Indian phone numbers normalised to last 10 digits, for the user's own reported-numbers list. */
export const normPhone = (p = '') => { const d = p.replace(/\D/g, ''); return d.length >= 10 ? d.slice(-10) : ''; };
