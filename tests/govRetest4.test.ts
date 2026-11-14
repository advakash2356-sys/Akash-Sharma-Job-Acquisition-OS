// Retest 4 (NO-GO at 4ecfd78): every r4 probe as table-driven cases, plus held-out variants not in the report.
// Open calls need positive evidence; strict experience kinds; a soft-preferred lexicon; age alone never downgrades; low-level
// title taxonomy + heuristic; CA/CMA Inter. Postings built with S() are sample shapes, not real vacancies. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { govResults, advFromProfile } from '../src/lib/gov/filter';
import { matchLabel, profileFit } from '../src/lib/gov/rank';
import { experienceOf, noticeTypeFromPdf, noticeTypeOf, parseNotice, postLevelOf, qualsIn, splitEligibility } from '../src/lib/gov/notice';
import { mergeFacts } from '../server/govNoticeRead';
import { eduTagsOf, enrich } from '../server/govPostings';
import { fromS3waas } from '../server/govOfficial';
import type { Profile } from '../src/lib/govJobs';

const T = '2026-11-14';
const base = { cat: 'GEN', pwbd: false, esm: false, gender: 'male', eduSet: true, dob: '1998-03-01', state: 'Uttar Pradesh' } as any;
const P: Record<string, Profile> = {
  lawyer: { ...base, edu: 'grad', spec: 'law', subject: 'BA LLB', bar: true, expYears: 3, expType: ['litigation'] },
  engineer: { ...base, edu: 'eng', spec: 'engineering', subject: 'B.Tech CSE', expYears: 3, expType: ['engineering'] },
  envMSc: { ...base, edu: 'pg', subject: 'MSc Environmental Science', expYears: 2, expType: ['research'] },
  mbbs: { ...base, edu: 'grad', spec: 'medical', subject: 'MBBS', medReg: true, expYears: 2, expType: ['clinical'] },
  ca: { ...base, edu: 'grad', spec: 'finance', subject: 'B.Com, CA', icai: true, expYears: 4, expType: ['audit_accounts'] },
  bsc: { ...base, edu: 'grad', subject: 'B.Sc Chemistry', expYears: 1 },
  twelfth: { ...base, dob: '2006-01-01', edu: '12', expYears: 0 },
};
const DEG = ['lawyer', 'engineer', 'envMSc', 'mbbs', 'ca', 'bsc'];
const HOPE = ['strong', 'eligible', 'related'];
let n = 0; const S = (title: string, x: any = {}) => ({ id: 'r4-' + ++n, title, org: 'Govt body', location: '', eligibility: '', state: 'All India', lesserKnown: false, official: true, lastDate: '2026-12-10', pay: '', vacancies: '', level: 'central', eduTags: eduTagsOf(`${title} ${x.eligibility || ''}`), ...x });
const F = { q: '', state: '', lesser: false, official: false, soon: false, deputation: false, sort: 'rank', allLevels: false };
const run = (posts: any[], pr: Profile) => govResults(posts, { ...F, adv: advFromProfile(pr) }, pr, [], T).list;
const lab = (p: any, k: string) => (run([p], P[k]).length ? matchLabel(p, P[k], T).label : 'HIDDEN');
const why = (p: any, k: string) => matchLabel(p, P[k], T).why.join(' ');

// ---------- 1. Open call needs POSITIVE evidence; negatives override; "for the post of" proves nothing ----------
const site = { host: 'x.dcourts.gov.in', org: 'District & Sessions Court, X', state: 'Uttar Pradesh', city: 'X' };
const row = (t: string) => `<tr><td>${t}</td><td></td><td>10/11/2026</td><td>30/11/2026</td><td><a href="https://cdn.s3waas.gov.in/a.pdf">pdf</a></td></tr>`;
const fate = (titles: string[]) => { const rows = fromS3waas(`data-table-1<table>${titles.map(row).join('')}</table>`, site as any, T);
  return (t: string) => { const p = rows.find((x: any) => x.title === t); if (!p) return 'DROPPED'; const e = enrich(p, ''); return e === null ? 'DROPPED' : e.facts!.noticeType; }; };
