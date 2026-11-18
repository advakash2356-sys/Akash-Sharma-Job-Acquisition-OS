// Fresh held-out wording, not copied from the tester report or earlier PR tests. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanMessage } from '../src/lib/scamShield';
import { findCtc, findVariablePct } from '../src/lib/offerShield';

const paySign = (r: ReturnType<typeof scanMessage>) =>
  r.signs.find((s) => s.title === 'Asks you to pay' || s.title === 'Asks for a payment' || s.title === 'Mentions a fee');

const TP = [
  'PhonePe par 2500 bhej do joining se pehle, warna slot cancel ho jayega.',
  'GPay pe 3k transfer karo for the laptop kit, then we ship it.',
  'UPI pe 4500 jama karna hoga interview slot ke liye.',
  'Send 1200 rs on Paytm to book your onboarding slot today.',
  'Please complete IMPS of 7000 as a security deposit before day one.',
  'Kindly transfer 2.5k INR as document charges to the coordinator.',
  'Pay rupees three thousand as interview fee to confirm attendance.',
  'This is a paid service of rupees twenty two hundred to forward your file.',
  'Form charges of 900 inr apply, said to be refundable after selection.',
  'WhatsApp note: 3500 jama karo training start karne ke liye.',
  'NEFT of 6000 for the uniform kit is required before you join.',
  'Scan and pay 1850 for verification, they sent a QR code.',
  'Google Pay par 1.5k bhejo otherwise the slot will lapse.',
  'Deposit 4000 rupees now; they say it is refundable if you are rejected.',
  'Training charges 5500 rs deni hogi before the first class.',
  'Slot booking amount of Rs 999 via UPI, pay to schedule the call.',
  'ID-card fee 800 inr is payable before you enter the campus.',
  'Laptop deposit 9000 INR, they said Paytm is accepted.',
  'Onboarding amount 2000 bhej dena to the number they shared.',
  'Plz 2200 bhejo on PhonePe for registration, then HR will call.',
  'Interview ke liye paise jama karo 1600, baad mein adjust hoga.',
  'Fees 3500 lagegi, GPay pe bhej dena before Friday.',
  'Refundable amount of twelve hundred rupees for document processing.',
  'Paytm pe 5k bhejna hoga kit ke liye, they already sent the QR.',
  'Bank transfer 2750 for processing has to be done today.',
  'QR code se 1999 pay karo, that is the joining fee they named.',
  'Rupees four thousand five hundred as security, send it on Paytm.',
  'Enrollment amount 1300 inr before they join the call.',
  'Jama karein 2400 rs training account mein, details on WhatsApp.',
  'Send 800 via NEFT as form charges to lock the application.',
  'Paid service of Rs 2100 to push the profile to their clients.',
  'Bhej do 1700 Paytm pe, they said interview ke baad refund mil jayega.',
  'Office aane se pehle 3.2k rs deposit dena hoga at the desk.',
  'UPI 2800 for background verification charges, pay first.',
  'Pay one thousand eight hundred as onboarding charges today.',
  'PhonePe: 6500 laptop security, refundable after three months they say.',
  'GPay par 1100 bhejo slot confirm karne ke liye.',
  'Charges of 4200 inr for the medical kit must be paid first.',
  'IMPS 3100 jama karo HR wallet mein before the briefing.',
  'Transfer karo 1500, they called it a paid service for profile push.',
  'Registration fee of ₹2.2k via UPI to schedule the first round.',
  'Please pay a processing amount of 1750 inr and share the screenshot.',
];

