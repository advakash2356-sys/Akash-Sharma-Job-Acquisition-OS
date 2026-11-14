// t386u: Gov matching spec gates + fresh official sources. Postings built with P() are sample shapes, not real vacancies;
// the fixtures in tests/fixtures/gov are trimmed copies of the official pages fetched 14 Nov 2026 IST. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { govResults, hasDetails, qualFits, type Search } from '../src/lib/gov/filter';
import { matchLabel, profileFit, relaxation, tierOf } from '../src/lib/gov/rank';
import { disciplineGate, domicileGate, experienceGate, lawStreams, licenceGate, payBelow, payInfo, userTier } from '../src/lib/gov/gates';
import { relaxation as examRelax, EXAMS, type Profile } from '../src/lib/govJobs';
import { fromEmploymentNews, fromIsro, fromS3waas, S3_SITES } from '../server/govOfficial';
const T = '2026-11-14'; let n = 0;
const P = (title: string, x: Record<string, unknown> = {}) => ({ id: String(++n), title, org: 'Govt body', location: '', eligibility: '', state: 'All India', lesserKnown: false, official: true, lastDate: '2026-12-10', pay: '', vacancies: '', ...x } as any);
const base: Profile = { dob: '1994-01-01', edu: 'grad', cat: 'GEN', pwbd: false, esm: false, gender: 'female', state: 'Delhi', expYears: 3, eduSet: true };
const lawyer: Profile = { ...base, spec: 'law', subject: 'BA LLB', bar: true };
const engineer: Profile = { ...base, edu: 'eng', spec: 'engineering', subject: 'B.Tech Civil' };
const doctor: Profile = { ...base, spec: 'medical', subject: 'MBBS', medReg: true };
const envSci: Profile = { ...base, edu: 'pg', spec: '', subject: 'MSc Environmental Science' };
const grad: Profile = { ...base, spec: '', subject: 'BA History' };
const F: Search = { q: '', state: '', lesser: false, official: false, soon: false, deputation: false, sort: 'rank', allLevels: false };
const titles = (l: any[]) => l.map((p) => p.title);

