// t386u PR #39 NO-GO (Website Testing Final on af8b2b0) regression tests: one or more per item.
// Postings built with P() are sample shapes, not real vacancies. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { govResults, qualFits, type Search } from '../src/lib/gov/filter';
import { matchLabel, profileFit } from '../src/lib/gov/rank';
import { branchGate, disciplineGate, lawStreams, LAW_UNCOVERED } from '../src/lib/gov/gates';
import type { Profile } from '../src/lib/govJobs';
import { eduTagsOf, enrich, NOT_A_JOB } from '../server/govPostings';
import { fromS3waas, S3_SITES } from '../server/govOfficial';
const T = '2026-11-14'; let n = 0;
const P = (title: string, x: Record<string, unknown> = {}) => ({ id: String(++n), title, org: 'Govt body', location: '', eligibility: '', state: 'All India', lesserKnown: false, official: true, lastDate: '2026-12-10', pay: '', vacancies: '', ...x } as any);
const base: Profile = { dob: '2000-01-01', edu: 'grad', cat: 'GEN', pwbd: false, esm: false, gender: 'female', state: 'Uttar Pradesh', expYears: 2, eduSet: true };
const lawyer: Profile = { ...base, spec: 'law', subject: 'BA LLB', bar: true };
const cse: Profile = { ...base, edu: 'eng', spec: 'engineering', subject: 'B.Tech CSE' };
const civil: Profile = { ...base, edu: 'eng', spec: 'engineering', subject: 'B.Tech Civil' };
const doctor: Profile = { ...base, spec: 'medical', subject: 'MBBS', medReg: true };
const ca: Profile = { ...base, spec: 'finance', subject: 'B.Com, CA', icai: true };
const twelfth: Profile = { ...base, edu: '12', spec: '', subject: '' };
const F: Search = { q: '', state: '', lesser: false, official: false, soon: false, deputation: false, sort: 'rank', allLevels: false };
const ids = (l: any[]) => l.map((p) => p.title);
const s3row = (title: string, desc: string, start = '01-11-2026', end = '30-11-2026') => `<table class="data-table-1"><tbody><tr><td>${title}</td><td>${desc}</td><td>${start}</td><td>${end}</td><td><a href="https://cdnbbsr.s3waas.gov.in/x.pdf">View</a></td></tr></tbody></table>`;
const site = (h: string) => { const s = S3_SITES.find((x) => x.host.startsWith(h)); assert.ok(s, h); return s!; };

test('H1: CA with ICAI sees "CA / CMA" posts; CMA is not a PG tag', () => {
  const tags = eduTagsOf('Finance Officer, NTPC. CA / CMA (ICAI or ICMAI member)');
  assert.ok(!tags.includes('PG'), `tags ${tags}`);
  const fo = P('Finance Officer', { org: 'NTPC Limited', level: 'psu', eligibility: 'CA / CMA (ICAI or ICMAI member)', eduTags: tags });
  assert.equal(disciplineGate(fo, ca).ok, true); assert.equal(qualFits(fo, ca), true);
  assert.ok(ids(govResults([fo], F, ca, [], T).list).includes('Finance Officer'));
  // Even with a stale PG tag, a passing professional discipline gate wins.
  assert.equal(qualFits({ ...fo, eduTags: ['PG'] }, ca), true);
  for (const t of ['MA in Economics', 'M.A. (English)', 'MBA Finance', 'M.Sc Physics', 'M.Tech']) assert.ok(eduTagsOf(t).includes('PG'), t);
  for (const t of ['CMA Inter', 'DMA trainee', 'Dharma Pracharak']) assert.ok(!eduTagsOf(t).includes('PG'), t);
});

test('M1a: Hindi floor titles (पारा विधिक स्वयंसेवक, चपरासी, लिपिक, आरक्षी…) are hidden from degree holders', () => {
  for (const t of ['पारा विधिक स्वयंसेवक का चयन', 'चपरासी पद हेतु भर्ती', 'लिपिक एवं टंकक', 'आदेशपाल', 'वाहन चालक', 'आरक्षी भर्ती', 'होमगार्ड स्वयंसेवक'])
    for (const p of [lawyer, cse, doctor, ca]) assert.equal(profileFit(P(t, { org: 'District Legal Services Authority, Bhojpur', state: 'Bihar' }), p).belowLevel, true, `${t} / ${p.subject}`);
  assert.equal(profileFit(P('चपरासी पद हेतु भर्ती'), twelfth).belowLevel, false, '12th-pass still sees it');
});

test('M1b: floor applies even when the subject check fails (Junior Assistant / Typist never reaches engineer, MBBS, CA)', () => {
  const ja = P('Recruitment of Junior Assistants / Typist-cum-Assistants', { org: 'District Court', eligibility: 'Graduate with typing in English', eduTags: ['GRADUATE'] });
  for (const p of [cse, doctor, ca]) { assert.equal(profileFit(ja, p).belowLevel, true, p.subject); assert.equal(govResults([ja], F, p, [], T).list.length, 0, p.subject); }
});

