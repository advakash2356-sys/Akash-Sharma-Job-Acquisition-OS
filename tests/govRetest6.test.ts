// Retest 6 (NO-GO at f9e2ef6): whole-term subjects with compound subjects first; fail-closed experience durations (months, expr.,
// exposure, worked); Strong needs a confirmed age; no analyst exemption below the graduate floor; OCR-tolerant ages; science
// adjacent posts are Related fit; DNS-checked SSRF guard. Random guards for experience, subject and age. Postings built with S()
// are sample shapes, not real vacancies. Akash Sync Agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { govResults, advFromProfile } from '../src/lib/gov/filter';
import { matchLabel } from '../src/lib/gov/rank';
import { agesOf, ageWordsIn, experienceOf, parseNotice, qualsIn } from '../src/lib/gov/notice';
import { postDiscs, subjectsIn } from '../src/lib/gov/gates';
import { fetchPdf } from '../server/govNoticeAi';
import { withPdfText } from '../server/govNoticeRead';
import { assertPublicHost, isPrivateIp } from '../server/safeFetch';
import { eduTagsOf } from '../server/govPostings';
import type { Profile } from '../src/lib/govJobs';

const T = '2026-11-14';
const base = { cat: 'GEN', pwbd: false, esm: false, gender: 'male', eduSet: true, dob: '1998-03-01', state: 'Uttar Pradesh' } as any;
const P: Record<string, Profile> = {
  lawyer: { ...base, edu: 'grad', spec: 'law', subject: 'BA LLB', bar: true, expYears: 3, expType: ['litigation'] },
  ca: { ...base, edu: 'grad', spec: 'finance', subject: 'B.Com, CA', icai: true, expYears: 4, expType: ['audit_accounts'] },
  mbbs: { ...base, edu: 'grad', spec: 'medical', subject: 'MBBS', medReg: true, expYears: 2, expType: ['clinical'] },
  engineer: { ...base, edu: 'eng', spec: 'engineering', subject: 'B.Tech CSE', expYears: 3, expType: ['engineering'] },
  bsc: { ...base, edu: 'grad', subject: 'B.Sc Chemistry', expYears: 1 },
  bscPhy: { ...base, edu: 'grad', subject: 'B.Sc Physics', expYears: 0 },
  bscBot: { ...base, edu: 'grad', subject: 'B.Sc Botany', expYears: 0 },
  mscChem: { ...base, edu: 'pg', subject: 'M.Sc Chemistry', expYears: 2, expType: ['research'] },
};
let n = 0;
const S = (title: string, eligibility: string, x: any = {}) => ({ id: `r6t-${++n}`, title, org: 'Govt body', location: '', eligibility, state: 'All India', official: true, lastDate: '2026-12-10', pay: 'Level 10', maxAge: 40, level: 'central', eduTags: eduTagsOf(`${title} ${eligibility}`), ...x });
const F = { q: '', state: '', lesser: false, official: false, soon: false, deputation: false, sort: 'rank', allLevels: false } as any;
const shown = (p: any, k: string, all = false) => govResults([p], { ...F, allLevels: all, adv: advFromProfile(P[k]) }, P[k], [], T).list.length > 0;
const lab = (p: any, k: string) => (shown(p, k) ? matchLabel(p, P[k], T).label : 'HIDDEN');
const HOPE = ['strong', 'eligible', 'related'];
let seed = Number(process.env.GUARD_SEED || 6061114); const rnd = (k: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % k; };
const pick = <X,>(a: X[]) => a[rnd(a.length)];

