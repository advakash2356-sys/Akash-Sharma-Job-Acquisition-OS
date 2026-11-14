// Retest 5 (NO-GO at 286ffbe): no-profile view never says Eligible; experience parsing fail-closed (yrs. / exp. / PQE / standing,
// years not stated = Check); unreadable PDF age = Check; SSRF-safe official-PDF fetch; good/nice-to-have are soft; litigation
// activities; BSc Chemistry Related fits. Postings built with S() are sample shapes, not real vacancies. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { govResults, advFromProfile } from '../src/lib/gov/filter';
import { LABEL_TEXT, matchLabel } from '../src/lib/gov/rank';
import { agesOf, ageWordsIn, experienceOf, parseNotice } from '../src/lib/gov/notice';
import { isOfficialPdfUrl, needsAiRead } from '../src/lib/gov/noticeAi';
import { fetchPdf } from '../server/govNoticeAi';
import { eduTagsOf } from '../server/govPostings';
import type { Profile } from '../src/lib/govJobs';

const T = '2026-11-14';
const base = { cat: 'GEN', pwbd: false, esm: false, gender: 'male', eduSet: true, dob: '1998-03-01', state: 'Uttar Pradesh' } as any;
const P: Record<string, Profile> = {
  lawyer: { ...base, edu: 'grad', spec: 'law', subject: 'BA LLB', bar: true, expYears: 3, expType: ['litigation'] },
  ca: { ...base, edu: 'grad', spec: 'finance', subject: 'B.Com, CA', icai: true, expYears: 4, expType: ['audit_accounts'] },
  mbbs: { ...base, edu: 'grad', spec: 'medical', subject: 'MBBS', medReg: true, expYears: 2, expType: ['clinical'] },
  engineer: { ...base, edu: 'eng', spec: 'engineering', subject: 'B.Tech Civil', expYears: 3, expType: ['engineering'] },
  bsc: { ...base, edu: 'grad', subject: 'B.Sc Chemistry', expYears: 1 },
};
let n = 0;
const S = (title: string, eligibility: string, x: any = {}) => ({ id: `r5-${++n}`, title, org: 'Govt body', location: '', eligibility, state: 'All India', official: true, lastDate: '2026-12-10', pay: 'Level 10', maxAge: 40, level: 'central', eduTags: eduTagsOf(`${title} ${eligibility}`), ...x });
const F = { q: '', state: '', lesser: false, official: false, soon: false, deputation: false, sort: 'rank', allLevels: false } as any;
const shown = (p: any, k: string) => govResults([p], { ...F, adv: advFromProfile(P[k]) }, P[k], [], T).list.length > 0;
const lab = (p: any, k: string) => (shown(p, k) ? matchLabel(p, P[k], T).label : 'HIDDEN');

// ---------- HIGH 1: no profile ----------
test('no profile: never Strong / Eligible / Related; scanned and unclear rows are Check notice', () => {
  const rows = [
    S('Legal Advisor', 'LLB with 3 years experience'), S('Junior Chemist', 'B.Sc Chemistry'), S('Office Attendant', '10th pass', { pay: 'Level 1' }),
    S('Panel Lawyer', 'Advocate', { facts: { ...parseNotice(S('Panel Lawyer', 'Advocate') as any), pdf: 'scanned' } }),
    S('Employment Notice no 1/2026 Upper Divisional Clerk Grade-III', '', { facts: { ...parseNotice(S('Employment Notice no 1/2026 Upper Divisional Clerk Grade-III', '') as any), noticeType: 'unclear' } }),
  ];
  for (const p of rows) { const m = matchLabel(p as any, null, T); assert.ok(!['strong', 'eligible', 'related'].includes(m.label), `${p.title}: ${m.label}`); assert.doesNotMatch(m.why.join(' '), /meets every essential/); }
  assert.equal(matchLabel(rows[0] as any, null, T).label, 'setup'); assert.equal(LABEL_TEXT.setup, 'Set up your profile to see your fit');
  const sc = matchLabel(rows[3] as any, null, T); assert.equal(sc.label, 'check'); assert.match(sc.why.join(' '), /scanned notice, verify manually/);
  const un = matchLabel(rows[4] as any, null, T); assert.equal(un.label, 'check'); assert.match(un.why.join(' '), /notice type unclear/);
});

