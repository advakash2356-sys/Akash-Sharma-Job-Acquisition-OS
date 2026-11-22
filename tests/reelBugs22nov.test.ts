// Regression + held-out tests for the five live-site bugs filmed 22 Nov 2026. Made-up clauses. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanOffer } from '../src/lib/offerShield';
import { designationPack } from '../src/lib/voiceGame';
import { naturalize } from '../src/lib/voiceInterview';
import { EXAMS, ageLimitText, ageOn, match, matchExam, radarText, type Profile } from '../src/lib/govJobs';

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

test('offer: Original documents held badge severity matches the serious why text', () => {
  const cases = [
    'Please carry original certificates for verification on the first day.',
    'Original documents are required at the time of joining the company.',
    'Original degree must be produced on day one for HR records.',
    'You must submit your original certificates to HR, which will be retained during the bond period.',
  ];
  for (const t of cases) {
    const c = scanOffer('SAMPLE. ' + t).find((x) => x.kind === DOC_KIND);
    assert.ok(c, 'should flag: ' + t);
    assert.match(c!.why, /serious/i);
    assert.equal(c!.risk, 'red', 'serious text must be red, not amber: ' + t);
  }
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
const cglOf = (p: Profile, postMaxAge?: number) => matchExam(CGL, p, postMaxAge);

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