// ---------- HIGH 1: subjects ----------
test('subjects are whole terms; compound subjects win (Pharmaceutical Chemistry is not Chemistry, Geophysics is not Physics)', () => {
  assert.deepEqual([...subjectsIn('Degree in Pharmacy or Pharmaceutical Chemistry')].sort(), ['pharmaceutical chemistry', 'pharmacy']);
  assert.deepEqual([...subjectsIn('B.Sc Biochemistry')], ['biochemistry']); assert.deepEqual([...subjectsIn('B.Sc Geo-physics')], ['geophysics']);
  assert.deepEqual([...subjectsIn('B.Sc (PCM)')].sort(), ['chemistry', 'mathematics', 'physics']);
  for (const [k, t, e] of [['bsc', 'Drug Inspector', 'Degree in Pharmacy or Pharmaceutical Chemistry'], ['bsc', 'Analyst', 'Degree in Pharmaceutical Chemistry'], ['bsc', 'Biochemist', 'B.Sc Biochemistry'],
    ['bsc', 'Scientific Assistant', 'B.Sc in Agricultural Chemistry and Soil Science'], ['bsc', 'Scientific Officer', 'Degree in Chemical Engineering'], ['bscPhy', 'Scientific Assistant', 'B.Sc Geophysics'],
    ['bscPhy', 'Scientific Assistant', 'B.Sc Biophysics'], ['bscBot', 'Forest Officer', 'B.Sc Forestry'], ['bscPhy', 'Chemical Assistant (Group B)', 'Graduate with Chemistry as a subject']] as const)
    assert.ok(!HOPE.includes(lab(S(t, e, { pay: 'Level 7', maxAge: 35 }), k)), `${k}: ${t} / ${e}`);
  // the notice's qualification clause beats the title-implied discipline
  assert.deepEqual(postDiscs('Technical Officer (Laboratory)', 'Graduate in Science'), []);
  assert.equal(lab(S('Technical Officer (Laboratory)', 'Graduate in Science', { pay: 'Level 7', maxAge: 35 }), 'bsc'), 'related');
  // a specific subject outside the table is unclear: Check, never hope
  for (const e of ['B.Sc in Oceanography', 'Degree in History', 'Graduate in Social Work', 'Degree in Hotel Management']) assert.equal(lab(S('Scientific Officer', e, { pay: 'Level 7', maxAge: 35 }), 'bsc'), 'check', e);
  // a generic "Graduate in Science" alternative admits a science graduate
  assert.equal(lab(S('Food Safety Officer', 'Graduate in Science or Food Technology', { pay: 'Level 7', maxAge: 35 }), 'bsc'), 'related');
});
test('guard: random compound / different subjects never give hope to a Chemistry, Physics or Botany graduate', () => {
  const OTHER: Record<string, string[]> = { bsc: ['Pharmaceutical Chemistry', 'Agricultural Chemistry', 'Biochemistry', 'Bio-chemistry', 'Industrial Chemistry', 'Petrochemicals', 'Physics', 'Geology', 'Zoology', 'Microbiology', 'Pharmacy', 'Forestry'],
    bscPhy: ['Geophysics', 'Geo-physics', 'Biophysics', 'Astrophysics', 'Chemistry', 'Biochemistry', 'Botany', 'Geology'], bscBot: ['Forestry', 'Agriculture', 'Horticulture', 'Zoology', 'Chemistry', 'Biochemistry', 'Physics'] };
  const FORMS = [(x: string) => `B.Sc ${x}`, (x: string) => `B.Sc. in ${x}`, (x: string) => `Degree in ${x}`, (x: string) => `Bachelor's degree in ${x} from a recognised university`, (x: string) => `Graduate with ${x} as a main subject`, (x: string) => `B.Sc (${x})`, (x: string) => `Graduation in ${x}`];
  const TITLES = ['Scientific Assistant', 'Laboratory Officer', 'Research Assistant', 'Analyst', 'Junior Scientific Officer', 'Technical Officer (Laboratory)', 'Chemical Assistant (Group B)', 'Quality Control Officer'];
  let tried = 0;
  for (let i = 0; i < Number(process.env.GUARD_N || 300); i++) { const k = pick(['bsc', 'bscPhy', 'bscBot']); const e = pick(FORMS)(pick(OTHER[k])); const t = pick(TITLES);
    const l = lab(S(t, e, { pay: pick(['Level 6', 'Level 7', 'Level 8']), maxAge: 35 }), k); assert.ok(!HOPE.includes(l), `${k}: "${t}" / "${e}" -> ${l}`); tried++; }
  assert.ok(tried >= 300);
});