const NON_OPEN = [
  // r4 report (9 kept wrongly) + live rows #12 Bathinda, #14 Rewari, #19 Alibag
  'Public Notice regarding the interviews for the post of Process Server', 'Notice for computer proficiency test for the post of Clerk', 'Name of the candidates selected for the post of Peon on contract basis',
  'Recruitment of Driver – Interview on 25.11.2026', 'Stenographer recruitment – Notice for Shorthand Test', 'Information regarding allotment of examination centres for the post of Copyist', 'Recruitment of Clerk – Typing speed test venue',
  'Peon recruitment – practical test notice', 'Recruitment of Mali – Revised date of interview', 'Recruitment of Chowkidar – Final merit', 'Recruitment of Driver – Trade test', 'Candidates who qualified the written exam for the post of Junior Assistant',
  'List of successful candidates – Stenographer Grade III', 'Notice regarding viva-voce for the post of Law Clerk',
  'Public Notice regarding the interviews for the post of Lift Operator, Generator Operator and Technician (Electrical) on contract basis.', 'PUBLIC NOTICE FOR THE COMPUTER PROFICIENCY TEST FOR THE POST OF STENOGRAPHER GRADE-III (PURELY ON AD-HOC BASIS)', 'Name of the candidate selected for the post of driver on a contract basis',
  // held-out
  'Notice regarding aptitude test for the post of Process Server', 'Venue of skill test – Junior Assistant', 'Date of interview for the post of Peon re-scheduled', 'Merit list for the post of Typist', 'Recruitment of Clerk – Screening test on 02.12.2026',
  'चतुर्थ श्रेणी पद हेतु साक्षात्कार की सूचना', 'लिपिक पद के चयनित अभ्यर्थियों की सूची', 'शिपाई पदाची निवड यादी', 'Recruitment of Copyist – Physical test notice', 'Postponement of interview for the post of Mali',
];
const UNCLEAR = ['Recruitment of Copyist on contract basis', 'Engagement of Law Researchers 2026-27', 'Recruitment notice for Process Server posts', 'Notification for the post of Driver (LMV)', 'Employment Notice no 1/2026 Upper Divisional Clerk Grade-III',
  'PEON POST RECRUITMENT NOTIFICATION NO:01/2026 DATED 31/10/2026', 'Engagement of General/Child Counsellors in the State of Haryana on contractual basis', 'Recruitment of Stenographer Grade III'];
const OPEN = ['Applications for the post of Stenographer Grade-III', 'Applications are invited for filling up of 8 posts of Gate Keepers, 6 posts of Chowkidars', 'Advertisement of vacancy of the post of Member, PLA Palamau',
  'Chennai – DLSA- Para Legal Volunteers – Recuritment – Application Called For – Reg', 'Notification No.1 – Application are invited for the post of Typist-cum-Assistant on contract basis in Permanent Lok Adalat', 'जिला विधिक सेवा प्राधिकार, भोजपुर, आरा के अंतर्गत पारा विधिक स्वयंसेवक के पद पर चयन हेतु विज्ञापन',
  'Walk-in interview for the post of Medical Officer', 'Last date extended – applications for the post of Process Server', 'लिपिक पद हेतु आवेदन आमंत्रित'];
