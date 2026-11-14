// "iPhone bundle" tests. Sample data is made up. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { incomeTax, slabTax, ctcToInHand } from '../src/lib/indiaTax';
import { scanOffer, findCtc, toDays } from '../src/lib/offerShield';
import { estimate44ADA, invoiceTotal, CHECKLIST, SOURCES } from '../src/lib/remoteKit';
import { checkCin, checkGstin, lookups } from '../src/lib/employerCheck';
import { porterStem } from '../src/lib/porter';
import { hasTerm } from '../src/lib/keywords';
import { fitScore, cosine } from '../src/lib/fitScore';
import { followUpIcs } from '../src/lib/ghost';

test('tax: rebate up to 12 lakh, slabs above', () => { assert.equal(incomeTax(1_200_000), 0); assert.equal(slabTax(1_500_000), 105_000); assert.equal(incomeTax(1_500_000), 109_200); assert.equal(incomeTax(1_210_000), Math.round(10_000 * 1.04)); });
test('tax: 24 lakh', () => { assert.equal(slabTax(2_400_000), 300_000); });
test('in-hand: 9 LPA estimate is sane', () => { const r = ctcToInHand({ ctc: 900_000 }); assert.equal(r.tax, 0); assert.ok(r.monthlyInHand > 60_000 && r.monthlyInHand < 72_000, String(r.monthlyInHand)); assert.ok(r.assumptions.length >= 5); });
test('in-hand: variable is excluded from monthly', () => { assert.ok(ctcToInHand({ ctc: 2_000_000, variablePct: 20 }).monthlyInHand < ctcToInHand({ ctc: 2_000_000 }).monthlyInHand); });
const OFFER = 'SAMPLE. Annual CTC of Rs 9,00,000. You agree to a service bond of 24 months and shall pay Rs 2,00,000 as liquidated damages. You must submit your original certificates which will be retained. The notice period is 90 days. You shall not join any competitor for 12 months after leaving. The joining bonus must be repaid if you resign within 12 months. Probation is 6 months.';
test('offer: flags bond, documents, notice, non-compete, clawback', () => { const c = scanOffer(OFFER); const k = c.map((x) => x.kind);
  for (const want of ['Service bond', 'Liquidated damages', 'Original documents held', 'Notice period', 'Non-compete', 'Clawback / repayment', 'Probation']) assert.ok(k.includes(want), want);
  assert.equal(c.find((x) => x.kind === 'Notice period')!.risk, 'red'); assert.equal(c.find((x) => x.kind === 'Original documents held')!.risk, 'red'); assert.equal(c[0].risk, 'red'); });
test('offer: short notice is info, CTC found', () => { assert.equal(scanOffer('SAMPLE. The notice period is 30 days for both sides.')[0].risk, 'info'); assert.equal(findCtc(OFFER), 900_000); assert.equal(findCtc('Your CTC is 8.5 LPA'), 850_000); assert.equal(toDays('3 months'.match(/(\d+)\s*(months)/)), 90); });
test('remote: 44ADA', () => { const e = estimate44ADA(2_400_000); assert.equal(e.deemedIncome, 1_200_000); assert.equal(e.tax, 0); assert.ok(!estimate44ADA(8_000_000).eligible); assert.ok(CHECKLIST.length >= 6); assert.ok(SOURCES.every((s) => /gov\.in/.test(s.href))); });
test('remote: invoice total', () => { assert.equal(invoiceTotal({ items: [{ desc: 'a', amount: 1000 }, { desc: 'b', amount: 250.5 }] } as any), 1250.5); });
test('employer: CIN and GSTIN format', () => { assert.ok(checkCin('U72200KA2015PTC123456')!.ok); assert.ok(!checkCin('ABC123')!.ok); assert.equal(checkCin(''), null); assert.ok(checkGstin('27AAPFU0939F1ZV')!.ok); assert.ok(!checkGstin('27AAPFU0939F1Z')!.ok);
  const l = lookups('Sample Foods', 'https://sample.example/jobs'); assert.ok(l.some((x) => x.href.includes('mca.gov.in'))); assert.ok(l.some((x) => x.href.includes('icann.org'))); });
