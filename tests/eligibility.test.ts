// Run: npx tsx --test tests/eligibility.test.ts   (fixtures are real postings fetched from Himalayas and FreeHire on 24 Oct 2026, trimmed)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyMode, decide, extractEligibility, inferCandidate, locationCountries, type Candidate } from '../src/lib/eligibility';

const him = JSON.parse(fs.readFileSync(new URL('./fixtures/himalayas.json', import.meta.url), 'utf8'));
const fh = JSON.parse(fs.readFileSync(new URL('./fixtures/freehire-remote.json', import.meta.url), 'utf8'));

const akash: Candidate = { residence: 'IN', city: 'Gurugram', authorizedIn: ['IN'], relocate: false, relocateCountries: [], modes: ['onsite', 'hybrid', 'remote'], shift: 'us', tzOffset: 5.5 };
const driver: Candidate = inferCandidate({ location: 'Delhi', targetRoles: 'Delivery Driver, Warehouse Helper', resumeText: 'Ravi\nDriver / Warehouse Helper | Delhi' });
const france: Candidate = { residence: 'FR', city: 'Lyon', authorizedIn: ['FR'], relocate: true, relocateCountries: ['IN'], modes: ['onsite', 'hybrid', 'remote'], shift: 'local', tzOffset: 1 };

function run(j: any, c: Candidate) {
  const job = { title: j.title, location: j.location ?? (j.src === 'himalayas' ? 'Remote' : ''), workMode: j.work_mode ?? (j.src === 'himalayas' ? 'remote' : ''), description: j.description, locationRestrictions: j.locationRestrictions, timezoneRestrictions: j.timezoneRestrictions, countryCodes: (j.countries || []).map((x: string) => x.toUpperCase()) };
  const m = classifyMode(job); const el = extractEligibility({ ...job, mode: m.mode }); return { m, el, d: decide(job, m.mode, el, c) };
}

test('work mode: remote, hybrid (remote + office days), onsite', () => {
  assert.equal(classifyMode({ title: 'Paralegal', location: 'Remote', description: 'Fully remote team.' }).mode, 'remote');
  assert.equal(classifyMode({ title: 'Legal Ops Manager', location: 'Remote, UK', description: 'You will join us in our London office 3 days a week.' }).mode, 'hybrid');
  assert.equal(classifyMode({ title: 'Analyst (Hybrid)', location: 'Pune, India' }).mode, 'hybrid');
  assert.equal(classifyMode({ title: 'Delivery Driver', location: 'New Delhi, Delhi, India' }).mode, 'onsite');
  assert.equal(classifyMode({ title: 'Counsel', location: '', description: '' }).mode, 'unknown');
});

test('location parsing: Indiana is not India', () => {
  assert.deepEqual(locationCountries('Sellersburg, IN'), ['US']);
  assert.deepEqual(locationCountries('Gurugram, Haryana, India'), ['IN']);
  assert.deepEqual(locationCountries('Paris, France'), ['FR']);
});

test('eligibility extraction from text', () => {
  const e = extractEligibility({ mode: 'remote', location: 'Remote', description: 'Candidates must be authorized to work in the United States. We do not offer visa sponsorship.' });
  assert.deepEqual(e.authRequired, ['US']); assert.equal(e.noSponsorship, true);
  const w = extractEligibility({ mode: 'remote', location: 'Remote', description: 'Work from anywhere in the world. We hire as contractors via Deel. Overlap with EST hours required.' });
  assert.equal(w.worldwide, true); assert.equal(w.contractorOk, true); assert.ok(w.tz && w.tz.max <= -4);
  const r = extractEligibility({ mode: 'remote', location: 'Remote - EMEA', description: '' });
  assert.ok(r.regions.includes('EMEA'));
  assert.equal(extractEligibility({ mode: 'remote', location: 'Remote', description: 'Identify friction anywhere legal work touches the business.' }).worldwide, false);
  assert.ok(extractEligibility({ mode: 'remote', location: 'Remote-NAMER', description: '' }).regions.includes('North America'));
  const u = extractEligibility({ mode: 'remote', location: 'Remote', description: 'Great team.' });
  assert.equal(u.unclear, true);
});

