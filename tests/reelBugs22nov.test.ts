// Regression + held-out tests for the five live-site bugs filmed 22 Nov 2026. Made-up clauses. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanOffer } from '../src/lib/offerShield';
import { designationPack } from '../src/lib/voiceGame';
import { naturalize } from '../src/lib/voiceInterview';
import { CGL_POSTS, EXAMS, ageLimitText, ageOn, cglPostLabel, cglPostStatuses, keepExamVisible, match, matchExam, radarText, type Profile } from '../src/lib/govJobs';

const BENCH_KIND = 'Pay depends on project allocation / bench';
const DOC_KIND = 'Original documents held';
const bench = (t: string) => scanOffer(t).filter((c) => c.kind === BENCH_KIND);

test('offer: flags salary payable only after billable deployment (filmed clause)', () => {
  const c = bench('SAMPLE. Salary is payable only after deployment on a billable client project. Other terms follow in the annexure.');
  assert.equal(c.length, 1, 'filmed no-salary-on-bench clause must be flagged');
  assert.equal(c[0].kind, BENCH_KIND);
  assert.ok(c[0].risk === 'red' || c[0].risk === 'amber');
});

// Fresh held-out set: varied wordings that must flag, and normal billable/bench mentions that must not.
const BENCH_TP = [
  'No salary will be paid while you are on the bench between client assignments.',
  'You shall not be entitled to any remuneration during the bench period after training.',
  'Pay starts only once you are staffed on a billable assignment for a client.',
  'Compensation is paid only when you are allocated to a client project by the staffing team.',
  'You will not be paid on the bench pending a new allocation.',
  'Salary is withheld during any bench period between projects, and resumes on deployment.',
  'Remuneration shall be payable only upon deployment to a billable project.',
  'The associate will draw salary only when billable to a client.',
  'There is no pay during bench time until a project is assigned.',
  'You are unpaid while on the bench pending allocation to a project.',
  'Monthly salary begins only after you are deployed on a client project.',
  'Wages are contingent upon being assigned to a billable project.',
  'You are not entitled to salary unless allocated to a billable client.',
  'During the bench, salary will be stopped until a new project is assigned.',
  'Fixed pay is payable solely after you are deployed on a billable engagement.',
  'You shall draw remuneration only after allocation to a billable client project.',
  'The company will not pay salary for time spent on the bench.',
  'Salary commences only when you are placed on a billable client project.',
  'No remuneration is payable for the period you remain on the bench.',
  'Your stipend is subject to being on a billable project after onboarding.',
];
const BENCH_FP = [
  'This is a billable consulting role with a competitive monthly salary paid on joining.',
  'Salary continues on the bench between projects as set out in the policy.',
  'The firm tracks billable hours for invoicing clients at the end of each month.',
  'Bench strength of the delivery team is twelve engineers across two cities.',
  'You may be placed on the bench between projects; full salary continues as per policy.',
  'Must maintain 80 percent billable utilization; salary is paid monthly on the last working day.',
  'Training on the bench is paid at the same rate as project work under this offer.',
  'Your salary is credited monthly, including periods between billable assignments.',
  'We have a paid bench policy; you remain on payroll when not deployed to a client.',
  'Billable targets do not affect your fixed monthly salary under this letter.',
  'You will work on billable and internal projects as assigned; salary is monthly and continuous.',
  'A bench period of two weeks is used for training, with salary paid in full throughout.',
  'Allocation to projects is based on skill; salary is not reduced between assignments.',
  'Non-billable research days are still paid at full salary under the standard policy.',
  'The client project starts in June; your salary starts on the joining date in May.',
  'We expect high billable utilization; this does not change your monthly salary.',
  'On-bench learning is encouraged and is fully paid at your regular salary rate.',
  'The offer lists a joining bonus and a 90-day notice period for both sides.',
  'Annual CTC is 12 LPA; standard terms of employment apply from the joining date.',
  'Please complete timesheets for billable and non-billable hours; salary is paid in full each month.',
];

test('offer: held-out bench-pay clauses flag, normal billable/bench mentions do not', () => {
  const missed: string[] = [], falseHits: string[] = [];
  for (const t of BENCH_TP) if (!bench('SAMPLE. ' + t).length) missed.push(t);
  for (const t of BENCH_FP) if (bench('SAMPLE. ' + t).length) falseHits.push(t);
  assert.equal(missed.length, 0, 'missed true positives:\n' + missed.join('\n'));
  assert.equal(falseHits.length, 0, 'false flags:\n' + falseHits.join('\n'));
  assert.ok(BENCH_TP.length >= 20 && BENCH_FP.length >= 20);
});

const docs = (t: string) => scanOffer(t).filter((c) => c.kind === DOC_KIND);
test('offer: Original documents held flags only real hold wording, and stays red', () => {
  const hold = 'You must submit your original certificates to HR, which will be retained during the bond period.';
  const c = docs('SAMPLE. ' + hold);
  assert.equal(c.length, 1);
  assert.match(c[0].why, /serious/i);
  assert.equal(c[0].risk, 'red');
  for (const t of [
    'Please carry original certificates for verification on the first day.',
    'Original documents are required at the time of joining the company.',
    'Original degree must be produced on day one for HR records.',
  ]) {
    assert.equal(docs('SAMPLE. ' + t).length, 0, 'must not flag verification: ' + t);
  }
});