test('notice type: negatives (interview, tests, selected, merit, centres, venue) drop the row; a recruitment title alone is "unclear"; positive evidence is an open call', () => {
  const f = fate([...NON_OPEN, ...UNCLEAR, ...OPEN]);
  for (const t of NON_OPEN) assert.equal(f(t), 'DROPPED', t);
  for (const t of UNCLEAR) assert.equal(f(t), 'unclear', t);
  for (const t of OPEN) assert.equal(f(t), 'open_call', t);
  assert.equal(noticeTypeOf('Notice regarding post of Driver'), 'other', '"post of" alone proves nothing');
  assert.equal(noticeTypeOf('Reservation for Scheduled Castes – applications invited for Clerk'), 'open_call', '"Scheduled" is not a schedule');
});
test('unclear notice type is never an open post: Check notice naming "notice type unclear", for every profile', () => {
  const p = enrich(fromS3waas(`data-table-1<table>${row('Recruitment of Law Clerk on contract basis')}</table>`, site as any, T)[0], '')!;
  const q = { ...p, eligibility: 'LLB', maxAge: 40 };
  for (const k of ['lawyer', 'twelfth']) { const m = matchLabel(q as any, P[k], T); assert.equal(m.label, 'check', k); if (k === 'lawyer') assert.match(m.why.join(' '), /notice type unclear/); }
  // other official sources are vacancy listings: their recruitment titles are open calls
  assert.equal(enrich({ ...p, id: 'en:1', facts: undefined } as any, '')!.facts!.noticeType, 'open_call');
});
const KURNOOL = "OFFICE OF THE PERMANENT LOK ADALAT KURNOOL NOTIFICATION NO: 01/2026 Applications are invited in the prescribed proforma (Bio-data) by way of issuing this notification to fill up the following post on contract basis. Vacancy Position: 1 Typist-cum-Assistant 01 Rs.25,220/- Educational and Technical Qualifications: a) For Retd. Employees: 1. Ministerial Officers who retired as Typist-cum-Assistant available at the district Head quarters, 2 Typist-cum-Assistant who have retired from service on attaining the age of superannuation and who have not attained the age of 65 years. b) For outsiders: 1. Must be Graduate from any recognized University. Age Limit: Must have completed the age of 18 years and must not have completed the age of 42 years as on 31.10.2026. Last date for receipt of applications on or before 20.11.2026";
const LAKHISARAI = "NOTICE INVITING APPLICATIONS FOR ENGAGEMENT OF SUPPORTIVE STAFF IN THE EVENING COURT Applications are hereby invited from eligible retired employees of the Civil Courts for engagement of supportive staff in the Evening Court, Lakhisarai, on a contractual basis. Eligibility Criteria (i) The applicant must be a retired employee of the Civil Courts. Only those retired Court employees who have retired within the preceding three years. Application must reach the office on or before 30-11-2026.";
test('PDF text: retired-only needs an explicit restriction; a fresh-candidate track (Kurnool, age 18-42) keeps the notice', () => {
  assert.equal(noticeTypeFromPdf(KURNOOL), 'open_call');
  assert.equal(noticeTypeFromPdf(LAKHISARAI), 'retiree_only');
  assert.equal(noticeTypeFromPdf('Applications are invited from retired judicial officers for the post of Conciliator. Fresh candidates may also apply. Age 21-40. Last date for receipt of applications 30.11.2026'), 'open_call', 'held-out: fresh track');
  assert.equal(noticeTypeFromPdf('List of selected candidates for the post of Driver. The following candidates are directed to report for joining.'), 'result_list');
  assert.equal(noticeTypeFromPdf('The interview for the post of Lift Operator will be held on 20.11.2026 at the District Court. Candidates are directed to appear with original documents.'), 'admit_schedule');
  assert.equal(noticeTypeFromPdf(''), null, 'scanned PDF: no verdict, stays unclear');
  const rules = parseNotice({ title: 'Employment Notice no 1/2026 Upper Divisional Clerk Grade-III' }); assert.equal(rules.noticeType, 'unclear');
  assert.equal(mergeFacts(rules, null, null).noticeType, 'unclear', 'scanned Arrah row stays "Check notice: notice type unclear"');
  assert.equal(mergeFacts(rules, null, 'open_call').noticeType, 'open_call', 'positive PDF evidence opens it');
  assert.equal(mergeFacts(rules, null, 'appointment').noticeType, 'appointment');
});