// ---------- HIGH 2: experience ----------
const EXP: [string, number | null, string?][] = [
  ['CA with 6 yrs. experience', 6], ['CA with 6 years exp.', 6], ['CA with 6 years of exp', 6], ['CA, 6 years PQE', 6], ['CA with 6 yrs post-qualification exp.', 6],
  ['CA with 6+ years experience', 6], ['CA with six (6) years experience', 6], ['CA with 6 years post qualification experience', 6], ['CA with experience of not less than 6 years', 6],
  ['PQE: 6 yrs', 6], ['Exp. 6 yrs', 6], ['6 yr exp', 6], ['Experience: minimum 06 years', 6], ['six-year experience', 6], ['CA having 6 yr. P.Q.E.', 6],
  ['LLB with 5 yrs. standing at the Bar', 5, 'litigation'], ['LLB with five years practice as an advocate', 5, 'litigation'], ['5 वर्ष का अनुभव', 5], ['Law Graduate candidates jinka 7 saal ka experience ho', 7], ['Bachelor degree aur 3 saal ka supervisory experience hai', 3],
  ['CA with post-qualification experience', null], ['CA with (sufficient) post-qualification experience', null], ['LLB with standing at the Bar', null, 'litigation'],
  ['Degree in Law with experience', null], ['MBBS. Experience in hospital', null, 'clinical'],
  ['minimum 5 years experience of arguing cases in civil courts', 5, 'litigation'], ['arguing cases in civil courts for 5 years', 5, 'litigation'], ['5 years experience of conducting cases before the district courts', 5, 'litigation'],
];
test('experience: yrs. / exp. / PQE / standing / practice / 6+ / six, and years not stated = null', () => {
  for (const [e, y, type] of EXP) { const x = experienceOf('', e); assert.ok(x, `${e}: no experience found`); assert.equal(x!.years, y, e); if (type) assert.equal(x!.type, type, e);
    assert.ok(!/not less than/.test(x!.detail || ''), `${e}: generic detail ${x!.detail}`); }
  // an age limit after the experience clause is never read as years of experience
  assert.equal(experienceOf('', 'Graduate. Experience desirable. Age: 35 years')?.years ?? null, null);
});
test('r5 probes: clear experience fails are hidden, unstated years are Check, never Strong', () => {
  const ca = (e: string) => lab(S('Accounts Manager', e), 'ca');
  for (const e of ['CA with 6 yrs. experience', 'CA with 6 years exp.', 'CA with 6 years of exp', 'CA, 6 years PQE', 'CA with 6 yrs post-qualification exp.']) assert.equal(ca(e), 'HIDDEN', e);
  assert.equal(ca('CA with post-qualification experience'), 'check'); assert.equal(ca('CA with (sufficient) post-qualification experience'), 'check');
  assert.equal(lab(S('Legal Advisor', 'LLB with 5 yrs. standing at the Bar'), 'lawyer'), 'HIDDEN');
  assert.equal(lab(S('Legal Advisor', 'LLB with 3 yrs. experience in corporate advisory'), 'lawyer'), 'check');
  assert.equal(lab(S('Legal Advisor', 'LLB with 3 years experience of arguing cases in civil courts'), 'lawyer'), 'strong');
});
// General guard: random experience phrasings that ask for more years than the profile has are never Strong.
test('guard: random experience phrasings above the profile\'s years are never Strong (fail-closed)', () => {
  let seed = Number(process.env.GUARD_SEED || 20261114); const rnd = (k: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % k; };
  const pick = <X,>(a: X[]) => a[rnd(a.length)];
  const NUMS: [string, number][] = [['6', 6], ['06', 6], ['6+', 6], ['six', 6], ['six (6)', 6], ['6 (six)', 6], ['7', 7], ['seven', 7], ['10', 10], ['ten', 10], ['8', 8], ['5', 5]];
  const UNITS = ['years', 'year', 'yrs', 'yrs.', 'yr', 'yr.', "years'", 'Years', 'YRS.'];
  const NOUNS = ['experience', 'exp.', 'exp', 'Exp.', 'PQE', 'P.Q.E.', 'post-qualification experience', 'post qualification exp.', 'standing at the Bar', 'practice', 'practice as an Advocate', 'relevant experience', 'professional experience', 'working experience', 'work experience in the field'];
  const PRE: Record<string, string[]> = { ca: ['CA with', 'Chartered Accountant having', 'CA (ICAI member),', 'Qualified CA;'], lawyer: ['LLB with', 'Degree in Law having', 'Advocate with', 'LL.B.;'] };
  const have: Record<string, number> = { ca: 4, lawyer: 3 }; const title: Record<string, string> = { ca: 'Accounts Manager', lawyer: 'Legal Advisor' };
  let tried = 0;
  for (let i = 0; i < Number(process.env.GUARD_N || 400); i++) {
    const k = pick(['ca', 'lawyer']); const [num, years] = pick(NUMS); if (years <= have[k]) continue; const unit = pick(UNITS); const noun = pick(NOUNS);
    const form = rnd(5); const phr = form === 0 ? `${num} ${unit} ${noun}` : form === 1 ? `${num} ${unit} of ${noun}` : form === 2 ? `${noun} of ${num} ${unit}` : form === 3 ? `${noun}: minimum ${num} ${unit}` : `minimum ${num} ${unit}' ${noun}`;
    const e = `${pick(PRE[k])} ${phr}${pick(['', '.', ' required.', ' (essential)'])}`; tried++;
    const p = S(title[k], e); const l = lab(p, k); assert.notEqual(l, 'strong', `${k}: "${e}" -> strong`); assert.notEqual(l, 'eligible', `${k}: "${e}" -> eligible`);
  }
  // and any experience requirement with no years stated
  for (const e of ['CA with post-qualification exp.', 'CA with experience', 'CA; experienced in audit', 'CA with PQE', 'CA having adequate exp.', 'Experienced Chartered Accountant'])
    assert.notEqual(lab(S('Accounts Manager', e), 'ca'), 'strong', e);
  assert.ok(tried > 150, `only ${tried} random cases`);
});