// Fresh held-out set (not the tester's strings): 25+ true holds and 25+ legitimate verification / return / viewing clauses.
const DOC_HOLD = [
  'The employer will retain your original degree until the service bond has been completed in full.',
  'HR shall hold the original mark sheets as security for the duration of the training agreement.',
  'Original educational documents are to be deposited with the firm on the joining date and stored in the vault.',
  'The company will keep your originals in custody till you finish twenty-four months of continuous service.',
  'Your original certificates will be withheld by the personnel section for the lock-in period stated above.',
  'Clause 9: originals to be placed in the custody of the head office until the surety is discharged.',
  'The institute will withhold original educational documents if you leave before the agreed tenure.',
  'Bond annexure: the college must retain the original degree certificate for two academic years.',
  'Originals remain with the employer in deposit and are not handed back before the notice is served.',
  'You agree that the firm may hold originals as collateral against the liquidated-damages clause.',
  'Aapke original certificates company deposit pe rakhne hain jab tak lock-in khatam na ho, as per annexure.',
  'Joining ke baad originals jama karane honge, aur do saal poore hone par hi wapas milenge.',
  'Original marksheets rakhna hoga HR locker mein till the service period mentioned in clause four ends.',
  'Company ke paas originals jama rahenge for the whole bond, which is written in the Hindi schedule.',
  'Aapko originals rakhne honge head office mein until the surety letter is formally cancelled.',
  'मूल प्रमाण पत्र नियोक्ता के पास तब तक जमा रहेंगे जब तक अनुबंध की अवधि समाप्त न हो।',
  'मूल शैक्षणिक दस्तावेज कंपनी की अभिरक्षा में दो वर्ष तक रहेंगे और उसके बाद लौटाए जाएंगे।',
  'आपको मूल डिग्री जमा करनी होगी तथा सेवा अवधि पूरी होने पर ही वापस ली जा सकेगी।',
  'मूल अंक पत्र कार्यालय में रखने होंगे जब तक बॉन्ड की शर्तें पूरी नहीं हो जातीं।',
  'कंपनी आपके मूल दस्तावेज तब तक अपने पास रखेगी जब तक आप नोटिस अवधि पूरी नहीं कर लेते।',
  'The school leaving originals will be retained by the training sponsor for the funded course period.',
  'Offer letter: original educational documents stay on deposit with the contractor until the project closes.',
  'We will take custody of the originals listed in schedule B on day one of employment.',
  'Your originals are held under the surety clause and released only after the bond amount is settled.',
  'The hospital shall keep the original registration certificates in its strong room for the bonded years.',
  'Original testimonials will be kept by the principal until the student completes the sponsored term.',
];
const DOC_VERIFY = [
  'Please carry original certificates for verification on the first day and take them home afterwards.',
  'Original documents must be produced at joining so that photocopies can be attested in front of you.',
  'Kindly bring originals for DV; the board will only view them and will not ask you to leave them behind.',
  'You should display the original degree during the background interview and pack it away when you leave.',
  'HR will glance at original mark sheets, stamp the copies, and give the originals back across the table.',
  'Verification is a short visual check of original educational documents at the onboarding desk.',
  'Candidates may show original certificates to the notary; nothing is to be stored overnight with us.',
  'Bring original and self-attested copies of every educational paper listed in the joining checklist.',
  'Submit photocopies only. Originals are for viewing during the scheduled appointment with HR.',
  'The university cell will inspect original documents and return them before you exit the campus.',
  'Please keep original documents ready for a brief cross-check on the morning you join the office.',
  'We ask to see original certificates; they remain with you throughout the appointment and after it.',
  'Document verification (DV) requires sight of the originals, which you carry in and carry out yourself.',
  'Join with originals for attestation at the venue, then take every paper home the same evening.',
  'Onboarding pack: bring originals plus two photocopies; the originals go back in your file the same day.',
  'The panel will compare original certificates with the uploaded scans and hand them back immediately.',
  'Originals will be verified and returned the same day after the document check by the establishment desk.',
  'Aapke original certificates verification ke liye dikhane hain, rakhne ke liye nahi, HR ne confirm kiya.',
  'DV ke din originals dikhana hoga, and you will walk out with every paper the same afternoon.',
  'कृपया मूल प्रमाण पत्र सत्यापन के लिए साथ लाएँ; जांच के बाद उसी दिन आपको वापस कर दिए जाएंगे।',
  'मूल दस्तावेज केवल देखने के लिए प्रस्तुत करें, जमा नहीं करने हैं, जैसा कि अनुदेश में लिखा है।',
  'काउंटर पर मूल डिग्री दिखानी है और फोटोप्रति पर मुहर लगते ही कागजात अपने साथ ले जाएँ।',
  'Joining formalities include producing original certificates at the desk for a same-day return after viewing.',
  'No original educational documents are to be left with the employer; only copies go on the personal file.',
  'Please arrange original marksheets for a short inspection; the originals stay in your possession.',
  'Background screening will view the original degree once; it is not a request to deposit any paper.',
];

test('offer: held-out original-documents holds flag red; verification wording stays clean', () => {
  const missed: string[] = [], falseHits: string[] = [];
  for (const t of DOC_HOLD) {
    const c = docs('SAMPLE. ' + t);
    if (!c.length) missed.push(t);
  }
  for (const t of DOC_VERIFY) {
    const c = docs('SAMPLE. ' + t);
    if (c.some((x) => x.risk === 'red')) falseHits.push(t);
  }
  assert.equal(missed.length, 0, 'missed holds:\n' + missed.join('\n'));
  assert.equal(falseHits.length, 0, 'false flags:\n' + falseHits.join('\n'));
  assert.ok(DOC_HOLD.length >= 25 && DOC_VERIFY.length >= 25);
});

test('offer: paid only for billable hours, and Hinglish no-pay-on-bench, still flag', () => {
  assert.ok(bench('SAMPLE. Your remuneration is paid only for billable hours under this contract.').length);
  assert.ok(bench('SAMPLE. The letter says paid only for billable hours, with no other retainer.').length);
  assert.ok(bench('SAMPLE. Bench pe salary nahi, until staffing confirms a client project in writing.').length);
  assert.ok(bench('SAMPLE. During the bench pe salary nahi milegi if no allocation is open that month.').length);
  assert.equal(bench('SAMPLE. The bench policy: full salary continues even when you are between client projects.').length, 0);
  assert.equal(bench('SAMPLE. A billable utilisation target of 80 percent is expected; there is no pay cut if you miss it in a quarter.').length, 0);
  assert.equal(bench('SAMPLE. A bench allowance paid each month covers training days when you are not on a client site.').length, 0);
});

test('voice: empty designation does not say "as a this role"', () => {
  for (const title of ['', '   ']) {
    const pack = designationPack(title);
    const text = pack.map((p) => p.q + ' ' + p.model).join('\n');
    assert.ok(!/as a this role/i.test(text), text);
    assert.ok(!/\ba this role\b/i.test(text), text);
    assert.ok(!/being a this role/i.test(text), text);
    assert.ok(!/for a this role/i.test(text), text);
    assert.ok(/\b(this role|the role)\b/i.test(text), 'needs a natural fallback: ' + text);
  }
  const named = designationPack('Software Engineer');
  assert.ok(named.some((p) => /as a Software Engineer/i.test(p.q)));
  assert.ok(!named.some((p) => /as a this role/i.test(p.q + p.model)));
});

test('voice: Say it more naturally strips a leading filler like "So,"', () => {
  const out = naturalize('So, um, I basically led the team through the launch.');
  assert.ok(!/^so\b/i.test(out), out);
  assert.ok(!/\bum\b|basically/i.test(out), out);
  assert.match(out, /led the team/i);
  const mid = naturalize('I paused, so I asked the team to wait.');
  assert.match(mid, /\bso\b/i);
  assert.equal(naturalize('So I walked through the plan with my manager.'), 'I walked through the plan with my manager.');
});

const CGL = EXAMS.find((e) => e.id === 'ssc-cgl')!;
const dobAt = (age: number, on = CGL.asOn) => {
  const d = new Date(on);
  d.setFullYear(d.getFullYear() - age);
  return d.toISOString().slice(0, 10);
};
const base = (x: Partial<Profile> = {}): Profile => ({ dob: dobAt(26), edu: 'grad', cat: 'GEN', pwbd: false, esm: false, gender: 'male', state: '', ...x });
const cglOf = (p: Profile, post?: Parameters<typeof matchExam>[2]) => matchExam(CGL, p, post);

test('gov: single-limit exams still add OBC +3 and SC +5 to the stated cap', () => {
  const cse = (c: Profile['cat']) => match(base({ dob: '1997-01-01', cat: c })).find((m) => m.exam.id === 'upsc-cse')!;
  assert.equal(cse('GEN').upper, 32);
  assert.equal(cse('OBC').upper, 35);
  assert.equal(cse('SC').upper, 37);
  assert.equal(cse('GEN').ageStatus, 'pass');
  assert.equal(cse('GEN').ok, true);
});