// ---------- 2. Experience is strict by default ----------
const EX: [string, string, 'check' | 'hope' | 'hidden'][] = [
  // r4 report
  ['lawyer', 'LLB with 3 years experience in corporate legal work in a PSU', 'check'], ['lawyer', 'LLB with 3 years post-qualification experience in drafting and vetting of contracts', 'check'],
  ['lawyer', 'LLB with 3 years experience in legal advisory work in a Government undertaking', 'check'], ['lawyer', 'LLB and 3 years of in-house counsel experience', 'check'],
  ['lawyer', 'LLB with 3 years practice before courts as an advocate', 'hope'], ['lawyer', 'LLB with 5 years practice at the Bar', 'hidden'], ['lawyer', 'LLB with 3 years experience in handling legal matters of a bank', 'check'],
  ['mbbs', 'MBBS with 2 years experience in implementation of national health programmes', 'check'], ['mbbs', 'MBBS with 2 years experience in disease surveillance and outbreak investigation', 'check'],
  ['mbbs', 'MBBS with 2 years of experience in community medicine', 'check'], ['mbbs', 'MBBS with 2 years hospital experience', 'hope'], ['mbbs', 'MBBS with 4 years clinical experience', 'hidden'],
  ['ca', 'CA with 4 years post-qualification experience in direct taxation', 'check'], ['ca', 'CA with 4 years experience in GST and indirect tax matters', 'check'], ['ca', 'CA with 4 years experience in statutory audit', 'hope'],
  ['ca', 'CA with 6 years post-qualification experience', 'hidden'], ['engineer', 'B.Tech CSE with 3 years experience in software development', 'check'], ['engineer', 'B.Tech CSE with 5 years experience', 'hidden'],
  ['engineer', 'B.Tech CSE with experience', 'check'], ['lawyer', 'LLB with experience as stated in the notice', 'check'],
  // held-out
  ['ca', 'CA with post-qualification experience of 6 yrs', 'hidden'], ['ca', 'CA with 06 years experience', 'hidden'], ['ca', 'CA with 6-year post-qualification experience', 'hidden'], ['ca', 'CA with six years experience', 'hidden'],
  ['lawyer', 'LLB with 3 years experience in arbitration and conciliation', 'check'], ['lawyer', 'LLB with 3 years experience in legal opinions for a corporation', 'check'], ['lawyer', 'LLB; 3 years standing at the Bar', 'hope'],
  ['mbbs', 'MBBS with 2 years experience in preventive and social medicine', 'check'], ['mbbs', 'MBBS with 2 years senior residency', 'hope'],
  ['ca', 'CA with 4 years experience in income-tax assessments', 'check'], ['ca', 'CA with 4 years experience in internal audit and accounts', 'hope'],
  ['engineer', 'B.Tech CSE with 3 years experience in full-stack web development', 'check'], ['engineer', 'B.Tech with 3 years experience in construction and maintenance of roads', 'hope'],
  ['lawyer', 'LLB with 3 years experience in warehouse operations', 'check'], ['lawyer', 'LLB with relevant experience', 'check'],
];
test('experience is strict: years parsed in every form; a kind not mapped to the profile is Check, never Strong; "with experience" and no years is Check', () => {
  for (const [who, e, exp] of EX) { const p = S(who === 'mbbs' ? 'Programme Officer (Health)' : who === 'ca' ? 'Finance Officer' : who === 'engineer' ? 'Systems Engineer' : 'Legal Manager', { eligibility: e, pay: 'Level 10', maxAge: 40 });
    const l = lab(p, who); const got = l === 'HIDDEN' ? 'hidden' : HOPE.includes(l) ? 'hope' : 'check'; assert.equal(got, exp, `${who}: ${e} -> ${l} | ${why(p, who).slice(0, 160)}`);
    if (exp === 'check') assert.match(why(p, who), /required/, e); }
  const x = (e: string) => experienceOf('X', splitEligibility(e).essential);
  assert.deepEqual([x('6 years post-qualification experience')?.years, x('post-qualification experience of 6 yrs')?.years, x('06 years experience')?.years, x('6-years experience')?.years, x('with experience')?.years], [6, 6, 6, 6, null]);
  assert.match(why(S('Legal Manager', { eligibility: 'LLB with 3 years post-qualification experience in drafting and vetting of contracts', pay: 'Level 10', maxAge: 40 }), 'lawyer'), /3 yrs corporate legal experience \(drafting and vetting of contracts\) required; your profile shows litigation/);
});

