import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeScore } from '../src/lib/matchScore.ts';
test('overall is weighted locally and inputs are clamped', () => {
  const r = normalizeScore({ skills: 80, experience: 60, keywords: 40, matchedSkills: ['Contracts', ''], missingSkills: 'x', fixes: Array(9).fill('f') });
  assert.equal(r.overall, 63); assert.deepEqual(r.matchedSkills, ['Contracts']); assert.deepEqual(r.missingSkills, []); assert.equal(r.fixes.length, 6);
  assert.equal(normalizeScore({ skills: 500, experience: -3, keywords: 'a' }).skills, 100);
  assert.equal(normalizeScore({}).overall, 0);
});
