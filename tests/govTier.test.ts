import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileFit, userLevel } from '../src/lib/gov/rank';
import type { Profile } from '../src/lib/govJobs';

const base = { dob: '1990-01-01', cat: 'GEN', pwbd: false, esm: false, gender: 'M', state: 'Delhi' } as unknown as Profile;
const pg = { ...base, edu: 'pg', expYears: 6, spec: 'law' } as Profile;
const tenth = { ...base, edu: '10', expYears: 0 } as Profile;
const post = (title: string, pay = '', eligibility = '') => ({ title, org: 'Govt', eligibility, pay, lastDate: '2026-12-01', lesserKnown: false, vacancies: '', official: true, state: '' });

test('qualification tier: peon / MTS / clerk hidden for a postgraduate lawyer, shown for a 10th-pass user', () => {
  for (const t of ['Peon', 'Multi Tasking Staff (MTS)', 'Lower Division Clerk', 'Group D Helper', 'Junior Assistant (Group C)']) {
    assert.equal(profileFit(post(t) as any, pg).belowLevel, true, t);
    assert.equal(profileFit(post(t) as any, tenth).belowLevel, false, t);
  }
  assert.equal(profileFit(post('Legal Consultant', 'Rs 80,000 per month', 'LLB with 5 years') as any, pg).belowLevel, false);
  assert.ok(profileFit(post('Legal Consultant', '', 'LLB') as any, pg).pts > profileFit(post('Section Officer') as any, pg).pts);
  assert.equal(userLevel(pg), 4); assert.equal(userLevel(tenth), 1);
});
