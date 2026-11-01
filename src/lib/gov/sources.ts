// Official government job sources by country, as DATA (links only; nothing fetched from these in the browser). Akash Sync Agent.
// Directory compiled from the "National Government Job Search Engine Playbook" Akash supplied (verified there 2026-11-01).
// We opened each link from our own server on 2026-11-01: reach = 'ok' (page loaded) or 'slow' (timed out from outside India / bot check; usually opens in a normal browser in India).
export type Reach = 'ok' | 'slow';
export interface Source { name: string; url: string; covers: string; lesser?: boolean; note?: string; reach: Reach }
export const CHECKED = '2026-11-01';
export const IN_SOURCES: Source[] = [
  { name: 'National Career Service (NCS)', url: 'https://ncs.gov.in/job-listing', covers: 'Central, state, PSU (filter Employer type = Government; it also lists private jobs)', reach: 'ok' },
  { name: 'Employment News (Rozgar Samachar)', url: 'https://employmentnews.gov.in/newemp/AllJobs.aspx?k=All', covers: 'Weekly list: ministries, PSUs, autonomous bodies, universities', reach: 'ok', note: 'Weekly issue; good for deputation, walk-in and small-body ads.' },
  { name: 'UPSC recruitment (incl. ORA specialist posts)', url: 'https://www.upsc.gov.in/recruitment/recruitment-advertisement', covers: 'Central Group A/B, AIS, defence exams; lateral and specialist posts', reach: 'ok' },
  { name: 'SSC notice board (incl. Selection Posts)', url: 'https://ssc.gov.in/home/notice-board', covers: 'Central Group B (non-gazetted) and C; Selection Posts are niche ministry roles', lesser: true, reach: 'ok' },
  { name: 'Railway Recruitment Boards', url: 'https://rrb.indianrailways.gov.in/', covers: 'Indian Railways, all regional boards', reach: 'ok' },
  { name: 'IBPS', url: 'https://www.ibps.in/', covers: 'Public sector banks, regional rural banks, some autonomous bodies', reach: 'slow' },
  { name: 'SBI Careers (incl. Specialist Cadre Officers)', url: 'https://sbi.co.in/web/careers', covers: 'SBI PO, clerks, specialist officers (IT, risk, law) year-round', lesser: true, reach: 'ok' },
  { name: 'National Testing Agency (recruitment exams)', url: 'https://nta.ac.in/', covers: 'Non-teaching posts for High Courts, EPFO, central universities', lesser: true, reach: 'slow' },
  { name: 'India Post GDS Online', url: 'https://indiapostgdsonline.gov.in/', covers: 'Gramin Dak Sevak (merit on 10th marks, no written exam)', reach: 'slow' },
  { name: 'RBI Opportunities', url: 'https://opportunities.rbi.org.in/scripts/vacancies.aspx', covers: 'Grade B officers, legal officers, economists, lateral specialists', lesser: true, reach: 'ok' },
  { name: 'SEBI careers', url: 'https://www.sebi.gov.in/department/human-resources-department-37/opportunity.html', covers: 'Officer Grade A (general, legal, IT, engineering, research)', lesser: true, reach: 'ok' },
  { name: 'NABARD', url: 'https://www.nabard.org/', covers: 'Grade A/B managers; specialist consultants', lesser: true, reach: 'ok' },
  { name: 'IRDAI', url: 'https://irdai.gov.in/', covers: 'Assistant Manager (actuarial, finance, law, general)', lesser: true, reach: 'ok' },
  { name: 'PFRDA', url: 'https://www.pfrda.org.in/', covers: 'Assistant Manager Grade A', lesser: true, reach: 'ok' },
  { name: 'DRDO RAC', url: 'https://rac.gov.in/', covers: 'Scientist B (via GATE) and lateral scientists', lesser: true, reach: 'slow' },
  { name: 'ISRO', url: 'https://www.isro.gov.in/', covers: 'Scientists, technical and scientific assistants at each centre', lesser: true, reach: 'ok' },
  { name: 'CSIR', url: 'https://www.csir.res.in/', covers: '37 national labs: scientists, technical officers, section officers', lesser: true, reach: 'ok' },
  { name: 'AIIMS exams', url: 'https://www.aiimsexams.ac.in/', covers: 'Nursing officers (NORCET), common recruitment exam for Group B/C', reach: 'ok' },
  { name: 'ICMR', url: 'https://icmr.gov.in/', covers: 'Project scientists, research and technical posts across institutes', lesser: true, reach: 'ok' },
  { name: 'Samarth / CU-Chayan', url: 'https://samarth.edu.in/careers/', covers: 'Central university teaching and non-teaching posts (OCI eligible for faculty)', lesser: true, reach: 'ok' },
  { name: 'Supreme Court of India', url: 'https://www.sci.gov.in/', covers: 'Junior Court Assistant, Personal Assistant, Law Clerk-cum-Research Assistant', lesser: true, reach: 'ok' },
  { name: 'Join Indian Army', url: 'https://joinindianarmy.nic.in/', covers: 'TGC, SSC-Tech, NCC special entry, JAG (law), Agniveer', lesser: true, reach: 'slow' },
  { name: 'Join Indian Navy', url: 'https://www.joinindiannavy.gov.in/', covers: 'Officer and sailor entries', reach: 'slow' },
  { name: 'Indian Air Force careers', url: 'https://careerindianairforce.cdac.in/', covers: 'Officer and Agniveervayu entries', reach: 'slow' },
  { name: 'NTPC careers', url: 'https://www.ntpc.co.in/', covers: 'Executive trainees (GATE), experienced engineers', reach: 'ok' },
  { name: 'ONGC careers', url: 'https://www.ongcindia.com/', covers: 'Graduate trainees (GATE), apprentices', reach: 'ok' },
  { name: 'BHEL careers', url: 'https://www.bhel.com/', covers: 'Engineer and supervisor trainees, artisans', reach: 'ok' },
  { name: 'BECIL', url: 'https://www.becil.com/', covers: 'Contract IT, media, paramedical staff placed in ministries and AIIMS', lesser: true, reach: 'ok' },
  { name: 'EdCIL', url: 'https://www.edcilindia.co.in/', covers: 'Contract staff for education ministry bodies', lesser: true, reach: 'slow' },
  { name: 'NITI Aayog', url: 'https://www.niti.gov.in/', covers: 'Young Professionals and consultants (no civil-service age bar)', lesser: true, reach: 'ok' },
  { name: 'MyGov', url: 'https://www.mygov.in/', covers: 'Work-for-government roles and fellowships', lesser: true, reach: 'ok' },
  { name: 'All State PSCs (directory)', url: 'https://uppsc.up.nic.in/OuterPages/Other_PSC.aspx', covers: 'Links to every State Public Service Commission', reach: 'ok' },
  { name: 'Department of Public Enterprises', url: 'https://dpe.gov.in/', covers: 'List of central PSUs (each runs its own careers page)', reach: 'ok' },
];