test('porter (natural, MIT) and UK spelling', () => { assert.equal(porterStem('presenting'), porterStem('presented')); assert.ok(hasTerm('Led organisational change', 'organizational')); assert.ok(hasTerm('Strong communicator, presented to leadership', 'communication')); });
test('fit score blends coverage and similarity', () => { const jd = 'Sales executive. Manage B2B client accounts, negotiate contracts, CRM, Excel reporting.'; const good = fitScore('Sales executive. Managed B2B client accounts, negotiated contracts, Salesforce CRM, Excel.', jd), bad = fitScore('Pastry chef. Baking bread and cakes.', jd);
  assert.ok(good.score > 70, String(good.score)); assert.ok(bad.score < 20, String(bad.score)); assert.ok(cosine('a b c', '') === 0); });
test('ics: three follow-up events', () => { const ics = followUpIcs({ id: 'j', title: 'Analyst', company: 'Sample Co', url: '', description: '', status: 'Applied', createdAt: '2026-10-01', appliedAt: '2026-10-01', notes: '', interviews: [] } as any, 'Riya');
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 3); assert.ok(ics.includes('DTSTART:20261022T090000')); });
test('extension: adapters and select options', () => { const ctx: any = {}; vm.runInNewContext(readFileSync('extension/fieldmap.js', 'utf8'), { globalThis: ctx }); const M = ctx.JAOS_MAP;
  assert.equal(M.adapterFor('acme.wd5.myworkdayjobs.com').name, 'Workday'); assert.equal(M.adapterFor('boards.greenhouse.io').name, 'Greenhouse'); assert.equal(M.adapterFor('www.naukri.com').name, 'Naukri'); assert.equal(M.adapterFor('example.com'), null);
  assert.equal(M.pickOption(['Select', 'Delhi', 'Mumbai'], 'delhi'), 1); assert.equal(M.pickOption(['Select', 'New Delhi, India'], 'New Delhi'), 1); assert.equal(M.pickOption(['Select', 'Pune'], 'Delhi'), -1);
  assert.equal(M.match('notice period'), 'noticePeriod'); assert.equal(M.match('current ctc'), 'currentCtc'); });
