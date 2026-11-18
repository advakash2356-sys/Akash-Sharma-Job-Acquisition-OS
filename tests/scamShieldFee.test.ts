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

test('H7 M1: Hinglish pay-app asks and unparsed amounts are red', () => {
  const cases = [
    'Paytm pe 1800 bhejo for training, after that we start the onboarding.',
    'Joining se pehle 2k rs deposit dena hoga HR account mein.',
    'Pay rupees two thousand five hundred as form fee to confirm the slot.',
    'We need a refundable security of 8,000 INR before you start.',
    'We charge a small paid service of eighteen hundred rupees to process this.',
    'Please pay enrollment charges of 4000 inr to lock the batch.',
    'bhai 1800 jama karo, refund ho jayega if not selected.',
  ];
  for (const message of cases) {
    const r = scanMessage({ message });
    assert.equal(r.verdict, 'red', message);
    assert.ok(payTitle(r), message);
  }
});
test('H8-H11 M2-M4: no-fee, bonus, reimbursement, salary UPI, negation and exam/tuition traps', () => {
  const cases = [
    'We do not charge any processing fee. Please come in on Monday. Salary Rs 40,000 a month.',
    'We will pay your joining bonus of Rs 1,00,000; it is refundable if you leave within 12 months. CTC 15 LPA.',
    'The company will reimburse certification fees up to Rs 10,000 after you join.',
    'Kindly share your UPI only for salary credit setup after joining. CTC Rs 6,00,000. No fee.',
    'We never ask candidates to pay a fee or deposit. Package is 11 LPA.',
    'We never ask for OTP, CVV or a deposit. The package is 9 LPA.',
    'A fee waiver is available for this internal course. Your CTC will be Rs 9,00,000.',
    'SBI Clerk 2026 official notification: application fee Rs 750 is payable to IBPS/the Bank.',
    'Education: B.Com (Hons). My tuition fee was Rs 80,000 per year at college. CTC 6 LPA.',
    'I paid tuition fee of Rs 1,20,000 last year during my MBA.',
    'Bank job: after selection, you may need to pay the official application fee of Rs 850 to IBPS.',
  ];
  for (const message of cases) {
    const r = scanMessage({ message });
    assert.equal(payTitle(r), undefined, message + ' => ' + r.signs.map((s) => s.title).join(', '));
    if (/never ask for OTP/i.test(message)) assert.ok(!r.signs.some((s) => /OTP|bank details/i.test(s.title)), message);
  }
});