// ---------- MEDIUM (a): ages ----------
const KURNOOL_OCR = 'b) For outsiders: 1; Must be Graduate from any recognized University and must have passed A.P, Government Technical Examination in English [pewriting by Higher Grade; Age LlElt: Must have completed the age of 18 years and must not have completed tJ:e age of 42 years as on 3l .LO.ZOZ6.';
test('age: OCR-noisy Kurnool limit is read; Hindi limits; unreadable limit is a Check, never "not stated"', async () => {
  assert.deepEqual(agesOf(KURNOOL_OCR), { min: 18, max: 42 });
  assert.deepEqual(agesOf('आयु सीमा: 18 से 35 वर्ष'), { min: 18, max: 35 }); assert.equal(agesOf('अधिकतम आयु: 40 वर्ष').max, 40);
  assert.ok(ageWordsIn('Age Limit: as per rules')); assert.ok(ageWordsIn('आयु सीमा')); assert.ok(ageWordsIn('वय मर्यादा')); assert.ok(!ageWordsIn('Last date 20.11.2026'));
  const { withPdfText } = await import('../server/govNoticeRead');
  const p = S('Notification No.1 – Application are invited for the post of Typist-cum-Assistant', '', { maxAge: undefined, state: 'Andhra Pradesh' }); const rules = parseNotice(p as any);
  const ok = withPdfText(p as any, rules, { elig: 'Must be Graduate from any recognized University', ages: agesOf(KURNOOL_OCR), ageWords: true }); assert.equal(ok.ageMax, 42); assert.ok(!ok.ageUnreadable);
  const old = { ...P.bsc, state: 'Andhra Pradesh', dob: '1981-01-01', domicile: true, lang: ['Telugu'] } as any; const pk = { ...p, facts: { ...ok, pdf: 'text', noticeType: 'open_call' } };
  assert.equal(matchLabel(pk as any, old, T).label, 'check'); assert.match(matchLabel(pk as any, old, T).why.join(' '), /May not qualify/);
  const bad = withPdfText(p as any, rules, { elig: 'Must be Graduate', ages: { min: 18, max: null }, ageWords: true }); assert.equal(bad.ageUnreadable, true);
  const m = matchLabel({ ...p, facts: { ...bad, pdf: 'text', noticeType: 'open_call' } } as any, { ...old, dob: '1996-01-01' }, T);
  assert.equal(m.label, 'check'); assert.match(m.why.join(' '), /verify age: unreadable in PDF/); assert.doesNotMatch(m.why.join(' '), /not stated/);
  // no age words at all: the old behaviour (label kept, "Age limit not stated" note)
  const none = withPdfText(p as any, rules, { elig: 'Must be Graduate', ages: { min: null, max: null }, ageWords: false }); assert.ok(!none.ageUnreadable);
});

// ---------- MEDIUM (b): SSRF ----------
const GOOD = ['https://cdnbbsr.s3waas.gov.in/s3ec0/uploads/2026/10/2026102965.pdf', 'https://districts.ecourts.gov.in/a/b.PDF', 'https://www.example.nic.in/x.pdf?v=1', 'https://gov.in/a.pdf'];
const BAD = ['https://evil.example.com#.gov.in/a.pdf', 'https://evil.example.com/#x.gov.in/a.pdf', 'https://evil.example.com?.gov.in/x.pdf', 'https://evil.example.com\\.gov.in/a.pdf',
  'https://user@evil.com/x.gov.in/a.pdf', 'https://x.gov.in@evil.com/a.pdf', 'https://x.gov.in:pw@evil.com/a.pdf', 'https://u:p@x.gov.in/a.pdf', 'http://x.gov.in/a.pdf',
  'https://x.gov.in:8443/a.pdf', 'https://x.gov.in.evil.com/a.pdf', 'https://evilgov.in/a.pdf', 'https://x.gov.in/a.html', 'https://x.gov.in/a.pdf.html', 'ftp://x.gov.in/a.pdf',
  'https://127.0.0.1/a.pdf', 'https://[::1]/a.pdf', 'https://x.gov.in./a.pdf', 'https://x.gov.in/a.pdf ', 'javascript:alert(1)//x.gov.in/a.pdf', 'https://xn--evil.com/x.gov.in.pdf', ''];