// ---------- 3. Soft preferred wordings (general lexicon, phrase-scoped); Masters-required stays essential ----------
const SOFT = ['Masters in any subject; LLB holders will have an edge', 'Masters in any subject. A law degree is welcome', 'Masters in any subject, LLB holders may get extra marks', 'Masters in any subject; those having LLB will be given first preference',
  'Masters in any subject (LLB will be an advantage)', 'Masters in any subject — LLB carries added weight', 'Masters in any subject. Desirability: LLB', 'Masters in any subject; LLB would be an additional advantage',
  // held-out
  'Masters in any subject; LLB is a plus point', 'Masters in any subject, LLB holders will be considered favourably', 'Masters in any subject; LLB carries weightage', 'Masters in any subject – LLB gives an edge', 'Masters in any subject; bonus marks for LLB holders', 'Masters in any subject. Advantage: LLB'];
const HARD = ['LL.B., with experience in arbitration desirable', 'LLB (Hons.), PSU experience will be an advantage', 'Degree in Law; candidates holding LLM will be preferred', 'Law graduate with 3 yrs standing at the Bar; knowledge of Hindi preferred', 'LLB with knowledge of computers welcome'];
test('soft preferred wordings never make LLB essential; the Masters requirement stays essential', () => {
  for (const e of SOFT) { const sp = splitEligibility(e); assert.ok(qualsIn(sp.essential).includes('PG'), `Masters dropped: ${e}`); assert.ok(!qualsIn(sp.essential).includes('LLB'), `LLB essential: ${e}`);
    const p = S('Programme Manager', { eligibility: e, pay: 'Level 10', maxAge: 40 }); assert.equal(profileFit(p, P.lawyer).field, false, e); assert.ok(!HOPE.includes(lab(p, 'lawyer')), `false hope: ${e}`); }
  for (const e of HARD) { const p = S('Programme Manager', { eligibility: e, pay: 'Level 10', maxAge: 40 }); assert.equal(profileFit(p, P.lawyer).field, true, e); }
});

// ---------- 4. Age: missing limit / DOB keeps the label with a sub-note; other unknowns still Check ----------
test('missing age limit or DOB keeps Strong / Eligible / Related and adds "Age limit not stated — check notice"', () => {
  const lo = S('Law Officer', { eligibility: 'LLB', pay: 'Level 10' }); const m = matchLabel(lo, P.lawyer, T); assert.equal(m.label, 'strong'); assert.match(m.why.join(' '), /Age limit not stated — check notice/);
  assert.equal(matchLabel(S('Law Officer', { eligibility: 'LLB', pay: 'Level 10', maxAge: 40 }), { ...P.lawyer, dob: '' }, T).label, 'strong');
  assert.match(matchLabel(S('Law Officer', { eligibility: 'LLB', pay: 'Level 10', maxAge: 40 }), { ...P.lawyer, dob: '' }, T).why.join(' '), /add your date of birth/);
  const co = S('Compliance Officer', { eligibility: 'Graduate in any discipline', pay: 'Level 8' }); assert.equal(matchLabel(co, P.lawyer, T).label, 'related'); assert.match(why(co, 'lawyer'), /Related fit: .*Age limit not stated/);
  // other unknown essentials still Check
  assert.equal(matchLabel(S('Law Officer', { eligibility: '', pay: 'Level 10' }), P.lawyer, T).label, 'check', 'qualification unknown');
  assert.equal(matchLabel(S('Panel Advocate', { eligibility: 'LLB; enrolled with the Bar Council', pay: 'Rs 60,000 per month' }), { ...P.lawyer, bar: undefined }, T).label, 'check', 'licence unknown');
  assert.equal(matchLabel(S('Legal Manager', { eligibility: 'LLB with 3 years practice as an advocate', pay: 'Level 10' }), { ...P.lawyer, expType: [] }, T).label, 'check', 'experience kind unknown');
  assert.equal(matchLabel(S('Law Officer', { eligibility: 'LLB', pay: 'Level 10', maxAge: 25 }), P.lawyer, T).label, 'check', 'a stated age that fails is still a fail');
  // discovery is back without age: the r4 Related set with age NOT stated
  const roles = ['Compliance Officer', 'Policy Analyst', 'Vigilance Officer', 'Research Officer', 'Data Analyst', 'GIS Analyst', 'Project Scientist (Climate)', 'Range Forest Officer', 'Project Manager', 'Quality Control Officer', 'Safety Officer', 'Risk Officer', 'Credit Analyst', 'Public Health Officer', 'Research Scientist', 'Human Rights Officer', 'Consumer Protection Officer', 'Climate Policy Consultant', 'Business Analyst', 'Lower Division Clerk', 'Data Entry Operator', 'Office Assistant'];
  const counts = ['lawyer', 'engineer', 'envMSc', 'mbbs', 'ca', 'twelfth'].map((k) => run(roles.map((r) => S(r, { eligibility: k === 'twelfth' ? '12th pass' : 'Graduate in any discipline', pay: k === 'twelfth' ? 'Level 2' : 'Level 8' })), P[k]).filter((p: any) => matchLabel(p, P[k], T).label === 'related').length);
  assert.deepEqual(counts, [9, 7, 8, 5, 7, 3]);
});

