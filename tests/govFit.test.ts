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
test('NO-GO 1: WDRA Under Secretary (Technical) needing Bio/Agri is not a law match', () => {
  const w = P('Under Secretary (Technical)', { org: 'Warehousing Development and Regulatory Authority (WDRA)', eligibility: 'Masters in Biology / Agriculture with experience', eduTags: ['PG'] });
  assert.equal(profileFit(w, lawyer).field, false); assert.ok(!eligibilityBadge(w, lawyer).why.some((x) => /law background/.test(x)));
});
test('NO-GO 2: RRB Group C manager/supervisor titles are not senior', () => {
  for (const t of ['Goods Train Manager', 'Chief Commercial cum Ticket Supervisor']) { const p = P(t, { org: 'RRB', pay: 'Rs 29,200 - 35,400 (Level 5/6)' }); assert.notEqual(tierOf(p), 'senior', t); assert.ok(profileFit(p, lawyer).pts <= 0, t); }
  assert.equal(tierOf(P('Manager', { pay: 'Rs 35,400' })), 'mid'); assert.equal(tierOf(P('Assistant Manager', { pay: 'Level 10 of pay matrix' })), 'senior'); assert.equal(tierOf(P('Officer', { pay: 'Rs 56,100 - 1,77,500' })), 'senior');
});
test('t329u subject hint: WDRA Bio/Agri post gets no officer boost for LLB and shows the subject', () => {
  const w = P('Under Secretary (Technical)', { org: 'WDRA', pay: 'Level 11 of pay matrix', eligibility: 'Masters in Biological Sciences / Agriculture with 5 years experience' });
  const legal = P('Legal Officer', { eligibility: 'LLB with 7 years experience', eduTags: ['LAW'] });
  assert.ok(profileFit(w, lawyer).pts < 0); assert.ok(profileFit(legal, lawyer).pts > profileFit(w, lawyer).pts + 40);
  const why = eligibilityBadge(w, lawyer).why.join(' '); assert.match(why, /Needs Life Sciences \/ Agriculture/); assert.doesNotMatch(why, /Officer \/ specialist/); // t386u: exact discipline gate wording
  assert.equal(profileFit(w, { ...lawyer, spec: '' }).subjects, undefined); // unknown degree: no penalty
});
test('t329u curated niche rows: official links, future-dated filter, law rows rank for lawyer, GATE rows not', async () => {
  const { CURATED, curatedPostings } = await import('../server/govCurated');
  assert.ok(CURATED.length >= 5); assert.ok(CURATED.every((r) => /(isro|csir)\.(gov|res)\.in/.test(r.noticeUrl))); for (const r of CURATED) { assert.match(r.noticeUrl, /^https:\/\//); assert.match(r.lastDate, /^\d{4}-\d{2}-\d{2}$/); }
  assert.equal(curatedPostings('2026-12-31').length, 0); const live = curatedPostings('2026-11-02'); assert.ok(live.every((p) => p.lesserKnown && p.official));
  assert.ok(live.some((p) => p.linkKind === 'notice') && live.some((p) => p.linkKind === 'site'));
  const tk = live.find((p) => /TKDL/.test(p.org))!; assert.ok(profileFit(tk, lawyer).pts < 0); // forestry/env-science post, not for LLB
});
test('contract tag: "contract law" in eligibility is not contractual', async () => {
  const { empTypeOf } = await import('../server/govPostings');
  assert.notEqual(empTypeOf('Law degree with 4 years experience in civil/contract law. Regular employment.'), 'contractual');
  assert.equal(empTypeOf('Engaged on contract basis for 2 years'), 'contractual'); assert.equal(empTypeOf('Fixed term appointment'), 'contractual');
});
