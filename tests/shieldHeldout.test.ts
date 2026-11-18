// Fresh held-out set for retest-2. New wording, not from prior reports or earlier PR tests. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanMessage } from '../src/lib/scamShield';
import { findCtc, findVariablePct } from '../src/lib/offerShield';

const paySign = (r: ReturnType<typeof scanMessage>) =>
  r.signs.find((s) => s.title === 'Asks you to pay' || s.title === 'Asks for a payment' || s.title === 'Mentions a fee');

const TP = [
  'PhonePe pe 1350 bhej do pehle, tabhi call schedule hoga.',
  'GPay par 4.1k transfer karo laptop security ke liye.',
  'UPI id pe 2650 jama karna padega slot book karne ko.',
  'Send 780 rs on Paytm to reserve the induction seat.',
  'Please do an IMPS of 8200 as a caution deposit before Monday.',
  'Transfer 1.7k INR as attestation charges to the coordinator now.',
  'Pay rupees nineteen hundred as a registration amount today.',
  'This is a paid service of rupees thirteen hundred to move your file.',
  'Form charges of 640 inr, they said refundable after the written test.',
  'WhatsApp: 2950 jama karo training start hone se pehle.',
  'NEFT of 4700 for the uniform set is due before you report.',
  'Scan the QR and pay 1425 for document verification.',
  'Google Pay pe 2.3k bhejo warna interview cancel ho jayega.',
  'Deposit 6100 rupees now; they claim it is refundable if you fail.',
  'Training charges 7350 rs deni hogi before module one.',
  'Booking amount of Rs 875 via UPI, pay to confirm the meeting.',
  'Badge fee 520 inr must be paid before campus entry.',
  'Monitor deposit 8800 INR, they asked for Paytm only.',
  'Joining amount 1450 bhej dena to the mobile number in the mail.',
  'Plz 2050 bhejo on PhonePe for the form, then they will call.',
  'Interview ke liye 980 jama karo, later adjust kar denge.',
  'Fees 4150 lagegi, GPay pe bhej dena by Thursday.',
  'Refundable amount of sixteen hundred rupees for file processing.',
  'Paytm pe 6.5k bhejna hoga toolkit ke liye, QR already sent.',
  'Bank transfer 3320 for processing has to go today itself.',
  'QR se 1680 pay karo, they named it a joining charge.',
  'Rupees two thousand two hundred as security, send it on Paytm.',
  'Enrollment amount 1175 inr before they join the video call.',
  'Jama karein 2550 rs the training wallet mein, chat pe details hain.',
  'Send 730 via NEFT as form charges to freeze the application.',
  'Paid service of Rs 1950 to circulate the profile to clients.',
  'Bhej do 1260 Paytm pe, they promised a refund after the test.',
  'Office aane se pehle 3.8k rs deposit dena hoga at reception.',
  'UPI 3050 for police-verification charges, pay first.',
  'Pay one thousand four hundred as onboarding charges today.',
  'PhonePe: 7700 device security, refundable after two months they say.',
  'GPay par 960 bhejo slot lock karne ke liye.',
  'Charges of 5380 inr for the safety kit must be paid first.',
  'IMPS 2210 jama karo the office wallet mein before briefing.',
  'Transfer karo 1550, they called it a paid service for shortlisting.',
  'Registration fee of ₹3.4k via UPI to schedule the screening.',
  'Please pay a processing amount of 1875 inr and share the receipt.',
];

