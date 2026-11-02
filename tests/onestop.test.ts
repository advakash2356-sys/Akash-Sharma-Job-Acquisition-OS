import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../src/lib/onestop/category';
import { expandTitle, familyOf } from '../src/lib/onestop/clusters';
import { rankJobs, score } from '../src/lib/onestop/rubric';
import { portalLinks, PORTALS } from '../src/lib/onestop/portals';
import { matchSnapshot } from '../server/snapshot';
import { dedupe } from '../scripts/collect-jobs';
import { govTrack } from '../src/components/GovPostings';

test('classify: government split, consulting, remote, international, corporate', () => {
  assert.equal(classify({ title: 'Young Professional (Data)', company: 'NITI Aayog', gov: true }), 'gov-lateral');
  assert.equal(classify({ title: 'Combined Graduate Level Examination 2026', company: 'SSC', gov: true }), 'gov-cadre');
  assert.equal(classify({ title: 'Senior Consultant', company: 'MeitY' }), 'gov-lateral');
  assert.equal(classify({ title: 'Analyst', company: 'Deloitte' }), 'consulting');
  assert.equal(classify({ title: 'Engineer', company: 'Acme', location: 'Remote', remote: true }), 'remote');
  assert.equal(classify({ title: 'Engineer', company: 'Acme', location: 'Berlin, Germany' }), 'international');
  assert.equal(classify({ title: 'Engineer', company: 'Acme', location: 'Gurugram, India' }), 'corporate');
  assert.equal(govTrack({ title: 'Assistant', org: 'Ministry', employmentType: 'contractual' }), 'lateral');
});

test('5-cluster lookup expands titles', () => {
  assert.equal(familyOf('Senior SOC Analyst'), 'soc analyst');
  const e = expandTitle('SOC Analyst');
  assert.ok(e.includes('siem engineer') && e.length > 5);
});

const P = { resume: 'Data analyst, 3 years. SQL, Python, Power BI, Tableau. Delhi.', roles: ['Data Analyst'], skills: ['sql'], location: 'Delhi', expYears: 3 };
test('100-point rubric: parts add up, title + skills + city win', () => {
  const b = score({ id: '1', title: 'Data Analyst', company: 'X', location: 'New Delhi, India', description: 'SQL Python Power BI' }, P, 1);
  assert.equal(b.total, Math.min(100, b.skills + b.role + b.domain + b.location + b.penalty));
  assert.ok(b.skills <= 35 && b.role <= 30 && b.domain <= 20 && b.location <= 15);
  assert.ok(b.total >= 80, `got ${b.total}`);
});
test('penalties: clearance -50; age cap applies only to cadre exams', () => {
  const c = score({ id: '2', title: 'Data Analyst', company: 'X', location: 'US', description: 'Active security clearance required' }, P, 1);
  assert.equal(c.penalty, -50);
  const age = { ...P, age: 40 };
  const cadre = score({ id: '3', title: 'Data Analyst Exam', company: 'SSC', location: 'India', description: 'Age limit 18 to 27 years', category: 'gov-cadre' }, age, 1);
  const lateral = score({ id: '4', title: 'Data Consultant', company: 'NITI', location: 'India', description: 'Age limit 18 to 27 years', category: 'gov-lateral' }, age, 1);
  assert.ok(cadre.reasons.some((r) => /age limit/.test(r))); assert.ok(!lateral.reasons.some((r) => /age limit/.test(r)));
});
test('rankJobs orders best first with MiniSearch BM25', () => {
  const r = rankJobs([{ id: 'a', title: 'Chef', company: 'Y', location: 'Paris', description: 'cooking' }, { id: 'b', title: 'Data Analyst', company: 'Z', location: 'Delhi', description: 'SQL Tableau' }], P);
  assert.equal(r[0].id, 'b');
});
test('portal deep links: ~50, prefilled, LinkedIn/Naukri/Indeed included', () => {
  assert.ok(PORTALS.length >= 45);
  const l = portalLinks('Data Analyst', 'Delhi', 3);
  for (const n of ['LinkedIn', 'Naukri', 'Indeed India', 'Foundit (Monster)', 'Shine', 'Glassdoor', 'Instahyre', 'Cutshort', 'Wellfound', 'Apna', 'iimjobs', 'hirist.tech', 'TimesJobs']) assert.ok(l.find((x) => x.name === n), n);
  assert.match(l.find((x) => x.name === 'Naukri')!.url, /data-analyst-jobs-in-delhi.*experience=3/);
  for (const x of l) assert.doesNotThrow(() => new URL(x.url));
});
test('snapshot matching uses cluster expansion; dedupe drops repeats', () => {
  const s = [{ t: 'SIEM Engineer', c: 'A', l: 'Pune', u: 'https://a/1', d: '2026-11-01', s: 'Workday', r: 0 as const, k: 'corporate' }, { t: 'Chef', c: 'B', l: '', u: 'https://b', d: '', s: 'Lever', r: 0 as const, k: 'corporate' }];
  assert.deepEqual(matchSnapshot(s, ['SOC Analyst']).map((j) => j.title), ['SIEM Engineer']);
  assert.equal(dedupe([...s, { ...s[0], u: 'https://a/2' }]).length, 2);
});

import { run } from '../scripts/precision-eval';
import { existsSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
test('precision@20 on the real snapshot (when present) is at least 0.6 for each test profile', { skip: !existsSync('data/jobs-snapshot.json.gz') }, () => {
  const jobs = JSON.parse(gunzipSync(readFileSync('data/jobs-snapshot.json.gz')).toString()).jobs;
  for (const r of run(jobs, true)) assert.ok(r.p20 >= 0.6, `${r.profile}: ${r.p20}`);
});