test('M2: non-job filters are case- and plural-insensitive; Mahabubnagar hall-ticket notice is dropped', () => {
  for (const t of ['Hall Tickets released', 'HALL TICKET', 'Admit Cards', 'Results declared', 'Call Letters']) assert.match(t, NOT_A_JOB, t);
  const html = s3row('Recruitment of Junior Assistants and Typist-cum-Assistants', 'Links are available for downloading the Hall Tickets for the written test');
  assert.equal(fromS3waas(html, site('mahabubnagar'), T).length, 0);
  assert.equal(fromS3waas(s3row('Recruitment of Junior Assistants', 'Results of the written test'), site('mahabubnagar'), T).length, 0);
  assert.equal(fromS3waas(s3row('Notification for recruitment of Junior Assistants', 'Applications are invited for the post of Junior Assistant'), site('mahabubnagar'), T).length, 1, 'a real call stays');
});

test('M3: retired-staff / re-employment notices are dropped', () => {
  const html = s3row('Inviting applications from eligible and willing retired employees of the Judicial Department', 'Applications invited for engagement of retired employees on contract basis');
  assert.equal(fromS3waas(html, site('ernakulam'), T).length, 0);
  assert.equal(enrich(P('Re-employment of retired officers as Consultant', { eligibility: 'Retired Government officers' }), ''), null);
  assert.notEqual(enrich(P('Assistant Engineer (Civil)', { eligibility: 'B.E. Civil' }), ''), null);
});

test('M4: engineering branch gate (CSE is not Civil / Environmental); Scientist B (Env) needs Env Sci', () => {
  const je = P('Junior Engineer (Civil)', { eligibility: 'B.E. / B.Tech in Civil Engineering', eduTags: ['ENGINEERING'] });
  assert.equal(branchGate(je, cse).ok, false); assert.equal(disciplineGate(je, cse).ok, false); assert.equal(qualFits(je, cse), false);
  assert.equal(disciplineGate(je, civil).ok, true); assert.notEqual(qualFits(je, civil), false);
  const ee = P('Environmental Engineer', { org: 'CPCB', eligibility: 'B.E. Environmental Engineering or M.Sc Environmental Science' });
  assert.equal(disciplineGate(ee, cse).ok, false); assert.equal(disciplineGate(ee, { ...base, edu: 'pg', subject: 'MSc Environmental Science' }).ok, true);
  const sb = P('Scientist B (Environment)', { org: 'CPCB', eligibility: "Master's degree in Environmental Science" });
  assert.equal(disciplineGate(sb, cse).ok, false); assert.notEqual(matchLabel(sb, cse, T).label, 'eligible'); assert.notEqual(matchLabel(sb, cse, T).label, 'strong');
  const get = P('Graduate Engineer Trainee (Computer Science)', { org: 'BEL', eligibility: 'B.E./B.Tech in Computer Science' });
  assert.equal(disciplineGate(get, cse).ok, true); assert.equal(disciplineGate(get, civil).ok, false);
  assert.equal(branchGate(je, { ...cse, subject: 'B.Tech' }).ok, null, 'unknown branch is a check, not a fail');
});

test('M5: no Strong match unless the age limit is confirmed', () => {
  const lo = P('Law Officer', { org: 'Coal India Limited', level: 'psu', eligibility: 'LLB', pay: 'E2 Rs 50,000 - 1,60,000' });
  const m = matchLabel(lo, lawyer, T); assert.equal(m.label, 'check'); assert.match(m.why.join(' '), /verify the age limit/);
  assert.equal(matchLabel({ ...lo, maxAge: 35 }, lawyer, T).label, 'strong');
});

test('M6: a 12th-pass profile is not shown degree-only posts and is never told to add a degree subject', () => {
  const posts = [P('Spl. Judicial Magistrate', { eligibility: 'Retired judicial officers or law graduates' }), P('Oath Commissioner', { eligibility: 'Advocates with 7 years practice' }),
    P('Director', { org: 'CSIR', pay: 'Level 14', eligibility: 'PhD with 15 years experience' }), P('Accounts Officer', { org: 'CAG', eligibility: 'Graduate with CA / CMA', eduTags: ['GRADUATE'] }),
    P('Junior Engineer (Civil)', { eligibility: 'B.E. Civil', eduTags: ['ENGINEERING'] })];
  for (const p of posts) { assert.equal(qualFits(p, twelfth), false, p.title); assert.doesNotMatch(matchLabel(p, twelfth, T).why.join(' '), /add your degree subject/i, p.title); }
  const mts = P('Multi Tasking Staff', { eligibility: '12th pass', eduTags: ['12TH'] }); assert.notEqual(qualFits(mts, twelfth), false);
  const dip = P('Junior Engineer (Civil)', { eligibility: 'Diploma in Civil Engineering' }); assert.notEqual(qualFits(dip, { ...twelfth, edu: 'diploma', subject: 'Diploma Civil' }), false);
});

