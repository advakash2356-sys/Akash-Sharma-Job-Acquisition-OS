import { test } from 'node:test'; import assert from 'node:assert/strict';
import { keyFromHeaders } from '../server/handlers.ts';
test('server accepts AQ. and AIza keys without format checks', () => {
  const aq = 'AQ.Ab' + 'x'.repeat(48), aiza = 'AIza' + 'y'.repeat(35);
  assert.equal(keyFromHeaders({ 'x-user-gemini-key': aq }), aq);
  assert.equal(keyFromHeaders({ 'x-user-gemini-key': ` ${aiza} ` }), aiza);
});