// Fresh held-out set for CGL: never use the highest cap (32+3) when the post is unknown.
test('gov: CGL held-out set uses the post limit or fails closed to Check notice', () => {
  const clause = /27,\s*30 or 32 by post/i;
  const filmed = cglOf(base({ dob: dobAt(26), cat: 'OBC' }));
  assert.equal(ageOn(filmed.exam.asOn === CGL.asOn ? dobAt(26) : dobAt(26), CGL.asOn), 26);
  assert.equal(filmed.age, 26);
  assert.equal(filmed.ok, true);
  assert.equal(filmed.ageStatus, 'pass');
  assert.equal(filmed.upper, 30, 'OBC tightest cap is 27+3, not 32+3');
  assert.equal(filmed.upperHigh, 35);
  const lim = ageLimitText(filmed);
  assert.ok(!/18 to 35/.test(lim.heading), lim.heading);
  assert.match(lim.heading, /30/);
  assert.match(lim.heading, /33/);
  assert.match(lim.heading, /35/);
  assert.match(lim.detail, /by post/i);
  const rad = radarText(filmed)!;
  assert.ok(!/about 9 more years/i.test(rad), rad);
  assert.match(rad, /about 4 more years/i);
  assert.match(rad, /lowest post limit/i);

  const midObc = cglOf(base({ dob: dobAt(32), cat: 'OBC' }));
  assert.equal(midObc.age, 32);
  assert.equal(midObc.ok, false);
  assert.equal(midObc.ageStatus, 'check');
  assert.equal(midObc.fit, 'check');
  assert.ok(midObc.why.some((w) => /Check notice/i.test(w) && clause.test(w)), midObc.why.join(' | '));
  const midLim = ageLimitText(midObc);
  assert.equal(midLim.heading, 'Check notice');
  assert.match(midLim.detail, clause);
  const midRad = radarText(midObc)!;
  assert.match(midRad, /Check notice/i);
  assert.ok(!/about 3 more years/i.test(midRad), midRad);
  assert.ok(!/about 9 more years/i.test(midRad), midRad);

  const midGen = cglOf(base({ dob: dobAt(28), cat: 'GEN' }));
  assert.equal(midGen.ageStatus, 'check');
  assert.equal(midGen.ok, false);
  assert.ok(midGen.why.some((w) => clause.test(w)));

  const underGen = cglOf(base({ dob: dobAt(26), cat: 'GEN' }));
  assert.equal(underGen.ok, true);
  assert.equal(underGen.ageStatus, 'pass');
  assert.equal(underGen.upper, 27);
  assert.equal(underGen.upperHigh, 32);
  assert.ok(!/18 to 32/.test(ageLimitText(underGen).heading));

  const overGen = cglOf(base({ dob: dobAt(33), cat: 'GEN' }));
  assert.equal(overGen.ok, false);
  assert.equal(overGen.ageStatus, 'fail');
  assert.equal(overGen.fit, 'no');
  assert.ok(overGen.why.some((w) => /Over age/i.test(w)));

  const overObc = cglOf(base({ dob: dobAt(36), cat: 'OBC' }));
  assert.equal(overObc.ageStatus, 'fail');
  assert.equal(overObc.ok, false);

  const scUnder = cglOf(base({ dob: dobAt(27), cat: 'SC' }));
  assert.equal(scUnder.ok, true);
  assert.equal(scUnder.upper, 32, 'SC tightest is 27+5, not 32+5');
  assert.equal(scUnder.upperHigh, 37);

  const scMid = cglOf(base({ dob: dobAt(34), cat: 'SC' }));
  assert.equal(scMid.ageStatus, 'check');
  assert.equal(scMid.ok, false);

  const scOver = cglOf(base({ dob: dobAt(38), cat: 'SC' }));
  assert.equal(scOver.ageStatus, 'fail');

  const edgeGen = cglOf(base({ dob: dobAt(27), cat: 'GEN' }));
  assert.equal(edgeGen.ageStatus, 'pass');
  assert.equal(edgeGen.upper, 27);

  const edgeObc = cglOf(base({ dob: dobAt(30), cat: 'OBC' }));
  assert.equal(edgeObc.ageStatus, 'pass');
  assert.equal(edgeObc.upper, 30);

  const pwbd = cglOf(base({ dob: dobAt(33), cat: 'GEN', pwbd: true }));
  assert.equal(pwbd.ageStatus, 'pass');
  assert.equal(pwbd.upper, 37, 'PwBD tightest is 27+10, not 32+10');
  assert.equal(pwbd.upperHigh, 42);

  const young = cglOf(base({ dob: dobAt(17), cat: 'GEN' }));
  assert.equal(young.ageStatus, 'fail');
  assert.ok(young.why.some((w) => /Too young/i.test(w)));

  const eduFail = cglOf(base({ dob: dobAt(24), cat: 'GEN', edu: '10' }));
  assert.equal(eduFail.ageStatus, 'pass');
  assert.equal(eduFail.ok, false);
  assert.equal(eduFail.fit, 'no');

  const post27 = cglOf(base({ dob: dobAt(32), cat: 'OBC' }), 27);
  assert.equal(post27.ageStatus, 'fail');
  assert.equal(post27.ok, false);
  assert.equal(post27.upper, 30);
  assert.ok(post27.why.some((w) => /Over age/i.test(w)));

  const post32 = cglOf(base({ dob: dobAt(32), cat: 'OBC' }), 32);
  assert.equal(post32.ageStatus, 'pass');
  assert.equal(post32.ok, true);
  assert.equal(post32.upper, 35, 'known 32-limit post uses 32+3, not a Check notice');
  assert.match(ageLimitText(post32).heading, /18 to 35/);

  const unknownPost = cglOf(base({ dob: dobAt(26), cat: 'OBC' }), 40);
  assert.equal(unknownPost.ageStatus, 'check');
  assert.equal(unknownPost.ok, false);
  assert.ok(unknownPost.why.some((w) => /Check notice/i.test(w) && clause.test(w)));

  const midViaMatch = match(base({ dob: dobAt(32), cat: 'OBC' })).find((m) => m.exam.id === 'ssc-cgl')!;
  assert.equal(midViaMatch.fit, 'check');
  assert.equal(midViaMatch.ok, false);
});

