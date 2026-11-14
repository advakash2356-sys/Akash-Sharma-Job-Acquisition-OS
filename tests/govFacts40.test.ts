// t386u Retest 3 redesign: structured notice facts + "no false hope". Every probe from the three retest reports (r2_v, r2_v3,
// r3_v) as table-driven cases, plus held-out variants that are not in any report, experience-type mismatches and unstated
// requirements. Postings built with S() are sample shapes, not real vacancies. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { govResults, advFromProfile, qualFits } from '../src/lib/gov/filter';
import { eligibilityBadge, matchLabel, profileFit, profileSortKey, compareKeys, relatedFit } from '../src/lib/gov/rank';
import { experienceGate } from '../src/lib/gov/gates';
import { noticeTypeFromPdf, noticeTypeOf, parseNotice, postLevelOf, qualsIn, splitEligibility, titleClass } from '../src/lib/gov/notice';
import { mergeFacts } from '../server/govNoticeRead';
import { eduTagsOf, enrich, RETIREES } from '../server/govPostings';
import { fromS3waas } from '../server/govOfficial';
import type { Profile } from '../src/lib/govJobs';

const T = '2026-11-14';
const base = { cat: 'GEN', pwbd: false, esm: false, gender: 'male', eduSet: true, dob: '1998-03-01', state: 'Uttar Pradesh' } as any;
const P: Record<string, Profile> = {
  lawyer: { ...base, edu: 'grad', spec: 'law', subject: 'BA LLB', bar: true, expYears: 5, expType: ['litigation'] },
  engineer: { ...base, edu: 'eng', spec: 'engineering', subject: 'B.Tech CSE', expYears: 3, expType: ['engineering'] },
  envMSc: { ...base, edu: 'pg', subject: 'MSc Environmental Science', expYears: 2, expType: ['research'] },
  mbbs: { ...base, edu: 'grad', spec: 'medical', subject: 'MBBS', medReg: true, expYears: 2, expType: ['clinical'] },
  ca: { ...base, edu: 'grad', spec: 'finance', subject: 'B.Com, CA', icai: true, expYears: 4, expType: ['audit_accounts'] },
  bsc: { ...base, edu: 'grad', subject: 'B.Sc Chemistry', expYears: 1 },
  twelfth: { ...base, dob: '2006-01-01', edu: '12', expYears: 0 },
};
let n = 0; const S = (title: string, x: any = {}) => ({ id: 'v' + ++n, title, org: 'Govt body', location: '', eligibility: '', state: 'All India', lesserKnown: false, official: true, lastDate: '2026-12-10', pay: '', vacancies: '', level: 'central', eduTags: [], ...x });
const F = { q: '', state: '', lesser: false, official: false, soon: false, deputation: false, sort: 'rank', allLevels: false };
const run = (posts: any[], pr: Profile) => govResults(posts, { ...F, adv: advFromProfile(pr) }, pr, [], T).list;
const DEG = ['lawyer', 'engineer', 'envMSc', 'mbbs', 'ca'];
const shownTo = (p: any, who = DEG) => who.filter((k) => run([p], P[k]).length);

