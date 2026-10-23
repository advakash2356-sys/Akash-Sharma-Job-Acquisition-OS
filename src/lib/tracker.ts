import type { Job, JobStatus } from '../types';
import { today } from './utils';
import { funnel } from './googleAuth';

/** Moves a job to a stage, stamping the stage date (and appliedAt), and logs the step for signed-in users. */
export function setStage(job: Job, stage: JobStatus): Partial<Job> {
  const d = today();
  const p: Partial<Job> = { status: stage, stageAt: { ...(job.stageAt || {}), [stage]: job.stageAt?.[stage] || d } };
  if (stage !== 'Saved' && !job.appliedAt && stage !== 'Withdrawn') p.appliedAt = d;
  funnel(`stage_${stage.toLowerCase()}` as any);
  return p;
}

export type Due = 'overdue' | 'today' | 'soon' | null;
export function dueState(j: Job, now = today()): Due {
  const due = j.nextAction?.due; if (!due || j.nextAction?.done) return null;
  if (due < now) return 'overdue'; if (due === now) return 'today';
  const days = (Date.parse(due) - Date.parse(now)) / 86400000; return days <= 3 ? 'soon' : null;
}

/** One all-day reminder as an .ics file (RFC 5545). */
export function reminderIcs(j: Job): string {
  const d = (j.nextAction?.due || today()).replace(/-/g, '');
  const next = new Date(Date.parse(j.nextAction?.due || today()) + 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Akash Sync Agent//Job Acquisition OS//EN', 'BEGIN:VEVENT', `UID:${j.id}-next@jaos`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next}`, `SUMMARY:${esc(`${j.nextAction?.text || 'Follow up'}: ${j.title} at ${j.company}`)}`, `DESCRIPTION:${esc(j.url || '')}`,
    'BEGIN:VALARM', 'TRIGGER:-PT9H', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
export function downloadIcs(j: Job) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([reminderIcs(j)], { type: 'text/calendar' }));
  a.download = `reminder-${j.company}-${j.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60) + '.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export function stageCounts(jobs: Job[]) { const c: Record<string, number> = {}; for (const j of jobs) c[j.status] = (c[j.status] || 0) + 1; return c; }
