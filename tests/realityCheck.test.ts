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
import { courseLinks, quoteFor, COURSE_DISCLAIMER } from '../src/lib/courses';
test('course links: real provider pages, free first, no affiliate params', () => {
  const c = courseLinks('Power BI');
  assert.deepEqual(c.map((x) => x.provider), ['Google Skills', 'Microsoft Learn', 'freeCodeCamp', 'Coursera', 'LinkedIn Learning']);
  for (const x of c) { const u = new URL(x.url); assert.ok(/(skills\.google|learn\.microsoft\.com|freecodecamp\.org|coursera\.org|linkedin\.com)$/.test(u.hostname)); assert.ok(!/ref|aff|utm|irclick/i.test(u.search)); }
  assert.equal(c[4].cost, 'Low cost (subscription)');
});
test('quotes the exact job line or nothing', () => {
  const jd = 'About us.\nMust have 3+ years of SQL and Power BI.\nNice: Python';
  assert.equal(quoteFor('power bi', jd), 'Must have 3+ years of SQL and Power BI.');
  assert.equal(quoteFor('Kubernetes', jd), '');
  for (const w of ['may be wrong', 'employer', 'affiliate', 'not responsible', 'not career advice']) assert.ok(COURSE_DISCLAIMER.includes(w));
});
