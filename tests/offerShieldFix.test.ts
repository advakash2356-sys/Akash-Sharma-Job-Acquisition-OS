import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findVariablePct, scanOffer } from '../src/lib/offerShield';
test('reads variable pay % from letter text', () => {
  assert.equal(findVariablePct('annual CTC of Rs 6,00,000. Variable pay of 15% is at the sole discretion'), 15);
  assert.equal(findVariablePct('Your CTC includes 10% variable.'), 10);
  assert.equal(findVariablePct('Your CTC is 8.5 LPA, all fixed.'), null);
});
test('no duplicate Service bond flag from "bond period"', () => {
  const t = 'You agree to a service bond of 36 months. You must submit your original certificates to HR, which will be retained during the bond period.';
  const c = scanOffer(t);
  assert.equal(c.filter((x) => x.kind === 'Service bond').length, 1);
  assert.equal(c.filter((x) => x.kind === 'Original documents held').length, 1);
});