// ---------- Level floor (r2_v A, r3_v A1-A4 + held-out) ----------
const LOW_TITLES = [
  // r2_v A listed + unlisted
  'ड्राइवर पद हेतु विज्ञापन', 'स्वीपर के पद पर भर्ती', 'जमादार भर्ती', 'रसोइया पद हेतु आवेदन', 'गार्ड पद', 'चपरासी के पदों पर भर्ती', 'चौकीदार भर्ती', 'माली पद', 'सफाईकर्मी भर्ती', 'वाहन चालक पद', 'अनुसेवक के पद',
  'भृत्य के पदों पर भर्ती', 'शिपाई पदभरती', 'पहारेकरी पदभरती', 'वाहनचालक पदभरती', 'ड्रायव्हर पदभरती', 'मेहतर पद', 'जलवाहक पद', 'पानीवाला पद', 'हमाल पद', 'खानसामा पद', 'चतुर्थ श्रेणी कर्मचारी भर्ती', 'ग्रुप डी भर्ती',
  'Recruitment of Group D posts', 'Class IV employees recruitment', 'सफाई कामगार', 'स्वच्छताकर्मी भर्ती', 'पहरेदार पद', 'लश्कर पद', 'Multi Purpose Worker', 'Sanitary Worker', 'Waterman', 'Bearer', 'Masalchi', 'Farash', 'Cook-cum-Helper', 'कार्यालय सहायक (चतुर्थ श्रेणी)',
  // r3_v A1 (unseen in earlier rounds)
  'सफाई सेवक के पदों पर भर्ती', 'जल पुरुष (Waterman) पद', 'संदेशवाहक पद हेतु विज्ञापन', 'डाक रनर पद', 'कार्यालय परिचर भर्ती', 'चौकीदार-सह-माली', 'स्वच्छता सहायक भर्ती', 'टेबल बॉय पद', 'कुली पद', 'गेटमैन पद', 'नाइट वॉचमैन', 'बागवान पद', 'रसोई सहायक',
  'शिपाई-नि-चौकीदार पदभरती', 'सेवक पदभरती', 'झाडूवाला पदभरती', 'पट्टेवाला पदभरती', 'स्वयंपाक मदतनीस', 'Office Peon-cum-Messenger', 'Messenger', 'Dak Runner', 'Office Subordinate', 'Night Watchman', 'Kitchen Boy', 'Mazdoor', 'Mess Servant', 'Room Attendant',
  'Gestetner Operator', 'Lift Operator', 'Jamadar (Sanitation)', 'Malee', 'Daftri', 'Record Lifter', 'Chainman',
  // r3_v A4
  'वाहन चालकों की भर्ती', 'चालक (हल्का वाहन)', 'चालक-सह-मैकेनिक', 'वाहनचालक पदभरती',
  // held-out (not in any report)
  'Peon-cum-Chowkidar', 'चपरासी-सह-चौकीदार', 'Kitchen Helper', 'Sanitation Worker', 'Lab Boy', 'Mukaddam', 'Jail Warder', 'Group-D (MTS) posts', 'Class-IV staff', 'स्वच्छक पद', 'सफाईकर्मियों की भर्ती', 'माळी पदभरती', 'Process Server', 'Home Guard Volunteers',
];
test('floor: every low-level title (all reports + held-out) is hidden from degree holders; 12th pass still sees it', () => {
  for (const t of LOW_TITLES) { const p = S(t); assert.deepEqual(shownTo(p), [], t); assert.equal(profileFit(p as any, P.twelfth).belowLevel, false, `${t} / 12th`); }
});
const STRUCT: [string, string, string][] = [['Store Assistant', 'Group C; 10th pass', ''], ['Office Assistant Gr. II', 'Class III post; Matriculation', ''], ['Field Assistant', 'Higher Secondary (12th) pass', 'Pay Level 3'], ['Record Assistant', 'SSC pass', 'Level-2 (Rs 19,900-63,200)'],
  ['सहायक (वर्ग-3)', 'इंटरमीडिएट उत्तीर्ण', 'लेवल 4'], ['सहाय्यक (गट-क)', 'बारावी उत्तीर्ण', ''], ['Technician Grade III', 'ITI (Fitter)', 'Level 2'], ['Junior Clerk', '12th pass with typing 30 wpm', 'Pay Level 2'], ['Support Staff', 'Middle pass', 'Rs 18,000 per month'], ['Library Clerk', 'Group C, Class XII pass', 'Level 4'],
  // held-out
  ['Data Analyst (Junior)', '12th pass', 'Level 4'], ['Laboratory Attendant', '10+2 with Science', 'Level 2'], ['समूह ग सहायक', '12वीं उत्तीर्ण', 'लेवल 3']];
test('floor: structural Group C / Class III / pay 2-5 with a below-graduate minimum is hidden from professionals', () => {
  for (const [t, e, pay] of STRUCT) assert.deepEqual(shownTo(S(t, { eligibility: e, pay })), [], `${t} / ${e}`);
  // Data Analyst (Junior), Level 4, 12th pass is never Related for degree holders (analyst exemption respects level)
  const dj = S('Data Analyst (Junior)', { eligibility: '12th pass', pay: 'Level 4', maxAge: 30 });
  for (const k of [...DEG, 'bsc']) assert.equal(relatedFit(dj as any, P[k], T), null, k);
});
const SHOW: [string, string, string, string][] = [['Laboratory Assistant', 'B.Sc in Chemistry', 'Group C, Pay Level 4', 'bsc'], ['Laboratory Assistant (Environment)', 'B.Sc / M.Sc in Environmental Science', 'Group C, Pay Level 5', 'envMSc'], ['Technical Assistant', 'B.Tech in Computer Science', 'Group C, Pay Level 5', 'engineer'],
  ['Junior Engineer (IT)', 'Diploma or B.Tech in Computer Science', 'Group C, Level 6', 'engineer'], ['Junior Engineer (Computer)', 'Diploma / B.E. Computer Engineering', 'Pay Level 5', 'engineer'], ['Junior Accountant', 'B.Com or CA Inter', 'Group C, Level 5', 'ca'], ['Legal Assistant', 'LLB', 'Group C, Level 5', 'lawyer'],
  ['Research Assistant', 'M.Sc Environmental Science', 'Level 5', 'envMSc'], ['Statistical Assistant', 'Graduate with Statistics', 'Group C, Level 5', 'bsc'], ['Field Officer', 'Matriculation; graduation desirable', 'Level 6', 'bsc'], ['सहायक संचालक (कृषि)', '', 'Level 10', 'bsc'], ['उप संचालक, लोक अभियोजन', 'LLB', 'Level 11', 'lawyer'],
  ['संचालक, पर्यावरण नियोजन', 'M.Sc Environmental Science', 'Level 13', 'envMSc'], ['संचालक मंडल सचिव', '', 'Level 10', 'ca'], ['Indian Coast Guard – Assistant Commandant (General Duty)', 'Graduate', 'Level 10', 'bsc'], ['Guard (Train Manager), Railways', 'Graduate', 'Level 5', 'bsc'],
  ['कामगार कल्याण अधिकारी', 'Graduate', 'Level 8', 'lawyer'], ['Hostel Warden', 'Graduate', 'Level 6', 'bsc'],
  // held-out officer heads containing a low-level word
  ['Security Officer', 'Graduate', 'Level 7', 'bsc'], ['Deputy Commandant (Home Guards)', 'Graduate', 'Level 11', 'bsc'], ['सहायक अभियंता (आईटी)', 'B.E. / B.Tech in Computer Science', 'Level 10', 'engineer'], ['Driving Licence Inspector', 'Graduate', 'Level 6', 'bsc']];
