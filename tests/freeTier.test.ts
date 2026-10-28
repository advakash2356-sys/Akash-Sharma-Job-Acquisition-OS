import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { checkCap, addUse, _resetMem, quotaKey, CAP_MESSAGE } from '../server/quota';
import { isFreeModel, extractJson, DEFAULT_OR_MODELS } from '../server/openrouter';
import { handleAction, keyFromHeaders, ApiError } from '../server/handlers';
import { checkBody } from '../server/guard';

beforeEach(() => { _resetMem(); delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.KV_REST_API_URL; process.env.FREE_AI_DAILY_CAP = '3'; });

test('daily cap: 3 results then a friendly DAILY_CAP error', async () => {
  for (let i = 0; i < 3; i++) { await checkCap('g:u1'); await addUse('g:u1'); }
  await assert.rejects(checkCap('g:u1'), (e: any) => e instanceof ApiError && e.code === 'DAILY_CAP' && e.status === 429 && /free AI results/.test(e.message));
  await checkCap('g:u2'); // other users unaffected
});
test('ip cap stops account cycling', async () => {
  process.env.FREE_AI_DAILY_IP_CAP = '2';
  await addUse('ip:1.2.3.4'); await addUse('ip:1.2.3.4');
  await assert.rejects(checkCap('g:new', '1.2.3.4'), /free AI results/);
  delete process.env.FREE_AI_DAILY_IP_CAP;
});
test('quota keys are hashed (no raw ids stored) and per UTC day', () => {
  const k = quotaKey('g:12345', Date.UTC(2026, 9, 28));
  assert.match(k, /^jaos:aiq:2026-10-28:[0-9a-f]{32}$/); assert.ok(!k.includes('12345'));
  assert.notEqual(k, quotaKey('g:12345', Date.UTC(2026, 9, 29)));
  assert.match(CAP_MESSAGE(3), /own free Gemini key/);
});
test('OpenRouter path only allows free models', () => {
  assert.ok(DEFAULT_OR_MODELS.every(isFreeModel));
  assert.ok(!isFreeModel('openai/gpt-4o'));
  assert.equal(extractJson('```json\n{"a":1}\n```'), '{"a":1}');
});
test('no site keys: clear message, nothing leaks', async () => {
  const g = process.env.GEMINI_API_KEY, o = process.env.OPENROUTER_API_KEY; delete process.env.GEMINI_API_KEY; delete process.env.OPENROUTER_API_KEY;
  await assert.rejects(handleAction('score-job', {}, undefined, 'g:x'), (e: any) => e.code === 'NO_API_KEY');
  if (g) process.env.GEMINI_API_KEY = g; if (o) process.env.OPENROUTER_API_KEY = o;
});
test('cap blocks before any upstream call; failed calls do not count', async () => {
  process.env.GEMINI_API_KEY = 'fake-site-key'; process.env.FREE_AI_DAILY_CAP = '0';
  await assert.rejects(handleAction('score-job', {}, undefined, 'g:y'), (e: any) => e.code === 'DAILY_CAP');
  process.env.FREE_AI_DAILY_CAP = '3';
  await assert.rejects(handleAction('score-job', {}, undefined, 'g:y'), (e: any) => e.code === 'NO_RESUME');
  await checkCap('g:y'); // the failed call was not counted
  delete process.env.GEMINI_API_KEY;
});
test('user key header and body size limits', () => {
  assert.equal(keyFromHeaders({ 'x-user-gemini-key': ' abc ' }), 'abc');
  assert.equal(keyFromHeaders({ 'x-user-gemini-key': 'x'.repeat(300) }), undefined);
  assert.throws(() => checkBody({ resume: 'x'.repeat(250_000) }), (e: any) => e.code === 'TOO_LARGE');
});
test('end to end (stubbed network): OpenRouter free fallback answers, counts toward the cap', async () => {
  delete process.env.GEMINI_API_KEY; process.env.OPENROUTER_API_KEY = 'or-test';
  const real = globalThis.fetch; let sent: any;
  globalThis.fetch = (async (url: any, init: any) => { sent = { url: String(url), body: JSON.parse(init.body), auth: init.headers.Authorization };
    return new Response(JSON.stringify({ choices: [{ message: { content: '```json\n{"score":72,"verdict":"Fit","strengths":[],"gaps":[],"keywords":[],"recommendation":"Apply"}\n```' } }] }), { status: 200 }); }) as any;
  try {
    const body = { resume: 'Experienced analyst with SQL, Python and dashboards for five years at a retail company.', title: 'Data Analyst', description: 'SQL, Python' };
    for (let i = 0; i < 3; i++) { const r: any = await handleAction('score-job', body, undefined, 'g:e2e'); assert.equal(r.result.score, 72); }
    assert.match(sent.url, /openrouter\.ai\/api\/v1\/chat\/completions/); assert.ok(sent.body.models.every(isFreeModel)); assert.equal(sent.auth, 'Bearer or-test');
    await assert.rejects(handleAction('score-job', body, undefined, 'g:e2e'), (e: any) => e.code === 'DAILY_CAP');
  } finally { globalThis.fetch = real; delete process.env.OPENROUTER_API_KEY; }
});