test('L2: lawyer note splits courts/ministries, PSUs, banks, regulators and names uncovered streams', () => {
  const st = lawStreams([P('Law Officer', { org: 'Ministry of Law' }), P('Law Officer', { org: 'Coal India Limited' }), P('Specialist Officer (Law)', { org: 'Bank of Baroda' }), P('Legal Officer Grade B', { org: 'Reserve Bank of India' })]);
  assert.deepEqual(st.map((x) => x.n), [0, 0, 1, 1, 1, 1]); assert.equal(LAW_UNCOVERED.length, 3); assert.ok(st.filter((x) => x.uncovered).every((x) => LAW_UNCOVERED.includes(x.name)));
});

test('L3: "Only near me" filters out-of-state posts and counts them', () => {
  const list = [P('Law Officer', { state: 'Uttar Pradesh', level: 'state' }), P('Law Officer', { state: 'Kerala', level: 'state' }), P('Law Officer', { state: 'All India' })];
  const r = govResults(list, F, { ...lawyer, relocate: false }, [], T); assert.equal(r.far, 1); assert.ok(r.list.every((p) => p.state !== 'Kerala'));
  assert.equal(govResults(list, F, lawyer, [], T).far, 0);
});

test('L5: "Gate Keepers" is not tagged engineering; GATE score still is', () => {
  assert.ok(!eduTagsOf('Recruitment of Gate Keepers').includes('ENGINEERING')); assert.ok(!eduTagsOf('Gate Keeper').includes('ENGINEERING'));
  assert.ok(eduTagsOf('Recruitment through GATE 2026 score').includes('ENGINEERING')); assert.ok(eduTagsOf('B.Tech in any branch').includes('ENGINEERING'));
  assert.ok(!eduTagsOf('Candidates should be graduates').includes('ENGINEERING'));
  assert.equal(profileFit(P('Recruitment of Gate Keepers'), civil).field, false);
});

test('L4: District Court cards say "listing ends" unless a real last date is parsed', () => {
  const [a] = fromS3waas(s3row('Recruitment of Process Server', 'Applications are invited for the post of Process Server'), site('jalaun'), T); assert.equal(a.dateKind, 'listing');
  const [b] = fromS3waas(s3row('Recruitment of Stenographer', 'Applications invited. Last date for receipt 25-11-2026'), site('jalaun'), T); assert.equal(b.dateKind, 'last'); assert.equal(b.lastDate, '2026-11-25');
});

// Akash (3:03 PM IST): "Related fit" = adjacent roles suited by education AND experience, above the floor, ranked after exact matches.
test('Related fit: a lawyer sees compliance, legal-analyst, policy and data-analyst posts at their level, after law posts', async () => {
  const { relatedFit, profileSortKey, compareKeys } = await import('../src/lib/gov/rank');
  const law5: Profile = { ...lawyer, expYears: 5 };
  const rel = [P('Compliance Officer', { org: 'SEBI', pay: 'Level 10', eligibility: 'Any graduate with 3 years experience', maxAge: 35 }), P('Research Analyst (Regulatory)', { org: 'IFSCA', pay: 'Rs 60,000 per month', eligibility: 'Graduate', maxAge: 40 }),
    P('Policy Officer', { org: 'Ministry of Consumer Affairs', pay: 'Level 10', eligibility: 'Any degree', maxAge: 40 }), P('Data Analyst', { org: 'NHAI', pay: 'Level 8', eligibility: 'Graduate in any discipline', maxAge: 40 })];
  for (const p of rel) { const m = matchLabel(p, law5, T); assert.equal(m.label, 'related', p.title); assert.match(m.why[0], /^Related fit: the notice asks for .+; your BA LLB and 5 yrs of work experience meet it\. \S/, p.title); assert.ok(relatedFit(p, law5)); }
  assert.match(matchLabel(rel[0], law5, T).why[0], /asks for graduate degree in any discipline \+ 3 yrs experience/);
  // A legal-analyst post is already a law post (exact profession), so it is shown and ranks with law posts.
  const la = P('Legal Analyst', { org: 'NITI Aayog', pay: 'Rs 60,000 per month', eligibility: 'Graduate' }); assert.equal(profileFit(la, law5).field, true); assert.equal(govResults([la], F, law5, [], T).list.length, 1);
  // Stays above the floor: clerical / menial "compliance" or data-entry posts are never Related fit.
  for (const p of [P('Compliance Clerk', { eligibility: '12th pass' }), P('Data Entry Operator (Policy Cell)', { eligibility: 'Graduate' }), P('Junior Assistant (Compliance)')]) { assert.equal(relatedFit(p, law5), null, p.title); assert.notEqual(matchLabel(p, law5, T).label, 'related', p.title); }
  // A hard gate still wins: a data-analyst post that needs Statistics is not offered to an LLB.
  assert.equal(relatedFit(P('Data Analyst', { pay: 'Level 8', eligibility: "Master's in Statistics" }), law5), null);
  // Ranking: exact law posts first, then Related fit, then the rest.
  const lo = P('Law Officer', { org: 'Coal India Limited', level: 'psu', pay: 'E2 Rs 50,000 - 1,60,000', eligibility: 'LLB', maxAge: 40 }); const other = P('Assistant Director (Tourism)', { pay: 'Level 10', eligibility: 'Graduate' });
  const sorted = [other, rel[0], lo].sort((a, b) => compareKeys(profileSortKey(a, law5, T), profileSortKey(b, law5, T)));
  assert.deepEqual(ids(sorted), ['Law Officer', 'Compliance Officer', 'Assistant Director (Tourism)']);
  assert.deepEqual(ids(govResults([other, rel[0], lo], F, law5, [], T).list).slice(0, 2), ['Law Officer', 'Compliance Officer']);
});
test('Related fit: an MSc Env Sci sees research, data and policy posts', async () => {
  const { relatedFit } = await import('../src/lib/gov/rank');
  const env: Profile = { ...base, edu: 'pg', spec: '', subject: 'MSc Environmental Science', expYears: 3 };
  for (const p of [P('Research Associate', { org: 'CSIR-NEERI', pay: 'Rs 58,000 per month', eligibility: 'PG in Science', maxAge: 40 }), P('GIS Analyst', { org: 'Forest Survey of India', pay: 'Level 7', eligibility: 'Post graduate', maxAge: 40 }), P('Policy Consultant', { org: 'MoEFCC', pay: 'Rs 80,000 per month', eligibility: 'Masters degree', maxAge: 40 })]) {
    const m = matchLabel(p, env, T); assert.equal(m.label, 'related', p.title); assert.match(m.why[0], /your MSc Environmental Science and 3 yrs of work experience meet it/, p.title);
  }
  assert.equal(relatedFit(P('Field Attendant (Forest)', { eligibility: '10th pass', eduTags: ['10TH'] }), env), null, 'below the floor');
  assert.equal(relatedFit(P('Research Associate (Law)', { pay: 'Rs 58,000', eligibility: 'LLM' }), env), null, 'law research needs a law degree');
});

