import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
// @ts-ignore vendored ESM
import * as workday from '../scripts/collect/vendor/openjobs/workday.mjs';

test('Workday job links include the career-site segment', async () => {
  const h = workday.detect({ ats_links: ['https://citi.wd5.myworkdayjobs.com/2'] });
  const jobs = await workday.fetchJobs(h, { workdayCap: 1, fetchJson: async (_u: string, _i: unknown) => ({ total: 1, jobPostings: [{ title: 'T', externalPath: '/job/Pune/T_1' }] }) });
  assert.equal(jobs[0].detail_url, 'https://citi.wd5.myworkdayjobs.com/2/job/Pune/T_1');
});
// Live check (network): LINK_CHECK=1 npm test. Bot-protected boards (Himalayas, We Work Remotely) answer 403 to scripts and are skipped.
test('sample of real snapshot links return 200', { skip: !process.env.LINK_CHECK || !existsSync('data/jobs-snapshot.json.gz') }, async () => {
  const jobs = JSON.parse(gunzipSync(readFileSync('data/jobs-snapshot.json.gz')).toString()).jobs.filter((j: any) => !/Himalayas|We Work Remotely|Working Nomads/.test(j.s));
  const by: Record<string, any[]> = {}; for (const j of jobs) (by[j.s] ||= []).push(j);
  const bad: string[] = [];
  await Promise.all(Object.values(by).flatMap((l) => [0, 0.5].map(async (f) => { const j = l[Math.floor(f * l.length)]; const r = await fetch(j.u, { headers: { 'user-agent': 'Mozilla/5.0 Chrome/130' }, signal: AbortSignal.timeout(15000) }).catch(() => null); if (!r || r.status >= 400) bad.push(`${j.s} ${r?.status} ${j.u}`); })));
  assert.deepEqual(bad, []);
});