const TRAPS = [
  'Internship stipend is Rs 22,000 a month. There are no charges of any kind.',
  'We do not charge any induction fee. CTC is Rs 8,25,000.',
  'The firm reimburses workshop fees up to Rs 18,000 each year after joining.',
  'Share a PhonePe number only so travel can be reimbursed after the drive.',
  'Please share UPI so payroll can credit your salary. Package 12 LPA. No fee.',
  'We never ask applicants to pay a joining fee or a caution deposit. CTC 15 LPA.',
  'We never request a PIN, OTP or a caution deposit. The offer is 7.5 LPA.',
  'A fee waiver is in place for the internal diploma. CTC will be Rs 10,50,000.',
  'RBI Grade B official notification lists an examination fee of Rs 850 payable to the Board.',
  'My university tuition was Rs 1,80,000. I am applying as an associate at CTC 8 LPA.',
  'I paid a semester fee of Rs 70,000 last year during my articleship.',
  'Once posted, you may still pay the official SSC examination fee to the Commission.',
  'This is a paid internship with a stipend of Rs 18,000. No deposit is asked.',
  'ESOP worth Rs 1,50,000 vests over four years. Applicants are never charged.',
  'Shift allowance is Rs 6,500. Training is given free of any cost.',
  'Professional tax of Rs 2,500 comes out of salary. There are no hidden charges.',
  'Cab fare is refunded and paid by the company after the site visit.',
  'A joining bonus of Rs 40,000 is repayable if you resign within a year.',
  'We will pay a retention bonus of Rs 1,50,000; repayable if you leave early.',
  'The salary range is ₹7-11 LPA. Can you share two slots next week?',
  'There is no processing fee and no toolkit deposit on this offer.',
  'The licence exam is employer-paid; the company will pay the fee of Rs 4,500.',
  'Only PF and professional tax are deducted. CTC is Rs 7,25,000.',
  'Do not pay anyone who calls for money. The official hiring process is free of cost.',
  'Do not transfer funds to a personal UPI. This desk never charges candidates.',
  'Classroom training is provided free of any cost. CTC is 14 LPA.',
  'We do not take any caution deposit from joiners. Package is 17 LPA.',
  'Relocation is reimbursed up to Rs 28,000 after you join.',
  'Share your account only for salary credit. No payment is asked of you.',
  'Official CAT brochure: examination fee Rs 2,400 is payable to the organising IIT.',
  'Education history: hostel fee was Rs 38,000 at college last year.',
  'This is not a paid service. Screens are free. CTC is 9.25 LPA.',
  'We will credit your UPI for the cab refund after the campus drive.',
  'We never require a deposit or fee from applicants. This is a 13 LPA role.',
  'Variable pay may be as high as 18%. Fixed CTC is 11 LPA. No charges.',
  'Group medical premium is paid by the company under a Rs 15,000 cover.',
  'Notice buyout is discretionary. CTC is 19 LPA. No candidate fee.',
  'We do not collect any background-check charges. Salary is 48,000 a month.',
  'Ignore chats asking for a PhonePe payment. We never charge to hire.',
  'In the increment letter, last increment was Rs 35,000. There is no fee to apply.',
  'Please visit on Wednesday. We do not charge any attestation fee. CTC Rs 9,50,000.',
  'The letter includes a refundable joining bonus of Rs 60,000 if you stay a year; CTC 14 LPA.',
];

test('held-out: payment asks are red (retest-2 set)', () => {
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

test('held-out: traps are not payment asks (retest-2 set)', () => {
  let pass = 0;
  const misses: string[] = [];
  for (const message of TRAPS) {
    const r = scanMessage({ message });
    const pay = paySign(r);
    const otp = /never request a PIN, OTP/i.test(message) && r.signs.some((s) => /OTP|bank details/i.test(s.title));
    if (!pay && !otp) pass++;
    else misses.push(`${r.verdict} ${r.signs.map((s) => `${s.title}:${s.match || ''}`).join(' | ')} :: ${message}`);
  }
  assert.equal(misses.join('\n'), '', `held-out traps ${pass}/${TRAPS.length} missed:\n${misses.join('\n')}`);
  assert.ok(TRAPS.length >= 40);
});

test('held-out offer: conflicts stay blank; clear and labelled figures fill', () => {
  assert.equal(findCtc('Schedule I quotes CTC 16 LPA. The covering note quotes CTC of Rs 13,50,000. Kindly confirm the correct number.'), null);
  assert.equal(findCtc('We record a C.T.C. of 8.4 lacs for the listed role.'), 840_000);
  assert.equal(findCtc('Monthly CTC of Rs 70,000 × 12 = Rs 8,40,000 is your annual CTC.'), 840_000);
  assert.equal(findCtc('Basic pay is 7 LPA and CTC is 10 LPA.'), 1_000_000);
  assert.equal(findCtc('Compensation is a CTC band of 8-10 LPA to be set later.'), null);
  assert.equal(findVariablePct('The variable component is 11% of CTC.'), 11);
  assert.equal(findVariablePct('Variable pay may be as high as 22% depending on the board.'), null);
});
