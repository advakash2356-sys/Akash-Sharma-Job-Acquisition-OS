// Regression + held-out tests for the five live-site bugs filmed 22 Nov 2026. Made-up clauses. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanOffer } from '../src/lib/offerShield';
import { designationPack } from '../src/lib/voiceGame';
import { naturalize } from '../src/lib/voiceInterview';
import { CGL_POSTS, EXAMS, ageLimitText, ageOn, match, matchExam, radarText, type Profile } from '../src/lib/govJobs';

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
    else if (c[0].risk !== 'red') missed.push('not red: ' + t);
  }
  for (const t of DOC_VERIFY) if (docs('SAMPLE. ' + t).length) falseHits.push(t);
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
