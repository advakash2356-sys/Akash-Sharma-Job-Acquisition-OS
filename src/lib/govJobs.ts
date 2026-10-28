// Government Jobs eligibility finder (India). Hand-curated from official notifications; every entry carries
// its source and the date it was last checked. Information only, not legal advice. Akash Sync Agent.
export type Edu = '10' | '12' | 'iti' | 'diploma' | 'grad' | 'eng' | 'pg';
export type Cat = 'GEN' | 'EWS' | 'OBC' | 'SC' | 'ST';
export type Gender = 'male' | 'female' | 'other';
export interface Profile { dob: string; edu: Edu; stream12?: 'pcm' | 'other'; cat: Cat; pwbd: boolean; esm: boolean; gender: Gender; state: string }
export interface Exam {
  id: string; name: string; body: string; group: 'UPSC' | 'SSC' | 'Banking' | 'Railways' | 'Defence' | 'Courts' | 'PSU / Research' | 'Postal';
  minAge: number; maxAge: number; asOn: string; // age reckoning date in the notification used
  edu: Edu[]; // any one of these qualifies
  qual: string; relax: 'central' | 'none' | 'obcScOnly'; esmNote?: string; maleOnly?: boolean; note?: string;
  lesser?: boolean; src: string; site: string; verified: string;
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
  { id: 'ssc-cgl', name: 'SSC CGL', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 32, asOn: '2026-08-01', edu: G, qual: 'Graduate', relax: 'central', esmNote: 'Ex-servicemen: 3 years after deducting military service.', note: 'Upper limit is 27, 30 or 32 by post.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-chsl', name: 'SSC CHSL (LDC/JSA/DEO)', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 27, asOn: '2026-08-01', edu: ['12', 'diploma', ...G], qual: 'Class 12', relax: 'central', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsl_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-mts', name: 'SSC MTS & Havaldar', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 27, asOn: '2026-01-01', edu: ['10', '12', 'iti', 'diploma', ...G], qual: 'Class 10', relax: 'central', note: 'MTS 18 to 25; Havaldar and some MTS posts 18 to 27.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_RHQ_2026_phase_xiv.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-gd', name: 'SSC GD Constable (CAPFs, SSF, Assam Rifles)', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 23, asOn: '2026-01-01', edu: ['10', '12', 'iti', 'diploma', ...G], qual: 'Class 10', relax: 'central', note: 'Physical standards apply.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_CTGD_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-je', name: 'SSC Junior Engineer (Civil/Electrical/Mechanical)', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 32, asOn: '2026-08-01', edu: ['diploma', 'eng'], qual: 'Engineering diploma or degree in Civil/Electrical/Mechanical', relax: 'central', note: 'Up to 30 for most posts; CPWD up to 32. Some posts need experience for diploma holders.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_je_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ssc-steno', name: 'SSC Stenographer Grade C & D', body: 'SSC', group: 'SSC', minAge: 18, maxAge: 30, asOn: '2026-08-01', edu: ['12', 'diploma', ...G], qual: 'Class 12 + shorthand skill test', relax: 'central', note: 'Grade C 18 to 30; Grade D 18 to 27.', src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_steno_2026.pdf', site: 'https://ssc.gov.in', verified: V },
  { id: 'ibps-po', name: 'IBPS PO/MT', body: 'IBPS', group: 'Banking', minAge: 20, maxAge: 30, asOn: '2026-07-01', edu: G, qual: 'Graduate, any discipline', relax: 'central', esmNote: 'Ex-servicemen: 5 years (as per notice).', src: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf', site: 'https://ibps.in', verified: V },
  { id: 'ibps-clerk', name: 'IBPS Clerk (CSA)', body: 'IBPS', group: 'Banking', minAge: 20, maxAge: 28, asOn: '2026-08-01', edu: G, qual: 'Graduate; state official language', relax: 'central', src: 'https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf', site: 'https://ibps.in', verified: V },
  { id: 'sbi-po', name: 'SBI PO', body: 'SBI', group: 'Banking', minAge: 21, maxAge: 30, asOn: '2026-04-01', edu: G, qual: 'Graduate', relax: 'central', src: 'https://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf', site: 'https://sbi.bank.in/web/careers', verified: V },
  { id: 'sbi-clerk', name: 'SBI Clerk (Junior Associate)', body: 'SBI', group: 'Banking', minAge: 20, maxAge: 28, asOn: '2026-04-01', edu: G, qual: 'Graduate; local language', relax: 'central', src: 'https://sbi.bank.in/web/careers/junior-associate', site: 'https://sbi.bank.in/web/careers', verified: V },
  { id: 'rbi-b', name: 'RBI Grade B Officer', body: 'RBI', group: 'Banking', minAge: 21, maxAge: 30, asOn: '2026-04-01', edu: G, qual: 'Graduate with minimum marks set in the notice', relax: 'central', src: 'https://www.rbi.org.in/scripts/Bs_viewcontent.aspx?Id=4997', site: 'https://opportunities.rbi.org.in', verified: V },
  { id: 'rbi-asst', name: 'RBI Assistant', body: 'RBI', group: 'Banking', minAge: 20, maxAge: 28, asOn: '2026-02-01', edu: G, qual: 'Graduate; local language', relax: 'central', src: 'https://ibpsreg.ibps.in/rbiafeb26/', site: 'https://opportunities.rbi.org.in', verified: V },
  { id: 'rrb-ntpc-g', name: 'RRB NTPC Graduate', body: 'RRB', group: 'Railways', minAge: 18, maxAge: 33, asOn: '2027-01-01', edu: G, qual: 'Graduate', relax: 'central', src: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2321873', site: 'https://rrb.indianrailways.gov.in', verified: V },
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
const RANK: Record<Edu, number> = { '10': 0, iti: 1, '12': 1, diploma: 1, grad: 2, eng: 2, pg: 3 };
export const dobInvalid = (dob: string, today = new Date().toISOString().slice(0, 10)) => !!dob && (isNaN(Date.parse(dob)) || dob >= today);
export function ageOn(dob: string, on: string) { const b = new Date(dob), d = new Date(on); let a = d.getFullYear() - b.getFullYear(); const m = d.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && d.getDate() < b.getDate())) a--; return a; }
export function relaxation(e: Exam, p: Profile) {
  if (e.relax === 'none') return 0;
  const c = p.cat === 'SC' || p.cat === 'ST' ? 5 : p.cat === 'OBC' ? 3 : 0;
  if (e.relax === 'obcScOnly') return c;
  return c + (p.pwbd ? 10 : 0);
}
export function eduOk(e: Exam, p: Profile) {
  if (e.edu.includes(p.edu)) return true;
  if (p.edu === 'pg') return e.edu.includes('grad');
  if (p.edu === 'eng') return e.edu.includes('grad');
  return false;
}
export interface Match { exam: Exam; age: number; upper: number; ok: boolean; why: string[] }
export function match(p: Profile): Match[] {
  return EXAMS.map((e) => {
    const age = ageOn(p.dob, e.asOn), r = relaxation(e, p), upper = e.maxAge + r, why: string[] = [];
    if (age < e.minAge) why.push(`Too young: ${age} on ${e.asOn}, minimum ${e.minAge}`);
    if (age > upper) why.push(`Over age: ${age} on ${e.asOn}, limit ${upper}${r ? ` incl. ${r} yr relaxation` : ''}`);
    if (!eduOk(e, p)) why.push(`Needs: ${e.qual}`);
    if (e.maleOnly && p.gender !== 'male') why.push('Men only for this entry');
    return { exam: e, age, upper, ok: why.length === 0, why };
  }).sort((a, b) => Number(b.ok) - Number(a.ok));
}
export { RANK };
