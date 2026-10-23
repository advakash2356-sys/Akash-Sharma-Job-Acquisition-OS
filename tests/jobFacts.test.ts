import test from 'node:test'; import assert from 'node:assert/strict';
import { jobFacts, parseSalary } from '../src/lib/jobFacts.ts';
test('salary: parsed when present, Not disclosed otherwise', () => {
  assert.equal(parseSalary('CTC: ₹6,00,000 - ₹9,00,000 per annum'), '₹6,00,000 - ₹9,00,000 per annum');
  assert.equal(parseSalary('Pay range $85,000 to $110,000 a year plus bonus'), '$85,000 to $110,000 a year');
  assert.equal(parseSalary('Offering 4-6 LPA for the right person'), '4-6 LPA');
  assert.equal(parseSalary('Competitive salary and great culture. Founded in 2004, 500 employees.'), 'Not disclosed');
  assert.equal(parseSalary('We have 2 offices'), 'Not disclosed');
});
test('employment, experience, shift', () => {
  const f = jobFacts('Full-time role. Minimum 3 years of experience in legal operations. Night shift (US hours).', ['UTC-5']);
  assert.equal(f.employment, 'Full-time'); assert.equal(f.experience, '3+ years'); assert.match(f.shift, /US \/ night shift/); assert.match(f.shift, /UTC-5/);
  assert.equal(jobFacts('Freshers welcome. Contract for 6 months').experience, 'Entry level / freshers');
  assert.equal(jobFacts('2-4 years experience').experience, '2–4 years');
  assert.equal(jobFacts('Join us').employment, 'Not stated');
});
