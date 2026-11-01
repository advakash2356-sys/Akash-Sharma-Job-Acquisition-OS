// t332u: the main JAOS profile drives gov ranking. Sample profile/postings only. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expYearsOf, specOf, eduOf, profileKeywords, prefillGov } from '../src/lib/gov/shared';
import { profileOverlap, profileFit, rankScore, type RankInput } from '../src/lib/gov/rank';
import type { Profile } from '../src/lib/govJobs';
const app = { headline: 'Advocate | BA LLB | 9 years litigation', targetRoles: 'Legal Officer, Law Officer, Legal Advisor', skills: 'litigation, contracts, drafting, arbitration', location: 'Gurugram, Haryana', resumeText: 'BA LLB from Delhi University. Practising advocate for 9 years.', experience: '9 years in civil and commercial litigation' };
const blank: Profile = { dob: '1990-05-01', edu: 'grad', cat: 'GEN', pwbd: false, esm: false, gender: 'male', state: '' };
const base = { lastDate: '2026-11-20', lesserKnown: false, pay: '', vacancies: '', official: true, org: 'Org', state: 'All India', eligibility: '' };
const P = (title: string, eligibility = ''): RankInput => ({ ...base, title, eligibility });
test('maps the shared profile', () => {
  assert.equal(expYearsOf(app), 9); assert.equal(specOf(app), 'law'); assert.equal(eduOf(app), 'grad');
  const k = profileKeywords(app); assert.ok(k.includes('legal') && k.includes('litigation')); assert.ok(!k.includes('officer'));
  const g = prefillGov(blank, app, ['Haryana', 'Delhi']); assert.equal(g.expYears, 9); assert.equal(g.spec, 'law'); assert.equal(g.state, 'Haryana');
  assert.equal(prefillGov({ ...blank, expYears: 3, state: 'Goa' }, app, ['Haryana']).expYears, 3); // never overwrite user answers
});
test('ranking uses role/skill overlap on title+eligibility, not org', () => {
  const k = profileKeywords(app); const prof = prefillGov(blank, app, ['Haryana']);
  const legal = P('Legal Advisor', 'LLB with litigation experience'), generic = P('Accounts Officer', 'B.Com'), orgOnly = { ...P('Accounts Officer', 'B.Com'), org: 'Legal Services Authority' };
  const s = (p: RankInput) => rankScore(p, [], '2026-11-01') + profileFit(p, prof).pts + profileOverlap(p, k).pts;
  assert.ok(s(legal) > s(generic) + 30); assert.equal(profileOverlap(orgOnly, k).pts, 0); assert.ok(profileOverlap(legal, k).hits.includes('litigation'));
  assert.equal(profileOverlap(legal, []).pts, 0);
});