test('offer minors: bond shorthand, deposit, variable INR, no doubled stops', () => {
  const c = scanOffer('SAMPLE.\n\nBond: 2 years, penalty Rs 1,50,000 if you leave early.\n\nYou must pay a refundable security deposit of Rs 25,000 before joining.\n\nVariable: INR 1,20,000 per year.\n\nNotice period is 30 days.');
  const k = (n: string) => c.find((x) => x.kind === n);
  assert.equal(k('Service bond')?.risk, 'red'); assert.equal(k('Pay to join / deposit')?.risk, 'red'); assert.ok(k('Variable pay')?.detail?.includes('INR 1,20,000'));
  assert.ok(c.every((x) => !/\.\s*\./.test(x.sentence.replace(/\.\.\./g, ''))), JSON.stringify(c.map((x) => x.sentence)));
  assert.ok(scanOffer('SAMPLE. Pay to join: a registration fee of Rs 2,000 is payable.').some((x) => x.kind === 'Pay to join / deposit'));
});
import { deadline, sprint, parseLcaCsv, filterEmployers, SAMPLE_CSV, SOURCES as H1B_SOURCES, DISCLAIMER as H1B_DISC } from '../src/lib/h1b';
import { checkAgent, CAP_WITH_GST, SOURCES as AGENT_SOURCES } from '../src/lib/agentCheck';
test('h1b: two deadlines, +60 days, I-94 cap', () => {
  const d = sprint({ lastWorked: '2026-10-01', officialEnd: '2026-10-15', i94End: '', today: '2026-10-28' });
  assert.equal(d.length, 2); assert.equal(d[0].lastDay, '2026-11-30'); assert.equal(d[1].lastDay, '2026-12-14'); assert.equal(d[0].daysLeft, 33);
  const c = deadline('x', '2026-10-01', '2026-11-10', '2026-10-28')!; assert.equal(c.lastDay, '2026-11-10'); assert.ok(c.cappedByI94);
  assert.equal(deadline('x', 'bad', '', '2026-10-28'), null); assert.match(H1B_DISC, /attorney/);
  assert.ok(H1B_SOURCES.every((s) => /^https:\/\/www\.(uscis|ecfr|dol|federalregister)\.gov\//.test(s.href)));
});
test('h1b: LCA CSV keeps allowlisted columns only, filters', () => {
  const rows = parseLcaCsv(SAMPLE_CSV); assert.equal(rows.length, 6); assert.ok(rows.every((r) => !('EMPLOYER_POC_EMAIL' in r)));
  assert.equal(rows[0].WAGE_RATE_OF_PAY_FROM, '$165,000');
  const all = filterEmployers(rows, { title: 'engineer' }); assert.equal(all[0].employer, 'Sample Cloud Co (made up)'); assert.equal(all[0].filings, 2);
  assert.ok(!all.some((e) => /Retail/.test(e.employer)), 'withdrawn excluded');
  assert.ok(!filterEmployers(rows, { skipStaffing: true }).some((e) => /Staffing/.test(e.employer)));
  assert.equal(filterEmployers(rows, { state: 'tx' }).length, 1); assert.equal(filterEmployers(rows, { minWage: 160000 }).length, 2);
  assert.throws(() => parseLcaCsv('a,b\n1,2'), /EMPLOYER_NAME/);
});
test('agent check: Rule 25 cap, excluded costs, cash, never "fraud"', () => {
  assert.equal(CAP_WITH_GST, 35400);
  const r = checkAgent('Dubai driver job. Service charge Rs 85,000 cash, medical and air ticket Rs 25,000 extra. Submit passport today.');
  assert.ok(r.overseas); assert.equal(r.maxFee, 85000); const t = r.signs.map((s) => s.title).join('|');
  assert.match(t, /above the legal cap/); assert.match(t, /Visa, medical or ticket/); assert.match(t, /Cash/); assert.match(t, /registration number/); assert.match(t, /passport/);
  assert.ok(!JSON.stringify(r.signs).match(/\bis a fraud|\bfraudster|\bscammer/i));
  const ok = checkAgent('Saudi job via RA B-0123/MUM/PER/1000+/5/9876/2020. Service fee ₹30,000 + GST by bank transfer.');
  assert.ok(!ok.signs.some((s) => s.level === 'red')); assert.ok(!ok.signs.some((s) => /registration/.test(s.title)));
  assert.equal(checkAgent('Qatar job, fees 1.2 lakh').maxFee, 120000);
  assert.ok(AGENT_SOURCES.some((s) => /emigrate\.gov\.in/.test(s.href)));
});
test('clean URLs: every public page path opens its page', () => {
  const main = readFileSync('src/main.tsx', 'utf8'), vj = readFileSync('vercel.json', 'utf8');
  for (const p of ['scam-shield', 'offer-shield', 'remote-kit', 'h1b-sprint', 'gov-jobs', 'voice-practice']) { assert.ok(main.includes(p), `main.tsx ${p}`); assert.ok(vj.includes(p), `vercel.json ${p}`); }
});
test('hash routes accept page ids with digits (h1b-sprint)', () => { const app = readFileSync('src/App.tsx', 'utf8'); const re = new RegExp(app.match(/location\.hash\.match\((\/.*?\/)\)/)![1].slice(1, -1)); assert.equal('#/app/h1b-sprint'.match(re)?.[1], 'h1b-sprint'); });
test('agent check: domestic pay-to-join is red, cap only for overseas', () => {
  const d = checkAgent('SAMPLE (made up): Data entry job in Pune. Pay Rs 500 registration fee to confirm your interview slot.');
  assert.equal(d.overseas, false); assert.equal(d.signs[0].level, 'red'); assert.match(d.signs[0].title, /pay to get a job/);
  assert.ok(!d.signs.some((s) => /within|cap/i.test(s.title + s.detail.replace(/fee cap does not apply/, ''))));
  assert.equal(checkAgent('Pune office job, registration fee required.').signs[0]?.level, 'red');
  assert.equal(checkAgent('Pune office job. Walk-in interview Monday 10 am.').signs.length, 0);
  const o = checkAgent('Dubai job via agent. Service fee Rs 20,000 by bank transfer.'); assert.ok(o.overseas); assert.equal(o.signs.find((s) => s.title === 'Fee asked')?.level, 'amber');
});
import { EXAMS as GOV, match as govMatch } from '../src/lib/govJobs';
test('gov jobs: every exam has an official source and verified date', () => { for (const e of GOV) { assert.ok(/^https:\/\//.test(e.src) && e.verified, e.id); } assert.ok(GOV.some((e) => e.lesser)); });
test('gov jobs: OBC relaxation and qualification', () => {
  const base = { dob: '1997-01-01', edu: 'grad' as const, cat: 'GEN' as const, pwbd: false, esm: false, gender: 'male' as const, state: '' };
  const cgl = (c: any) => govMatch({ ...base, cat: c }).find((m) => m.exam.id === 'ssc-cgl')!; assert.equal(cgl('GEN').upper, 32); assert.equal(cgl('OBC').upper, 35); assert.equal(cgl('SC').upper, 37);
  assert.ok(!govMatch({ ...base, edu: '10' }).find((m) => m.exam.id === 'upsc-cse')!.ok);
  assert.ok(!govMatch({ ...base, dob: '2002-01-01', gender: 'female' }).find((m) => m.exam.id === 'upsc-cds')!.ok); });
import { dobInvalid } from '../src/lib/govJobs';
test('gov jobs: future/today DOB is invalid; no rrbcdg links', () => { assert.ok(dobInvalid('2099-01-01')); assert.ok(dobInvalid('2026-10-29', '2026-10-29')); assert.ok(!dobInvalid('2001-05-10')); assert.ok(GOV.every((e) => !e.src.includes('rrbcdg'))); });
import { analyze, naturalize, highlight } from '../src/lib/voiceInterview';
import { checkOneStop } from '../src/lib/oneStop';
test('voice: fillers, slang, wpm and STAR', () => { const a = analyze('Um so basically yeah I was gonna, you know, fix stuff. When I was at my last job I had to cut delays, I decided to set up a tracker and it reduced delays by 30%.', 10, ['delay', 'result'], 'behavioural');
  assert.ok(a.fillers.length >= 3); assert.ok(a.slang.includes('gonna')); assert.ok(a.wpm! > 170); assert.ok(a.star.situation && a.star.action && a.star.result); assert.ok(a.delivery < 80);
  assert.ok(!/\bum\b|basically|gonna/i.test(naturalize('Um I am gonna basically lead the team'))); assert.ok(highlight('um hello').some((p) => p.filler)); });
test('one-stop: CTC mismatch + free mail + fee = red', () => { const r = checkOneStop('Annual CTC of Rs 9,00,000. Notice period is 30 days.', 'Your CTC Rs 9,50,000. Pay Rs 3,500 verification fee.', 'hr@gmail.com', 'Sample Foods');
  assert.equal(r.verdict, 'red'); assert.ok(r.cross.some((c) => /CTC differs/.test(c.title))); assert.ok(r.cross.some((c) => /free email/.test(c.title))); });
test('voice: um-only or gibberish answers score near 0', () => { for (const t of ['um uh um basically um', 'asdfgh qwrtzp xkcdv bbbbb zzzzz mmmm']) { const a = analyze(t, 8, ['team'], 'hr'); assert.ok(a.noAnswer, t); assert.ok(a.score <= 5, String(a.score)); }
  assert.ok(!analyze('I led a team of eight people and we cut delays by thirty percent last year.', 8, ['team'], 'hr').noAnswer); });
test('voice: made-up words near 0; short genuine answer is "too short"', () => { const a = analyze('blah florp zing wobble quix snarf', 6, ['team'], 'hr'); assert.ok(a.noAnswer && a.score <= 5, String(a.score));
  const b = analyze('Yes, I did that', 3, ['team'], 'hr'); assert.ok(b.tooShort && !b.noAnswer); });
import { addAnswer, NEW_GAME, sanity, toLevel, reminderIcs } from '../src/lib/voiceGame';
test('game: baseline 4-5, small capped growth, gate gives 0', () => {
  const good = analyze('When I was at my last job our team had to cut delivery delays. I decided to set up a daily tracker with the vendors and I called each one every morning. As a result we reduced delays by 30% in two months and the customer was happy.', 40, ['team', 'result', 'delay'], 'behavioural');
  assert.ok(sanity(good).ok); let g = addAnswer(NEW_GAME, good, '2026-10-29').game; assert.ok(g.level! >= 4 && g.level! <= 5);
  for (let i = 0; i < 10; i++) g = addAnswer(g, good, '2026-10-29').game; assert.ok(g.todayGain <= 0.3 + 1e-9); assert.ok(g.level! - g.baseline! <= 0.3 + 1e-9);
  const bad = addAnswer(g, analyze('um uh um basically um', 5, ['team'], 'hr'), '2026-10-29'); assert.ok(!bad.counted && bad.rating === 0 && bad.game.xp === g.xp);
  const next = addAnswer(g, good, '2026-10-30').game; assert.equal(next.streak, 2); assert.equal(toLevel(100), 10); assert.ok(/RRULE:FREQ=DAILY/.test(reminderIcs(19, 'https://x'))); });
import { keysFrom } from '../src/lib/voiceInterview';
test('voice: follow-up keys come from the follow-up question; .ics in UTC', () => {
  assert.ok(keysFrom('How do you plan your work now to avoid that?').some((k) => k.startsWith('plan')));
  const ics = reminderIcs(19, 'https://x', new Date('2026-11-01T10:00:00Z')); assert.match(ics, /DTSTART:\d{8}T\d{6}Z/); assert.match(ics, /DTSTAMP:20261101T100000Z/); });
import { setBoth, load, KEY, NO_CONSENT, setConsent, expire, addMonths, exportJson, CONSENT_TEXT } from '../src/lib/consent';
test('consent: NO_CONSENT shape, timestamped, 6-month CV retention, withdraw and expiry logged', () => {
  assert.equal(NO_CONSENT.sms.given, false); assert.equal(NO_CONSENT.cv.given, false);
  let s = setConsent(NO_CONSENT, 'cv', true, 'profile', '2026-11-01T06:00:00.000Z'); assert.equal(s.cv.until, '2027-05-01T06:00:00.000Z'); assert.equal(s.log[0].text, CONSENT_TEXT.cv);
  s = setConsent(s, 'sms', true, 'profile', '2026-11-01T06:01:00.000Z'); s = setConsent(s, 'sms', false, 'profile', '2026-11-02T06:00:00.000Z'); assert.equal(s.sms.given, false); assert.equal(s.log.at(-1)!.action, 'withdrawn');
  const e = expire(s, '2027-05-02T00:00:00.000Z'); assert.equal(e.cv.given, false); assert.equal(e.log.at(-1)!.action, 'expired');
  assert.equal(addMonths('2026-08-31T00:00:00.000Z', 6), '2027-02-28T00:00:00.000Z'); assert.ok(JSON.parse(exportJson(s)).log.length === 3); });

test('consent: optional and unticked by default, tick records, untick persists after reload, withdraw both, export succeeds', () => {
  const mem = new Map<string, string>(); (globalThis as any).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); }, removeItem: (k: string) => { mem.delete(k); } };
  (globalThis as any).window = { dispatchEvent() { return true; } };
  let s = load(); assert.equal(s.sms.given, false); assert.equal(s.cv.given, false); assert.equal(s.log.length, 0); assert.equal(mem.size, 0, 'nothing stored until the user acts');
  s = setConsent(s, 'sms', true, 'gov-jobs'); s = setConsent(s, 'cv', true, 'gov-jobs'); mem.set(KEY, JSON.stringify(s));
  assert.ok(load().sms.given && load().cv.until, 'click records consent with timestamp and retention date');
  s = setConsent(load(), 'sms', false, 'gov-jobs'); mem.set(KEY, JSON.stringify(s));
  const r = load(); assert.equal(r.sms.given, false, 'untick persists after reload'); assert.equal(r.cv.given, true);
  const w = setBoth(r, false, 'gov-jobs'); assert.equal(w.cv.given, false); assert.equal(w.log.at(-1)!.action, 'withdrawn');
  const j = JSON.parse(exportJson(w)); assert.equal(j.current.sms.given, false); assert.equal(j.log.length, 4); assert.ok(j.version);
  delete (globalThis as any).localStorage; delete (globalThis as any).window; });
test('extension field map: common fields matched, sensitive fields skipped', async () => {
  await import('../extension/fieldmap.js'); const M = (globalThis as any).JAOS_MAP;
  assert.equal(M.match('highest qualification'), 'education'); assert.equal(M.match('notice period'), 'noticePeriod'); assert.equal(M.match('email address'), 'email');
  assert.equal(M.match('mobile number'), 'phone'); assert.equal(M.match('first name'), 'firstName'); assert.equal(M.match('date of birth'), null); assert.equal(M.match('aadhaar number'), null); assert.equal(M.match('password'), null); });

test('extension field map: never fills fields about other people', async () => {
  await import('../extension/fieldmap.js'); const M = (globalThis as any).JAOS_MAP;
  for (const d of ['reference name', 'referee email', 'emergency contact phone', 'emergency contact name', "father's name", 'mother name', 'guardian mobile', 'spouse name', 'nominee name', 'manager name', 'supervisor email', 'next of kin phone'])
    assert.equal(M.match(d), null, d);
  assert.equal(M.match('full name'), 'fullName'); assert.equal(M.match('phone number'), 'phone'); });
import { anyDate, fromFreeHire, fromRss, noContacts, payOf, stateOf } from '../server/govPostings';
test('gov postings: dates, pay, state, official link, no contacts, closed dropped', () => {
  assert.equal(anyDate('Application Last Date: 05.10.2026'), '2026-10-05'); assert.equal(anyDate('till 14 October 2026'), '2026-10-14'); assert.equal(anyDate('31.02.2026'), '');
  assert.match(payOf('SPA – 8th Level of Pay Matrix, 7th CPC'), /8th Level/); assert.equal(payOf('Salary: achhi milegi.'), '');
  assert.equal(stateOf('UKSSSC PA'), 'Uttarakhand'); assert.equal(noContacts('mail a.b@x.gov.in or 9876543210'), 'mail [email removed] or [phone removed]');
  const raw = { public_slug: 's', title: 'Personal Assistant', company: 'High Court of Delhi', location: 'New Delhi', posted_at: '2026-10-01T00:00:00Z', description: 'Total Vacancies: 33<br>PA – 7th Level of Pay Matrix, 7th CPC<br>Who Can Apply: graduates<br>Application Last Date: 05.12.2026<br>Notification: https://www.delhihighcourt.nic.in/x.pdf<br>' };
  const p = fromFreeHire(raw, '2026-11-01')!; assert.equal(p.lastDate, '2026-12-05'); assert.ok(p.official && p.lesserKnown); assert.equal(p.state, 'Delhi'); assert.match(p.pay, /7th Level/);
  assert.equal(fromFreeHire({ ...raw, description: raw.description.replace('05.12.2026', '05.10.2026') }, '2026-11-01'), null, 'closed posting dropped');
  assert.equal(fromFreeHire({ ...raw, description: 'Last Date: 05.12.2026 apply at example.com' }, '2026-11-01'), null, 'no official link dropped');
  const rss = '<item><title><![CDATA[NIT Calicut Project Associate Recruitment 2026]]></title><link>https://sarkarimap.org/job/x</link><pubDate>Sat, 31 Oct 2026 06:49:55 GMT</pubDate><description><![CDATA[1 vacancy. Apply 11 November 2026 tak.]]></description></item>';
  const r = fromRss(rss, '2026-11-01'); assert.equal(r.length, 1); assert.equal(r[0].lastDate, '2026-11-11'); assert.ok(r[0].lesserKnown && !r[0].official); assert.equal(r[0].state, 'Kerala'); });
import { postingsLimit } from '../api/gov/postings';
test('gov postings limiter: 12/min per IP then 429 with postings wording', () => {
  for (let i = 0; i < 12; i++) postingsLimit('1.2.3.4', 1000 + i);
  assert.throws(() => postingsLimit('1.2.3.4', 2000), (e: any) => e.status === 429 && /government postings/.test(e.message));
  postingsLimit('5.6.7.8', 2000); postingsLimit('1.2.3.4', 1000 + 61_000); });
import { PROVIDERS, inDomain } from '../src/lib/gov/providers';
import { IN_SOURCES } from '../src/lib/gov/sources';
import { rankScore, eligibilityBadge, relaxation } from '../src/lib/gov/rank';
import { levelOf, empTypeOf, agesOf, eduTagsOf, SCAM, enrich } from '../server/govPostings';
test('gov providers: India live, AU/IT/US stubs with official sources and no jobs; domain trust', () => {
  assert.ok(PROVIDERS.IN.live); for (const c of ['AU', 'IT', 'US'] as const) { assert.equal(PROVIDERS[c].live, false); assert.ok(PROVIDERS[c].sources.length >= 2); }
  assert.ok(IN_SOURCES.length >= 30 && IN_SOURCES.filter((s) => s.lesser).length >= 15 && IN_SOURCES.every((s) => s.url.startsWith('https://') && !s.url.includes('google.com')));
  assert.equal(inDomain('https://ssc.gov.in/x.pdf').tier, 'GOV_TLD'); assert.equal(inDomain('https://www.sbi.co.in/web/careers').tier, 'WHITELIST_PSU'); assert.equal(inDomain('https://railwayrecruitmentcell.org/').tier, 'UNTRUSTED'); assert.equal(inDomain('https://evilgov.in.example.com/').tier, 'UNTRUSTED');
  assert.equal(PROVIDERS.US.verifyOfficialDomain('https://www.usajobs.gov/').trusted, true); });
test('gov postings enrich: level, employment type, ages, education, scam drop', () => {
  assert.equal(levelOf('High Court of Delhi'), 'judiciary'); assert.equal(levelOf('DSSSB Delhi District Courts'), 'judiciary'); assert.equal(levelOf('Indian Coast Guard'), 'defence'); assert.equal(levelOf('SEBI'), 'regulator');
  assert.equal(empTypeOf('6 posts on deputation basis'), 'deputation'); assert.equal(empTypeOf('Walk-in interview'), 'contractual');
  assert.deepEqual(agesOf('Age 18 to 27 years'), { minAge: 18, maxAge: 27 }); assert.deepEqual(eduTagsOf('B.Tech or MCA'), ['ENGINEERING', 'PG']);
  assert.ok(SCAM.test('pay fee to abc@ybl')); const base: any = { title: 'Clerk', org: 'X', noticeUrl: 'https://x.gov.in/a.pdf', official: true, eligibility: '' };
  assert.equal(enrich(base, 'Security deposit of Rs 5000 required'), null); assert.equal(enrich(base, 'Graduate. Age 21-30 years')!.maxAge, 30); });
test('gov rank + eligibility badge: urgency, lesser-known, three states only', () => {
  const p: any = { lastDate: '2026-11-05', lesserKnown: true, pay: 'Level 7', vacancies: '10', official: true, title: 'Assistant', org: 'SEBI', eligibility: '', state: 'Delhi', maxAge: 30, eduTags: ['GRADUATE'] };
  assert.ok(rankScore(p, [], '2026-11-01') > rankScore({ ...p, lesserKnown: false, lastDate: '2026-12-30' }, [], '2026-11-01'));
  const prof: any = { dob: '1995-01-01', edu: 'grad', cat: 'OBC', pwbd: false, state: 'Delhi' }; assert.equal(relaxation(prof), 3);
  assert.equal(eligibilityBadge(p, prof, '2026-11-01').badge, 'verify', 'qualification only inferred from tags'); assert.equal(eligibilityBadge({ ...p, eligibility: 'Graduate' }, prof, '2026-11-01').badge, 'likely'); assert.equal(eligibilityBadge({ ...p, maxAge: 25 }, prof).badge, 'maynot');
  assert.equal(eligibilityBadge({ ...p, title: 'Research Associate', maxAge: undefined, eduTags: [] }, prof).badge, 'verify'); assert.equal(eligibilityBadge({ ...p, eligibility: 'Graduate', maxAge: undefined }, prof, '2026-11-01').badge, 'likely', 'age alone never downgrades'); assert.equal(eligibilityBadge({ ...p, employmentType: 'deputation' }, prof).badge, 'maynot'); });
import { filterPostings } from '../src/lib/gov/filter';
test('gov fixtures: deputation hidden by default and shown when toggled; scam postings dropped', () => {
  const base = { title: 'Stenographer', org: 'Ministry X', location: 'Delhi', eligibility: '', state: 'Delhi', lesserKnown: false, official: true, lastDate: '2026-12-01' };
  const list = [{ ...base, employmentType: 'deputation' }, { ...base, title: 'Clerk', employmentType: 'permanent' }];
  const f = { q: '', state: '', lesser: false, official: false, soon: false, deputation: false };
  assert.deepEqual(filterPostings(list, f).map((p) => p.title), ['Clerk']); assert.equal(filterPostings(list, { ...f, deputation: true }).length, 2);
  const raw = (extra: string) => ({ public_slug: 's', title: 'MTS', company: 'Office Y', location: 'Delhi', description: `Last Date: 05.12.2026<br>Notification: https://y.gov.in/n.pdf<br>${extra}` });
  const keep = fromFreeHire(raw('Graduate'), '2026-11-01'); assert.ok(keep && enrich(keep, 'Graduate'));
  for (const bad of ['Pay fee to jobs@ybl', 'WhatsApp number 9xxxxxxxxx for joining', 'Security deposit Rs 2000', 'Confirmed sarkari job without exam']) assert.equal(enrich(fromFreeHire(raw(bad), '2026-11-01')!, bad), null, bad);
  assert.equal(enrich(fromFreeHire(raw('Applications on deputation basis'), '2026-11-01')!, 'Applications on deputation basis')!.employmentType, 'deputation'); });
test('GovJobs: every element id in the page source is unique', async () => {
  const { readFileSync } = await import('node:fs'); const src = readFileSync('src/pages/GovJobs.tsx', 'utf8');
  const ids = [...src.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]); assert.equal(new Set(ids).size, ids.length, ids.join(','));
  for (const m of src.matchAll(/htmlFor="([^"]+)"/g)) assert.ok(ids.includes(m[1]), `label for ${m[1]}`); });
