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
