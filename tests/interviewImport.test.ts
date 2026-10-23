import test from 'node:test'; import assert from 'node:assert/strict';
const describe = (_n: string, f: () => void) => f(); const it = test;
const expect = (a: any) => ({ toBe: (b: any) => assert.equal(a, b), toHaveLength: (n: number) => assert.equal(a.length, n) });
import { parseIcs, icsTime, matchJob, toLocalInput } from '../src/lib/icsParse.ts';
describe('ics', () => {
  it('converts TZID to UTC', () => { expect(icsTime('20261028T100000', 'Asia/Kolkata')).toBe('2026-10-28T04:30:00.000Z'); expect(icsTime('20261028T100000', 'America/New_York')).toBe('2026-10-28T14:00:00.000Z'); expect(icsTime('20261028T100000Z')).toBe('2026-10-28T10:00:00.000Z'); expect(icsTime('20261028')).toBe(''); });
  it('parses an event with folded lines and a Meet link', () => {
    const r = parseIcs('BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:abc@x\r\nSUMMARY:Interview: Acme Legal\\, HR round\r\nDTSTART;TZID=Asia/Kolkata:20261028T150000\r\nDTEND;TZID=Asia/Kolkata:20261028T153000\r\nDESCRIPTION:Join https://meet.google\r\n .com/abc-defg-hij\r\nEND:VEVENT\r\nEND:VCALENDAR');
    expect(r).toHaveLength(1); expect(r[0].title).toBe('Interview: Acme Legal, HR round'); expect(r[0].start).toBe('2026-10-28T09:30:00.000Z'); expect(r[0].minutes).toBe(30); expect(r[0].link).toBe('https://meet.google.com/abc-defg-hij');
  });
  it('matches jobs by company', () => {
    const jobs: any = [{ id: '1', company: 'Acme Legal Pvt Ltd', title: 'Paralegal' }, { id: '2', company: 'Zeta', title: 'Driver' }];
    expect(matchJob(jobs, 'Interview with ACME LEGAL')).toBe('1'); expect(matchJob(jobs, 'Dentist')).toBe('');
  });
  it('keeps floating times local', () => { expect(toLocalInput('2026-10-28T15:00:00')).toBe('2026-10-28T15:00'); });
});