test('floor: officer heads and degree-minimum posts stay visible to the matching degree holder (never hidden on title words)', () => {
  for (const [t, e, pay, who] of SHOW) assert.equal(run([S(t, { eligibility: e, pay })], P[who]).length, 1, `${t} / ${who}`);
  for (const t of ['सहायक संचालक (मत्स्य)', 'संयुक्त संचालक, अभियोजन', 'संचालक मंडल सदस्य', 'परिचालन प्रबंधक', 'स्टाफ नर्स (परिचारिका)']) assert.equal(titleClass(t) === 'support', false, t);
  // Pharmacist (D.Pharm / B.Pharm) is hidden for an MBBS by design: the notice's essential degree is pharmacy, which the profile does not hold.
  assert.equal(run([S('Pharmacist', { eligibility: 'D.Pharm / B.Pharm', pay: 'Level 5' })], P.mbbs).length, 0);
});

// ---------- Qualification facts and the CA override (r2_v B, r3_v B + held-out) ----------
const CA_CASES: [string, 'ok' | 'not'][] = [['CA / MBA Finance', 'ok'], ['CA or MBA (Finance)', 'ok'], ['Chartered Accountant / MBA (Finance) / PGDM (Finance)', 'ok'], ['CA/ICWA/MBA', 'ok'], ['MBA (Finance) or CA', 'ok'], ['CA / CMA / M.Com', 'ok'], ['Post Graduate in Commerce or CA', 'ok'],
  ['M.Com or CA with 3 years experience', 'ok'], ['Qualified CA. MBA Finance preferred.', 'ok'], ['MBA Finance only', 'not'], ['CA (Inter) / M.Com', 'not'],
  ['C.A. / MBA (Finance)', 'ok'], ['Chartered Accountant or MBA Finance', 'ok'], ['MBA (Finance) / ICWA / CA', 'ok'], ['ICAI member or MBA (Fin)', 'ok'], ['MBA (Finance) with 2 yrs', 'not'], ['M.Com / MBA Finance', 'not'], ['CA Inter / MBA', 'not'], ['PGDM Finance or CA-Final pass', 'ok'], ['Post-graduate degree in Finance', 'not'],
  // held-out
  ['Fellow member of ICAI (FCA)', 'ok'], ['CA Foundation / MBA', 'not'], ['MBA (Finance); CA is an added advantage', 'not'], ['Chartered Accountancy (ICAI) or Cost Accountant', 'ok']];
test('CA override fires only when the ESSENTIAL text names CA / ICAI exactly (MBA, M.Com, CA Inter, PG Finance do not count)', () => {
  for (const [e, want] of CA_CASES) {
    const p = S('Finance Manager', { eligibility: e, eduTags: eduTagsOf(e), pay: 'Level 10', maxAge: 40 }); const b = eligibilityBadge(p as any, P.ca, T); const txt = [...b.why, ...b.checks].join(' ');
    if (want === 'ok') { assert.notEqual(b.badge, 'maynot', e); assert.doesNotMatch(txt, /higher qualification/, e); }
    else { assert.ok(b.badge === 'maynot' || /higher qualification/.test(txt), `${e}: ${b.badge} ${txt}`); assert.notEqual(b.badge, 'likely', e); }
  }
});
test('degree tokens tolerate punctuation and the essential degree is never dropped', () => {
  for (const [t, q] of [['LL.B.', 'LLB'], ['L.L.B', 'LLB'], ['LL. B', 'LLB'], ['M.B.B.S.', 'MBBS'], ['M.B.B.S', 'MBBS'], ['B.E.', 'BE'], ['B. Tech', 'BE'], ['B.Tech.', 'BE'], ['M.Sc.', 'MSC'], ['B.Com', 'BCOM'], ['Ph.D.', 'PHD'], ['LL.M.', 'LLM']] as const)
    assert.ok(qualsIn(t).includes(q as any), t);
  const f = parseNotice({ title: 'Medical Officer', eligibility: 'MBBS with MPH preferred' }); assert.deepEqual(f.essential, ['MBBS']); assert.deepEqual(f.preferred, ['MPH']);
  assert.deepEqual(parseNotice({ title: 'X', eligibility: 'M.B.B.S. (MD desirable)' }).essential, ['MBBS']);
  assert.equal(parseNotice({ title: 'X', eligibility: 'Matriculation with ITI; knowledge of Hindi at matric level' }).minEdu, 1);
  assert.equal(parseNotice({ title: 'X', eligibility: 'Graduate; Hindi at matriculation level' }).minEdu, 3);
  assert.equal(parseNotice({ title: 'X', eligibility: 'Graduate with MBA' }).minEdu, 4);
  assert.equal(parseNotice({ title: 'X', eligibility: 'Diploma or B.Tech in Civil' }).minEdu, 2);
});

