import { test } from 'node:test';
import assert from 'node:assert/strict';
import { realityCheck, tierOf } from '../src/lib/realityCheck';
test('tiers', () => { assert.equal(tierOf(40), 'stretch'); assert.equal(tierOf(60), 'fit'); assert.equal(tierOf(80), 'safe'); });
test('uses only given data, top 2 improvements', () => {
  const r = realityCheck({ score: 62, gaps: ['Kubernetes', 'Go'], fixes: ['Add a Go project', 'Quantify impact', 'Third'] });
  assert.equal(r.tier, 'fit'); assert.deepEqual(r.improve, ['Add a Go project', 'Quantify impact']); assert.deepEqual(r.gaps, ['Kubernetes', 'Go']);
});
test('never invents competition stats', () => {
  const r = realityCheck({ score: 90 });
  assert.match(r.competition, /no applicant count/); assert.ok(!/\d+%|\d+ applicants/.test(JSON.stringify(r)));
  assert.match(realityCheck({ score: 50, postedDaysAgo: 3 }).competition, /Posted 3 days ago/);
  assert.deepEqual(realityCheck({ score: 30, gaps: ['SQL'] }).improve, ['Close or address: SQL']);
});