const TRAPS = [
  'Stipend is Rs 25,000 a month for this internship. No charges at all.',
  'We do not charge any onboarding fee. CTC is Rs 7,50,000.',
  'The company reimburses course fees up to Rs 20,000 each year after you join.',
  'Share a GPay number only so we can reimburse your travel after the interview.',
  'Please share UPI so we can credit your first salary. Package 10 LPA. No fee.',
  'We never ask candidates to pay a registration fee or a security deposit. CTC 14 LPA.',
  'We never ask for PIN, OTP or a security deposit. The offer is 8 LPA.',
  'A fee waiver applies to the internal MBA course. CTC will be Rs 11,00,000.',
  'IBPS PO official notification lists an application fee of Rs 850 payable to IBPS.',
  'My college tuition fee was Rs 2,00,000. I am applying for the analyst role at CTC 9 LPA.',
  'I paid a tuition fee last year of Rs 90,000 during CA articleship.',
  'After a bank posting you may still pay the official IBPS exam fee to the Board.',
  'This is a paid internship with a stipend of Rs 20,000. No deposit is required.',
  'ESOP grant of Rs 2,00,000 vests over four years. We never charge applicants.',
  'Night shift allowance is Rs 8,000. Training is provided at no charge.',
  'Professional tax of Rs 2,400 is deducted from salary. There are no hidden charges.',
  'Travel expenses are refunded and paid by the company after the visit.',
  'A joining bonus of Rs 50,000 is repayable if you resign within a year.',
  'We will pay a retention bonus of Rs 2,00,000; it is repayable if you leave early.',
  'The salary range is ₹8-12 LPA. Could you share two slots for a call next week?',
  'There is no processing fee and no kit deposit attached to this offer.',
  'Certification is employer-paid; the company will pay the exam fee of Rs 5,000.',
  'Only PF and professional tax are deducted. CTC is Rs 6,50,000.',
  'Please do not pay anyone who calls asking for money. The official process is free of cost.',
  'Do not transfer any amount to a personal UPI. This HR team never charges applicants.',
  'Training will be provided free of any cost. CTC is 13 LPA.',
  'We don\'t take any security deposit from new hires. Package is 16 LPA.',
  'Relocation expenses are reimbursed up to Rs 30,000 after you join.',
  'Share your bank account only for salary setup. No payment is asked from you.',
  'Official RRB notification: exam fee Rs 500 is payable to IBPS / the Board.',
  'Education history: my semester fee was Rs 45,000 at university last year.',
  'This is not a paid service. Interviews are free. CTC is 8.5 LPA.',
  'We will credit your UPI for the travel refund after the interview.',
  'We never require a deposit or fee from candidates. This is a 12 LPA role.',
  'Variable pay can be up to 15%. Fixed CTC is 10 LPA. No charges.',
  'Medical insurance premium is paid by the company under a Rs 12,000 cover.',
  'Notice buyout is at the company\'s discretion. CTC is 18 LPA. No candidate fee.',
  'We do not collect any document verification charges. Salary is 45,000 a month.',
  'Kindly ignore messages asking for a Paytm payment. We never charge for hiring.',
  'During the increment review, last increment was Rs 40,000. There is no fee to apply.',
  'Please come in on Tuesday. We do not charge any verification fee. CTC Rs 8,00,000.',
  'The offer includes a refundable joining bonus of Rs 75,000 if you stay a year; CTC 13 LPA.',
];

test('held-out: payment asks are red (fresh set)', () => {
  let pass = 0;
  const misses: string[] = [];
  for (const message of TP) {
    const r = scanMessage({ message });
    if (r.verdict === 'red' && paySign(r)) pass++;
    else misses.push(`${r.verdict} ${r.signs.map((s) => s.title).join('/') || 'none'} :: ${message}`);
  }
  assert.equal(misses.join('\n'), '', `held-out TP ${pass}/${TP.length} missed:\n${misses.join('\n')}`);
  assert.ok(TP.length >= 40);
});

test('held-out: traps are not payment asks (fresh set)', () => {
  let pass = 0;
  const misses: string[] = [];
  for (const message of TRAPS) {
    const r = scanMessage({ message });
    const pay = paySign(r);
    const otp = /never ask for PIN, OTP/i.test(message) && r.signs.some((s) => /OTP|bank details/i.test(s.title));
    if (!pay && !otp) pass++;
    else misses.push(`${r.verdict} ${r.signs.map((s) => `${s.title}:${s.match || ''}`).join(' | ')} :: ${message}`);
  }
  assert.equal(misses.join('\n'), '', `held-out traps ${pass}/${TRAPS.length} missed:\n${misses.join('\n')}`);
  assert.ok(TRAPS.length >= 40);
});

test('held-out offer: clear figures fill, ranges and noise stay blank', () => {
  assert.equal(findCtc('Annexure A: annual cost to the company is 14.5 lakhs per annum.'), 1_450_000);
  assert.equal(findCtc('We confirm a CTC of 21 LPA, all inclusive.'), 2_100_000);
  assert.equal(findCtc('Compensation is a CTC band of 9-11 LPA and will be set later.'), null);
  assert.equal(findCtc('Notice buyout equal to 4 LPA may apply. The CTC annexure is not attached.'), null);
  assert.equal(findCtc('Monthly CTC Rs 90,000, so annual CTC is Rs 10,80,000.'), 1_080_000);
  assert.equal(findVariablePct('The variable component is 8% of CTC.'), 8);
  assert.equal(findVariablePct('Variable pay may be as high as 25% depending on the board.'), null);
});