// ---------- Preferred phrasing (r2_v C, r2 M3, r3_v C + held-out) ----------
const SOFT = ['Masters in any discipline. LLB would be an asset.', 'Masters in any discipline; LLB holders shall be given priority', 'Masters in any discipline, LLB (optional)', 'Masters in any discipline. Law graduate (LL.B.) preferred.', 'Masters in any discipline, ideally with an LLB', 'Masters in any discipline. An LLB is a plus.',
  'Masters in any discipline; additional qualification in law will be an added qualification', 'Masters in any discipline. Preferably LLB.', 'Masters in any discipline, LLB preferable', 'Masters in any discipline. Candidates with LLB will get preference.',
  'Graduate. Preference will be given to LLB holders.', 'Graduate; LLB holders will be given weightage', 'Graduate, preferably LLB', 'Graduate, LLB is an added advantage', 'Graduate; LLB desirable but not essential', 'Graduate (LLB desirable)', 'Graduate\nDesirable: LLB',
  'Masters in Public Policy. LLB preferred.', 'Masters in Public Policy (LLB desirable)', 'Masters in Public Policy; LLB will be an added advantage', 'Masters in Public Policy, LLB holders will be given weightage', 'Essential: Masters in Public Policy\nDesirable: LLB',
  // held-out
  'Any graduate; a law degree will be an advantage', 'Graduate in any discipline. Desirable: LL.B.', 'Graduate; LL.B. (preferable)', 'Post graduate; LLB holders get priority'];
const HARD = ['LLB with 3 years experience, PSU experience preferred', 'LLB with 3 years experience; PSU experience preferred', 'LLB with 3 years experience. PSU experience preferred.', 'Degree in Law with preference for PSU experience', 'LL.B. from a recognised university, preferably with 3 years practice',
  'Bachelor of Laws (desirable: LLM)', 'Essential: LLB. Desirable: experience in PSU, knowledge of arbitration', 'LLB (3 years / 5 years) with experience in litigation desirable', 'Graduate in Law; advocates with High Court practice will be given weightage',
  'Degree in Law (LLB) with 3 years experience, experience in a PSU preferred', 'Essential: LLB with 3 years experience, Desirable: PSU experience', 'LLB with 3 years post-qualification experience; candidates from PSUs preferred',
  // held-out
  'L.L.B. with 2 years experience; LLM shall be an added advantage', 'Law graduate (LL.B.); corporate experience is a plus'];
test('preferred markers govern only their phrase: soft LLB never makes a post exact; required LLB always does', () => {
  for (const e of SOFT) assert.equal(profileFit(S('Consultant (Grade II)', { eligibility: e, pay: 'Level 10', maxAge: 40 }) as any, P.lawyer).field, false, e);
  for (const e of HARD) assert.equal(profileFit(S('Manager (Grade A)', { eligibility: e, pay: 'Level 11', maxAge: 40 }) as any, P.lawyer).field, true, e);
  assert.equal(splitEligibility('Degree in Law (LLB) with 3 years experience, experience in a PSU preferred').essential, 'Degree in Law (LLB) with 3 years experience');
});
test('ordering: every exact match ranks before every Related fit, and Related before the rest', () => {
  const law = [S('Law Officer', { eligibility: 'LLB', pay: 'Level 10', maxAge: 40 }), S('Compliance Officer', { eligibility: 'Graduate; LLB (desirable)', pay: 'Level 10', maxAge: 35 }), S('Manager (Grade A)', { eligibility: HARD[9], pay: 'Level 11', maxAge: 35 }),
    S('Assistant Manager', { eligibility: HARD[11], pay: 'Level 10', maxAge: 35 }), S('Legal Analyst', { eligibility: 'LLB', maxAge: 40 }), S('Data Analyst', { eligibility: 'Graduate in any discipline', pay: 'Level 8', maxAge: 40 }),
    S('Policy Consultant', { eligibility: 'Graduate in any discipline. LLB preferred.', pay: 'Rs 1,00,000 per month', maxAge: 45 }), S('Assistant Director (Tourism)', { eligibility: 'Graduate', pay: 'Level 10' })];
  const kinds = run(law, P.lawyer).map((p: any) => profileFit(p, P.lawyer).field ? 0 : matchLabel(p, P.lawyer, T).label === 'related' ? 1 : 2);
  assert.deepEqual(kinds, [...kinds].sort()); assert.ok(kinds.includes(1)); assert.equal(kinds.filter((k) => k === 0).length, 4);
});