test('gov: named CGL posts use their own min and max; 20-30 is not treated as 18-30', () => {
  const jso = CGL_POSTS.find((x) => x.id === 'jso')!;
  const stat = CGL_POSTS.find((x) => x.id === 'stat-inv')!;
  const css = CGL_POSTS.find((x) => x.id === 'aso-css')!;
  const auditor = CGL_POSTS.find((x) => x.id === 'auditor-cag')!;
  assert.equal(jso.maxAge, 32); assert.equal(stat.maxAge, 30); assert.equal(css.minAge, 20); assert.equal(auditor.maxAge, 27);

  const gen31 = base({ dob: dobAt(31), cat: 'GEN' });
  assert.equal(cglOf(gen31, { minAge: 18, maxAge: 32 }).ok, true);
  assert.equal(cglOf(gen31, { minAge: 18, maxAge: 32 }).upper, 32);
  assert.equal(cglOf(gen31, { minAge: 18, maxAge: 30 }).ok, false);
  assert.equal(cglOf(gen31, { minAge: 18, maxAge: 30 }).ageStatus, 'fail');

  const gen19 = base({ dob: dobAt(19), cat: 'GEN' });
  const any = cglOf(gen19);
  assert.equal(any.ok, false);
  assert.equal(any.ageStatus, 'check', '19 is past 18 but below the 20-30 posts, so fail closed');
  assert.ok(any.why.some((w) => /Check notice/i.test(w)));
  assert.equal(cglOf(gen19, { minAge: 18, maxAge: 27 }).ok, true);
  assert.equal(cglOf(gen19, { minAge: 20, maxAge: 30 }).ok, false);
  assert.equal(cglOf(gen19, { minAge: 20, maxAge: 30 }).ageStatus, 'fail');

  const viaProfile = match({ ...gen31, cglPost: 'jso' }).find((m) => m.exam.id === 'ssc-cgl')!;
  assert.equal(viaProfile.ok, true);
  assert.equal(viaProfile.upper, 32);
  const viaStat = match({ ...gen31, cglPost: 'stat-inv' }).find((m) => m.exam.id === 'ssc-cgl')!;
  assert.equal(viaStat.ok, false);
  assert.equal(viaStat.ageStatus, 'fail');
  const viaUnknown = match({ ...base({ dob: dobAt(26) }), cglPost: 'not-a-real-post' }).find((m) => m.exam.id === 'ssc-cgl')!;
  assert.equal(viaUnknown.ageStatus, 'check');
  assert.equal(viaUnknown.ok, false);
});

test('gov: Ex-serviceman fails closed without service years, then deducts service + 3', () => {
  const over = base({ dob: dobAt(28), cat: 'GEN', esm: true });
  const noYears = cglOf(over, { minAge: 18, maxAge: 27 });
  assert.equal(noYears.ok, false);
  assert.equal(noYears.ageStatus, 'check');
  assert.ok(noYears.why.some((w) => /Check notice/i.test(w) && /military service/i.test(w)), noYears.why.join(' | '));

  const withYears = cglOf({ ...over, esmYears: 2 }, { minAge: 18, maxAge: 27 });
  assert.equal(withYears.ok, true);
  assert.equal(withYears.ageStatus, 'pass');
  assert.equal(withYears.upper, 32, '27 + 2 years of service + 3');

  const under = cglOf(base({ dob: dobAt(26), cat: 'GEN', esm: true }), { minAge: 18, maxAge: 27 });
  assert.equal(under.ok, true, 'already under the civilian cap, years not required for a pass');

  const stillOver = cglOf({ ...base({ dob: dobAt(31), cat: 'GEN', esm: true }), esmYears: 0 }, { minAge: 18, maxAge: 27 });
  assert.equal(stillOver.upper, 30, '27 + 0 years + 3');
  assert.equal(stillOver.ok, false);
  assert.equal(stillOver.ageStatus, 'fail');
});

test('gov: missing or empty DOB never passes and does not report a numeric pass with NaN', () => {
  for (const dob of ['', '   ']) {
    const m = cglOf(base({ dob }));
    assert.equal(m.ok, false, dob);
    assert.equal(m.ageStatus, 'check', dob);
    assert.equal(m.fit, 'check', dob);
    assert.ok(!Number.isFinite(m.age), 'age must not be a real number when DOB is missing: '+dob);
    assert.ok(m.why.some((w) => /Check notice/i.test(w) && /date of birth/i.test(w)), m.why.join(' | '));
  }
  const cse = match(base({ dob: '' })).find((m) => m.exam.id === 'upsc-cse')!;
  assert.equal(cse.ok, false);
  assert.equal(cse.ageStatus, 'check');
});


// Tester's exact 32 + 32 from the 0b3434a retest, plus a fresh held-out set written for this fix.
const TESTER_DOC_FP = [
  'Kindly produce your original certificates for scrutiny at the onboarding counter on Monday morning.',
  'The originals will be shown and handed back across the desk once the clerk has ticked the checklist.',
  'This offer states that originals are not retained by the establishment at any stage of joining.',
  'We do not keep originals; only the attested photocopies are placed on the personal file.',
  'All educational papers will be returned after verification, usually before you leave the hall.',
  'Candidates must present original marksheets for inspection by the document-verification officer.',
  'Please bring the original degree for DV at the regional office and take it home when the slot ends.',
  'The campus team will inspect original documents under CCTV and give them back before lunch is served.',
  'You are required to produce original certificates for scrutiny, after which they go straight back into your bag.',
  'HR will not retain any original educational papers; the clause covers photocopies only.',
  'We will not retain your original certificates, as confirmed in paragraph 4 of this appointment letter.',
  'The firm does not keep original documents overnight, even if verification runs late into the evening.',
  'Originals not retained: you walk in with them and walk out with them after the visual check.',
  'Please hold the original certificates up to the camera during the remote KYC call, then put them away.',
  'The company will keep a photocopy of your original degree; the original itself stays with you.',
  'HR will retain only the self-attested copies, and the original certificates are returned immediately.',
  'We retain scanned copies for the file; your originals will be returned the same afternoon.',
  'Document scrutiny is limited to viewing original papers; nothing is taken into company storage.',
  'Please arrive with original testimonials for a short comparison against the uploaded scans.',
  'The notary will look at the original degree, stamp the copies, and give the original back at once.',
  'Joining instructions: carry original academic records for DV, then collect them before you exit.',
  'A visual check of original papers is mandatory; the employer has no authority to store those papers.',
  'On the first morning, original certificates are to be exhibited and then collected by the candidate.',
  'Please do not leave original documents on the table; they are only for a momentary inspection.',
  'Background verification will ask to see original marksheets, which remain in the candidate’s folder.',
  'Originals ko sirf dikhana hai verification desk par, wapas le jaana hai usi time, rakhne ke liye nahi.',
  'DV ke baad originals wapas ho jaayenge; company ke paas rakhne ka koi niyam is offer mein nahi hai.',
  'हम मूल प्रमाण पत्र केवल जांच के लिए मांगते हैं और सत्यापन पूरा होते ही लौटा देते हैं।',
  'मूल दस्तावेज जमा नहीं करने हैं; केवल देखने के बाद उम्मीदवार उन्हें साथ ले जाएँ।',
  'कंपनी मूल डिग्री अपने पास नहीं रखेगी, जांच के पश्चात कागजात तत्काल लौटाए जाएंगे।',
  'We never hold original certificates after the appointment; that is written in the FAQs attached here.',
  'The letter is clear that original documents must be produced for scrutiny and are not to be deposited.',
];
const TESTER_DOC_TP = [
  'The firm will retain your original academic certificates until the close of the service agreement.',
  'Please deposit original marksheets with the admin desk; they are released only after the lock-in ends.',
  'HR may withhold the original degree for the first eighteen months of employment under clause 11.',
  'Original documents will stay in the company’s custody while the training surety remains in force.',
  'You must submit originals to the registrar till completion of bond, as set out in schedule C.',
  'Originals will not be returned until you have served the full notice and the exit clearance is signed.',
  'The employer shall keep the original certificates in a sealed cover for the term of the agreement.',
  'Joining is conditional on leaving original educational papers in deposit with the contractor’s office.',
  'A surety clause allows the institute to hold original testimonials for the sponsored study period.',
  'Personnel will take custody of your original degree on day one and log it in the bond register.',
  'The original mark sheets are to be surrendered and will be stored by management for two calendar years.',
  'We will keep original documents as collateral against the repayment obligation in annexure D.',
  'Should you resign early, original certificates already deposited remain with us until dues are cleared.',
  'The appointment requires original papers to be placed with the trustee until the guarantee expires.',
  'Your originals stay impounded in the head-office vault for the entire probation-plus-bond window.',
  'The college will not release original documents till the funded course has been completed in full.',
  'Aapko originals jama karwane honge joining ke din, aur teen saal baad hi nikalwaye ja sakte hain.',
  'Original certificates company locker mein rakhwaane honge jab tak service bond discharge na ho.',
  'Annexure (Hindi): originals ko paas rakhna hoga till the surety letter is cancelled in writing.',
  'Bond ke khatam hone tak original documents company ke paas rahenge, jo schedule mein likha hai.',
  'मूल प्रमाणपत्र जमा कराने होंगे और अनुबंध पूरा होने के बाद ही लौटाए जाएंगे।',
  'नियोक्ता मूल दस्तावेज अपनी अभिरक्षा में रखेगा जब तक बॉन्ड की रकम का निपटान न हो।',
  'आपकी मूल डिग्री तब तक रोकी जाएगी जब तक निर्धारित सेवा अवधि पूरी नहीं हो जाती।',
  'कार्यालय आपके मूल अंक पत्र दो वर्ष तक अपने पास रखेगा, यह शर्त पत्र में दर्ज है।',
  'The sponsor retains original educational documents for the period of the scholarship bond.',
  'Original papers held by the training partner are handed back only after the bonded term ends.',
  'Clause 6 says the contractor may withhold original certificates if the lock-in is still running.',
  'Please hand over original testimonials; they will be kept in the iron cupboard until year two ends.',
  'The society shall deposit your original degree with its lawyer until the service period lapses.',
  'Originals remain in HR custody and cannot be withdrawn mid-bond except by a court order.',
  'We retain the original registration certificate throughout the rural-posting bond described below.',
  'Management will keep your original certificates until the liquidated-damages clause is exhausted.',
];