// ---------- HIGH 2: experience ----------
const EX: [string, number | null, string?][] = [
  ['CA; expr. 6 yrs', 6], ['CA with 6 yrs expr. in audit', 6, 'audit_accounts'], ['CA with 5+ yrs in audit & assurance', 5, 'audit_accounts'], ['CA having worked for 5 years in a CA firm', 5],
  ['MBBS; clinical exposure of 36 months', 3, 'clinical'], ['CA with minimum 72 months experience', 6], ['CA with 18 months of experience', 2], ['FCA / ACA with 4 years', 4],
  ['LLB with practice at the Bar for a period of seven years', 7, 'litigation'], ['LLB; 2 yrs experience of appearing in criminal trials', 2, 'litigation'], ['Advocate with 3 years practice in trial courts', 3, 'litigation'],
  ['Advocate practising before the High Court for three years', 3, 'litigation'], ['LLB with 3 years work in legal aid clinics', 3, 'other'], ['MBBS with 2 years senior residency', 2, 'clinical'],
  ['अधिवक्ता के रूप में सात वर्ष की प्रैक्टिस', 7, 'litigation'], ['सीए; न्यूनतम पांच वर्ष का अनुभव', 5],
  ['CA, with at least half a decade of experience', null], ['Graduate; 3 years in a reputed organisation', null],
];
test('experience: months, expr., exposure, worked, "for a period of", Hindi number words; any other duration fails closed', () => {
  for (const [e, y, type] of EX) { const x = experienceOf('', e); assert.ok(x, e); assert.equal(x!.years, y, e); if (type) assert.equal(x!.type, type, e); }
  // durations that are not experience: age, course length, contract term, relaxation
  for (const e of ['LLB (3 years / 5 years integrated course)', 'Graduate. Contract for 2 years, extendable', 'Age 35 years; LLB', 'Graduate; age relaxation of 5 years for SC/ST', 'Two years Diploma in Pharmacy'])
    assert.equal(experienceOf('', e), null, e);
  assert.deepEqual(qualsIn('Advocate with 3 years practice'), ['LLB']); assert.deepEqual(qualsIn('Enrolled advocate'), ['LLB']);
});
test('r6 B probes end to end', () => {
  const L = (k: string, t: string, e: string) => lab(S(t, e), k);
  for (const e of ['CA; expr. 6 yrs', 'CA with 6 yrs expr. in audit']) assert.equal(L('ca', 'Finance Manager', e), 'HIDDEN', e);
  for (const e of ['CA with 5+ yrs in audit & assurance', 'CA having worked for 5 years in a CA firm']) assert.ok(!HOPE.includes(L('ca', 'Finance Manager', e)), e);
  assert.equal(L('lawyer', 'Law Officer', 'LLB with practice at the Bar for a period of seven years'), 'HIDDEN');
  for (const e of ['LLB; 2 yrs experience of appearing in criminal trials', 'Advocate with 3 years practice in trial courts', 'Advocate practising before the High Court for three years']) assert.ok(HOPE.includes(L('lawyer', 'Law Officer', e)), e);
  assert.equal(L('lawyer', 'Law Officer', 'LLB with 3 years work in legal aid clinics'), 'check'); assert.ok(!HOPE.includes(L('mbbs', 'Medical Officer', 'MBBS; clinical exposure of 36 months')));
});
test('guard: random durations above the profile\'s years (years / yrs / months / expr / exposure / worked) are never hope', () => {
  const have: Record<string, number> = { ca: 4, lawyer: 3, mbbs: 2 }; const title: Record<string, string> = { ca: 'Finance Manager', lawyer: 'Law Officer', mbbs: 'Medical Officer' };
  const PRE: Record<string, string[]> = { ca: ['CA', 'CA;', 'Chartered Accountant,', 'ICAI member'], lawyer: ['LLB', 'LLB;', 'Advocate', 'Law graduate,'], mbbs: ['MBBS', 'MBBS;', 'MBBS degree,'] };
  const NOUN = ['expr.', 'exposure', 'work', 'experience', 'exp.', 'practice', 'service', 'standing', ''];
  let tried = 0;
  for (let i = 0; i < Number(process.env.GUARD_N || 400); i++) {
    const k = pick(['ca', 'lawyer', 'mbbs']); const yrs = have[k] + 1 + rnd(5); const months = rnd(3) === 0;
    const dur = months ? `${yrs * 12} ${pick(['months', 'month', 'mths'])}` : `${pick([String(yrs), `${yrs}+`, `0${yrs}`.slice(-2)])} ${pick(['years', 'yrs', 'yrs.', 'yr', 'year'])}`; const noun = pick(NOUN);
    const form = rnd(6); const body = form === 0 ? `with ${dur} ${noun}` : form === 1 ? `having worked for ${dur}` : form === 2 ? `${noun} of ${dur}` : form === 3 ? `${noun}: ${dur}` : form === 4 ? `with ${dur} in ${pick(['audit', 'courts', 'hospitals', 'a government body'])}` : `minimum ${dur} ${noun} required`;
    const e = `${pick(PRE[k])} ${body}`.replace(/\s+/g, ' ').trim(); const l = lab(S(title[k], e), k); assert.ok(!HOPE.includes(l), `${k}: "${e}" -> ${l}`); tried++;
  }
  assert.ok(tried >= 400);
});