// ---------- Notice type (r2_v D, r3_v D, r_v + held-out) ----------
const site = { host: 'x.dcourts.gov.in', org: 'District & Sessions Court, X', state: 'Uttar Pradesh', city: 'X' };
const row = (t: string) => `<tr><td>${t}</td><td></td><td>10/11/2026</td><td>30/11/2026</td><td><a href="https://cdn.s3waas.gov.in/a.pdf">pdf</a></td></tr>`;
const keptRows = (ts: string[]) => fromS3waas(`data-table-1<table>${ts.map(row).join('')}</table>`, site, T).filter((p) => enrich(p, '') !== null).map((p) => p.title);
const DROP = ['Hall-Tickets for Typist posts', 'Admit-Card for Stenographer exam', 'Call-Letter for interview of Process Server', 'Answer-Key of written test', 'Engagement of Retd. employees on contract basis', 'Engagement of Retd Govt officers as Consultant', 'Applications invited from pensioners for engagement',
  'Engagement of superannuated officials', 'सेवानिवृत्त कर्मचारियों की संविदा पर नियुक्ति हेतु विज्ञापन', 'सेवा निवृत्त कर्मचारियों की नियुक्ति', 'रिटायर्ड कर्मचारियों की नियुक्ति', 'Retired Judges as Mediators – empanelment',
  'Engagement of Retired Bank Officers as Recovery Agents – applications invited', 'Advertisement: Retired Teachers as Guest Faculty', 'Advertisement for hiring former Government employees as Consultants', 'सेवा-निवृत्त कर्मचारियों की संविदा नियुक्ति हेतु विज्ञापन', 'Advertisement for empanelment of superannuated Judicial Officers as Arbitrators',
  'सेवानिवृत्त शिक्षकों की अतिथि शिक्षक के रूप में नियुक्ति हेतु विज्ञापन', 'Applications invited from retired CAPF personnel for Security Supervisor', 'Recruitment of Clerk – List of applicants', 'Recruitment of Driver – list of candidates called for interview', 'Recruitment of Stenographer – Roll numbers allotted',
  'Recruitment of Copyist – Date of examination', 'Recruitment of Peon – Exam schedule', 'Recruitment of Process Server – Status of applications', 'Recruitment of Typist – Notice regarding skill test', 'Recruitment of LDC – Final select list', 'Recruitment of Driver – Result of driving test', 'Recruitment of Clerk 2025 – Joining report',
  'Recruitment of Orderly – Notice regarding document verification', 'HALL TICKET for the post of Junior Assistant - Notification 01/2026', 'Download Admit Cards for recruitment of Stenographer', 'Call Letters for interview - recruitment notice', 'Recruitment notice: re-employment of retired judicial officers',
  // live rows from retest 3 (Arrah UDC appointment letter; Lakhisarai retired supportive staff; Kurnool retired typists)
  'Appointment letter of selected candidates for the post of Upper Division Clerk', 'Engagement of retired employees as supportive staff in the Evening Court', 'Applications invited from Ministerial Officers who retired as Typist-cum-Assistant',
  // held-out
  'Recruitment of Copyist – List of shortlisted candidates', 'Recruitment of Peon – Interview schedule', 'Recruitment of Driver – provisional select list', 'Recruitment of Clerk – appointment order', 'Engagement of ex-employees of the Judicial Department', 'सेवानिवृत्त अधिकारियों की नियुक्ति'];
const KEEP = ['Recruitment of Stenographer Grade III', 'Recruitment of Process Server on contract basis', 'Recruitment of Ex-Servicemen pensioners as Security Guards', 'Advertisement for Pension Assistant (Group C)', 'Advertisement for Accounts Officer (Pension Disbursement)', 'Advertisement for Peon. Age: 18-40; superannuation at 60.',
  'Advertisement for Junior Assistant (retired persons need not apply)', 'Advertisement for Superintendent (Pensions)', 'Recruitment of Law Clerk (fresh law graduates)', 'भूतपूर्व सैनिकों की चौकीदार पद पर भर्ती हेतु विज्ञापन', 'Advertisement for Driver; pensioners of State Govt may also apply',
  'Recruitment of Ex-Servicemen as Security Guards', 'Advertisement for Law Clerk (fresh law graduates)', 'Recruitment of Junior Assistant (applicants should not be retired from service)', 'Engagement of Pension Assistant / Pension Clerk',
  // held-out
  'Applications are invited for the post of Typist', 'Recruitment of Stenographer Grade-II (English) – advertisement', 'Advertisement for Ex-Army drivers'];