test('Akash (India, remote, US shift): worldwide and India-eligible remote shown, US-only hidden, US hours noted', () => {
  const ww = run(him.find((x: any) => !x.locationRestrictions.length && x.timezoneRestrictions.some((t: number) => t < -4)), akash);
  assert.equal(ww.d.show, true); assert.match(ww.d.badge, /worldwide, accepts India/); assert.match(ww.d.reason, /US shift/);
  const us = run(him.find((x: any) => x.locationRestrictions.length === 1 && x.locationRestrictions[0] === 'United States'), akash);
  assert.equal(us.d.show, false); assert.match(us.d.badge, /United States only: hidden/);
  const ind = run(him.find((x: any) => x.locationRestrictions.includes('India')), akash);
  assert.equal(ind.d.show, true); assert.match(ind.d.badge, /accepts India/);
  const fr = run(fh.find((x: any) => x.location === 'France'), akash);
  assert.equal(fr.d.show, false);
  const auth = decide({ location: 'Remote' }, 'remote', extractEligibility({ mode: 'remote', location: 'Remote', description: 'Must be legally authorized to work in the United States.' }), akash);
  assert.equal(auth.show, false); assert.match(auth.badge, /United States work authorisation required: hidden/);
});

test('Driver Delhi: India-local only, remote and US hidden', () => {
  assert.deepEqual(driver.modes, ['onsite', 'hybrid']); assert.equal(driver.residence, 'IN');
  const local = decide({ location: 'New Delhi, Delhi, India' }, 'onsite', extractEligibility({ mode: 'onsite', location: 'New Delhi, Delhi, India' }), driver);
  assert.equal(local.show, true); assert.equal(local.kind, 'local');
  assert.equal(decide({ location: 'Sellersburg, IN' }, 'onsite', extractEligibility({ mode: 'onsite', location: 'Sellersburg, IN' }), driver).show, false);
  assert.equal(run(him[0], driver).d.show, false);
});

test('France person: remote-from-France and onsite India (relocation) shown; US-only remote hidden', () => {
  const fr = run(fh.find((x: any) => x.location === 'France'), france);
  assert.equal(fr.d.show, true); assert.match(fr.d.badge, /accepts France/);
  const blr = decide({ location: 'Bengaluru, Karnataka, India' }, 'onsite', extractEligibility({ mode: 'onsite', location: 'Bengaluru, Karnataka, India' }), france);
  assert.equal(blr.show, true); assert.equal(blr.kind, 'relocate'); assert.match(blr.reason, /not said you are authorised/);
  const emea = decide({ location: 'Remote - EMEA' }, 'remote', extractEligibility({ mode: 'remote', location: 'Remote - EMEA' }), france);
  assert.equal(emea.show, true);
  const us = run(him.find((x: any) => x.locationRestrictions.length === 1 && x.locationRestrictions[0] === 'United States'), france);
  assert.equal(us.d.show, false);
  const nyc = decide({ location: 'New York, NY' }, 'onsite', extractEligibility({ mode: 'onsite', location: 'New York, NY' }), france);
  assert.equal(nyc.show, false);
});

test('unclear eligibility is shown and flagged, never hidden', () => {
  const r = run(fh.find((x: any) => !x.location && !(x.countries || []).length), akash);
  assert.equal(r.d.show, true); assert.equal(r.d.kind, 'remote-unclear');
});

test('fixture totals per persona (printed)', () => {
  for (const [n, c] of [['akash', akash], ['driver', driver], ['france', france]] as const) {
    const res = [...him, ...fh].map((j) => run(j, c).d);
    const t = (k: string) => res.filter((d) => d.kind === k).length;
    console.log(`${n}: ${res.length} postings, shown ${res.filter((d) => d.show).length} (remote-ok ${t('remote-ok')}, unclear ${t('remote-unclear')}, local ${t('local')}, relocate ${t('relocate')}), hidden ${t('hidden')}`);
  }
});