// ---------- HIGH 3 / HIGH 4 ----------
test('Strong needs a confirmed age: no age stated -> "Eligible, verify age (not stated)"; Related stays Related with the note', () => {
  for (const [k, t, e] of [['mbbs', 'Medical Officer', 'MBBS'], ['ca', 'Accounts Officer', 'CA'], ['lawyer', 'Assistant Public Prosecutor', 'LLB'], ['engineer', 'Assistant Engineer (IT)', 'B.Tech Computer Science']] as const) {
    const m = matchLabel(S(t, e, { maxAge: undefined }), P[k], T); assert.equal(m.label, 'eligible', t); assert.match(m.why.join(' '), /Eligible, verify age \(not stated in the notice\)/);
    assert.equal(matchLabel(S(t, e, { maxAge: 40 }), P[k], T).label, 'strong', `${t} with age stated`); }
  const co = S('Compliance Officer', 'Graduate in any discipline', { pay: 'Level 8', maxAge: undefined }); const m = matchLabel(co, P.lawyer, T); assert.equal(m.label, 'related'); assert.match(m.why.join(' '), /Age limit not stated/);
});
test('graduate floor without exemptions: a 10th / 12th minimum or pay below Rs 35,400 is hidden unless Show all levels', () => {
  for (const p of [S('Research Analyst (Entry)', 'Intermediate pass', { pay: 'Rs 22,000 per month', maxAge: undefined }), S('Policy Research Analyst (Junior)', 'Higher Secondary (10+2)', { pay: 'Rs 20,000 per month', maxAge: 30 }),
    S('Data Analyst', 'Graduate in any discipline', { pay: 'Rs 25,000 per month' }), S('Field Officer', 'Matriculation; graduation desirable', { pay: 'Level 6' }), S('Assistant', 'Graduate', { pay: 'Level 4' })]) {
    assert.equal(shown(p, 'bsc'), false, p.title); assert.equal(shown(p, 'bsc', true), true, `${p.title} under Show all levels`); }
  assert.equal(shown(S('Junior Chemist', 'B.Sc Chemistry', { pay: 'Rs 40,000 per month' }), 'bsc'), true);
});
test('science adjacent posts are Related fit (not generic Eligible) at the right level', () => {
  for (const [k, t, e, pay] of [['bsc', 'Chemical Assistant (Group B)', 'Graduate with Chemistry as a subject', 'Level 6'], ['bsc', 'Analyst (Water Testing Laboratory)', 'B.Sc with Chemistry', 'Level 6'], ['bsc', 'Junior Analyst (Food)', 'Degree in Chemistry or Food Science', 'Level 6'],
    ['bsc', 'Assistant Public Analyst', 'B.Sc (Chemistry)', 'Level 7'], ['bscPhy', 'Scientific Assistant (Physics)', 'B.Sc with Physics', 'Level 6'], ['bscBot', 'Plant Protection Officer', 'B.Sc (Botany/Agriculture)', 'Level 7'], ['bscBot', 'Research Assistant (Botany)', 'B.Sc with Botany', 'Level 6']] as const)
    assert.equal(lab(S(t, e, { pay, maxAge: 35 }), k), 'related', `${k}: ${t}`);
});

// ---------- MEDIUM 5 / LOW 7: ages ----------
const AGES: [string, number | null][] = [['Age : Not more than 4O years as on 01.01.2026', 40], ['Upper age Iimit: 35 yrs', 35], ['must not have attained the a ge of 40 years', 40], ['Agc limit 18-35', 35], ['Age Limit:- 18 to 4Z years', 42],
  ['Maximum age : 3 5 years', 35], ['Applicants aged upto 45 years of age may apply', 45], ['आयु: 21 वर्ष से 40 वर्ष', 40], ['वयोमर्यादा 18 ते 38 वर्षे', 38], ['Age Limit (max) : forty years', 40], ['Age limit: thirty-five years', 35],
  ['Candidates born between 02.01.1986 and 01.01.2005 (both inclusive) as on 01.01.2026', 39], ['Age 18-35 years, relaxable up to 40 years for SC/ST', 35], ['Age limit as per rules of the State Government', null]];