test('notice type: lists, interview calls, roll numbers, schedules, status, appointment letters and retired-only notices are not open calls', () => {
  const kept = keptRows([...DROP, ...KEEP]);
  for (const t of DROP) assert.ok(!kept.includes(t), `should drop: ${t}`);
  for (const t of KEEP) assert.ok(kept.includes(t), `should keep: ${t}`);
  assert.equal(noticeTypeOf('Recruitment of Clerk – List of applicants'), 'result_list'); assert.equal(noticeTypeOf('Recruitment of Peon – Exam schedule'), 'admit_schedule');
  assert.equal(noticeTypeOf('Appointment letter UDC'), 'appointment'); assert.equal(noticeTypeOf('Recruitment of Stenographer Grade III'), 'open_call'); assert.equal(RETIREES.test('Engagement of Retd. employees'), true);
});
test('notice PDF text: retired-only and appointment notices are caught from the official PDF (Lakhisarai, Kurnool text layers)', () => {
  assert.equal(noticeTypeFromPdf('{NOTICE INVITING APPLICATIONS FOR ENGAGEMENT OF SUPPORTIVE STAFF IN THE EVENING COURT} Applications are hereby invited from eligible retired employees of the Judgeship'), 'retiree_only');
  assert.equal(noticeTypeFromPdf('NOTIFICATION NO: 01/2026 DLSA KNL Applications are invited in the prescribed proforma from the Ministerial Officers who retired as Typist-cum-Assistant'), 'retiree_only');
  assert.equal(noticeTypeFromPdf('The following candidates selected for appointment to the post of UDC shall collect their appointment letters'), 'appointment');
  assert.equal(noticeTypeFromPdf('EMPLOYMENT NOTICE Applications are invited for the post of Clerk. Retired employees are not eligible.'), null);
  assert.equal(noticeTypeFromPdf(''), null, 'a scanned PDF has no text layer: Gemini (existing key) or nothing');
});
test('Gemini merge: the model can only mark a row not-open or fill empty fields; it never reopens a rules verdict', () => {
  const rules = parseNotice({ title: 'Recruitment of Upper Division Clerk', eligibility: 'Qualification as stated in the official notice.' });
  const g = { noticeType: 'appointment', essentialQualification: 'Graduate', preferredQualification: '', minEducationLevel: 3, group: 'C', payLevel: 4, isOfficer: false, experienceYears: -1, experienceType: '', licences: [], ageMin: 18, ageMax: 37 } as any;
  const m = mergeFacts(rules, g, null); assert.equal(m.noticeType, 'appointment'); assert.equal(m.source, 'gemini'); assert.equal(m.minEdu, 3); assert.equal(m.ageMax, 37); assert.equal(m.group, 'C');
  const closed = { ...rules, noticeType: 'result_list' as const }; assert.equal(mergeFacts(closed, { ...g, noticeType: 'open_call' }, null).noticeType, 'result_list');
  const stated = parseNotice({ title: 'Clerk', eligibility: '12th pass; age 18-27 years' }); const m2 = mergeFacts(stated, { ...g, noticeType: 'open_call' }, null); assert.equal(m2.minEdu, 2); assert.equal(m2.ageMax, 27);
  assert.equal(mergeFacts(rules, null, 'retiree_only').noticeType, 'retiree_only');
});

