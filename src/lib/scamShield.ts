import { reEscape } from './reEscape';
/** Scam Shield: browser-only warning-sign checks on a recruiter message. Rules only, no AI, nothing sent anywhere.
 *  Built by Akash Sync Agent. Free-mail list: subset of Kikobeats/free-email-domains (MIT). */
import { FREE_MAIL } from './freeMailDomains';

export type Level = 'red' | 'amber';
export interface Sign { level: Level; title: string; detail: string; match?: string }
export interface ScamInput { message: string; email?: string; company?: string; phone?: string }
export interface ScamResult { verdict: 'red' | 'amber' | 'green'; signs: Sign[]; headline: string; advice: string[] }

const AMOUNT_MARKED = /(?:₹|rs\.?|inr|rupees?|रु\.?|रुपये|rupaye|rupay)\s*\d[\d,]*(?:\.\d+)?\s*k?\b|\d[\d,]*(?:\.\d+)?\s*k?\s*(?:₹|\/-|rs\b|rupees?|रुपये|rupaye|rupay|inr)\b|\d+(?:\.\d+)?\s*k\b/i;
const FEE = /\b(?:registration|security|refundable|processing|verification|training|kit|document(?:ation)?|interview|joining|uniform|laptop|onboarding|slot|booking|form|enrollment|enrolment)\s*(?:fee|fees|charges?|amount|deposit)\b|\b(?:fee|fees|charges?|deposit)\b|\bpay(?:ment)?\b.{0,40}\b(?:to (?:schedule|confirm|book|process|forward|release))|फीस|शुल्क|पैसे\s*(?:जमा|भेज|देने)|जमा\s*(?:करें|करना|करो)|paise\s*(?:jama|bhej|dene|do)|fees?\s*(?:bharo|bharna|bhare|jama|dena|deni|lagegi|lagega)|jama\s*(?:karo|karna|karein|karen)|amount\s*(?:bhejo|bhejna|transfer)/i;
const FEE_MORE = /paid\s+service|(?:amount|fee|fees|deposit|sum|payment).{0,40}?refundable|refundable\s+(?:fee|fees|deposit|amount|security|hai)|\b(?:bhejo|bhej\s*do|bhej\s*dena|bhejna|transfer\s*karo)\b/i;
const HINGLISH_PAY = /\b(?:bhejo|bhej\s*do|bhej\s*dena|bhejna|jama\s*karo|jama\s*karna|jama\s*karein|jama\s*karen|transfer\s*karo)\b/i;
const FEE_ADJ = 'registration|processing|training|security|hidden|joining|document(?:ation)?|interview|refundable|paid|verification|application|enrollment|enrolment|form|slot|booking|onboarding|kit';
const neverAskChunk = (t: string, i: number, hit: string) => {
  const re = /\b(?:never|do(?:es)?\s+not|don(?:['\u2019]?t)|doesn(?:['\u2019]?t))\s+ask(?:\s+(?:candidates|anyone|you|applicants))?(?:\s+to)?\s+(?:for|to\s+(?:pay|share|send|give))?\s+(.{0,120}?)(?:\.|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const from = m.index, to = m.index + m[0].length;
    if (i >= from && i <= to && new RegExp(hit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(m[1] || m[0])) return true;
  }
  return false;
};
const feeDenied = (t: string, i: number, hit: string) => {
  const w = t.slice(Math.max(0, i - 100), i + hit.length);
  const around = t.slice(Math.max(0, i - 32), i + hit.length + 32);
  if (/(?:^|[^A-Za-z])(?:no|not\s+a|without(?:\s+any)?|zero|nil|free of(?:\s+any)?)\s+(?:(?:a|any|the)\s+)?(?:(?:registration|processing|training|security|hidden|joining|document(?:ation)?|interview|refundable|paid|verification|application|enrollment|enrolment|kit|laptop|uniform|form|slot|booking|onboarding|candidate|candidates|applicant|applicants)\s+)*(?:fee|fees|charges?|deposit|payment|paid\s+service)$/i.test(w)) return true;
  const denyVerb = new RegExp(
    `(?:do(?:es)?\\s+not|don(?:['\\u2019]?t)|doesn(?:['\\u2019]?t)|never)\\s+(?:charge[ds]?|ask(?:\\s+\\w+){0,4}\\s+to\\s+pay|take|require|collect|demand)(?:\\s+(?:any|a|the|candidates?))*(?:\\s+(?:${FEE_ADJ}))*(?:\\s+(?:fee|fees|charges?|deposit|payment)(?:\\s*(?:,|or|and|\\/)\\s*(?:a\\s+|any\\s+)?(?:fee|fees|charges?|deposit|payment))*)?$`,
    'i');
  if (denyVerb.test(w)) return true;
  if (neverAskChunk(t, i, hit)) return true;
  if (/\bfee\s+waiver\b/i.test(around)) return true;
  if (/\b(?:tuition|semester fee|college fee|university fee|education history)\b/i.test(around) || /\b(?:university|college|semester)\b/i.test(around) && /\bfee\b/i.test(hit)) return true;
  if (/\b(?:application|exam)\s+fee\b/i.test(hit + ' ' + around) && /\b(?:ibps|sbi|ssc|rrb|upsc|official notification|payable to (?:ibps|the bank))\b/i.test(t)) return true;
  if (/\b(?:reimburse(?:s|d|ment)?|employer[- ]paid|company will pay|paid by (?:the )?company)\b/i.test(t.slice(Math.max(0, i - 80), i + hit.length + 40))) return true;
  if (/\b(?:joining|retention|sign[- ]?on|performance|annual)\s+bonus\b/i.test(t.slice(Math.max(0, i - 80), i + hit.length + 80))) return true;
  return false;
};
const feeAsk = (t: string) => {
  const re = new RegExp(`(?:${FEE.source})|(?:${FEE_MORE.source})`, 'ig');
  let hit: RegExpExecArray | null;
  while ((hit = re.exec(t))) { if (!feeDenied(t, hit.index, hit[0])) return hit[0]; }
};
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

const WORD_NUM: Record<string, number> = { zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90, hundred:100, thousand:1000, lakh:100000, lac:100000 };
const WORD_RUN = /\b(?:rupees?\s+)?(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|lakh|lac)(?:[\s-]+(?:and\s+)?(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|lakh|lac))*(?:\s+rupees?)?\b/i;
const wordsToNum = (s: string) => {
  const toks = s.toLowerCase().replace(/-/g, ' ').split(/\s+/).filter((x) => x && x !== 'and' && x !== 'rupee' && x !== 'rupees');
  if (!toks.length || toks.some((x) => WORD_NUM[x] == null)) return null;
  let total = 0, cur = 0;
  for (const x of toks) {
    const v = WORD_NUM[x];
    if (v === 100) cur = (cur || 1) * 100;
    else if (v >= 1000) { total += (cur || 1) * v; cur = 0; }
    else cur += v;
  }
  const n = total + cur; return n >= 100 ? n : null;
};
const isYearish = (s: string) => { const n = Number(s.replace(/,/g, '')); return /^(?:19|20)\d{2}$/.test(s) && n >= 1900 && n <= 2039; };
const wordAmount = (t: string) => { const m = t.match(WORD_RUN); if (!m || wordsToNum(m[0]) == null) return; return m[0]; };
const findAmount = (t: string) => {
  const marked = t.match(AMOUNT_MARKED); if (marked) return marked[0];
  const words = wordAmount(t); if (words) return words;
  const re = /\b(\d{1,2},\d{3}|\d{3,5})\b/g;
  let hit: RegExpExecArray | null;
  while ((hit = re.exec(t))) {
    const near = t.slice(Math.max(0, hit.index - 44), hit.index + hit[0].length + 44);
    const payCtx = PAYCHAN.test(near) || HINGLISH_PAY.test(near) || /\b(?:training|joining|onboarding|deposit|fees?|charges?|paid service|registration|interview|amount)\b/i.test(near);
    if (isYearish(hit[1]) && !payCtx) continue;
    if (payCtx) return hit[0];
  }
};
const noFeeClause = (t: string) => /\b(?:no fee|do(?:es)? not charge|never charge|never ask(?:\s+\w+){0,4}\s+to\s+pay|without (?:any )?(?:fee|charge)|free of (?:any )?(?:cost|charge|fee))\b/i.test(t);
const payForSalary = (t: string) => /\b(?:salary credit|for salary|salary (?:credit )?setup|credit setup|after joining.{0,24}(?:upi|paytm|gpay|phonepe|google pay)|(?:upi|paytm|gpay|phonepe).{0,48}salary)\b/i.test(t);
const secretAsk = (t: string) => {
  const re = new RegExp(SECRET.source, 'ig');
  let hit: RegExpExecArray | null;
  while ((hit = re.exec(t))) { if (!neverAskChunk(t, hit.index, hit[0]) && !feeDenied(t, hit.index, hit[0])) return hit[0]; }
};


export function scanMessage(input: ScamInput): ScamResult {
  const t = `${input.message || ''}`.replace(/\s+/g, ' ');
  const signs: Sign[] = [];
  const amt = findAmount(t), fee = feeAsk(t), pay = m(PAYCHAN, t);
  if (fee && (amt || pay)) signs.push({ level: 'red', title: 'Asks you to pay', detail: 'Real employers and job sites do not charge candidates for interviews, registration, training or documents.', match: [fee, amt].filter(Boolean).join(' · ') });
  else if (amt && pay && !noFeeClause(t) && !payForSalary(t)) signs.push({ level: 'red', title: 'Asks for a payment', detail: 'An amount and a payment method appear together. Do not pay to get a job.', match: `${amt} · ${pay}` });
  else if (fee) signs.push({ level: 'amber', title: 'Mentions a fee', detail: 'Ask in writing who is paying and why. Candidates should not pay.', match: fee });
  const sec = secretAsk(t); if (sec) signs.push({ level: 'red', title: 'Asks for OTP or bank details', detail: 'Never share an OTP, PIN, CVV or bank login with anyone.', match: sec });
  const task = m(TASK, t); if (task) signs.push({ level: 'red', title: 'Paid "task" job', detail: 'Liking videos or writing reviews for money is a common task-fraud pattern that later asks for a deposit.', match: task });
  const emails = [input.email || '', ...emailsIn(t)].filter(Boolean);
  const claimed = `${input.company || ''} ${t}`.toLowerCase();
  const brand = BRANDS.find((b) => new RegExp(`\\b${reEscape(b)}\\b`).test(claimed)); // nosemgrep: detect-non-literal-regexp -- reviewed: input escaped or a fixed constant pattern
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
