/** Ghost-Proof Follow-up: day 5 / 10 / 21 reminders, drafts, ghosted mark and reply rate. User sends everything. Akash Sync Agent. */
import type { Job } from '../types';

export const STEPS = [5, 10, 21] as const;
const addDays = (d: string, n: number) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.floor((Date.parse(b) - Date.parse(a)) / 864e5);
export const waiting = (j: Job) => !!j.appliedAt && j.status === 'Applied' && !j.reply && !(j.interviews || []).length;

export interface Step { n: 1 | 2 | 3; day: number; date: string; state: 'sent' | 'due' | 'upcoming' }
export function schedule(j: Job, today: string): Step[] {
  if (!waiting(j)) return [];
  const sent = j.followUpsSent || 0;
  return STEPS.map((day, i) => { const n = (i + 1) as 1 | 2 | 3; const date = addDays(j.appliedAt!, day); return { n, day, date, state: n <= sent ? 'sent' : date <= today ? 'due' : 'upcoming' }; });
}
/** Ghosted: still waiting 21+ days after applying. */
export function isGhosted(j: Job, today: string) { return waiting(j) && daysBetween(j.appliedAt!, today) >= 21; }

/** Short, plain follow-ups. No stock openers, no em dashes, no invented facts: only the role, company and the user's own line. */
export function draft(j: Job, n: 1 | 2 | 3, name = '', ownLine = '') {
  const role = j.title || 'the role', co = j.company || 'your team', sign = name ? `\n\nThanks,\n${name}` : '\n\nThanks';
  const own = ownLine.trim() ? ` ${ownLine.trim().replace(/[.!]?$/, '.')}` : '';
  if (n === 1) return { subject: `${role} application`, body: `Hi,\n\nI applied for the ${role} role at ${co} on ${j.appliedAt}. I'm still keen on it and wanted to check if there's an update on the timeline.${own}${sign}` };
  if (n === 2) return { subject: `Re: ${role} application`, body: `Hi,\n\nA quick follow-up on my application for ${role}. If it's useful, I can send anything else you need or set up a short call this week.${sign}` };
  return { subject: `Re: ${role} application`, body: `Hi,\n\nI haven't heard back about the ${role} role, so I'll assume it has moved on. If anything opens up at ${co} that fits my background, I'd be glad to hear about it.${sign}` };
}

export interface ReplyStats { applied: number; replied: number; ghosted: number; waiting: number; rate: number | null }
/** Reply rate counts only applications at least 5 days old, so new ones don't drag it down. */
export function replyStats(jobs: Job[], today: string): ReplyStats {
  const applied = jobs.filter((j) => j.appliedAt && j.status !== 'Saved' && j.status !== 'Withdrawn' && daysBetween(j.appliedAt, today) >= 5);
  const replied = applied.filter((j) => j.reply || j.status !== 'Applied' || (j.interviews || []).length).length;
  const ghosted = applied.filter((j) => isGhosted(j, today)).length;
  return { applied: applied.length, replied, ghosted, waiting: applied.length - replied - ghosted, rate: applied.length ? Math.round((replied / applied.length) * 100) : null };
}
/** Per-company reply rate from the user's own tracker only. Never shared. */
export function companyRates(jobs: Job[], today: string) {
  const by = new Map<string, Job[]>();
  for (const j of jobs) if (j.appliedAt && j.company) { const k = j.company.trim(); by.set(k, [...(by.get(k) || []), j]); }
  return [...by.entries()].map(([company, js]) => ({ company, ...replyStats(js, today) })).filter((r) => r.applied > 0).sort((a, b) => b.applied - a.applied);
}

/** All three follow-up reminders as one calendar file (RFC 5545), 9:00 local, with the draft subject in the note. */
export function followUpIcs(j: Job, name = ''): string {
  if (!j.appliedAt) return '';
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const ev = STEPS.map((day, i) => { const n = (i + 1) as 1 | 2 | 3; const d = addDays(j.appliedAt!, day).replace(/-/g, ''); const dr = draft(j, n, name);
    return ['BEGIN:VEVENT', `UID:${j.id}-ghost${n}@jaos`, `DTSTAMP:${stamp}`, `DTSTART:${d}T090000`, `DTEND:${d}T091500`, `SUMMARY:${esc(`Day ${day} follow-up: ${j.title} at ${j.company}`)}`, `DESCRIPTION:${esc(`${dr.subject}\n\n${dr.body}\n\n${j.url || ''}`)}`, 'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:Follow-up reminder', 'END:VALARM', 'END:VEVENT'].join('\r\n'); });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Akash Sync Agent//Job Acquisition OS//EN', ...ev, 'END:VCALENDAR'].join('\r\n');
}