test('SSRF: official PDF URLs are parsed with URL and suffix-checked', () => {
  for (const u of GOOD) assert.equal(isOfficialPdfUrl(u), true, u);
  for (const u of BAD) assert.equal(isOfficialPdfUrl(u), false, u);
  assert.equal(needsAiRead({ noticeUrl: 'https://evil.example.com#.gov.in/a.pdf', facts: { pdf: 'scanned' } as any }), false);
});
test('SSRF: fetchPdf uses redirect manual, re-validates every hop, max 3 hops', async () => {
  const pdf = new Uint8Array(200).fill(37); const calls: string[] = [];
  const mk = (map: Record<string, { status: number; loc?: string }>) => (async (u: any, init: any) => { calls.push(String(u)); assert.equal(init.redirect, 'manual');
    const r = map[String(u)] || { status: 200 }; return new Response(r.status === 200 ? pdf : null, { status: r.status, headers: r.loc ? { location: r.loc } : {} }); }) as typeof fetch;
  const A = 'https://a.gov.in/n.pdf';
  assert.equal((await fetchPdf(A, 2000, mk({})))?.byteLength, 200);
  calls.length = 0; assert.equal(await fetchPdf(A, 2000, mk({ [A]: { status: 302, loc: 'https://evil.example.com/n.pdf' } })), null); assert.deepEqual(calls, [A]);
  calls.length = 0; assert.equal(await fetchPdf(A, 2000, mk({ [A]: { status: 301, loc: 'http://a.gov.in/n.pdf' } })), null);
  calls.length = 0; assert.equal((await fetchPdf(A, 2000, mk({ [A]: { status: 302, loc: '/m.pdf' } })))?.byteLength, 200); assert.deepEqual(calls, [A, 'https://a.gov.in/m.pdf']);
  const loop: Record<string, { status: number; loc?: string }> = {}; for (let i = 0; i < 6; i++) loop[`https://a.gov.in/${i}.pdf`] = { status: 302, loc: `https://a.gov.in/${i + 1}.pdf` };
  calls.length = 0; assert.equal(await fetchPdf('https://a.gov.in/0.pdf', 2000, mk(loop)), null); assert.equal(calls.length, 4);
  calls.length = 0; assert.equal(await fetchPdf('https://evil.example.com#.gov.in/a.pdf', 2000, mk({})), null); assert.equal(calls.length, 0);
});

// ---------- MEDIUM (c) + LOW ----------
test('good to have / nice to have are soft (never essential)', () => {
  for (const e of ['Graduate in any discipline. LLB would be good to have.', 'Graduate; nice to have: LLB', 'Graduate. Good-to-have: LLB', 'LLB is nice to have; Graduate', 'Graduate (LLB good to have)']) {
    const f = parseNotice(S('Assistant', e) as any); assert.ok(!f.essential.includes('LLB'), `${e}: ${f.essential}`); assert.ok(f.preferred.includes('LLB'), `${e}: preferred ${f.preferred}`); }
  assert.notEqual(lab(S('Assistant Manager', 'Graduate in any discipline. LLB would be good to have.', { pay: 'Level 7' }), 'lawyer'), 'strong');
});
test('BSc Chemistry: Related fits for chemist / lab / QC / forensic / food analyst / research posts at the right level', () => {
  for (const [t, e] of [['Quality Control Officer', 'Bachelor degree in Science'], ['Research Officer', 'Graduate in Science'], ['Junior Chemist', 'B.Sc. degree'], ['Scientific Assistant', 'Degree in Science from a recognised university'],
    ['Food Safety Officer', 'Graduate in Science or Food Technology'], ['Forensic Science Assistant', 'Graduate in Science'], ['Laboratory Officer', 'B.Sc.']])
    assert.equal(lab(S(t, e, { pay: 'Level 6', maxAge: 30 }), 'bsc'), 'related', t);
  assert.equal(lab(S('Laboratory Assistant', '12th pass with Science', { pay: 'Level 2', maxAge: 30 }), 'bsc'), 'HIDDEN');
  assert.equal(lab(S('Assistant Chemical Examiner', 'M.Sc. Chemistry', { pay: 'Level 8' }), 'bsc'), 'HIDDEN');
});