// ---------- 5. Low-level titles: taxonomy + heuristic ----------
const LOW = ['कार्यालय सेवक के पद', 'नलकूप चालक', 'भंडार सेवक भर्ती', 'चपराशी पदभरती', 'सुरक्षा रक्षक पदभरती', 'मजूर पदभरती', 'स्वच्छता दूत', 'वाटर कैरियर भर्ती', 'सफाई मजदूर', 'कैंटीन बॉय', 'Office Boy', 'Tea Boy', 'Canteen Attendant', 'Dresser', 'Mukaddam', 'Gangman', 'Boatman', 'Syce', 'Packer', 'Loader', 'Duftry', 'Ayah', 'Usher', 'Cleaner-cum-Helper', 'Pump Operator', 'Bundle Lifter', 'Despatch Rider',
  // held-out
  'Daftry', 'Dispatch Rider', 'Tea Maker', 'Khidmatgar', 'Lineman', 'Plumber', 'Carpenter', 'पम्प ऑपरेटर', 'टी बॉय', 'Generator Operator', 'Lift Operator', 'Technician (Electrical)', 'Store Keeper'];
test('low-level titles (taxonomy + "no officer / professional head noun and no minimum above 12th"): hidden from degree holders with a reason; 12th pass sees them', () => {
  for (const t of LOW) { const p = S(t); const leak = DEG.filter((k) => lab(p, k) !== 'HIDDEN'); assert.deepEqual(leak, [], t); assert.notEqual(lab(p, 'twelfth'), 'HIDDEN', `12th: ${t}`);
    const all = govResults([p], { ...F, allLevels: true, adv: advFromProfile(P.bsc) } as any, P.bsc, [], T).list; assert.equal(all.length, 1, `Show all levels: ${t}`); assert.match(why(p, 'bsc'), /Junior \/ entry-level post/, t); }
  // officer / professional head nouns, a stated degree minimum, or a title that names no post are never classed low
  for (const [t, e] of [['Research Analyst (Entry)', ''], ['Counsellor', ''], ['Project Associate', ''], ['Assistant', 'Graduate'], ['Advertisement for appointment in posts in National Green Tribunal', ''], ['Higher Judicial Service (HJS) direct recruitment', ''], ['Member, Permanent Lok Adalat', '']])
    assert.notEqual(postLevelOf(parseNotice({ title: t, eligibility: e })), 'low', t);
});

// ---------- 6. Lows: CA/CMA Inter; Research Analyst (Entry) for BSc ----------
test('CA override: "CA/CMA Inter or MBA" is not a CA requirement; named CA is', () => {
  for (const [e, ok] of [['MBA (Fin.) / PGDM (Finance)', false], ['M.Com with ICWA (Inter)', false], ['CA/CMA Inter or MBA', false], ['MBA / CA-Inter', false], ['Postgraduate in Commerce', false], ['CA / ICWA (Intermediate) or MBA', false], ['CA/CS Foundation', false],
    ['Member of ICAI or MBA', true], ['Qualified Chartered Accountant (ACA)', true], ['FCA / ACA with 4 years', true], ['CA / CMA (final)', true]] as const) {
    const p = S('Finance Controller', { eligibility: e, pay: 'Level 11', maxAge: 40 }); const l = lab(p, 'ca'); assert.equal(HOPE.includes(l), ok, `${e} -> ${l}`); }
  assert.deepEqual(qualsIn('CA/CMA Inter or MBA'), ['CA_INTER', 'MBA']);
});
test('Research Analyst (Entry), Intermediate pass, Rs 22,000: shown to a BSc graduate as Eligible, not Check; sub-graduate analyst posts with structure stay hidden', () => {
  const ra = S('Research Analyst (Entry)', { eligibility: 'Intermediate pass', pay: 'Rs 22,000 per month' }); assert.ok(['eligible', 'related'].includes(lab(ra, 'bsc')), lab(ra, 'bsc'));
  for (const [t, e, pay] of [['Junior Data Analyst', 'Higher Secondary with computer knowledge', 'Level 3'], ['Analyst Assistant', 'Matriculation', 'Level 2'], ['Laboratory Analyst Helper', '10th pass', '']]) assert.deepEqual(DEG.filter((k) => lab(S(t, { eligibility: e, pay }), k) !== 'HIDDEN'), [], t);
});

