import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findCtc, findVariablePct, prefillPayFields, mergePayPrefill, payRefreshNotice, scanOffer } from '../src/lib/offerShield';
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

test('H1: typo-fix and append paste do not overwrite edited CTC or variable %', () => {
  const letter = 'Your CTC is 18.75 LPA. Variable pay of 12% is included.';
  const filled = mergePayPrefill({ text: '', ctc: '', variable: '0' }, letter, 'new');
  assert.equal(filled.ctc, '1875000'); assert.equal(filled.variable, '12');
  const edited = { ...filled, ctc: '2000000', variable: '5', ctcEdited: true, variableEdited: true };
  const typed = mergePayPrefill(edited, letter + ' Welcome to the team.', 'type');
  assert.equal(typed.ctc, '2000000'); assert.equal(typed.variable, '5');
  const append = mergePayPrefill(edited, letter + ' Welcome to the team.', 'append');
  assert.equal(append.ctc, '2000000'); assert.equal(append.variable, '5');
  const fresh = mergePayPrefill(edited, 'Your CTC is 8.5 LPA, all fixed.', 'new');
  assert.equal(fresh.ctc, '850000'); assert.equal(fresh.variable, '0'); assert.equal(fresh.ctcEdited, false);
});
test('H2-H6 M5: ranges, conflicts, ceilings, bonus, monthly, Hindi and crore', () => {
  assert.equal(findCtc('The role has a CTC of 10-12 LPA depending on interview performance.'), null);
  assert.equal(findCtc('Your previous CTC was 12 LPA. We are pleased to offer a CTC of Rs 10,00,000 for this role.'), 1_000_000);
  assert.equal(findCtc('Monthly CTC of Rs 80,000 x 12 = Rs 9,60,000 is your annual CTC.'), 960_000);
  assert.equal(findCtc('This is a split-payroll role. CTC USD 80,000 / INR 66,00,000 per annum.'), null);
  assert.equal(findCtc('A retention bonus equivalent to 2 LPA vests after year two. Detailed CTC will follow in annexure.'), null);
  assert.equal(findCtc('If you leave, a notice buyout of 3 lakhs per annum of remaining term may apply. CTC annexure will be sent separately.'), null);
  assert.equal(findCtc('CTC: Rs 1,00,000 per month. Other terms as discussed.'), 1_200_000);
  assert.equal(findCtc('आपका CTC 12 लाख रुपये प्रति वर्ष है।'), 1_200_000);
  assert.equal(findCtc('CTC of 1.2 crore per annum, all inclusive.'), 12_000_000);
  assert.equal(findVariablePct('Your CTC is 12 LPA. You may receive up to 15% variable at discretion.'), null);
  assert.equal(findVariablePct('A variable bonus of up to 20% may be paid at discretion.'), null);
  assert.equal(findVariablePct('variable pay of 10-20% of CTC'), null);
  assert.deepEqual(prefillPayFields('The role has a CTC of 10-12 LPA. You may receive up to 15% variable.'), {});
});

test('retest-2: conflicting CTC hits stay blank; C.T.C., times signs, fixed pay, refresh notice', () => {
  assert.equal(findCtc('Annexure A states CTC 14 LPA. Page 2 mentions CTC of Rs 11,00,000. Please confirm which figure applies.'), null);
  assert.equal(findCtc('We confirm a C.T.C. of 9.6 lacs for the Associate Counsel role.'), 960_000);
  assert.equal(findCtc('Monthly CTC of Rs 95,000 × 12 = Rs 11,40,000 is your annual CTC.'), 1_140_000);
  assert.equal(findCtc('Monthly CTC of Rs 95,000 * 12 = Rs 11,40,000 is your annual CTC.'), 1_140_000);
  assert.equal(findCtc('Fixed pay is 9 LPA and CTC is 11 LPA.'), 1_100_000);
  const edited = { text: 'old', ctc: '1600000', variable: '6', ctcEdited: true, variableEdited: true };
  assert.equal(payRefreshNotice(edited, 'new'), 'CTC and variable were refreshed from the new letter.');
  assert.equal(payRefreshNotice(edited, 'type'), undefined);
  assert.equal(payRefreshNotice(edited, 'append'), undefined);
  const fresh = mergePayPrefill(edited, 'Your package is 8 LPA, all fixed.', 'new');
  assert.equal(fresh.ctc, '800000');
  assert.equal(fresh.variable, '0');
  assert.equal(fresh.ctcEdited, false);
});