// ---------- Analyst rule and Related reasons (r2_v E, r3_v E, F, G) ----------
test('analyst rule: Related fit per profile, with a concrete reason tying the notice to the degree and experience', () => {
  const AN = ['GIS Analyst', 'Credit Analyst', 'Business Analyst', 'Market Analyst', 'Security Analyst', 'Investment Analyst', 'Water Quality Analyst', 'Policy Analyst', 'Data Analyst', 'Systems Analyst', 'Legal Analyst', 'Chemical Analyst'];
  const rel = (k: string) => run(AN.map((t) => S(t, { eligibility: 'Graduate in any discipline', pay: 'Level 8', maxAge: 40 })), P[k]).filter((p: any) => matchLabel(p, P[k], T).label === 'related').map((p: any) => p.title);
  const law = rel('lawyer'); for (const t of ['Data Analyst', 'Policy Analyst']) assert.ok(law.includes(t), t); for (const t of ['GIS Analyst', 'Credit Analyst', 'Chemical Analyst']) assert.ok(!law.includes(t), t);
  const ca = rel('ca'); for (const t of ['Credit Analyst', 'Investment Analyst', 'Data Analyst']) assert.ok(ca.includes(t), t); assert.ok(!ca.includes('GIS Analyst'));
  const env = rel('envMSc'); for (const t of ['GIS Analyst', 'Water Quality Analyst', 'Data Analyst', 'Policy Analyst']) assert.ok(env.includes(t), t);
  const eng = rel('engineer'); for (const t of ['Systems Analyst', 'Data Analyst']) assert.ok(eng.includes(t), t); assert.ok(!eng.includes('Credit Analyst'));
  const r = relatedFit(S('Data Analyst', { eligibility: 'Graduate in any discipline', pay: 'Level 8', maxAge: 40 }) as any, P.lawyer, T)!;
  assert.match(r, /^Related fit: the notice asks for graduate degree in any discipline; your BA LLB and 5 yrs of litigation \/ court practice experience meet it\. Analyst posts use the analytical and research skills of your Law degree\.$/);
});
test('discovery: broader Related roles for a lawyer, a CA, an MBBS and an engineer, each only when every essential is met', () => {
  const cases: [string, string, string][] = [['lawyer', 'Labour Welfare Officer', 'Graduate'], ['lawyer', 'Protection Officer (DV Act)', 'Graduate'], ['lawyer', 'Assistant Registrar', 'Graduate'], ['lawyer', 'Land Acquisition Officer', 'Graduate'], ['lawyer', 'Enforcement Officer (EPFO)', 'Graduate'],
    ['ca', 'Bank Officer (Credit)', 'Graduate'], ['ca', 'GST Inspector', 'Graduate'], ['mbbs', 'Hospital Administrator', 'Graduate'], ['mbbs', 'Drug Safety Associate', 'Graduate'], ['engineer', 'IT Officer', 'Graduate'], ['engineer', 'Energy Auditor', 'Graduate'], ['envMSc', 'Disaster Management Officer', 'Graduate'], ['envMSc', 'Junior Scientific Officer', 'Graduate']];
  for (const [k, t, e] of cases) { const p = S(t, { eligibility: e, pay: 'Level 8', maxAge: 40 }); const m = matchLabel(p as any, P[k], T); assert.equal(m.label, 'related', `${t} / ${k}: ${m.why[0]}`); assert.match(m.why[0], /^Related fit: the notice asks for .+; your .+ meets? it\. [A-Z]/, t); }
});
test('Env Sci: subject-exact posts rank above Related posts (r3_v F)', () => {
  const env = [S('Policy Consultant', { eligibility: 'Masters degree', pay: 'Rs 80,000 per month', maxAge: 40 }), S('GIS Analyst', { eligibility: 'Masters in any discipline', pay: 'Level 8', maxAge: 40 }), S('Environmental Officer', { eligibility: 'M.Sc Environmental Science', pay: 'Level 7', maxAge: 40 }),
    S('Assistant Environmental Engineer', { eligibility: 'B.E. Environmental / M.Sc Environmental Science', pay: 'Level 8', maxAge: 40 }), S('Scientist B', { eligibility: 'M.Sc in Environmental Sciences / Ecology', pay: 'Level 10', maxAge: 35 }), S('Research Associate', { eligibility: 'PG in Science', pay: 'Rs 58,000 per month', maxAge: 40 }), S('Pollution Control Officer', { eligibility: 'Masters in Environmental Science or Chemistry', pay: 'Level 8', maxAge: 40 })];
  const labels = run(env, P.envMSc).map((p: any) => matchLabel(p, P.envMSc, T).label); const firstRel = labels.indexOf('related'); assert.ok(firstRel > 0); assert.ok(labels.slice(firstRel).every((l) => l === 'related'));
});
test('12th pass: a small Related list at their own level only (r3_v G)', () => {
  const G: [any, boolean][] = [[S('Lower Division Clerk', { eligibility: '12th pass', pay: 'Level 2' }), true], [S('Data Entry Operator', { eligibility: '12th pass', pay: 'Rs 20,000 per month' }), true], [S('Junior Court Assistant', { eligibility: '12th pass', pay: 'Level 4' }), true],
    [S('Clerk (Grade A) Level 7', { eligibility: '12th pass', pay: 'Level 7' }), false], [S('Senior Clerk', { eligibility: '12th pass', pay: 'Level 6' }), false], [S('Upper Division Clerk', { eligibility: 'Graduate', pay: 'Level 4' }), false], [S('Stenographer Grade D', { eligibility: '12th pass + steno', pay: 'Level 4' }), true],
    [S('Computer Operator', { eligibility: '12th with DCA', pay: 'Rs 36,000 per month' }), false], [S('Assistant Section Officer', { eligibility: '12th pass' }), false], [S('टंकक', { eligibility: 'इंटरमीडिएट', pay: 'लेवल 3' }), true]];
  for (const [p, want] of G) assert.equal(!!relatedFit({ ...p, maxAge: 30 }, P.twelfth, T), want, p.title);
  assert.equal(run([S('Upper Division Clerk', { eligibility: 'Graduate', pay: 'Level 4', maxAge: 30 })], P.twelfth).length, 0, 'a graduate-minimum post is hidden for 12th pass (stated essential not met)');
});