const FRESH2_DOC_HOLD = [
  'The firm shall retain the original degree certificate throughout the training bond.',
  'Original marksheets are to be surrendered at induction and are released only after the lock-in lapses.',
  'HR has stored the original academic records in the vault pending completion of the service term.',
  'Your original certificates will be impounded as security against the joining-bonus recovery clause.',
  'The sponsor will not return original educational documents until the funded internship is over.',
  'Original papers must be submitted to the registrar till the bonded months have been served.',
  'The contractor keeps the original testimonials in its strong room for the whole engagement.',
  'Originals stay deposited with the principal until the surety bond is formally vacated.',
  'The hospital withholds original registration certificates during the two-year rural posting.',
  'We will hold your original graduation certificate as collateral for the equipment issued to you.',
  'Original educational papers remain in the custody of the personnel wing until resignation is cleared.',
  'The academy has retained all original mark sheets of sponsored cadets for the course duration.',
  'The original degree is to be placed with the trustee until the liquidated-damages amount is settled.',
  'The college will keep the originals and will not release them till fee recovery is complete.',
  'Joining ke baad original certificates jama karne honge, wapas tabhi jab bond khatam ho.',
  'Original documents rakhwaane hain company locker mein until the notice period is fully served.',
  'Aapke originals training partner ke paas rahenge jab tak course complete na ho.',
  'HR originals ko rakhne wala hai till the probation-plus-bond window is over.',
  'Company will rakh the original degree with head office for the entire bonded tenure.',
  'Original papers ko surrender karna hoga aur return tabhi milega jab lock-in cross ho.',
  'मूल प्रमाण पत्र संस्थान तब तक अपने पास रखेगा जब तक बॉन्ड की राशि चुका न दी जाए।',
  'मूल डिग्री जमा करनी होगी तथा सेवाकाल पूरा होने तक वापस नहीं की जाएगी।',
  'मूल अंक पत्र नियोक्ता की अभिरक्षा में रहेंगे जब तक अनुबंध समाप्त नहीं होता।',
  'कंपनी आपके मूल दस्तावेज रोकेगी यदि आप निर्धारित अवधि से पहले छोड़ते हैं।',
  'मूल शैक्षणिक पत्र कार्यालय में तब तक रखे रहेंगे जब तक जमानत पत्र रद्द न हो।',
  'The training partner has deposited the original certificates, and they remain in custody until the exam is cleared.',
  'Originals will be kept back by the firm; they are handed over only after the service bond expires.',
  'You must deposit original academic documents with the escrow desk for the life of the agreement.',
  'The board shall withhold the original degree and shall not release it until the scholarship is worked off.',
  'Please submit the original degree. They will be retained until the rural service bond ends.',
];
const FRESH2_DOC_VERIFY = [
  'Please bring original certificates for document verification and take them home afterwards.',
  'Originals are only to be shown to the notary; no paper is left with the office overnight.',
  'Kindly hold your original degree up to the camera during the video KYC call.',
  'The desk will keep a photocopy of each certificate on the personnel file.',
  'HR retains only self-attested copies; originals stay in your bag throughout the appointment.',
  'Candidates must produce original marksheets for a same-day visual check at the desk.',
  'We do not retain original educational documents under any clause of this letter.',
  'Originals will not be deposited with the employer; only scans are uploaded to the portal.',
  'Please keep a photocopy of your original degree for the joining folder.',
  'The board will inspect original papers and return them before lunch the same day.',
  'DV requires sight of the originals, which you carry in and carry out yourself.',
  'Original documents are required at joining so that copies can be attested in front of you.',
  'The firm has no authority to hold your original certificates at any time.',
  'Originals nahi rakhne hain, sirf verification ke liye dikhane hain on the first morning.',
  'Company originals ko retain nahi karegi; copies file mein jayengi after attestation.',
  'Aap photocopies jama kijiye; original certificates aapke paas hi rahenge throughout.',
  'Rakhne ke liye nahi, sirf camera ke saamne original degree hold karni hai for KYC.',
  'DV ke din originals dikhana hoga and you walk out with every paper the same afternoon.',
  'कृपया मूल प्रमाण पत्र सत्यापन हेतु साथ लाएँ; जमा नहीं करने हैं।',
  'मूल दस्तावेज केवल दिखाने हैं, कंपनी उन्हें अपने पास नहीं रखेगी।',
  'मूल डिग्री की फोटोप्रति जमा करें; मूल पत्र अपने पास रखें।',
  'सत्यापन के बाद उसी दिन मूल अंक पत्र वापस कर दिए जाएंगे।',
  'नियोक्ता मूल प्रमाण पत्र नहीं रखेगा, केवल प्रतियाँ फ़ाइल में रहेंगी।',
  'The notary will look at the original degree and give it back at once after stamping copies.',
  'Please keep original documents ready for a brief cross-check; they remain with you.',
  'Original certificates are never stored with the company under this joining policy.',
  'Background screening will view the original degree once at the venue and close the file.',
  'Submit self-attested copies only; do not surrender your original marksheets to anyone at the desk.',
  'The university does not keep original educational documents after the appointment ends.',
  'Originals rakhne ki zaroorat nahi, only attested copies chahiye for the personal file.',
];

