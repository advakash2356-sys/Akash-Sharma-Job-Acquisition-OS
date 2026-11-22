// Government Jobs eligibility finder (India). Hand-curated from official notifications; every entry carries
// its source and the date it was last checked. Information only, not legal advice. Akash Sync Agent.
/** Professional field of the degree (e.g. LLB = law). Used only to rank live postings. */
export type Spec = '' | 'law' | 'engineering' | 'medical' | 'finance' | 'teaching' | 'other';
export type Edu = '10' | '12' | 'iti' | 'diploma' | 'grad' | 'eng' | 'pg' | 'phd';
export type Cat = 'GEN' | 'EWS' | 'OBC' | 'SC' | 'ST';
export type Gender = 'male' | 'female' | 'other';
export interface Profile { /** optional city or district, used to pre-fill the advanced search */ city?: string; dob: string; edu: Edu; stream12?: 'pcm' | 'other'; cat: Cat; pwbd: boolean; esm: boolean; /** years of military service; required for ESM age relaxation */ esmYears?: number; /** SSC CGL post id from CGL_POSTS; blank means no post selected */ cglPost?: string; gender: Gender; state: string; expYears?: number; spec?: Spec; /** true once the user picked education on this page themselves */ eduSet?: boolean }
export interface Exam {
  id: string; name: string; body: string; group: 'UPSC' | 'SSC' | 'Banking' | 'Railways' | 'Defence' | 'Courts' | 'PSU / Research' | 'Postal';
  minAge: number; maxAge: number; maxAgeByPost?: number[]; asOn: string; // age reckoning date in the notification used; maxAgeByPost when the cap varies by post
  edu: Edu[]; // any one of these qualifies
  qual: string; relax: 'central' | 'none' | 'obcScOnly'; esmNote?: string; maleOnly?: boolean; note?: string;
  lesser?: boolean; pay?: { text: string; src: string }; src: string; site: string; verified: string;
}
export const VERIFIED = '2026-10-29';
export const DISCLAIMER = 'Information only, not legal advice. Rules change every cycle: always check the official notification before you apply. Relaxations apply only if you hold the required certificate (OBC must be non-creamy layer, central list).';
const V = VERIFIED;
const G: Edu[] = ['grad', 'eng', 'pg'];
export const EXAMS: Exam[] = [
  { id: 'upsc-cse', name: 'UPSC Civil Services (IAS/IPS/IFS…)', body: 'UPSC', group: 'UPSC', minAge: 21, maxAge: 32, asOn: '2026-08-01', edu: G, qual: 'Any graduate degree', relax: 'central', note: 'Attempts: Gen/EWS 6, OBC 9, SC/ST unlimited.', src: 'https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf', site: 'https://upsc.gov.in', verified: V },
  { id: 'upsc-ese', name: 'UPSC Engineering Services (ESE)', body: 'UPSC', group: 'UPSC', minAge: 21, maxAge: 30, asOn: '2027-01-01', edu: ['eng', 'pg'], qual: 'Engineering degree', relax: 'central', src: 'https://www.upsc.gov.in/sites/default/files/Notif-ESEP-2027-Engl-160926.pdf', site: 'https://upsc.gov.in', verified: V },
  { id: 'upsc-nda', name: 'NDA & NA (Army/Navy/Air Force)', body: 'UPSC', group: 'Defence', minAge: 15, maxAge: 18, asOn: '2026-01-01', edu: ['12', 'iti', 'diploma', 'grad', 'eng', 'pg'], qual: 'Class 12 (Air Force/Navy wings need Physics & Maths)', relax: 'none', note: 'Unmarried. NDA II 2026: born 1 Jan 2008 to 1 Jan 2011.', src: 'https://www.upsc.gov.in/sites/default/files/Notif-NDA-II-2026-Engl-200526.pdf', site: 'https://upsc.gov.in', verified: V },
  { id: 'upsc-cds', name: 'CDS (IMA / INA)', body: 'UPSC', group: 'Defence', minAge: 19, maxAge: 24, asOn: '2027-07-01', edu: G, qual: 'Graduate (final-year students may apply)', relax: 'none', maleOnly: true, note: 'Unmarried men. OTA: 19 to 25, open to women. CDS II 2026: IMA born 2 Jul 2003 to 1 Jul 2008.', src: 'https://www.upsc.gov.in/sites/default/files/Notif-CDS-II-2026-Engl-200526.pdf', site: 'https://upsc.gov.in', verified: V },
  { id: 'ssc-cgl', pay: { text: '7th CPC Pay Level 4 to 8 (₹25,500 to ₹1,51,100 basic), by post', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf' }, name: 'SSC CGL', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 32, maxAgeByPost: [27, 30, 32], asOn: '2026-08-01', edu: G, qual: 'Graduate', relax: 'central', esmNote: 'Ex-servicemen: 3 years after deducting military service.', note: 'Upper limit is 27, 30 or 32 by post.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-chsl', name: 'SSC CHSL (LDC/JSA/DEO)', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 27, asOn: '2026-08-01', edu: ['12', 'diploma', ...G], qual: 'Class 12', relax: 'central', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsl_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-mts', name: 'SSC MTS & Havaldar', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 27, asOn: '2026-01-01', edu: ['10', '12', 'iti', 'diploma', ...G], qual: 'Class 10', relax: 'central', note: 'MTS 18 to 25; Havaldar and some MTS posts 18 to 27.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_RHQ_2026_phase_xiv.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-gd', name: 'SSC GD Constable (CAPFs, SSF, Assam Rifles)', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 23, asOn: '2026-01-01', edu: ['10', '12', 'iti', 'diploma', ...G], qual: 'Class 10', relax: 'central', note: 'Physical standards apply.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_CTGD_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-je', name: 'SSC Junior Engineer (Civil/Electrical/Mechanical)', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 32, asOn: '2026-08-01', edu: ['diploma', 'eng'], qual: 'Engineering diploma or degree in Civil/Electrical/Mechanical', relax: 'central', note: 'Up to 30 for most posts; CPWD up to 32. Some posts need experience for diploma holders.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_je_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-steno', name: 'SSC Stenographer Grade C & D', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 30, asOn: '2026-08-01', edu: ['12', 'diploma', ...G], qual: 'Class 12 + shorthand skill test', relax: 'central', note: 'Grade C 18 to 30; Grade D 18 to 27.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_steno_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ibps-po', pay: { text: 'Basic ₹48,480 in scale ₹48,480 to ₹85,920 (JMGS-I), plus allowances', src: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf' }, name: 'IBPS PO/MT', body: 'IBPS', group: 'Banking', minAge: 20, maxAge: 30, asOn: '2026-07-01', edu: G, qual: 'Graduate, any discipline', relax: 'central', esmNote: 'Ex-servicemen: 5 years (as per notice).', src: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf', site: 'https://ibps.in', verified: V },
  { id: 'ibps-clerk', pay: { text: 'Basic ₹24,050 in scale ₹24,050 to ₹64,480, plus allowances', src: 'https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf' }, name: 'IBPS Clerk (CSA)', body: 'IBPS', group: 'Banking', minAge: 20, maxAge: 28, asOn: '2026-08-01', edu: G, qual: 'Graduate; state official language', relax: 'central', src: 'https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf', site: 'https://ibps.in', verified: V },
  { id: 'sbi-po', pay: { text: 'Basic ₹48,480 + 4 advance increments, scale to ₹85,920; SBI states approx. CTC ₹21.97 lakh at Mumbai', src: 'https://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf' }, name: 'SBI PO', body: 'SBI', group: 'Banking', minAge: 21, maxAge: 30, asOn: '2026-04-01', edu: G, qual: 'Graduate', relax: 'central', src: 'https://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf', site: 'https://sbi.bank.in/web/careers', verified: V },
  { id: 'sbi-clerk', name: 'SBI Clerk (Junior Associate)', body: 'SBI', group: 'Banking', minAge: 20, maxAge: 28, asOn: '2026-04-01', edu: G, qual: 'Graduate; local language', relax: 'central', src: 'https://sbi.bank.in/web/careers/junior-associate', site: 'https://sbi.bank.in/web/careers', verified: V },
  { id: 'rbi-b', name: 'RBI Grade B Officer', body: 'RBI', group: 'Banking', minAge: 21, maxAge: 30, asOn: '2026-04-01', edu: G, qual: 'Graduate with minimum marks set in the notice', relax: 'central', src: 'https://www.rbi.org.in/scripts/Bs_viewcontent.aspx?Id=4997', site: 'https://opportunities.rbi.org.in', verified: V },
  { id: 'rbi-asst', pay: { text: 'Basic ₹29,000 in scale ₹29,000 to ₹78,640, plus allowances', src: 'https://ibpsreg.ibps.in/rbiafeb26/' }, name: 'RBI Assistant', body: 'RBI', group: 'Banking', minAge: 20, maxAge: 28, asOn: '2026-02-01', edu: G, qual: 'Graduate; local language', relax: 'central', src: 'https://ibpsreg.ibps.in/rbiafeb26/', site: 'https://opportunities.rbi.org.in', verified: V },
  { id: 'rrb-ntpc-g', pay: { text: '7th CPC Pay Level 5 (₹29,200) or 6 (₹35,400) initial pay, by post', src: 'https://rrb.indianrailways.gov.in/' }, name: 'RRB NTPC Graduate', body: 'RRB', group: 'Railways', minAge: 18, maxAge: 33, asOn: '2027-01-01', edu: G, qual: 'Graduate', relax: 'central', src: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2321873', site: 'https://rrb.indianrailways.gov.in', verified: V },
  { id: 'rrb-ntpc-ug', note: 'Source: CEN 07/2026 (NTPC UG) on the unified RRB site.', name: 'RRB NTPC Undergraduate', body: 'RRB', group: 'Railways', minAge: 18, maxAge: 30, asOn: '2027-01-01', edu: ['12', 'diploma', ...G], qual: 'Class 12', relax: 'central', src: 'https://rrb.indianrailways.gov.in/', site: 'https://rrb.indianrailways.gov.in', verified: V },
  { id: 'rrb-d', note: 'Source: CEN 09/2025 (Level 1) on the unified RRB site.', name: 'RRB Group D (Level 1)', body: 'RRB', group: 'Railways', minAge: 18, maxAge: 33, asOn: '2026-01-01', edu: ['10', '12', 'iti', 'diploma', ...G], qual: 'Class 10 or ITI', relax: 'central', src: 'https://rrb.indianrailways.gov.in/', site: 'https://rrb.indianrailways.gov.in', verified: V },
  { id: 'rrb-alp', note: 'Source: CEN 01/2026 (ALP) on the unified RRB site.', name: 'RRB Assistant Loco Pilot', body: 'RRB', group: 'Railways', minAge: 18, maxAge: 30, asOn: '2026-07-01', edu: ['iti', 'diploma', 'eng'], qual: 'Class 10 + ITI (or engineering diploma/degree in notified trades)', relax: 'central', src: 'https://rrb.indianrailways.gov.in/', site: 'https://rrb.indianrailways.gov.in', verified: V },
  // Lesser-known
  { id: 'gds', name: 'India Post Gramin Dak Sevak (BPM/ABPM/Dak Sevak)', body: 'Department of Posts', group: 'Postal', minAge: 18, maxAge: 40, asOn: '2026-09-21', edu: ['10', '12', 'iti', 'diploma', ...G], qual: 'Class 10 with Maths and English; local language studied up to Class 10', relax: 'central', note: 'Merit list on Class 10 marks, no exam. EWS gets no age relaxation.', lesser: true, src: 'https://www.indiapost.gov.in/gdsonlineengagement/pdf/descriptive-notification-hindi.pdf', site: 'https://www.indiapost.gov.in/gdsonlineengagement', verified: V },
  { id: 'icg-navik', name: 'Indian Coast Guard Navik / Yantrik', body: 'Indian Coast Guard', group: 'Defence', minAge: 18, maxAge: 22, asOn: '2026-08-01', edu: ['10', '12', 'iti', 'diploma', ...G], qual: 'Navik (Domestic Branch): Class 10. Navik (GD): Class 12 with Maths & Physics. Yantrik: diploma', relax: 'obcScOnly', lesser: true, note: 'CGEPT 01/2026: Navik GD born 1 Aug 2004 to 1 Aug 2008. Relaxation only where posts are reserved.', src: 'https://joinindiancoastguard.cdac.in/cgept/', site: 'https://joinindiancoastguard.cdac.in/cgept/', verified: V },
  { id: 'sci-jca', name: 'Supreme Court Junior Court Assistant', body: 'Supreme Court of India', group: 'Courts', minAge: 18, maxAge: 30, asOn: '2026-09-01', edu: G, qual: 'Graduate + English typing 35 wpm + computer skills', relax: 'central', lesser: true, src: 'https://www.sci.gov.in/recruitments/', site: 'https://www.sci.gov.in/recruitments/', verified: V },
  { id: 'drdo-ceptam', name: 'DRDO CEPTAM (Senior Technical Assistant-B / Technician-A)', body: 'DRDO', group: 'PSU / Research', minAge: 18, maxAge: 28, asOn: '2026-01-01', edu: ['iti', 'diploma', ...G], qual: 'STA-B: science/engineering degree or diploma; Tech-A: Class 10 + ITI', relax: 'central', esmNote: 'Ex-servicemen: military service + 3 years.', lesser: true, src: 'https://www.drdo.gov.in/drdo/sites/default/files/vacancy/CEPTAM-11_AdvtEnglish.pdf', site: 'https://www.drdo.gov.in', verified: V },
  { id: 'ntpc-et', name: 'NTPC Engineering Executive Trainee (via GATE)', body: 'NTPC (PSU)', group: 'PSU / Research', minAge: 18, maxAge: 27, asOn: '2026-02-25', edu: ['eng', 'pg'], qual: 'BE/BTech in a relevant branch + valid GATE score', relax: 'central', lesser: true, note: 'Hired through GATE every year. Minimum age not stated; 18 shown as a floor.', src: 'https://www.ntpc.co.in/recruitment-system-ntpc', site: 'https://careers.ntpc.co.in', verified: V },
  { id: 'ta-officer', name: 'Territorial Army Officer (for working civilians)', body: 'Territorial Army', group: 'Defence', minAge: 18, maxAge: 42, asOn: '2026-05-19', edu: G, qual: 'Graduate and gainfully employed (govt, private or self-employed)', relax: 'none', lesser: true, note: 'Serve part-time without leaving your job.', src: 'https://territorialarmy.in/page/3', site: 'https://territorialarmy.in', verified: V },
];
const RANK: Record<Edu, number> = { '10': 0, iti: 1, '12': 1, diploma: 1, grad: 2, eng: 2, pg: 3, phd: 4 };
export const dobInvalid = (dob: string, today = new Date().toISOString().slice(0, 10)) => !!dob && (isNaN(Date.parse(dob)) || dob >= today);
/** Verification older than this many days gets a 'may be out of date' warning. */
export const STALE_DAYS = 120;
export const daysSince = (iso: string, today = new Date().toISOString().slice(0, 10)) => Math.floor((Date.parse(today) - Date.parse(iso)) / 864e5);
export function ageOn(dob: string, on: string) { const b = new Date(dob), d = new Date(on); let a = d.getFullYear() - b.getFullYear(); const m = d.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && d.getDate() < b.getDate())) a--; return a; }
export function relaxation(e: Exam, p: Profile) {
  if (e.relax === 'none') return 0;
  const c = p.cat === 'SC' || p.cat === 'ST' ? 5 : p.cat === 'OBC' ? 3 : 0;
  if (e.relax === 'obcScOnly') return c;
  return c + (p.pwbd ? 10 : 0);
}
export function eduOk(e: Exam, p: Profile) {
  if (e.edu.includes(p.edu)) return true;
  if (p.edu === 'pg' || p.edu === 'phd') return e.edu.includes('pg') || e.edu.includes('grad');
  if (p.edu === 'eng') return e.edu.includes('grad');
  return false;
}

/** SSC CGL 2026 posts from the official notice (as on 01-08-2026). Posts with a blank age column are listed as Check notice and are never passed or failed on age. */
export interface CglPost { id: string; name: string; org: string; minAge?: number; maxAge?: number; ageUnstated?: boolean; verifyNote?: string }
export const CGL_POSTS: CglPost[] = [
  { id: 'aao-central', name: 'Assistant Audit Officer (Central Cadre)', org: 'C&AG', minAge: 18, maxAge: 30 },
  { id: 'aao-state', name: 'Assistant Audit Officer (State Cadre)', org: 'C&AG', minAge: 18, maxAge: 30 },
  { id: 'aa-officer-state', name: 'Assistant Accounts Officer (State Cadre)', org: 'C&AG', minAge: 18, maxAge: 30 },
  { id: 'aso-css', name: 'Assistant Section Officer', org: 'Central Secretariat Service', minAge: 20, maxAge: 30 },
  { id: 'aso-ib', name: 'Assistant Section Officer', org: 'Intelligence Bureau', minAge: 18, maxAge: 30 },
  { id: 'aso-railways', name: 'Assistant Section Officer', org: 'Ministry of Railways', minAge: 20, maxAge: 30 },
  { id: 'aso-mea', name: 'Assistant Section Officer', org: 'Ministry of External Affairs', minAge: 20, maxAge: 30 },
  { id: 'aso-afhq', name: 'Assistant Section Officer', org: 'AFHQ', minAge: 20, maxAge: 30 },
  { id: 'aso-meity', name: 'Assistant Section Officer', org: 'Ministry of Electronics and Information Technology', minAge: 18, maxAge: 30 },
  { id: 'aso-other-l7', name: 'Assistant / Assistant Section Officer', org: 'Other Ministries/Departments/Organizations (Level 7)', minAge: 18, maxAge: 30 },
  { id: 'it-inspector', name: 'Inspector of Income Tax', org: 'CBDT', minAge: 18, maxAge: 30 },
  { id: 'ce-inspector', name: 'Inspector (Central Excise)', org: 'CBIC', minAge: 18, maxAge: 30 },
  { id: 'po-inspector', name: 'Inspector (Preventive Officer)', org: 'CBIC', ageUnstated: true, verifyNote: 'Some listings give 18–30; verify in the official notice.' },
  { id: 'examiner', name: 'Inspector (Examiner)', org: 'CBIC', ageUnstated: true, verifyNote: 'Some listings give 18–30; verify in the official notice.' },
  { id: 'ed-aeo', name: 'Assistant Enforcement Officer', org: 'Directorate of Enforcement', minAge: 18, maxAge: 30 },
  { id: 'cbi-si', name: 'Sub Inspector', org: 'Central Bureau of Investigation', minAge: 20, maxAge: 30 },
  { id: 'inspector-posts', name: 'Inspector Posts', org: 'Department of Posts', minAge: 18, maxAge: 30 },
  { id: 'cbn-inspector', name: 'Inspector', org: 'Central Bureau of Narcotics', minAge: 18, maxAge: 30 },
  { id: 'aso-other-l6', name: 'Assistant / Assistant Section Officer', org: 'Other Ministries/Departments/Organizations (Level 6)', minAge: 18, maxAge: 30 },
  { id: 'ea-cbic', name: 'Executive Assistant', org: 'CBIC', minAge: 18, maxAge: 30 },
  { id: 'ra-nhrc', name: 'Research Assistant', org: 'NHRC', minAge: 18, maxAge: 30 },
  { id: 'div-acct', name: 'Divisional Accountant', org: 'Offices under C&AG', minAge: 18, maxAge: 30 },
  { id: 'nia-si', name: 'Sub Inspector', org: 'National Investigation Agency', minAge: 18, maxAge: 30 },
  { id: 'ncb-si', name: 'Sub-Inspector / Junior Intelligence Officer', org: 'Narcotics Control Bureau', minAge: 18, maxAge: 30 },
  { id: 'jso', name: 'Junior Statistical Officer (JSO)', org: 'Ministry of Statistics & Programme Implementation', minAge: 18, maxAge: 32 },
  { id: 'stat-inv', name: 'Statistical Investigator Grade-II', org: 'Ministry of Home Affairs', minAge: 18, maxAge: 30 },
  { id: 'office-supt', name: 'Office Superintendent', org: 'CBDT', minAge: 18, maxAge: 30 },
  { id: 'section-head', name: 'Section Head', org: 'Director General of Foreign Trade', minAge: 18, maxAge: 30 },
  { id: 'auditor-cag', name: 'Auditor', org: 'Offices under C&AG', minAge: 18, maxAge: 27 },
  { id: 'auditor-cgda', name: 'Auditor', org: 'Offices under CGDA', minAge: 18, maxAge: 27 },
  { id: 'auditor-other', name: 'Auditor', org: 'Other Ministries/Departments', minAge: 18, maxAge: 27 },
  { id: 'accountant-cag', name: 'Accountant', org: 'Offices under C&AG', minAge: 18, maxAge: 27 },
  { id: 'accountant-cga', name: 'Accountant', org: 'Controller General of Accounts', minAge: 18, maxAge: 27 },
  { id: 'jr-accountant', name: 'Accountant / Junior Accountant', org: 'Other Ministries/Departments', minAge: 18, maxAge: 27 },
  { id: 'postal-asst', name: 'Postal Assistant / Sorting Assistant', org: 'Department of Posts', minAge: 18, maxAge: 27 },
  { id: 'ssa-udc', name: 'Senior Secretariat Assistant / Upper Division Clerk', org: 'Central Govt. Offices/Ministries other than CSCS', minAge: 18, maxAge: 27 },
  { id: 'saa-mes', name: 'Senior Administrative Assistant', org: 'Military Engineering Services', minAge: 18, maxAge: 27 },
  { id: 'tax-asst-cbdt', name: 'Tax Assistant', org: 'CBDT', minAge: 18, maxAge: 27 },
  { id: 'tax-asst-cbic', name: 'Tax Assistant', org: 'CBIC', minAge: 18, maxAge: 27 },
  { id: 'cbn-si', name: 'Sub-Inspector', org: 'Central Bureau of Narcotics', minAge: 18, maxAge: 27 },
];

export type AgeStatus = 'pass' | 'fail' | 'check';
export type FitStatus = 'ok' | 'check' | 'no';
export interface Match { exam: Exam; age: number; upper: number; upperHigh: number; minAge: number; relax: number; ageStatus: AgeStatus; fit: FitStatus; ok: boolean; why: string[]; ageClause?: string; postMaxAge?: number }
export function postAges(e: Exam): number[] {
  const raw = e.maxAgeByPost?.length ? e.maxAgeByPost : [e.maxAge];
  return [...new Set(raw)].sort((a, b) => a - b);
}
export function postMins(e: Exam): number[] {
  if (e.id === 'ssc-cgl') return [...new Set(CGL_POSTS.filter((x) => !x.ageUnstated && x.minAge != null).map((x) => x.minAge as number))].sort((a, b) => a - b);
  return [e.minAge];
}
/** ESM: fail closed unless years of military service are given, then deduct service + 3 (CGL / notices that deduct service). Does not stack on top of category + PwBD; the larger figure is used. */
export function esmExtra(e: Exam, p: Profile): number | 'check' {
  if (!p.esm) return 0;
  const deducts = /deduct/i.test(e.esmNote || '') || e.id === 'ssc-cgl';
  if (!deducts) return 0;
  if (p.esmYears == null || !Number.isFinite(p.esmYears) || p.esmYears < 0) return 'check';
  return p.esmYears + 3;
}
export type PostCap = number | { minAge: number; maxAge: number } | { ageUnstated: true; verifyNote?: string };
const isUnstatedCap = (post?: PostCap): post is { ageUnstated: true } => typeof post === 'object' && post != null && 'ageUnstated' in post && !!post.ageUnstated;
const isNamedCap = (post?: PostCap): post is { minAge: number; maxAge: number } => typeof post === 'object' && post != null && 'maxAge' in post;

/** Age check for one exam. When limits vary by post, use a named or listed cap; otherwise fail closed to Check notice naming the clause. Strong / likely eligible needs a confirmed age. Missing DOB never passes. */
export function matchExam(e: Exam, p: Profile, post?: PostCap): Match {
  const rawAge = ageOn(p.dob, e.asOn);
  const dobMissing = !p.dob || dobInvalid(p.dob) || !Number.isFinite(rawAge);
  const age = dobMissing ? NaN : rawAge;
  const catR = relaxation(e, p);
  const esm = esmExtra(e, p);
  const esmPending = esm === 'check';
  const r = typeof esm === 'number' && esm > catR ? esm : catR;
  const posts = postAges(e);
  const minsAll = postMins(e);
  const varyClause = posts.length > 1 || minsAll.length > 1 ? (e.note || 'Age limit varies by post. Check the official notice.') : undefined;
  let used: number[] | 'unknown' = posts;
  let usedMins = minsAll;
  let postMaxAge: number | undefined;
  if (typeof post === 'number') {
    postMaxAge = post;
    used = posts.includes(post) ? [post] : 'unknown';
    usedMins = used === 'unknown' ? minsAll : [e.minAge];
  } else if (isNamedCap(post)) {
    postMaxAge = post.maxAge;
    used = [post.maxAge];
    usedMins = [post.minAge];
  }
  const capBase = used === 'unknown' ? posts : used;
  const caps = capBase.map((x) => x + r);
  const tight = Math.min(...caps), loose = Math.max(...caps);
  const minLoose = Math.min(...usedMins), minTight = Math.max(...usedMins);
  const why: string[] = [];
  let ageStatus: AgeStatus = 'pass';
  let clause = varyClause;
  if (dobMissing) {
    ageStatus = 'check';
    clause = 'add a valid date of birth to confirm the age limit.';
    why.push(`Check notice: ${clause}`);
  } else if (isUnstatedCap(post)) {
    ageStatus = 'check';
    clause = 'age not stated in notice.' + (post.verifyNote ? ` ${post.verifyNote}` : '');
    why.push(`Check notice: ${clause}`);
  } else if (age < minLoose) {
    why.push(`Too young: ${age} on ${e.asOn}, minimum ${minLoose}`);
    ageStatus = 'fail';
  } else if (used === 'unknown') {
    ageStatus = 'check';
    why.push(`Check notice: ${varyClause || 'age limit varies by post'}`);
  } else if (usedMins.length === 1 && age < minTight) {
    why.push(`Too young: ${age} on ${e.asOn}, minimum ${minTight}`);
    ageStatus = 'fail';
  } else if (age > loose) {
    if (esmPending) { ageStatus = 'check'; clause = 'Ex-servicemen relaxation needs your years of military service (service deducted, then +3 years, as in the notice).'; why.push(`Check notice: ${clause}`); }
    else { why.push(`Over age: ${age} on ${e.asOn}, limit ${loose}${r ? ` incl. ${r} yr relaxation` : ''}`); ageStatus = 'fail'; }
  } else if ((used.length > 1 || usedMins.length > 1) && (age > tight || age < minTight)) {
    if (esmPending && age > tight) { ageStatus = 'check'; clause = 'Ex-servicemen relaxation needs your years of military service (service deducted, then +3 years, as in the notice).'; why.push(`Check notice: ${clause}`); }
    else { ageStatus = 'check'; why.push(`Check notice: ${varyClause}`); }
  }
  if (!eduOk(e, p)) why.push(`Needs: ${e.qual}`);
  if (e.maleOnly && p.gender !== 'male') why.push('Men only for this entry');
  const blockers = why.filter((w) => !/^Check notice/i.test(w));
  const fit: FitStatus = blockers.length ? 'no' : ageStatus === 'check' ? 'check' : ageStatus === 'fail' ? 'no' : 'ok';
  const upper = used === 'unknown' ? tight : capBase.length === 1 ? capBase[0] + r : tight;
  const selected = typeof post === 'object' && post || typeof post === 'number' && posts.includes(post);
  return { exam: e, age, upper, upperHigh: loose, minAge: used === 'unknown' ? minLoose : (usedMins.length === 1 ? usedMins[0] : minLoose), relax: r, ageStatus, fit, ok: fit === 'ok', why, ageClause: ageStatus === 'check' || (!selected && (posts.length > 1 || minsAll.length > 1)) ? (clause || varyClause) : undefined, postMaxAge };
}
export function cglPostOf(p: Profile): CglPost | 'unknown' | undefined {
  const id = (p.cglPost || '').trim();
  if (!id) return undefined;
  return CGL_POSTS.find((x) => x.id === id) || 'unknown';
}
export function match(p: Profile): Match[] {
  const order = { ok: 0, check: 1, no: 2 } as const;
  return EXAMS.map((e) => {
    if (e.id !== 'ssc-cgl') return matchExam(e, p);
    const post = cglPostOf(p);
    if (post === 'unknown') return matchExam(e, p, -1);
    if (post && post.ageUnstated) return matchExam(e, p, { ageUnstated: true, verifyNote: post.verifyNote });
    if (post) return matchExam(e, p, { minAge: post.minAge!, maxAge: post.maxAge! });
    return matchExam(e, p);
  }).sort((a, b) => order[a.fit] - order[b.fit]);
}

export const CGL_AGE_UNSTATED = 'Check notice: age not stated in notice';
export function cglPostLabel(x: CglPost): string {
  if (x.ageUnstated) return `${x.name}, ${x.org} (age not stated in notice)`;
  return `${x.name}, ${x.org} (${x.minAge}–${x.maxAge})`;
}
export function cglPostStatuses(p: Profile): { post: CglPost; status: AgeStatus; note?: string }[] {
  const exam = EXAMS.find((e) => e.id === 'ssc-cgl')!;
  return CGL_POSTS.map((post) => {
    const cap: PostCap = post.ageUnstated ? { ageUnstated: true, verifyNote: post.verifyNote } : { minAge: post.minAge!, maxAge: post.maxAge! };
    const m = matchExam(exam, p, cap);
    const note = m.ageStatus === 'check' ? m.ageClause : undefined;
    return { post, status: m.ageStatus, note };
  });
}
/** CGL stays on the results list with its per-post breakdown even when the picked post is a fail. */
export function keepExamVisible(m: Match, showAll: boolean) {
  return showAll || m.fit !== 'no' || m.exam.id === 'ssc-cgl';
}

export function cglPostGroups(p: Profile) {
  const rows = cglPostStatuses(p);
  const labels = { pass: 'Pass', check: 'Check notice', fail: 'Fail' } as const;
  return (['pass', 'check', 'fail'] as const)
    .map((status) => ({ status, label: labels[status], rows: rows.filter((r) => r.status === status) }))
    .filter((g) => g.rows.length);
}

export function ageLimitText(m: Match): { heading: string; detail: string } {
  const posts = postAges(m.exam), r = m.relax;
  if (m.ageStatus === 'check') return { heading: 'Check notice', detail: m.ageClause || m.exam.note || 'Age limit varies by post. Check the official notice.' };
  if (posts.length > 1 && m.postMaxAge == null) {
    const caps = posts.map((x) => x + r);
    const list = caps.length === 2 ? `${caps[0]} or ${caps[1]}` : `${caps.slice(0, -1).join(', ')} or ${caps[caps.length - 1]}`;
    const mins = postMins(m.exam);
    const minLabel = mins.length > 1 ? `${Math.min(...mins)} or ${Math.max(...mins)}` : String(m.minAge);
    return { heading: `${minLabel} to ${list} yrs`, detail: r > 0 ? `by post, after ${r} yrs relaxation` : 'by post, no relaxation applied' };
  }
  return { heading: `${m.minAge} to ${m.upper} yrs`, detail: r > 0 ? `after ${r} yrs relaxation` : 'no relaxation applied' };
}
export function radarText(m: Match): string | null {
  if (m.fit === 'check' && m.ageStatus === 'check') return `Check notice: ${m.ageClause || m.exam.note || 'age limit varies by post'}`;
  if (m.fit !== 'ok') return null;
  const years = m.upper - m.age;
  const lowest = postAges(m.exam).length > 1 && m.postMaxAge == null;
  const counted = "counted on this notification's date.";
  if (years <= 0) return `this is your last eligible cycle by age${lowest ? ' for the lowest post limit' : ''}, ${counted}`;
  const more = `about ${years} more year${years === 1 ? '' : 's'}`;
  return lowest ? `${more} before you cross the lowest post limit, ${counted}` : `${more} before you cross the age limit, ${counted}`;
}
export { RANK };
