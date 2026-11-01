// t326u: experience, degree and career level drive gov "Best match". Postings below are sample shapes, not real vacancies. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eligibilityBadge, profileFit, rankScore, tierOf, type RankInput } from '../src/lib/gov/rank';
import type { Profile } from '../src/lib/govJobs';
const base = { lastDate: '2026-11-20', lesserKnown: false, pay: '', vacancies: '', official: true, org: 'Org', state: 'All India', eligibility: '' };
const P = (title: string, extra: Partial<RankInput> = {}): RankInput => ({ ...base, title, ...extra });
const posts = [P('Gramin Dak Sevak (GDS)', { eduTags: ['10TH'], lesserKnown: true, pay: 'Rs 10,000' }), P('Multi Tasking Staff (MTS)', { eduTags: ['10TH'] }), P('Lower Division Clerk', { eduTags: ['12TH'] }), P('Constable (GD)'),
  P('Legal Officer', { eligibility: 'LLB with 7 years post qualification experience', eduTags: ['LAW'] }), P('Assistant Public Prosecutor', { eduTags: ['LAW'] }), P('Deputy Manager (Law)', { org: 'NTPC', eduTags: ['LAW'] }), P('Scientist B', { eduTags: ['PG'] })];
const lawyer: Profile = { dob: '1990-05-01', edu: 'grad', cat: 'GEN', pwbd: false, esm: false, gender: 'male', state: 'Delhi', expYears: 9, spec: 'law' };
const fresher: Profile = { ...lawyer, dob: '2006-01-01', edu: '12', expYears: 0, spec: '' };
const rank = (prof: Profile) => posts.map((p) => ({ t: p.title, s: rankScore(p, [], '2026-11-01') + profileFit(p, prof).pts, hide: profileFit(p, prof).belowLevel })).sort((a, b) => b.s - a.s);
test('tiers', () => { assert.equal(tierOf(posts[0]), 'junior'); assert.equal(tierOf(posts[1]), 'junior'); assert.equal(tierOf(posts[4]), 'senior'); assert.equal(tierOf(P('Junior Engineer')), 'mid'); });
test('BA+LLB+9y: junior posts hidden and never above legal/officer posts', () => {
  const r = rank(lawyer); for (const t of ['Gramin Dak Sevak (GDS)', 'Multi Tasking Staff (MTS)', 'Lower Division Clerk', 'Constable (GD)']) assert.ok(r.find((x) => x.t === t)!.hide, t);
  assert.deepEqual(r.slice(0, 3).map((x) => x.t).sort(), ['Assistant Public Prosecutor', 'Deputy Manager (Law)', 'Legal Officer']);
  const b = eligibilityBadge(posts[1], lawyer); assert.equal(b.badge, 'maynot'); assert.match(b.why[0], /below your 9 yrs/);
  assert.notEqual(eligibilityBadge(posts[4], lawyer).badge, 'maynot'); assert.ok(eligibilityBadge(posts[4], lawyer).why.some((w) => /law background/.test(w)));
});
test('fresher still sees entry posts at the top, nothing hidden', () => { const r = rank(fresher); assert.ok(r.every((x) => !x.hide)); assert.ok(['Gramin Dak Sevak (GDS)', 'Multi Tasking Staff (MTS)', 'Lower Division Clerk'].includes(r[0].t)); });
test('no profile: unchanged behaviour', () => assert.equal(profileFit(posts[0], null).pts, 0));