const docTier = (t: string) => (docs('SAMPLE. ' + t)[0]?.risk ?? 'clean');
function docCounts(arr: string[]) {
  const n = { red: 0, amber: 0, clean: 0 };
  for (const t of arr) n[docTier(t)]++;
  return n;
}

test('offer: earlier tester 32+32 and 30+30 still have no false reds and no missed holds', () => {
  const missed = [...TESTER_DOC_TP, ...FRESH2_DOC_HOLD].filter((t) => docTier(t) === 'clean');
  const falseRed = [...TESTER_DOC_FP, ...FRESH2_DOC_VERIFY].filter((t) => docTier(t) === 'red');
  assert.equal(missed.length, 0, missed.join('\n'));
  assert.equal(falseRed.length, 0, falseRed.join('\n'));
});

test('offer: Hindi bench wording and unpaid-leave denial do not mis-fire', () => {
  assert.ok(bench('SAMPLE. वेतन नहीं दिया जाएगा यदि आप बेंच पर हैं और कोई बिल योग्य परियोजना आवंटित नहीं है।').length);
  assert.ok(bench('SAMPLE. बेंच पर रहते हुए वेतन नहीं मिलेगा जब तक नई तैनाती नहीं होती।').length);
  assert.equal(bench('SAMPLE. The firm tracks bench days for capacity planning and does not treat them as unpaid leave.').length, 0);
  assert.equal(bench('SAMPLE. Bench time is recorded for planning; it is not unpaid leave under the standing orders.').length, 0);
  assert.ok(bench('SAMPLE. यदि आप बेंच पर हैं तो मासिक पारिश्रमिक रुका रहेगा, यह नियुक्ति पत्र में स्पष्ट है।').length);
  assert.ok(bench('SAMPLE. वेतन तभी शुरू होगा जब आपको बिल योग्य परियोजना पर तैनात किया जाएगा, बेंच के दिनों में नहीं।').length);
  assert.equal(bench('SAMPLE. Bench occupancy is a planning metric and is never treated as unpaid time under this offer.').length, 0);
});

test('gov: Inspector (Preventive Officer) and Inspector (Examiner) are Check notice, never aged', () => {
  const po = CGL_POSTS.find((x) => x.id === 'po-inspector')!;
  const ex = CGL_POSTS.find((x) => x.id === 'examiner')!;
  assert.equal(po.name, 'Inspector (Preventive Officer)');
  assert.equal(ex.name, 'Inspector (Examiner)');
  assert.equal(po.ageUnstated, true);
  assert.equal(ex.ageUnstated, true);
  assert.match(cglPostLabel(po), /age not stated in notice/i);
  assert.match(cglPostLabel(ex), /age not stated in notice/i);
  for (const age of [17, 25, 31, 40]) {
    for (const id of ['po-inspector', 'examiner'] as const) {
      const m = match({ ...base({ dob: dobAt(age), cat: 'GEN' }), cglPost: id }).find((x) => x.exam.id === 'ssc-cgl')!;
      assert.equal(m.ageStatus, 'check', id + ' age ' + age);
      assert.equal(m.ok, false, id + ' must not pass on age ' + age);
      assert.notEqual(m.fit, 'ok', id);
      assert.ok(m.why.every((w) => !/Over age|Too young/i.test(w)), m.why.join(' | '));
      assert.match(m.ageClause || '', /age not stated in notice/i);
      assert.match(ageLimitText(m).heading, /Check notice/i);
      assert.match(m.ageClause || '', /18–30|18-30/);
    }
  }
});

test('gov: empty DOB still returns exams for the results card, with Check notice', () => {
  const rows = match(base({ dob: '' }));
  assert.ok(rows.length > 0, 'UI can render the results card from match() with an empty DOB');
  const cgl = rows.find((m) => m.exam.id === 'ssc-cgl')!;
  assert.equal(cgl.ageStatus, 'check');
  assert.equal(cgl.fit, 'check');
  assert.equal(cgl.ok, false);
  assert.match(ageLimitText(cgl).heading, /Check notice/i);
  assert.ok(cgl.why.some((w) => /date of birth/i.test(w)));
});

test('gov: per-post pass/check/fail keeps CGL visible when the picked post fails', () => {
  const p = base({ dob: dobAt(31), cat: 'GEN', cglPost: 'auditor-cag' });
  const m = match(p).find((x) => x.exam.id === 'ssc-cgl')!;
  assert.equal(m.ageStatus, 'fail');
  assert.equal(m.fit, 'no');
  assert.equal(keepExamVisible(m, false), true, 'CGL must stay on the list with its breakdown');
  const rows = cglPostStatuses(p);
  const auditor = rows.find((r) => r.post.id === 'auditor-cag')!;
  const jso = rows.find((r) => r.post.id === 'jso')!;
  const po = rows.find((r) => r.post.id === 'po-inspector')!;
  assert.equal(auditor.status, 'fail');
  assert.equal(jso.status, 'pass');
  assert.equal(po.status, 'check');
  assert.match(po.note || '', /age not stated in notice/i);
});