// ---------- PDF text layer fills a row that states no qualification (verbatim from the official notice; never invented) ----------
test('qualification and age read from the official PDF text when the feed row states none', async () => {
  const { eligibilityFromText, agesOf } = await import('../src/lib/gov/notice');
  const { withPdfText } = await import('../server/govNoticeRead');
  const e = eligibilityFromText(KURNOOL); assert.match(e, /Must be Graduate/); assert.deepEqual(agesOf(KURNOOL), { min: 18, max: 42 });
  const CHD = 'The minimum qualification and other criteria to fill up these posts are as under:- Sr. No Name of the Post No. of Posts Pay Minimum Qualification 1 Gate Keeper 8 Candidate should have passed middle standard examination and possess knowledge of Hindi/Punjabi. The candidate should not be less than 18 years and not more than 37 years of age';
  assert.ok(eligibilityFromText(CHD).length > 0); assert.deepEqual(agesOf(CHD), { min: 18, max: 37 });
  assert.equal(eligibilityFromText('proof of educational qualifications, category, date of birth'), '', 'a mention without a qualification is not a clause');
  const p: any = S('Typist-cum-Assistant', { eligibility: 'Qualification as stated in the official notice.' }); const rules = parseNotice(p);
  const f = withPdfText(p, rules, { elig: e, ages: agesOf(KURNOOL) }); assert.equal(f.stated, true); assert.equal(f.minEdu, 3); assert.equal(f.ageMax, 42); assert.equal(f.source, 'pdf');
  assert.equal(withPdfText(p, rules, { elig: '', ages: { min: null, max: null } }).stated, false, 'scanned: stays "not in the feed text"');
});