// ---------- Retest of 4a6261b (REPORT-retest.md) ----------
test('retest M1: Hindi floor covers ड्राइवर, स्वीपर, जमादार, रसोइया, गार्ड and common variants', () => {
  for (const t of ['ड्राइवर पद हेतु आवेदन', 'स्वीपर की भर्ती', 'जमादार', 'रसोइया पद', 'गार्ड भर्ती', 'सुरक्षा गार्ड', 'चालक', 'सफाईकर्मी', 'सफाई कर्मचारी', 'चौकीदार', 'माली', 'अर्दली', 'ड्राईवर'])
    for (const p of [lawyer, cse, doctor, ca, { ...base, edu: 'pg', spec: '', subject: 'MSc Environmental Science' } as Profile]) assert.equal(profileFit(P(t, { org: 'District Court', state: 'Bihar' }), p).belowLevel, true, `${t} / ${p.subject}`);
  assert.equal(profileFit(P('ड्राइवर पद हेतु आवेदन'), twelfth).belowLevel, false);
});
test('retest M2: CA badge for "Risk Officer, CA / MBA Finance" is not "May not qualify"', async () => {
  const { eligibilityBadge } = await import('../src/lib/gov/rank');
  const ro = P('Risk Officer', { org: 'SIDBI', pay: 'Level 10', eligibility: 'CA / MBA Finance', eduTags: eduTagsOf('CA / MBA Finance'), maxAge: 40 });
  const e = eligibilityBadge(ro, ca, T); assert.notEqual(e.badge, 'maynot'); assert.doesNotMatch(e.why.join(' '), /higher qualification/);
  assert.doesNotMatch(matchLabel(ro, ca, T).why.join(' '), /May not qualify/); assert.equal(qualFits(ro, ca), true);
  assert.equal(eligibilityBadge(ro, { ...base, spec: '', subject: 'BA History' }, T).badge, 'maynot', 'a BA History grad still fails');
});
test('retest M3: a degree named as "preferred" never makes a post exact; every Related fit ranks after every exact match', async () => {
  const { profileSortKey, compareKeys } = await import('../src/lib/gov/rank');
  const law5: Profile = { ...lawyer, expYears: 5 };
  const pc = P('Policy Consultant', { org: 'NITI Aayog', pay: 'Rs 1,00,000 per month', eligibility: 'Graduate in any discipline. LLB preferred.', maxAge: 45 });
  const co = P('Compliance Officer', { org: 'SEBI', pay: 'Level 10', eligibility: 'Graduate; LLB (desirable)', maxAge: 35 });
  const comp = P('Compliance Manager', { org: 'IFSCA', pay: 'Level 11', eligibility: 'LLB with 3 years experience', maxAge: 40 });
  for (const p of [pc, co, comp]) { assert.equal(profileFit(p, law5).field, false, p.title); assert.equal(matchLabel(p, law5, T).label, 'related', p.title); }
  const lo = P('Law Officer', { org: 'Coal India Limited', level: 'psu', pay: 'E2 Rs 50,000 - 1,60,000', eligibility: 'LLB', maxAge: 40 });
  const cj = P('Civil Judge (Junior Division)', { state: 'Uttar Pradesh', level: 'state', eligibility: 'LLB; enrolled as an advocate', maxAge: 35 });
  const la = P('Legal Analyst', { pay: 'Rs 60,000 per month', eligibility: 'LLB preferred' }); assert.equal(profileFit(la, law5).field, true, 'core title is the profession');
  const da = P('Data Analyst', { org: 'NHAI', pay: 'Level 8', eligibility: 'Graduate in any discipline' }); const ot = P('Assistant Director (Tourism)', { pay: 'Level 10', eligibility: 'Graduate' });
  const all = [pc, ot, da, co, lo, comp, cj, la];
  const sorted = [...all].sort((a, b) => compareKeys(profileSortKey(a, law5, T), profileSortKey(b, law5, T)));
  const kind = (p: any) => profileFit(p, law5).field ? 0 : matchLabel(p, law5, T).label === 'related' ? 1 : 2;
  const ks = sorted.map(kind); assert.deepEqual(ks, [...ks].sort(), `order ${ids(sorted)} kinds ${ks}`);
  assert.ok(ids(sorted).indexOf('Law Officer') < ids(sorted).indexOf('Policy Consultant'));
  const shown = govResults(all, F, law5, [], T).list.map(kind); assert.deepEqual(shown, [...shown].sort(), 'govResults keeps exact before related');
});
test('retest Low: hyphenated non-job notices and Retd./pensioner/superannuated notices are dropped', () => {
  assert.match('Download Hall-Tickets', NOT_A_JOB); assert.match('Admit-Card released', NOT_A_JOB);
  assert.equal(fromS3waas(s3row('Recruitment of Junior Assistants', 'Hall-Tickets for the written test'), site('mahabubnagar'), T).length, 0);
  for (const t of ['Engagement of Retd. employees as Consultant', 'Engagement of retd. Govt. officers', 'Engagement of pensioners on contract', 'Engagement of superannuated judicial officers'])
    { assert.equal(enrich(P(t), ''), null, t); assert.equal(fromS3waas(s3row(t, 'Applications are invited'), site('ernakulam'), T).length, 0, t); }
});
test('retest Low: each related reason fits its role; lawyer keeps Data Analyst as Related fit', () => {
  const law5: Profile = { ...lawyer, expYears: 5 };
  const pa = matchLabel(P('Policy Analyst', { pay: 'Level 10', eligibility: 'Any graduate', maxAge: 40 }), law5, T); assert.equal(pa.label, 'related'); assert.match(pa.why[0], /policy/i); assert.doesNotMatch(pa.why[0], /analytical/);
  const da = matchLabel(P('Data Analyst', { pay: 'Level 8', eligibility: 'Graduate in any discipline', maxAge: 40 }), law5, T); assert.equal(da.label, 'related'); assert.match(da.why[0], /analytical and research skills/);
  const ep = matchLabel(P('Policy Analyst', { pay: 'Level 10', eligibility: 'Any graduate', maxAge: 40 }), { ...civil, expYears: 2 }, T); assert.equal(ep.label, 'related'); assert.match(ep.why[0], /policy/i); assert.doesNotMatch(ep.why[0], /quantitative|data \/ analysis/);
});
test('retest Low: near-me left-out count counts only posts that pass the other filters', () => {
  const list = [P('Law Officer', { state: 'Kerala', level: 'state' }), P('Peon', { state: 'Kerala', eduTags: ['10TH'] }), P('Lower Division Clerk', { state: 'Kerala' }), P('Law Officer', { state: 'Uttar Pradesh', level: 'state' })];
  const r = govResults(list, F, { ...lawyer, relocate: false }, [], T); assert.equal(r.far, 1); assert.equal(r.list.length, 1);
  assert.equal(govResults(list, { ...F, allLevels: true }, { ...lawyer, relocate: false }, [], T).far, 3, 'show all levels counts all of them');
});
test('retest Low: 12th pass gets a small Related list of clerk / DEO / assistant posts at their level, never officer posts', async () => {
  const { relatedFit } = await import('../src/lib/gov/rank');
  for (const p of [P('Lower Division Clerk', { eligibility: '12th pass with typing', eduTags: ['12TH'] }), P('Data Entry Operator', { eligibility: '12th pass', eduTags: ['12TH'] }), P('Office Assistant', { eligibility: 'Intermediate (12th)', eduTags: ['12TH'] })]) {
    const m = matchLabel({ ...p, maxAge: 30 }, twelfth, T); assert.equal(m.label, 'related', p.title); assert.match(m.why[0], /Related fit: the notice asks for 12th pass; your 12th pass( and \d+ yrs of work experience)? meets? it\. Office and data-entry work at your level \(12th pass\)/, p.title);
  }
  for (const p of [P('Assistant Section Officer', { eligibility: '12th pass', eduTags: ['12TH'] }), P('Data Entry Operator', { eligibility: 'Graduate', eduTags: ['GRADUATE'] }), P('Junior Assistant', { pay: 'Level 10', eligibility: 'Any graduate', eduTags: ['GRADUATE'] }), P('Peon', { eduTags: ['10TH'] })])
    assert.equal(relatedFit(p, twelfth), null, p.title);
  assert.equal(relatedFit(P('Lower Division Clerk', { eduTags: ['12TH'] }), lawyer), null, 'degree holders never get clerical Related fit');
});