// ---------- No false hope: experience type, unstated requirements ----------
const EXP_CASES: [string, string, Partial<Profile>, 'met' | 'check' | 'fail', RegExp?][] = [
  ['Higher Judicial Service (direct from Bar)', 'LLB; 7 years practice as an advocate', { expYears: 8, expType: ['corporate_legal'] }, 'check', /7 yrs litigation practice required; your profile shows corporate legal/],
  ['Higher Judicial Service (direct from Bar)', 'LLB; 7 years practice as an advocate', { expYears: 8, expType: ['litigation'] }, 'met'],
  ['Higher Judicial Service (direct from Bar)', 'LLB; 7 years practice as an advocate', { expYears: 6, expType: ['litigation'] }, 'fail', /Needs 7 years' litigation practice; you have 6/],
  ['Higher Judicial Service (direct from Bar)', 'LLB; 7 years practice as an advocate', { expYears: undefined, expType: ['litigation'] }, 'check', /7 yrs litigation practice required/],
  ['Legal Advisor', 'LLB with 5 years experience in drafting of contracts and agreements', { expYears: 6, expType: ['litigation'] }, 'check', /5 yrs corporate legal experience required; your profile shows litigation/],
  ['Medical Officer (NHM)', 'MBBS with 3 years experience in public health programmes', { expYears: 4, expType: ['clinical'] }, 'check', /3 yrs public health experience required; your profile shows clinical/],
  ['Medical Officer', 'MBBS; 2 years clinical experience in a hospital', { expYears: 3, expType: ['clinical'] }, 'met'],
  ['Assistant Professor (Law)', 'LLM with NET; 3 years teaching experience', { expYears: 5, expType: ['litigation'] }, 'check', /3 yrs teaching experience required/],
  ['Accounts Officer', 'CA with 3 years audit experience', { expYears: 4, expType: ['audit_accounts'] }, 'met'],
  ['Law Officer', 'LLB with 3 years experience', { expYears: 4, expType: [] }, 'met'],
  ['Law Officer', 'LLB with 3 years experience', { expYears: 2 }, 'fail'],
  ['Public Prosecutor', 'LLB; 7 years practice as an advocate', { expYears: 9, expType: ['judicial'] }, 'check', /7 yrs litigation practice required; your profile shows judicial/],
];
test('no false hope: experience years AND type; a type the profile does not show is Check notice naming the clause, never Eligible', () => {
  for (const [t, e, extra, want, re] of EXP_CASES) {
    const p = S(t, { eligibility: e, maxAge: 45, pay: 'Level 10' }); const pr = { ...P.lawyer, ...(/medical/i.test(t) ? P.mbbs : /accounts/i.test(t) ? P.ca : {}), ...extra, subject: /Professor/.test(t) ? 'BA LLB, LLM, NET' : /medical/i.test(t) ? 'MBBS' : /accounts/i.test(t) ? 'B.Com, CA' : 'BA LLB', edu: /Professor/.test(t) ? 'pg' : 'grad' } as Profile;
    const g = experienceGate(p as any, pr); const m = matchLabel(p as any, pr, T);
    if (want === 'met') { assert.equal(g.ok, true, t); assert.ok(['strong', 'eligible', 'related'].includes(m.label), `${t}: ${m.label} ${m.why.join(' ')}`); }
    if (want === 'check') { assert.equal(g.ok, null, t); assert.equal(m.label, 'check', t); assert.match(m.why.join(' '), re!, t); assert.equal(run([p], pr).length, 1, `${t} stays visible`); }
    if (want === 'fail') { assert.equal(g.ok, false, t); assert.equal(run([p], pr).length, 0, `${t} hidden`); if (re) assert.match(m.why.join(' '), re, t);
      assert.equal(govResults([p], { ...F, allLevels: true }, pr, [], T).list.length, 1, `${t} shown under Show all levels`); }
  }
});
test('no false hope: an unstated essential (qualification, age, licence answer, DOB) is Check notice naming it, never Strong / Eligible / Related', () => {
  const lo = (x: any) => S('Law Officer', { pay: 'Level 10', ...x });
  const cases: [any, Partial<Profile>, RegExp][] = [
    [lo({ eligibility: '', maxAge: 40 }), {}, /essential qualification is not in the feed text/],
    [lo({ eligibility: 'LLB' }), {}, /the age limit \(not in the feed text\)/],
    [lo({ eligibility: 'LLB; enrolled as an advocate', maxAge: 40 }), { bar: undefined }, /Bar Council enrolment required/],
    [lo({ eligibility: 'LLB', maxAge: 40 }), { dob: '' }, /date of birth/],
    [S('Compliance Officer', { eligibility: 'Graduate', pay: 'Level 10' }), {}, /Adjacent role \(compliance\).*the age limit/],
    [S('Data Analyst', { eligibility: '', pay: 'Level 8', maxAge: 40 }), {}, /essential qualification/],
  ];
  for (const [p, extra, re] of cases) { const pr = { ...P.lawyer, ...extra } as Profile; const m = matchLabel(p, pr, T); assert.equal(m.label, 'check', p.title); assert.match(m.why.join(' '), re, p.title); assert.equal(run([p], pr).length, 1, 'unknowns never hide'); assert.equal(qualFits(p, pr) === false, false); }
  // a stated condition that clearly fails is hidden, with the reason under "Show all levels"
  const old = S('Law Officer', { eligibility: 'LLB', pay: 'Level 10', maxAge: 25 }); assert.equal(run([old], P.lawyer).length, 0); assert.match(matchLabel(old, P.lawyer, T).why.join(' '), /May not qualify.*stated limit 25/);
  const mo = S('Medical Officer', { eligibility: 'MBBS', pay: 'Level 10', maxAge: 40 }); assert.equal(run([mo], P.lawyer).length, 0, 'lawyer never sees a Medical Officer post');
});
test('postLevel uses fields first: group, pay level and minimum education, then the whole-title class', () => {
  const lv = (title: string, eligibility = '', pay = '') => postLevelOf(parseNotice({ title, eligibility, pay }));
  assert.equal(lv('Assistant', 'Graduate', 'Group D'), 'support'); assert.equal(lv('Assistant', '', 'Pay Level 1'), 'support'); assert.equal(lv('Assistant', '10th pass'), 'support');
  assert.equal(lv('Assistant', '12th pass'), 'subgrad'); assert.equal(lv('Assistant', 'Graduate'), 'grad'); assert.equal(lv('Assistant'), null, 'unknown stays visible');
  assert.equal(lv('Coast Guard Assistant Commandant'), 'officer'); assert.equal(lv('Guard (Train Manager)'), 'officer'); assert.equal(lv('कामगार कल्याण अधिकारी'), 'officer'); assert.equal(lv('Data Analyst (Junior)', '12th pass', 'Level 4'), 'subgrad');
});
