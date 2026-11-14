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

test('salary: fees are not salary', () => {
  assert.equal(parseSalary('SAMPLE (made up): Data entry job. Pay Rs 1500 registration fee by UPI today only.'), 'Not disclosed');
  assert.equal(parseSalary('SAMPLE (made up): Refundable security deposit of ₹2,000 - ₹5,000 for the kit.'), 'Not disclosed');
  assert.equal(parseSalary('SAMPLE (made up): Training cost Rs 12,000. Pay us before joining.'), 'Not disclosed');
});
test('salary: pay words still count, fee elsewhere ignored', () => {
  assert.equal(parseSalary('SAMPLE (made up): Sales Executive, Pune. Salary ₹4-6 LPA. Apply on the careers page.'), '₹4-6 LPA');
  assert.equal(parseSalary('SAMPLE (made up): Stipend ₹15,000 per month for interns.'), '₹15,000 per month');
  assert.equal(parseSalary('SAMPLE (made up): Pay Rs 999 registration fee now. Our clients offer a monthly salary of ₹25,000 - ₹30,000 per month after selection.'), '₹25,000 - ₹30,000 per month');
  assert.equal(parseSalary('SAMPLE (made up): ₹20,000 - ₹25,000 with no context'), 'Not disclosed');
});