// ---------- Scanned notices: no server key path; the signed-in user's own key (mocked) in the browser ----------
const scannedRow = (title: string, x: any = {}) => ({ ...S(title, { eligibility: 'Qualification as stated in the official notice.', noticeUrl: 'https://cdnbbsr.s3waas.gov.in/s3x/uploads/2026/08/2026081947.pdf', ...x }), facts: { ...parseNotice({ title }), pdf: 'scanned' as const } });
const G = (x: any = {}) => ({ noticeType: 'open_call', essentialQualification: 'Graduate in any discipline', preferredQualification: '', minEducationLevel: 3, group: '', payLevel: -1, isOfficer: false, experienceYears: -1, experienceType: '', licences: [], ageMin: 18, ageMax: 40, ...x });
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m }; };
test('no user key: a scanned notice is "Check notice: scanned notice, verify manually" for every profile and the browser never calls the AI', async () => {
  const { aiReadNotice } = await import('../src/lib/gov/noticeAi');
  for (const t of ['Applications are invited for the post of Typist', 'Employment Notice no 1/2026 Upper Divisional Clerk Grade-III', 'Advertisement for Research Officer']) {
    const p = scannedRow(t, { eligibility: 'Graduate', maxAge: 40 });
    for (const k of Object.keys(P)) { const m = matchLabel(p as any, P[k], T); assert.equal(m.label, 'check', `${t} / ${k}`); }
    assert.match(matchLabel(p as any, P.bsc, T).why.join(' '), /scanned notice, verify manually/, t);
    let calls = 0; const r = await aiReadNotice(p, { key: () => '', signedIn: () => true, call: async () => { calls++; return G(); }, store: mem() });
    assert.equal(r, null); assert.equal(calls, 0, 'no key: no call');
    const r2 = await aiReadNotice(p, { key: () => 'user-key', signedIn: () => false, call: async () => { calls++; return G(); }, store: mem() }); assert.equal(r2, null); assert.equal(calls, 0, 'not signed in: no call');
  }
});
test('server read-notice action: never uses a server key; refuses without the user key, even when a server key exists', async () => {
  const { handleAction } = await import('../server/handlers');
  const { readNoticeWithKey } = await import('../server/govNoticeAi');
  const prev = process.env.GEMINI_API_KEY; process.env.GEMINI_API_KEY = 'dummy-server-value-for-test';
  try { await assert.rejects(handleAction('read-notice', { url: 'https://cdnbbsr.s3waas.gov.in/a.pdf' } as any, undefined), (e: any) => e.code === 'NO_USER_KEY'); }
  finally { if (prev === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev; }
  await assert.rejects(readNoticeWithKey('https://example.com/a.pdf', 'user-key'), (e: any) => e.code === 'BAD_URL');
  // mocked key path: fixed schema in, validated answer out; the key passed is the user's
  let usedKey = ''; let schema: any = null;
  const g = await readNoticeWithKey('https://cdnbbsr.s3waas.gov.in/a.pdf', 'user-key', { fetch: async () => new Uint8Array(200), generate: async (k, req) => { usedKey = k; schema = req.schema; return JSON.stringify(G({ noticeType: 'appointment' })); } });
  assert.equal(usedKey, 'user-key'); assert.deepEqual(Object.keys(schema.properties).sort(), ['ageMax', 'ageMin', 'essentialQualification', 'experienceType', 'experienceYears', 'group', 'isOfficer', 'licences', 'minEducationLevel', 'noticeType', 'payLevel', 'preferredQualification']);
  assert.equal(g!.noticeType, 'appointment');
  assert.equal(await readNoticeWithKey('https://cdnbbsr.s3waas.gov.in/a.pdf', 'user-key', { fetch: async () => new Uint8Array(200), generate: async () => '{"noticeType":"maybe"}' }), null, 'off-schema answer is no answer');
});
test('user key (mocked): an open call confirmed by the model gets a real label; a non-open answer hides the row; cached per notice', async () => {
  const { aiReadNotice } = await import('../src/lib/gov/noticeAi');
  const store = mem(); let calls = 0; const deps = (g: any) => ({ key: () => 'user-key', signedIn: () => true, call: async () => { calls++; return g; }, store });
  const p = scannedRow('Applications are invited for the post of Research Officer', { pay: 'Level 8' });
  const r = (await aiReadNotice(p, deps(G())))!; assert.equal(r.facts!.pdf, 'ai'); assert.equal(r.facts!.noticeType, 'open_call'); assert.equal(r.facts!.ageMax, 40);
  assert.ok(HOPE.includes(matchLabel(r as any, P.bsc, T).label), matchLabel(r as any, P.bsc, T).why.join(' '));
  await aiReadNotice(p, deps(G())); assert.equal(calls, 1, 'second read comes from the browser cache');
  const arrah = scannedRow('Employment Notice no 1/2026 Upper Divisional Clerk Grade-III', { noticeUrl: 'https://cdnbbsr.s3waas.gov.in/s3y/uploads/2026/08/b.pdf' });
  const a = (await aiReadNotice(arrah, deps(G({ noticeType: 'appointment' }))))!; assert.equal(a.facts!.noticeType, 'appointment'); assert.equal(run([a], P.twelfth).length, 0, 'appointment notice never shown');
  assert.equal(govResults([a] as any, { ...F, allLevels: true } as any, null, [], T).list.length, 0, 'not even under Show all levels');
  const o = (await aiReadNotice(scannedRow('Advertisement for Clerk', { noticeUrl: 'https://cdnbbsr.s3waas.gov.in/s3z/c.pdf' }), deps(G({ noticeType: 'other' }))))!;
  assert.equal(o.facts!.noticeType, 'unclear', 'not confirmed as an open call: never presented as open'); assert.equal(matchLabel(o as any, P.twelfth, T).label, 'check');
});