// ---------- Retest 2 of 40890ef (REPORT-retest2.md) ----------
const env3: Profile = { ...base, edu: 'pg', spec: '', subject: 'MSc Environmental Science', expYears: 3 };
const DEG = [lawyer, cse, doctor, ca, env3, { ...base, spec: '', subject: 'BA History' } as Profile];
test('retest2 M1: floor title list covers regional variants (Hindi / Marathi / English)', () => {
  const words = ['भृत्य', 'शिपाई', 'पहारेकरी', 'ड्रायव्हर', 'मेहतर', 'जलवाहक', 'पानीवाला', 'हमाल', 'खानसामा', 'स्वच्छताकर्मी', 'पहरेदार', 'लश्कर', 'मसालची', 'फर्राश', 'वाहनचालक', 'चालकों की भर्ती', 'रखवालदार', 'माळी',
    'Multi Purpose Worker', 'Sanitary Worker', 'Waterman', 'Bearer', 'Farash', 'Masalchi', 'Lascar', 'Hamal', 'Ward Boy', 'Cook-cum-Helper', 'Safaiwala', 'Beldar'];
  for (const w of words) { for (const p of DEG) assert.equal(profileFit(P(`${w} पद`, { org: 'District Court' }), p).belowLevel, true, `${w} / ${p.subject}`); assert.equal(profileFit(P(`${w} पद`), twelfth).belowLevel, false, `${w} / 12th`); }
});
test('retest2 M1: structural floor (Group D / Class IV / चतुर्थ श्रेणी / ग्रुप डी / गट-ड / pay level 1 / 8th-10th-ITI minimum) blocks degree profiles', () => {
  const posts = [P('Group D posts in District Court'), P('Class IV employees recruitment'), P('चतुर्थ श्रेणी कर्मचारी भर्ती'), P('ग्रुप डी भर्ती'), P('समूह घ के पद'), P('गट-ड पदभरती'), P('कार्यालय सहायक (चतुर्थ श्रेणी)'),
    P('Office Attendant-II', { pay: 'Pay Level 1 (Rs 18,000-56,900)' }), P('Process Assistant', { eligibility: '10th pass' }), P('Technician', { eligibility: 'ITI in Electrician trade' }), P('Record Sorter', { eligibility: '8th class pass' }), P('भर्ती सूचना: सहयोगी', { eligibility: 'दसवीं उत्तीर्ण' })];
  for (const x of posts) { for (const p of DEG) assert.equal(profileFit(x, p).belowLevel, true, `${x.title} / ${p.subject}`); assert.equal(profileFit(x, twelfth).belowLevel, false, `${x.title} / 12th`); }
  // Group C / Class III / level 2-5: blocked only when the minimum is below graduation.
  const gc12 = P('Assistant (Group C)', { pay: 'Level 4', eligibility: '12th pass with typing' }); const gcGrad = P('Assistant (Group C)', { pay: 'Level 4', eligibility: 'Graduate in any discipline' });
  for (const p of DEG) { assert.equal(profileFit(gc12, p).belowLevel, true, p.subject); }
  assert.equal(profileFit(gcGrad, { ...base, spec: '', subject: 'BA History' }).belowLevel, false, 'graduate-minimum Group C is not blocked for a general graduate');
  assert.equal(profileFit(P('तृतीय श्रेणी सहायक', { eligibility: 'इंटरमीडिएट उत्तीर्ण' }), env3).belowLevel, true);
  // Officer posts are never blocked by the structural gate.
  for (const x of [P('Section Officer (Group C)', { pay: 'Level 5', eligibility: '12th pass' }), P('Inspector, Class III', { eligibility: '12th pass' }), P('Assistant Engineer', { pay: 'Level 10', eligibility: 'B.E. Civil; candidates must know Hindi at matric level' })])
    assert.equal(profileFit(x, civil).belowLevel, false, x.title);
});
test('retest2 M2: whole-token matching: चालक never matches inside संचालक; Director posts are shown', () => {
  const dirs = [P('सहायक संचालक (कृषि)', { level: 'state', pay: 'Level 10' }), P('उप संचालक, लोक अभियोजन', { level: 'state', pay: 'Level 11' }), P('संचालक, पर्यावरण नियोजन', { level: 'state', pay: 'Level 13' })];
  for (const d of dirs) for (const p of DEG) { assert.equal(profileFit(d, p).belowLevel, false, `${d.title} / ${p.subject}`); assert.equal(govResults([d], F, p, [], T).list.length, 1, `${d.title} shown / ${p.subject}`); }
  assert.equal(profileFit(P('स्टाफ नर्स (परिचारिका)'), doctor).belowLevel, false, 'परिचारिका (nurse) is not परिचारक');
  assert.equal(profileFit(P('सफाई निरीक्षक'), env3).belowLevel, false, 'sanitary inspector is an inspector, not a sweeper');
  assert.equal(profileFit(P('वाहन चालक'), lawyer).belowLevel, true);
});
test('retest2 M3: only the preferred phrase is dropped; every preference wording is caught; required degree stays exact', async () => {
  const { requiredPart, profileSortKey, compareKeys } = await import('../src/lib/gov/rank');
  const law5: Profile = { ...lawyer, expYears: 5 };
  for (const e of ['Graduate. Preference will be given to LLB holders.', 'Graduate; LLB holders will be given weightage', 'Graduate, preferably LLB', 'Graduate, LLB is an added advantage', 'Graduate; LLB desirable but not essential', 'Graduate (LLB desirable)', 'Graduate\nDesirable: LLB'])
    assert.equal(profileFit(P('Consultant (Grade II)', { pay: 'Level 10', eligibility: e }), law5).field, false, e);
  assert.match(requiredPart('Degree in Law (LLB) with 3 years experience, experience in a PSU preferred'), /Degree in Law \(LLB\) with 3 years experience/);
  assert.doesNotMatch(requiredPart('Degree in Law (LLB) with 3 years experience, experience in a PSU preferred'), /PSU/);
  const mg = P('Manager (Grade A)', { pay: 'Level 11', eligibility: 'Degree in Law (LLB) with 3 years experience, experience in a PSU preferred', maxAge: 40 });
  const mg2 = P('Manager (Grade A)', { pay: 'Level 11', eligibility: 'Essential: LLB with 3 years experience, Desirable: PSU experience', maxAge: 40 });
  for (const m of [mg, mg2]) assert.equal(profileFit(m, law5).field, true, m.eligibility);
  const rel = P('Policy Consultant', { pay: 'Rs 1,00,000 per month', eligibility: 'Masters in Public Policy. LLB preferred.', maxAge: 45 });
  const sorted = [rel, mg, mg2].sort((a, b) => compareKeys(profileSortKey(a, law5, T), profileSortKey(b, law5, T)));
  assert.equal(ids(sorted)[2], 'Policy Consultant', 'required-LLB Manager ranks above the Related post');
});
test('retest2 Low: CA override applies only when CA is named ("MBA Finance only" is not likely for CA)', async () => {
  const { eligibilityBadge } = await import('../src/lib/gov/rank');
  const mbaOnly = P('Manager (Finance)', { pay: 'Level 10', eligibility: 'MBA Finance', eduTags: eduTagsOf('MBA Finance'), maxAge: 40 });
  assert.notEqual(eligibilityBadge(mbaOnly, ca, T).badge, 'likely'); assert.notEqual(qualFits(mbaOnly, ca), true);
  for (const e of ['CA or MBA (Finance)', 'Chartered Accountant / MBA / PGDM', 'CA/ICWA/MBA', 'MBA (Finance) or CA', 'Qualified CA, MBA preferred'])
    assert.notEqual(eligibilityBadge(P('Manager (Finance)', { pay: 'Level 10', eligibility: e, eduTags: eduTagsOf(e), maxAge: 40 }), ca, T).badge, 'maynot', e);
});
test('retest2 Low: retiree notices with सेवा निवृत्त / रिटायर्ड are dropped; incidental mentions are kept', () => {
  for (const t of ['सेवा निवृत्त कर्मचारियों की संविदा नियुक्ति', 'रिटायर्ड कर्मचारी की नियुक्ति हेतु आवेदन', 'Engagement of pensioners on contract', 'Re-engagement of retired judicial officers'])
    { assert.equal(enrich(P(t), ''), null, t); assert.equal(fromS3waas(s3row(t, 'Applications are invited'), site('ernakulam'), T).length, 0, t); }
  for (const [t, e] of [['Recruitment of Drivers', 'Ex-Servicemen (pensioners) may apply as Drivers'], ['Recruitment of Peon', 'Peon. Superannuation age 60.'], ['Recruitment of Junior Assistant', 'Graduate (retired employees are not eligible)']])
    { assert.notEqual(enrich(P(t, { eligibility: e }), ''), null, t); assert.equal(fromS3waas(s3row(`Notification for ${t}`, `Applications are invited. ${e}`), site('ernakulam'), T).length, 1, t); }
});
test('retest2 Low: generic analyst narrowed: GIS / Credit Analyst are not Related for lawyer or engineer; Data Analyst stays for lawyer', async () => {
  const { relatedFit } = await import('../src/lib/gov/rank');
  const law5: Profile = { ...lawyer, expYears: 5 };
  for (const t of ['GIS Analyst', 'Credit Analyst']) for (const p of [law5, civil]) assert.equal(relatedFit(P(t, { pay: 'Level 8', eligibility: 'Any graduate' }), p), null, `${t} / ${p.subject}`);
  assert.equal(relatedFit(P('GIS Analyst', { pay: 'Level 8', eligibility: 'Any graduate' }), ca), null, 'GIS is not credit analysis');
  assert.match(relatedFit(P('Data Analyst', { pay: 'Level 8', eligibility: 'Graduate in any discipline', maxAge: 40 }), law5) || '', /analytical and research skills/);
  assert.match(relatedFit(P('Credit Analyst', { pay: 'Level 8', eligibility: 'Any graduate', maxAge: 40 }), ca) || '', /credit/i);
});
test('retest2 Low: MSc Env Sci exact-subject posts rank above Related posts', async () => {
  const { profileSortKey, compareKeys, subjectExact } = await import('../src/lib/gov/rank');
  const ee = P('Environmental Engineer', { org: 'CPCB', pay: 'Level 10', eligibility: 'B.E. Environmental Engineering or M.Sc Environmental Science' });
  const sb = P('Scientist B (Environment)', { org: 'CPCB', pay: 'Level 10', eligibility: "Master's degree in Environmental Science" });
  const rel = [P('Policy Consultant', { pay: 'Rs 80,000 per month', eligibility: 'Masters degree', maxAge: 40 }), P('Research Associate', { pay: 'Rs 58,000 per month', eligibility: 'PG in Science', maxAge: 40 })];
  assert.ok(subjectExact(ee, env3)); assert.ok(subjectExact(sb, env3));
  for (const r of rel) assert.equal(matchLabel(r, env3, T).label, 'related', r.title);
  const sorted = [...rel, ee, sb].sort((a, b) => compareKeys(profileSortKey(a, env3, T), profileSortKey(b, env3, T)));
  assert.deepEqual(ids(sorted).slice(0, 2).sort(), ['Environmental Engineer', 'Scientist B (Environment)']);
  assert.deepEqual(ids(govResults([...rel, ee, sb], F, env3, [], T).list).slice(0, 2).sort(), ['Environmental Engineer', 'Scientist B (Environment)']);
});
test('retest2 Low: 12th-pass Related list excludes posts above their level (Level 6+, Grade A)', async () => {
  const { relatedFit } = await import('../src/lib/gov/rank');
  assert.equal(relatedFit(P('Clerk (Grade A)', { pay: 'Level 7', eligibility: '12th pass', eduTags: ['12TH'] }), twelfth), null);
  assert.equal(relatedFit(P('Lower Division Clerk', { pay: 'Level 6', eligibility: '12th pass', eduTags: ['12TH'] }), twelfth), null);
  assert.equal(relatedFit(P('Data Entry Operator', { pay: 'Rs 35,400 - 1,12,400', eligibility: '12th pass', eduTags: ['12TH'] }), twelfth), null);
  assert.ok(relatedFit(P('Lower Division Clerk', { pay: 'Level 2', eligibility: '12th pass', eduTags: ['12TH'], maxAge: 30 }), twelfth));
});
test('retest2 Low: "should not be retired" clauses keep the post; plain "Recruitment of X" rows are open calls; CA Data Analyst gets its own reason', async () => {
  const { relatedFit } = await import('../src/lib/gov/rank');
  const one = (t: string) => fromS3waas(`<table class="data-table-1"><tbody><tr><td>${t}</td><td></td><td>10/11/2026</td><td>30/11/2026</td><td><a href="https://cdn.s3waas.gov.in/a.pdf">pdf</a></td></tr></tbody></table>`, site('ernakulam'), T).length;
  assert.equal(one('Recruitment of Junior Assistant (applicants should not be retired from service)'), 1); assert.equal(one('Recruitment of Stenographer Grade III'), 1);
  assert.equal(one('Retired Judges as Mediators – empanelment'), 0); assert.equal(one('Final list of eligible applications for the recruitment of vacant posts of Stenographer Grade-3 (English)'), 0, 'a list is not an opening'); assert.equal(one('Engagement of Pension Assistant / Pension Clerk'), 1, 'a Pension Assistant post is a real post');
  assert.match(relatedFit(P('Data Analyst', { pay: 'Level 8', eligibility: 'Graduate in any discipline', maxAge: 40 }), ca) || '', /financial-analysis and audit skills/);
});