test('ages: OCR noise, upto N years of age, DOB ranges, Hindi / Marathi, number words; unreadable -> Check, never a wrong number', () => {
  for (const [t, want] of AGES) { assert.equal(agesOf(t).max, want, t); assert.ok(ageWordsIn(t), `age words: ${t}`); }
});
test('guard: random noisy age limits below the profile\'s age are never hope (read right, or Check "unreadable")', () => {
  const tp = S('Junior Assistant', '', { maxAge: undefined, state: 'Bihar', pay: 'Level 6' }); const rules = parseNotice(tp as any); const old = { ...P.bsc, state: 'Bihar', dob: '1980-01-01' } as any;
  const AGE = ['Age', 'AGE', 'a ge', 'Agc', 'Age limit', 'Age Iimit', 'Upper age limit', 'Maximum age', 'आयु', 'आयु सीमा'];
  const NUMS = (x: number) => [String(x), `${String(x)[0]}${String(x)[1] === '0' ? 'O' : String(x)[1] === '2' ? 'Z' : String(x)[1]}`, `${String(x)[0]} ${String(x)[1]}`, ({ 30: 'thirty', 32: 'thirty-two', 35: 'thirty five', 40: 'forty', 42: 'forty two' } as any)[x] || String(x)];
  for (let i = 0; i < Number(process.env.GUARD_N || 300); i++) {
    const max = pick([30, 32, 35, 40, 42]); const num = pick(NUMS(max)); const a = pick(AGE); const hindi = /आयु/.test(a);
    const txt = hindi ? `${a}: 18 वर्ष से ${num} वर्ष` : pick([`${a}: 18 to ${num} years`, `${a} : not more than ${num} years`, `${a} should not exceed ${num} yrs`, `${a} limit 18-${num}`, `must not have attained the ${a.toLowerCase()} of ${num} years`, `applicants upto ${num} years of age`]);
    const f = withPdfText(tp as any, rules, { elig: 'Graduate in any discipline', ages: agesOf(txt), ageWords: ageWordsIn(txt) });
    const l = matchLabel({ ...tp, facts: { ...f, pdf: 'text', noticeType: 'open_call' } } as any, old, T).label; assert.ok(!HOPE.includes(l), `"${txt}" -> ${l} (read ${agesOf(txt).max})`);
    const r = agesOf(txt).max; assert.ok(r === null || r === max, `"${txt}" read ${r}, want ${max}`);
  }
});

// ---------- LOW 11: SSRF DNS check ----------
test('SSRF: private, loopback, link-local, CGNAT, multicast and reserved addresses (v4 / v6 / mapped / NAT64) are refused', async () => {
  for (const ip of ['10.0.0.5', '127.0.0.1', '169.254.169.254', '172.31.255.255', '192.168.0.1', '100.64.0.1', '0.0.0.0', '198.18.0.1', '224.0.0.1', '255.255.255.255', '::', '::1', 'fe80::1', 'fd12:3456::1', 'fc00::1', 'ff02::1',
    '::ffff:127.0.0.1', '::ffff:a9fe:a9fe', '64:ff9b::7f00:1', '2001:db8::1', '2002:c0a8:101::1', 'not-an-ip']) assert.equal(isPrivateIp(ip), true, ip);
  for (const ip of ['8.8.8.8', '164.100.1.1', '2404:6800:4009:80c::200e', '::ffff:8.8.8.8']) assert.equal(isPrivateIp(ip), false, ip);
  const res = (map: Record<string, string[]>) => async (h: string) => { if (!map[h]) throw new Error('NXDOMAIN'); return map[h]; };
  await assert.rejects(assertPublicHost('a.gov.in', res({ 'a.gov.in': ['10.0.0.5'] })), /non-public/);
  await assert.rejects(assertPublicHost('a.gov.in', res({ 'a.gov.in': ['164.100.1.1', '::1'] })), /non-public/);
  await assert.rejects(assertPublicHost('nx.gov.in', res({})), /did not resolve/);
  await assertPublicHost('a.gov.in', res({ 'a.gov.in': ['164.100.1.1'] }));
  // every hop is resolved before it is fetched: a redirect to a gov.in name that resolves privately is never requested
  const pdf = new Uint8Array(300).fill(37); const calls: string[] = [];
  const mk = (map: Record<string, { status: number; loc?: string }>) => (async (u: any) => { calls.push(String(u)); const r = map[String(u)] || { status: 200 }; return new Response(r.status === 200 ? pdf : null, { status: r.status, headers: r.loc ? { location: r.loc } : {} }); }) as typeof fetch;
  const dns = res({ 'a.gov.in': ['164.100.1.1'], 'b.nic.in': ['164.100.2.2'], 'internal.gov.in': ['10.1.1.1'] });
  assert.equal((await fetchPdf('https://a.gov.in/n.pdf', 2000, mk({ 'https://a.gov.in/n.pdf': { status: 302, loc: 'https://b.nic.in/n.pdf' } }), dns))?.byteLength, 300);
  calls.length = 0; assert.equal(await fetchPdf('https://a.gov.in/n.pdf', 2000, mk({ 'https://a.gov.in/n.pdf': { status: 302, loc: 'https://internal.gov.in/n.pdf' } }), dns), null); assert.deepEqual(calls, ['https://a.gov.in/n.pdf']);
  calls.length = 0; assert.equal(await fetchPdf('https://internal.gov.in/n.pdf', 2000, mk({}), dns), null); assert.equal(calls.length, 0);
});
