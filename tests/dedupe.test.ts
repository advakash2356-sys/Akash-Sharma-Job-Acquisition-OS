import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nearDuplicate } from '../src/lib/dedupe';
const d = 'Join our controllers team to own legal entity reporting, statutory accounts, intercompany reconciliations, US GAAP and local GAAP close, audit support, regulatory filings, balance sheet substantiation and control testing across regions.';
test('same role under another company name is a duplicate', () => {
  assert.equal(nearDuplicate({ title: 'Legal Entity Controller - Associate', description: d, url: 'a' }, { title: 'Legal Entity Controller – Associate', description: d + ' Apply via Nextmind Solutions.', url: 'b' }), true);
});
test('different roles are kept', () => {
  assert.equal(nearDuplicate({ title: 'Legal Entity Controller - Associate', description: d, url: 'a' }, { title: 'Financial Analyst', description: d, url: 'b' }), false);
});
