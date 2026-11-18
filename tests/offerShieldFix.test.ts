import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findCtc, findVariablePct, prefillPayFields, scanOffer } from '../src/lib/offerShield';
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

test('finds clearly stated CTC and does not guess', () => {
  assert.equal(findCtc('annual CTC of Rs 9,00,000'), 900_000);
  assert.equal(findCtc('Your CTC is 8.5 LPA'), 850_000);
  assert.equal(findCtc('Cost to Company: Rs. 10,00,000/-'), 1_000_000);
  assert.equal(findCtc('CTC of 12 lakhs'), 1_200_000);
  assert.equal(findCtc('You agree to a service bond of 2 lakhs if you leave early.'), null);
  assert.equal(findCtc('We are pleased to offer you the role of Analyst.'), null);
});
test('prefill pay fields only when clearly stated', () => {
  assert.deepEqual(prefillPayFields('annual CTC of Rs 6,00,000. Variable pay of 15% is at the sole discretion'), { ctc: '600000', variable: '15' });
  assert.deepEqual(prefillPayFields('Your CTC is 8.5 LPA, all fixed.'), { ctc: '850000' });
  assert.deepEqual(prefillPayFields('We are pleased to offer you the role of Analyst. Probation is 3 months.'), {});
});
