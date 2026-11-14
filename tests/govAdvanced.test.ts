// t385u: profession-first Government Jobs search + advanced filters. Postings below are sample shapes, not real vacancies. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advancedFilter, advFromProfile, govResults, type Search } from '../src/lib/gov/filter';
import { eligibilityBadge, matchLabel } from '../src/lib/gov/rank';
import { eduOk, EXAMS, type Profile } from '../src/lib/govJobs';
import { eduOf } from '../src/lib/gov/shared';
const T = '2026-11-14';
let n = 0;
const P = (title: string, x: Record<string, unknown> = {}) => ({ id: String(++n), title, org: 'Govt body', location: 'Delhi', eligibility: '', state: 'All India', lesserKnown: false, official: true, lastDate: '2026-12-10', pay: '', vacancies: '', ...x } as any);
const LAW = [
  P('Civil Judge (Junior Division) / PCS-J', { org: 'Uttar Pradesh Public Service Commission', state: 'Uttar Pradesh', level: 'state', eligibility: 'LLB, enrolled as an advocate', eduTags: ['LAW'], maxAge: 35 }),
  P('Higher Judicial Service (HJS) direct recruitment', { org: 'High Court of Delhi', level: 'judiciary', eligibility: '7 years practice as an advocate', eduTags: ['LAW'] }),
  P('Assistant Public Prosecutor', { org: 'Delhi Subordinate Services Selection Board', level: 'state', state: 'Delhi', eduTags: ['LAW'], maxAge: 30 }),
  P('Law Officer', { org: 'Coal India Limited', level: 'psu', pay: 'Rs 60,000 - 1,80,000', eligibility: 'Degree in Law (LLB)', eduTags: ['LAW'], maxAge: 40 }),
  P('Specialist Officer (Law) SO-Law', { org: 'Bank of Baroda', level: 'psu', eduTags: ['LAW', 'GRADUATE'] }),
  P('Legal Assistant', { org: 'Ministry of Law and Justice', level: 'central', eligibility: 'Degree in Law' }),
  P('Standing Counsel', { org: 'Income Tax Department', level: 'central', employmentType: 'contractual' }),
  P('Judicial Member', { org: 'National Company Law Tribunal (NCLT)', level: 'judiciary' }),
  P('Legal Officer Grade B', { org: 'Reserve Bank of India', level: 'regulator', pay: 'Level 10' }),
  P('Panel Lawyer / Legal Aid Counsel', { org: 'District Legal Services Authority (DLSA)', level: 'local', employmentType: 'contractual' }),
  P('Assistant Professor (Law)', { org: 'Central University', level: 'autonomous', eduTags: ['LAW', 'PG'] }),
  P('Law Clerk-cum-Research Assistant', { org: 'Supreme Court of India', level: 'judiciary', eduTags: ['LAW'] }),
];
const JUNIOR = [
  P('Peon', { org: 'District Court', eduTags: ['10TH'] }), P('Multi Tasking Staff (MTS)', { org: 'SSC', eduTags: ['10TH'] }),
  P('Lower Division Clerk', { org: 'Ministry X', eduTags: ['12TH'] }), P('Staff Car Driver', { org: 'Department of Posts', eduTags: ['10TH'] }),
  P('Junior Court Assistant (Clerk)', { org: 'High Court', eduTags: ['GRADUATE'] }), P('Chowkidar', { org: 'Nagar Nigam' }),
  P('DLSA Chittoor Driver Recruitment 2026', { org: 'District Legal Services Authority' }), P('Stenographer, Legal Services Authority', { org: 'SLSA' }),
];
const OTHER = [P('Scientist B (Electronics)', { org: 'DRDO', level: 'autonomous', eligibility: 'BE/BTech in Electronics', eduTags: ['ENGINEERING'], pay: 'Level 10' }), P('Staff Nurse', { org: 'AIIMS', eduTags: ['MEDICAL'] })];
const ALL = [...JUNIOR, ...OTHER, ...LAW];
const lawyer: Profile = { dob: '1993-03-01', edu: 'grad', cat: 'OBC', pwbd: false, esm: false, gender: 'male', state: 'Delhi', expYears: 8, expType: ['litigation'], spec: 'law' };
const engineer: Profile = { ...lawyer, edu: 'eng', spec: 'engineering', expYears: 2 };
const grad: Profile = { ...lawyer, spec: '', expYears: 0 };
const fresher: Profile = { ...lawyer, dob: '2006-01-01', edu: '12', spec: '', expYears: 0 };
const F: Search = { q: '', state: '', lesser: false, official: false, soon: false, deputation: false, sort: 'rank', allLevels: false };
const titles = (l: any[]) => l.map((p) => p.title);