const TESTER2_DOC_FP = [
  'We neither retain nor deposit any original certificates at joining or later.',
  'No originals are kept by the establishment under any annex of this appointment.',
  'All original documents stay with you after the document-verification slot ends.',
  'Copies retained on the personnel file are attested photocopies, never the originals.',
  'HR retains copies only, and every original certificate is handed to you at the exit desk.',
  'Please produce the original degree certificate for a short visual check, then pack it away.',
  'The original marksheet is to be exhibited to the clerk and collected again before you leave.',
  'Bring the original testimonials for comparison with the portal scans; nothing is stored overnight.',
  'The original TC / transfer certificate is required for inspection at DV and goes home with you.',
  'We do not charge a file fee, and we also do not hold original educational papers at any time.',
  'Originals will be looked at on day one; they are not deposited and they are not kept in any locker.',
  'Kindly hold your original marksheet in front of the webcam so the officer can read the serial number.',
  'The firm will keep scanned copies of the original degree; the paper itself remains in your folder.',
  'No original academic records are to be surrendered; the desk accepts attested copies alone.',
  'The board neither withholds nor stores original papers, as the FAQs attached to this letter confirm.',
  'Original certificates remain in your possession throughout onboarding and after the appointment.',
  'Please keep the original degree certificate handy for a five-minute cross-check with the notary.',
  'Verification of original documents is completed in one sitting and you walk out with every paper.',
  'The office has no right to keep originals; only xerox copies are punched into the joining file.',
  'Aapke original papers aapke paas hi rahenge; copies file mein jayengi after the stamp is applied.',
  'Na to originals retain honge, na hi deposit; sirf photocopies personal file par lagenge.',
  'Original TC sirf dikhana hai, rakhne ya jama karne ka koi niyam is letter mein nahi hai.',
  'कंपनी न तो मूल प्रमाण पत्र रखेगी और न ही जमा करेगी, केवल छायाप्रतियाँ फ़ाइल में रहेंगी।',
  'मूल अंक पत्र आपके पास ही रहेंगे; सत्यापन के बाद कोई मूल पत्र कार्यालय में नहीं छूटेगा।',
  'मूल ट्रांसफर सर्टिफिकेट केवल दिखाने के लिए लाएँ और उसी बैठक में वापस ले जाएँ।',
  'The recruiter will neither ask you to deposit originals nor keep them after the scrutiny is over.',
  'Originals are never taken into safe custody; the phrase in this letter applies only to photocopies.',
  'We ask you to carry original papers so that we can attest copies; the originals are not collected.',
  'There is no clause under which original documents stay with the company for any period of service.',
  'Please do not submit originals to the courier; send attested copies and keep the originals yourself.',
  'The appointment letter forbids storage of original testimonials, degree certificates or marksheets.',
  'Any mention of a locker in annex B refers to copies retained, not to original educational documents.',
];
const TESTER2_DOC_TP = [
  'Originals will be verified on day 1 and retained by HR till the bond ends, as clause 8 records.',
  'We do not charge fees; originals will be retained in the head-office safe for the service term.',
  'The original degree certificate is not returned unless the two-year surety has been discharged.',
  'Original academic records will be released only after you have served the full notice period.',
  'Your original certificates will be kept in safe custody until the training agreement lapses.',
  'Please bring your original marksheet. They will be kept by the registrar for the bonded year.',
  'The original testimonials are to remain with the principal for the duration of service.',
  'Original papers stay in the vault up to the close of the lock-in described in schedule D.',
  'The original TC will be deposited with the admin desk and released only after the bond is over.',
  'Submit the original degree certificate to the trustee till completion of the rural posting.',
  'Original marksheets shall be placed with the escrow officer until the guarantee expires.',
  'HR will keep your original graduation papers for the duration of service under annexure A.',
  'The firm withholds the original degree; it is handed back only after the scholarship is worked off.',
  'Original documents are stored in the iron cupboard up to the date the surety letter is cancelled.',
  'Your certificates are listed in schedule B. They will be kept until the probation-plus-bond ends.',
  'The original educational papers will not be returned until exit clearance has been signed off.',
  'We will take the original degree certificate into custody and will not release it till year two ends.',
  'Joining is subject to the original TC being held by the sponsor for the whole funded course.',
  'The contractor shall retain original testimonials throughout, and verification happens on day one.',
  'Originals ko verification ke baad bhi rakhna hoga jab tak service bond discharge na ho jaaye.',
  'Aapke original marksheet company locker mein jama rahenge up to the close of the lock-in period.',
  'Original degree certificate rakhwaane honge till the notice and the bond have both been served.',
  'Annex (Hinglish): originals safe custody mein rahenge for the duration of service, not just overnight.',
  'मूल प्रमाण पत्र दिन एक को जाँचे जाएँगे और बॉन्ड समाप्त होने तक मानव संसाधन विभाग रखेगा।',
  'आपके मूल दस्तावेज सुरक्षित अभिरक्षा में रखे जाएँगे जब तक सेवा अवधि पूरी न हो।',
  'मूल डिग्री प्रमाण पत्र तभी जारी किया जाएगा जब निर्धारित सेवा पूरी हो चुकी हो।',
  'मूल अंक पत्र जमा करने होंगे तथा अनुबंध की पूरी अवधि तक वापस नहीं दिए जाएँगे।',
  'The university will keep the original degree certificate in deposit with its lawyer until dues end.',
  'Original papers, once surrendered, stay impounded in the vault for the duration of service.',
  'A double condition applies: originals are not returned unless, and until, the bond amount is settled.',
  'Please hand over the original testimonials; they remain in custody up to the last working day of year two.',
  'The original marksheet and the degree certificate will be withheld for the duration of the agreement.',
];

const FRESH3_DOC_HOLD = [
  'The sponsor shall keep the original degree in the iron chest for the funded term.',
  'Original transfer certificates will be deposited with the warden and released only after hostel dues are cleared.',
  'Your certificates appear in enclosure C. They will be retained until the apprenticeship ends.',
  'The original TC is to remain with the scholarship cell for the duration of the rural posting.',
  'Original academic records stay in the registrar vault up to the last date of the lock-in.',
  'A double gate is written in: originals are not returned unless, and until, the surety is vacated.',
  'The original diploma will not be released unless six months of service have been completed.',
  'We will withhold the original marksheet throughout the probation-plus-bond window.',
  'Please hand over the original testimonials; they stay impounded in the safe until year two closes.',
  'Joining depends on the original TC being held by the donor for the entire course.',
  'Original papers, once surrendered, remain with the trustee for the duration of employment.',
  'The firm stores the original graduation certificate in deposit with counsel until arrears end.',
  'Annexure: originals will be verified at entry and kept by HR till the bond is discharged.',
  'Fees are not taken in cash; the original degree will be kept in the head-office locker for two years.',
  'Original marksheets ko submit karna hoga till the bonded posting has been served in full.',
  'Aapke original certificates rakhwaane honge company vault mein up to the close of lock-in.',
  'Original TC jama rahega registrar ke paas for the duration of service, as the Hindi footnote says.',
  'Degree certificates safe custody mein rahenge jab tak scholarship recover na ho jaaye.',
  'मूल ट्रांसफर सर्टिफिकेट प्रधानाचार्य के पास सेवाकाल की अवधि तक रहेगा।',
  'मूल डिग्री तभी जारी की जाएगी जब ग्रामीण सेवा पूरी हो चुकी हो।',
  'आपके प्रमाण पत्र अनुसूची में लिखे हैं। वे बॉन्ड समाप्त होने तक रखे जाएँगे।',
  'मूल अंक पत्र मानव संसाधन विभाग रोकेगा जब तक गारंटी पत्र रद्द न हो।',
  'The contractor will hold originals for the whole funded internship; verification is only on day one.',
  'The original licence stays with the medical superintendent up to the end of the bonded years.',
  'Original educational papers shall be placed with the escrow desk until the guarantee lapses.',
  'We take the original degree into custody on joining and hand it back only after the notice is worked off.',
  'The college will retain your original TC throughout, and document checks happen at induction.',
  'मूल दस्तावेज सुरक्षित अभिरक्षा में जमा रहेंगे तथा अनुबंध समाप्ति पर लौटाए जाएँगे।',
  'Originals stay in the strong room for the duration of the agreement set out in schedule E.',
  'Your marksheets are named in list 2. They will be kept by the principal until probation ends.',
];
const FRESH3_DOC_VERIFY = [
  'We neither keep nor deposit any original degree certificates after the scrutiny ends.',
  'No originals are stored in the office locker under this appointment letter.',
  'Kindly hold the original TC in front of the webcam during the remote document check.',
  'Please do not courier originals; mail attested copies and keep the originals yourself.',
  'All original papers stay with you once the verification appointment is over.',
  'HR retains photocopies only; the original degree is returned at the same desk.',
  'The original TC / transfer certificate is shown at DV and goes home with you the same morning.',
  'Copies kept on file are self-attested photocopies, never the original testimonials.',
  'Produce the original marksheet for a brief visual check, then pack it away again.',
  'The firm has no right to hold original academic records at any stage of joining.',
  'Originals will be looked at once; they are not surrendered and they are not kept overnight.',
  'Please keep the original licence handy for a short notary comparison, then take it back.',
  'Na to original certificates rakhne hain, na hi jama; sirf xerox file par lagenge.',
  'Original TC sirf dikhana hai at the desk; rakhne ka koi rule nahi likha hai.',
  'Aapke originals aapke paas hi rahenge after the stamp is applied to the copies.',
  'कंपनी न तो मूल अंक पत्र रखेगी और न ही जमा करेगी, केवल प्रतियाँ फ़ाइल में जाएँगी।',
  'मूल दस्तावेज आपके पास ही रहेंगे; सत्यापन के बाद कार्यालय में कुछ नहीं छूटेगा।',
  'कृपया मूल डिग्री कैमरा के सामने पकड़ें ताकि क्रमांक पढ़ा जा सके।',
  'मूल पत्र अपने पास रखें और केवल छायाप्रतियाँ भेजें।',
  'There is no annex under which original documents remain with the employer for a term of service.',
  'The letter forbids storage of original marksheets, degrees or testimonials by the company.',
  'We ask you to carry originals so copies can be attested; the originals are not collected.',
  'Bring original papers for comparison with uploads; nothing is placed in any locker overnight.',
  'The board neither withholds nor stores the original TC, as the frequently asked questions state.',
  'Verification of original documents finishes in one sitting and you walk out with every sheet.',
  'Any locker mentioned in the annex refers to copies retained, not to original educational papers.',
  'Original certificates remain in your possession throughout the appointment and afterwards.',
  'The recruiter will neither ask you to deposit the original diploma nor keep it after scrutiny.',
  'Scanned copies of the original degree are filed; the paper itself remains in your folder.',
  'Please hold your original marksheet up to the webcam so the serial can be read aloud.',
];

