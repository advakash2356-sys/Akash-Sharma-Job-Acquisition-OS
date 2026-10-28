/** Job Truth Score: is this listing worth your time? Evidence only, every point is shown. Akash Sync Agent. */
import { normTitle } from './dedupe';
import { daysOld } from './keywords';
import { parseSalary } from './jobFacts';

export type Alive = 'live' | 'dead' | 'unknown';
export interface TruthInput { postedAt?: string; alive?: Alive; reposts?: number; description?: string; fit?: number | null; now?: number }
export interface TruthPart { label: string; points: number; max: number; note: string }
export interface Truth { score: number; verdict: 'apply' | 'check' | 'skip'; label: string; parts: TruthPart[]; dontApply: string[] }

export function truthScore(i: TruthInput): Truth {
  const age = daysOld(i.postedAt, i.now ?? Date.now());
  const parts: TruthPart[] = [];
  parts.push({ label: 'Posting age', max: 25, points: age < 0 ? 8 : age <= 7 ? 25 : age <= 21 ? 15 : age <= 45 ? 5 : 0, note: age < 0 ? 'Date not given' : `${age} day${age === 1 ? '' : 's'} old` });
  const alive = i.alive || 'unknown';
  parts.push({ label: 'Link still live', max: 25, points: alive === 'live' ? 25 : alive === 'dead' ? 0 : 10, note: alive === 'live' ? 'Original link opens' : alive === 'dead' ? 'Original link is gone or closed' : 'Not checked yet' });
  const rp = i.reposts || 0;
  parts.push({ label: 'Reposts', max: 15, points: rp === 0 ? 15 : rp === 1 ? 8 : 0, note: rp === 0 ? 'No repeat posting seen' : `Seen ${rp + 1} times in your list` });
  const sal = parseSalary(i.description || '');
  parts.push({ label: 'Salary disclosed', max: 10, points: sal === 'Not disclosed' ? 0 : 10, note: sal });
  const fit = i.fit == null ? null : Math.max(0, Math.min(100, i.fit));
  parts.push({ label: 'Your fit', max: 25, points: fit == null ? 10 : Math.round(fit / 4), note: fit == null ? 'Not scored yet' : `${fit}% match` });
  const score = parts.reduce((a, p) => a + p.points, 0);
  const dontApply: string[] = [];
  if (alive === 'dead') dontApply.push('The original link no longer works, so the role is likely closed.');
  if (age > 45) dontApply.push(`Posted ${age} days ago. Most roles are filled or paused by now.`);
  if (rp >= 2) dontApply.push('Posted again and again, which can mean an always-open or ghost listing.');
  if (fit != null && fit < 40) dontApply.push(`Your fit is ${fit}%. Your time is better spent on closer matches.`);
  const verdict = dontApply.length && (alive === 'dead' || dontApply.length >= 2 || (fit != null && fit < 40)) ? 'skip' : score >= 65 ? 'apply' : 'check';
  const label = verdict === 'skip' ? "Don't apply" : verdict === 'apply' ? 'Worth applying' : 'Check first';
  return { score, verdict, label, parts, dontApply };
}

/** How many other jobs in the list look like the same posting (same company and title). */
export function repostCount<J extends { id: string; title: string; company: string }>(job: J, all: J[]): number {
  const key = (o: J) => `${o.company.toLowerCase().trim()}|${normTitle(o.title.replace(/\(.*?\)/g, ' '))}`; const k = key(job);
  return all.filter((o) => o.id !== job.id && key(o) === k).length;
}
