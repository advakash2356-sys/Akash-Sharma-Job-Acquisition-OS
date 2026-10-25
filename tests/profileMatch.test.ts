import test from 'node:test'; import assert from 'node:assert/strict';
import { compare, parsePastedProfile, parsePositionsCsv, parseSkills } from '../src/lib/profileMatch.ts';
const resume = `Akash Sharma\nadv.akash2356@gmail.com\nLegal Associate | Khaitan Associates LLP | 2021 - 2023\nContract Analyst, Acme Solutions Pvt Ltd 2023 - Present\nSkills: contract drafting, CLM`;
test('Positions.csv from LinkedIn export', () => {
  const r = parsePositionsCsv('Company Name,Title,Description,Location,Started On,Finished On\nKhaitan Associates LLP,Legal Associate,"Drafted, reviewed\ncontracts",Delhi,Jan 2021,Mar 2022\n"Acme Solutions Pvt. Ltd.",Contract Analyst,,,Apr 2023,\nBeta Corp,Intern,,,Jun 2019,Aug 2019')!;
  assert.equal(r.length, 3); assert.equal(r[1].end, 'Present');
  const m = compare(r, resume, { skills: ['Contract Drafting', 'Litigation'], linkedinEmail: 'other@x.com' });
  assert.equal(m.matched, 2); assert.deepEqual(m.onlyLinkedIn.map((x) => x.company), ['Beta Corp']);
  assert.equal(m.dateMismatch.length, 1); assert.equal(m.dateMismatch[0].role.company, 'Khaitan Associates LLP');
  assert.deepEqual(m.skillsMissing, ['Litigation']); assert.ok(m.emailMismatch);
});
test('pasted profile text', () => {
  const r = parsePastedProfile('Experience\nContract Analyst\nAcme Solutions Pvt Ltd · Full-time\nApr 2023 - Present · 3 yrs\nLegal Associate\nKhaitan Associates LLP\n2021 – 2023');
  assert.equal(r.length, 2); assert.equal(r[0].company, 'Acme Solutions Pvt Ltd'); assert.equal(r[1].start, '2021');
  assert.equal(compare(r, resume).dateMismatch.length, 0);
});
test('skills and empty input', () => {
  assert.deepEqual(parseSkills('Name\nCLM\nNegotiation'), ['CLM', 'Negotiation']);
  assert.equal(parsePositionsCsv('random text'), null); assert.equal(compare([], resume).score, 0);
});
