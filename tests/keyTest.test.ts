import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { testGeminiKey, KEY_TEST_URL } from '../src/lib/keyTest';
const K = 'AIza' + 'x'.repeat(35);
const res = (status: number, body: any = {}) => (async () => new Response(JSON.stringify(body), { status })) as any;
test('success and clear errors', async () => {
  let seen: any; const ok = (async (u: any, i: any) => { seen = { u, h: i.headers }; return new Response('{}', { status: 200 }); }) as any;
  assert.equal((await testGeminiKey(K, ok)).ok, true);
  assert.equal(seen.u, KEY_TEST_URL); assert.equal(seen.h['x-goog-api-key'], K); assert.ok(!String(seen.u).includes(K));
  assert.match((await testGeminiKey(K, res(400, { error: { message: 'API key not valid' } }))).text, /isn't valid/);
  assert.match((await testGeminiKey(K, res(403))).text, /blocked/);
  assert.match((await testGeminiKey(K, res(429))).text, /busy/);
  assert.match((await testGeminiKey('', ok)).text, /Paste/);
  assert.match((await testGeminiKey('abc', ok)).text, /doesn't look like/);
  assert.match((await testGeminiKey(K, (async () => { throw new Error('x'); }) as any)).text, /Couldn't reach Google/);
});
test('card: button link, 3 steps, local note, CSP, credit kept', () => {
  const c = readFileSync('src/components/ApiKeyCard.tsx', 'utf8');
  assert.match(c, /https:\/\/aistudio\.google\.com\/app\/apikey/); assert.match(c, /Get your free Gemini key/); assert.match(c, /target="_blank"/);
  assert.match(c, /Create API key/); assert.match(c, /stays in this browser/);
  assert.match(readFileSync('vercel.json', 'utf8'), /connect-src 'self' https:\/\/generativelanguage\.googleapis\.com/);
  assert.match(readFileSync('src/pages/About.tsx', 'utf8'), /Akash Sync Agent/);
});