test('lawyer: every open law post appears, ranked first, and zero peon / MTS / clerk / driver posts', () => {
  const r = govResults(ALL, F, lawyer, [], T);
  for (const p of LAW) assert.ok(titles(r.list).includes(p.title), `missing law post: ${p.title}`);
  for (const p of JUNIOR) assert.ok(!titles(r.list).includes(p.title), `junior post shown: ${p.title}`);
  assert.ok(!r.list.some((p) => /\b(peon|mts|multi tasking|clerk(?!-cum)|driver|chowkidar)\b/i.test(p.title) && !/law clerk/i.test(p.title)));
  // hidden = below-level posts + posts whose stated essential the lawyer fails (BE/BTech, nursing): no false hope.
  assert.equal(r.hidden, JUNIOR.length + OTHER.length);
  assert.deepEqual(titles(r.list.slice(0, LAW.length)).sort(), titles(LAW).sort(), 'law posts rank above non-law posts');
  for (const p of LAW) { const m = matchLabel(p, lawyer, T); assert.ok(m.label !== 'eligible' || /verify age/.test(m.why.join(' ')), p.title); } // profession posts: Strong, Check, or Eligible only while the age is unconfirmed (r6 HIGH 3)
  assert.equal(matchLabel(LAW[3], lawyer, T).label, 'strong'); assert.match(matchLabel(LAW[3], lawyer, T).why[0], /law post/);
  // No false hope: with 6 years the HJS post (7 years' practice, a STATED essential) is hidden, and shown with the reason under Show all levels.
  const six = { ...lawyer, expYears: 6 }; assert.ok(!titles(govResults(ALL, F, six, [], T).list).includes(LAW[1].title));
  assert.ok(titles(govResults(ALL, { ...F, allLevels: true }, six, [], T).list).includes(LAW[1].title)); assert.match(matchLabel(LAW[1], six, T).why.join(' '), /May not qualify.*Needs 7 years/);
});
test('Show all levels brings junior posts back; so does picking the Entry job level', () => {
  assert.equal(govResults(ALL, { ...F, allLevels: true }, lawyer, [], T).list.length, ALL.length);
  const r = govResults(ALL, { ...F, adv: { tiers: ['junior'] } }, lawyer, [], T); assert.ok(titles(r.list).includes('Peon'));
});
test('same profession-first rule for engineers; graduates hide far-below posts; 12th pass still sees entry posts', () => {
  const e = govResults(ALL, F, engineer, [], T).list; assert.equal(e[0].title, 'Scientist B (Electronics)'); assert.ok(!titles(e).includes('Peon'));
  assert.ok(!titles(govResults(ALL, F, grad, [], T).list).includes('Multi Tasking Staff (MTS)'));
  const f = govResults(ALL, F, fresher, [], T); assert.ok(titles(f.list).includes('Peon'));
  // 12th pass: nothing is hidden for level; only posts whose stated essential degree they lack are hidden.
  for (const p of ALL) if (!titles(f.list).includes(p.title)) assert.equal(eligibilityBadge(p, fresher, T).badge, 'maynot', p.title);
});
test('advanced filters: qualification, sector, department, city, category age relaxation', () => {
  assert.deepEqual(titles(advancedFilter(ALL, { quals: ['PHD'], unstated: false }, lawyer, T)), []);
  assert.ok(advancedFilter(ALL, { quals: ['MEDICAL'], unstated: false }, lawyer, T).every((p) => p.eduTags?.includes('MEDICAL')));
  assert.ok(advancedFilter(ALL, { sectors: ['regulator'] }, lawyer, T).every((p) => p.level === 'regulator'));
  assert.deepEqual(titles(advancedFilter(ALL, { dept: 'nclt' }, lawyer, T)), ['Judicial Member']);
  assert.ok(advancedFilter(ALL, { city: 'uttar pradesh' }, lawyer, T).some((p) => /PCS-J/.test(p.title)));
  // APP limit 30 (Delhi state post; lawyer is from Delhi, age 33): GEN fails, OBC +3 passes.
  const app = [LAW[2]];
  assert.equal(advancedFilter(app, { ageFit: true, cat: 'GEN' }, lawyer, T).length, 0); assert.equal(advancedFilter(app, { ageFit: true }, lawyer, T).length, 1);
  assert.equal(advancedFilter([P('No limit stated')], { ageFit: true, qualFit: true }, lawyer, T).length, 1, 'unknown never hides');
});
test('one-time details pre-fill the search; empty feed stays empty (nothing invented)', () => {
  const a = advFromProfile({ ...lawyer, city: 'Saket' }); assert.equal(a.state, undefined, 'place ranks, never hides'); assert.ok(a.ageFit && a.qualFit);
  assert.deepEqual(govResults([], F, lawyer, [], T), { list: [], hidden: 0, far: 0 });
});
test('PhD is a qualification level: counts as postgraduate for exams and is read from the shared profile', () => {
  const phd: Profile = { ...grad, edu: 'phd' }; assert.ok(eduOk(EXAMS.find((e) => e.id === 'upsc-cse')!, phd));
  assert.equal(eduOf({ headline: 'PhD in Economics' }), 'phd'); assert.equal(eduOf({ headline: 'MSc Physics' }), 'pg');
});
