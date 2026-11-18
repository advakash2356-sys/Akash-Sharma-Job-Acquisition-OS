// Sample data below is made up for tests (labelled "sample"). Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanMessage } from '../src/lib/scamShield';

const payTitle = (r: ReturnType<typeof scanMessage>) =>
  r.signs.find((s) => s.title === 'Asks you to pay' || s.title === 'Asks for a payment' || s.title === 'Mentions a fee');

function assertPaymentAsk(message: string, label: string) {
  const r = scanMessage({ message });
  assert.equal(r.verdict, 'red', `${label}: expected red, got ${r.verdict} (${r.signs.map((s) => s.title).join(', ') || 'no signs'})`);
  assert.ok(payTitle(r), `${label}: missing payment-ask sign`);
}

function assertNoPaymentAsk(message: string, label: string) {
  const r = scanMessage({ message });
  assert.equal(payTitle(r), undefined, `${label}: unexpected payment-ask (${r.signs.map((s) => `${s.title}: ${s.match || s.detail}`).join('; ')})`);
}

const ASKS = [
  ["it's a paid service of ₹1,800 and also claimed the amount is refundable if I don't clear the interview", 'victim wording, rupee symbol'],
  ["it's a paid service of Rs 1800 and the amount is refundable if you don't clear the interview", 'victim wording, Rs'],
  ['Sample: This is a paid service of Rs. 1,800 to schedule interviews.', 'paid service only'],
  ['Sample: The amount of ₹1,800 is refundable if you do not clear the interview.', 'refundable amount'],
  ['Sample: Please pay a refundable fee of Rs 2000 if you do not clear the interview.', 'refundable fee'],
  ['Sample: A security deposit of Rs 5,000 is required before joining.', 'security deposit'],
  ['Sample: You must pay a training fee of ₹4,500 to start.', 'training fee'],
  ['Sample: Training charges of Rs 3000 are payable at onboarding.', 'training charges'],
  ['Sample: Pay ₹1,800 registration fee to schedule interviews.', 'known registration fee'],
  ['Sample: yeh paid service hai Rs 1800 ki, amount refundable hai interview clear nahi hua toh.', 'Hinglish paid service + refundable'],
  ['Sample: interview ke liye 1800 rupaye ki paid service, refundable hai.', 'Hinglish paid service'],
  ['Sample: security deposit 5000 rupaye jama karna hoga.', 'Hinglish security deposit'],
  ['Sample: training fees 2500 rupaye deni hogi joining se pehle.', 'Hinglish training fees'],
  ['Sample: fees bharo 1800 rs, refundable if you do not clear the interview.', 'Hinglish fees bharo + refundable'],
  ['Sample: Please transfer a refundable deposit of INR 2500 for the training kit.', 'refundable deposit + training kit'],
];

const SAFE = [
  ['Sample: Your salary will be Rs 8,00,000 per annum. There is no registration fee.', 'salary + no registration fee'],
  ['Sample: CTC of Rs 12,00,000. We do not charge any fee.', 'CTC + do not charge any fee'],
  ['Sample: The role pays ₹15 LPA. No fee is required to apply.', 'LPA + no fee to apply'],
  ['Sample: Thanks for applying. Compensation is ₹50,000 per month. We never ask candidates to pay a deposit.', 'salary + never ask for deposit'],
  ['Sample: This is a paid internship with a stipend of Rs 15,000 per month.', 'paid internship stipend'],
  ['Sample: Could you share your availability for a 30 minute call next week? The salary range is ₹8-12 LPA.', 'normal invite with salary range'],
  ['Sample: There is no processing fee and no security deposit for this role. CTC is Rs 9,00,000.', 'explicit no fee / no deposit'],
];

test('scam: payment-ask wordings are red', () => {
  for (const [message, label] of ASKS) assertPaymentAsk(message, label);
});

test('scam: salary and no-fee wording is not a payment ask', () => {
  for (const [message, label] of SAFE) assertNoPaymentAsk(message, label);
});