test('M1 exact discipline gate: engineer is not eligible for APP; lawyer is not eligible for Medical Officer', () => {
  const app = P('Assistant Public Prosecutor', { eduTags: ['LAW'], eligibility: 'Degree in Law (LLB) and enrolled as an advocate' });
  const mo = P('Medical Officer', { eduTags: ['MEDICAL'], eligibility: 'MBBS, registered with NMC' });
  assert.equal(disciplineGate(app, engineer).ok, false); assert.equal(qualFits(app, engineer), false);
  assert.equal(matchLabel(app, engineer, T).label, 'check'); assert.match(matchLabel(app, engineer, T).why.join(' '), /May not qualify.*Law/);
  assert.equal(qualFits(mo, lawyer), false); assert.notEqual(matchLabel(mo, lawyer, T).label, 'eligible');
  assert.equal(qualFits(mo, doctor), true); assert.equal(qualFits(app, lawyer), true);
  // auto "Only posts my qualification meets" hides them
  const r = govResults([app, mo], { ...F, adv: { qualFit: true } }, engineer, [], T); assert.deepEqual(titles(r.list), []);
});
test('fair cross-fits: MSc Environmental Science sees pollution board, forest, research and data analyst posts, not litigation', () => {
  const ok = [P('Assistant Environmental Engineer / Scientist', { org: 'State Pollution Control Board', eligibility: 'M.Sc. Environmental Science or B.E. Environmental Engineering' }),
    P('Range Forest Officer', { eligibility: 'Degree in Forestry, Agriculture, Environmental Science or Botany' }), P('Project Scientist (Ecology)', { eligibility: 'M.Sc. in Ecology / Environmental Science / Life Sciences' }),
    P('Data Analyst', { eligibility: 'Masters in Statistics, Environmental Science or Economics' })];
  for (const p of ok) assert.notEqual(disciplineGate(p, envSci).ok, false, p.title);
  const lit = P('Law Officer (Litigation)', { eligibility: 'LLB with 3 years litigation practice' }); assert.equal(disciplineGate(lit, envSci).ok, false); assert.equal(qualFits(lit, envSci), false);
});
test('licence + experience gates (Bar / NMC, years of practice to cut-off)', () => {
  const cj = P('Civil Judge (Junior Division)', { eligibility: 'LLB; enrolled as an advocate', state: 'Delhi', level: 'judiciary' });
  assert.equal(licenceGate(cj, lawyer).ok, true); assert.equal(licenceGate(cj, { ...lawyer, bar: false }).ok, false); assert.equal(licenceGate(cj, { ...lawyer, bar: undefined }).ok, null);
  assert.equal(matchLabel(cj, { ...lawyer, bar: undefined }, T).label, 'check'); assert.match(matchLabel(cj, { ...lawyer, bar: undefined }, T).why.join(' '), /Bar Council enrolment/);
  const hjs = P('Higher Judicial Service (direct from Bar)'); assert.equal(experienceGate(hjs, lawyer).ok, false); assert.equal(experienceGate(hjs, { ...lawyer, expYears: 8 }).ok, true);
  assert.equal(qualFits(hjs, lawyer), false);
  const lo = P('Law Officer', { org: 'Coal India Limited', level: 'psu', eligibility: 'LLB with 2 years post qualification experience', pay: 'E2 Rs 50,000 - 1,60,000' });
  assert.equal(matchLabel(lo, lawyer, T).label, 'strong');
});
test('domicile + regional language: Punjab PCS-J for a Delhi lawyer asks to check domicile and Punjabi', () => {
  const pj = P('Civil Judge (Junior Division) PCS-J', { state: 'Punjab', level: 'judiciary', eligibility: 'LLB; enrolled as an advocate' });
  const d = domicileGate(pj, lawyer); assert.equal(d.ok, null); assert.match(d.why!, /Punjabi/); assert.match(d.why!, /domicile/);
  assert.equal(domicileGate(pj, { ...lawyer, state: 'Punjab', languages: ['Punjabi', 'English'] }).ok, true);
  assert.equal(matchLabel(pj, lawyer, T).label, 'check');
});
test('age relaxation: OBC +3, SC/ST +5, PwBD 10/13/15, Ex-SM service + 3', () => {
  assert.equal(relaxation({ cat: 'OBC', pwbd: false }), 3); assert.equal(relaxation({ cat: 'SC', pwbd: false }), 5);
  assert.equal(relaxation({ cat: 'GEN', pwbd: true }), 10); assert.equal(relaxation({ cat: 'OBC', pwbd: true }), 13); assert.equal(relaxation({ cat: 'ST', pwbd: true }), 15);
  assert.equal(relaxation({ cat: 'GEN', pwbd: false, esm: true, esmYears: 5 }), 8);
  assert.equal(examRelax(EXAMS.find((e) => e.id === 'ssc-cgl')!, { ...base, cat: 'OBC', pwbd: true }), 13);
});
test('level floor by tier: professionals never see constable / home guard / agniveer / DEO / LDC; graduates never see 10th/ITI posts', () => {
  const low = ['Constable (Legal Cell)', 'Home Guard', 'Agniveer (General Duty)', 'Data Entry Operator', 'Lower Division Clerk', 'Peon', 'MTS', 'Staff Car Driver'].map((t) => P(t));
  for (const p of low) { assert.equal(profileFit(p, lawyer).belowLevel, true, p.title); assert.notEqual(matchLabel(p, lawyer, T).label, 'strong', p.title); }
  for (const t of ['Home Guard', 'Agniveer (General Duty)', 'Forest Guard', 'Office Attendant']) assert.equal(profileFit(P(t), grad).belowLevel, true, t);
  assert.equal(profileFit(P('Lower Division Clerk', { eduTags: ['12TH'] }), grad).belowLevel, false, 'graduates may still take LDC');
  assert.equal(profileFit(P('Law Clerk-cum-Research Assistant', { eduTags: ['LAW'] }), lawyer).belowLevel, false);
  assert.equal(userTier(lawyer), 'professional'); assert.equal(userTier(grad), 'graduate'); assert.equal(userTier({ ...base, edu: '12' }), 'school');
  assert.equal(profileFit(P('Peon'), { ...base, edu: '10' }).belowLevel, false);
});
test('L2 pay range: WCCB Assistant Director at "Pay Level 2-10" uses the upper bound and is not hidden', () => {
  const w = P('Assistant Director', { org: 'Wildlife Crime Control Bureau (WCCB)', pay: 'Pay Level 2-10' });
  assert.equal(payInfo('Pay Level 2-10').level, 10); assert.notEqual(tierOf(w), 'junior'); assert.equal(profileFit(w, grad).belowLevel, false);
});
test('minimum pay level hides lower-paid posts (unknown pay never hides)', () => {
  const p6 = P('Assistant', { pay: 'Level 6 (Rs 35,400 - 1,12,400)' }); const pro = { ...lawyer, minPayLevel: 10 };
  assert.equal(payBelow(p6.pay, 10), true); assert.equal(profileFit(p6, pro).belowLevel, true); assert.equal(payBelow('', 10), null);
  assert.equal(payBelow('Rs 56,100 - 1,77,500', 10), false);
});
test('L3 first visit: no details means nothing hidden (no silent graduate default)', () => {
  const blank: Profile = { dob: '', edu: 'grad', cat: 'GEN', pwbd: false, esm: false, gender: 'male', state: '' };
  assert.equal(hasDetails(blank), false); assert.equal(hasDetails({ ...blank, eduSet: true }), true);
  const list = [P('Peon', { eduTags: ['10TH'] }), P('Law Officer')]; assert.equal(govResults(list, F, hasDetails(blank) ? blank : null, [], T).hidden, 0);
});
test('nearby first: with "only near me", same-state posts outrank far-away ones', () => {
  const near = { ...lawyer, relocate: false as const };
  const a = P('Law Officer', { state: 'Kerala', level: 'state', pay: 'Level 11' }); const b = P('Law Officer', { state: 'Delhi', level: 'state', pay: 'Level 10' });
  assert.equal(govResults([a, b], F, near, [], T).list[0].state, 'Delhi');
  assert.match(matchLabel(a, { ...lawyer, languages: ['Malayalam'] }, T).why.join(' '), /domicile|posting in Kerala/);
});
test('lawyer completeness: counts each sub-stream so empty ones can be stated plainly', () => {
  const s = lawStreams([P('Spl. Judicial Magistrate'), P('Assistant Public Prosecutor')]); assert.deepEqual(s.map((x) => x.n), [1, 1, 0]);
});
test('official parsers on real page fixtures: Employment News, ISRO, District Courts', () => {
  const f = (n: string) => readFileSync(new URL(`./fixtures/gov/${n}`, import.meta.url), 'utf8');
  const en = fromEmploymentNews(f('employmentnews-alljobs.html'), T); assert.equal(en.length, 2); assert.ok(en.every((p) => p.official && p.noticeUrl.startsWith('https://employmentnews.gov.in/') && p.lastDate >= T));
  assert.equal(fromEmploymentNews(f('employmentnews-alljobs.html'), '2026-08-01').length > 2, true);
  const is = fromIsro(f('isro-opportunities.html'), '2026-11-01'); assert.ok(is.length >= 3); assert.ok(is.every((p) => /^https:\/\/www\.isro\.gov\.in\//.test(p.noticeUrl)));
  assert.ok(is.some((p) => /Medical Officer/.test(p.title))); assert.equal(fromIsro(f('isro-opportunities.html'), T).length, 0, 'closed posts drop off');
  const site = (h: string) => S3_SITES.find((s) => s.host.startsWith(h))!;
  const jal = fromS3waas(f('dcourts-jalaun.html'), site('jalaun'), T); assert.ok(jal.some((p) => /Judicial Magistrate/.test(p.title)));
  assert.ok(jal.every((p) => /^https:\/\/cdnbbsr\.s3waas\.gov\.in\//.test(p.noticeUrl)));
  assert.equal(fromS3waas(f('dcourts-akola.html'), site('akola'), T).length, 0, 'posting orders are not openings');
  assert.equal(fromS3waas(f('dcourts-patna.html'), site('patna'), T).length, 0, 'appointment letters / promotion notices are not openings');
  assert.equal(fromS3waas(f('dcourts-bilaspur.html'), site('bilaspur'), T).length, 0, 'waiting lists / joining orders are not openings');
  assert.equal(fromS3waas(f('dcourts-chandigarh.html'), site('chandigarh'), T).length, 1);
});