test('offer: tester retest-2 64 strings and a new 30+30 three-tier documents set', () => {
  const missed = [...TESTER2_DOC_TP, ...FRESH3_DOC_HOLD].filter((t) => docTier(t) === 'clean');
  const falseRed = [...TESTER2_DOC_FP, ...FRESH3_DOC_VERIFY].filter((t) => docTier(t) === 'red');
  assert.equal(missed.length, 0, 'missed holds (must be red or amber):\n' + missed.join('\n'));
  assert.equal(falseRed.length, 0, 'false reds (legit may be clean or amber):\n' + falseRed.join('\n'));
  assert.ok(TESTER2_DOC_TP.length >= 32 && TESTER2_DOC_FP.length >= 32);
  assert.ok(FRESH3_DOC_HOLD.length >= 30 && FRESH3_DOC_VERIFY.length >= 30);
  const amberWhy = docs('SAMPLE. The firm does not normally keep originals except when a service bond is in force.');
  assert.equal(amberWhy[0]?.risk, 'amber');
  assert.equal(amberWhy[0]?.why, 'Check: confirm whether originals are kept');
  assert.equal(docTier('We neither retain nor deposit any original certificates at joining or later.'), 'clean');
  const sets = {
    'tester-64-hold': docCounts(TESTER2_DOC_TP),
    'tester-64-legit': docCounts(TESTER2_DOC_FP),
    'fresh3-hold': docCounts(FRESH3_DOC_HOLD),
    'fresh3-legit': docCounts(FRESH3_DOC_VERIFY),
  };
  console.log('documents three-tier counts', JSON.stringify(sets));
});

test('gov: Inspector verify note is printed once', () => {
  const row = cglPostStatuses(base({ dob: dobAt(25), cat: 'GEN' })).find((r) => r.post.id === 'po-inspector')!;
  const text = `${row.note || ''}`;
  const needle = 'Some listings give 18–30; verify in the official notice.';
  assert.match(text, /age not stated in notice/i);
  assert.equal(text.split(needle).length - 1, 1, 'verify note duplicated: ' + text);
});

test('offer: retest-3 Highs and Medium — rakhwaayi/jab tak, conditionals, B.Tech/B.E., clear denials, not-returned-until', () => {
  const ho39 = 'Pehle original certificates verification ke liye dikhana hoga. Uske baad original degree HR locker mein rakhwaayi jaayegi jab tak do saal ka service bond poora na ho.';
  assert.equal(docTier(ho39), 'red', 'HO39 rakhwaayi jaayegi jab tak must be a hold, and na ho is until not negation');
  const ho39mail = 'Joining mail, made up. Dear Sana, welcome to Kaveri Textiles, Erode. On 8 December please come to the mill office at 9 a.m. with photographs and a cancelled cheque. Pehle original certificates verification ke liye dikhana hoga. Uske baad original degree HR locker mein rakhwaayi jaayegi jab tak do saal ka service bond poora na ho. Regards, Mill HR.';
  assert.equal(docTier(ho39mail), 'red');

  const am08 = 'Joining packs mention original documents in the checklist, and a follow-up note will state if anything is to be held after the first-day check.';
  assert.notEqual(docTier(am08), 'red', 'AM08 conditional if … to be held must not be red');

  assert.equal(docTier('The hospital stores the original B.Sc certificate in deposit with its standing counsel until outstanding loans end.'), 'red');
  assert.equal(docTier('The employer shall keep the original B.Tech degree in the strong room for the funded term.'), 'red');
  assert.equal(docTier('The firm will retain your original B.E. degree until the bond ends.'), 'red');
  const ho36 = 'Bring original educational certificates for verification on the first day. Photocopies will be attested in front of you. The project will retain your original B.Tech degree certificate until that rural service has been completed.';
  assert.equal(docTier(ho36), 'red');

  for (const t of [
    'The hospital does not retain original educational certificates after the joining formalities end.',
    'No original documents are kept in the personal file of any new staff nurse.',
    'We do not collect or store original degree certificates at any stage of onboarding.',
    'Original papers are not deposited with the employer under this appointment letter.',
    'Staff are not required to surrender original marksheets or the nursing registration.',
    'This appointment forbids the employer from holding original academic records at any time.',
    'There is no clause under which original marksheets remain with the nursing college after the check.',
  ]) assert.equal(docTier(t), 'clean', 'clear denial should be clean: ' + t);

  assert.equal(docTier('A special condition is written in: originals are not returned unless the bank guarantee has been vacated.'), 'red');
  assert.equal(docTier('The original nursing licence will not be released unless eighteen months of service have been completed.'), 'red');
  assert.equal(docTier('Original academic records will be released only after you have served the full notice period.'), 'red');
});
