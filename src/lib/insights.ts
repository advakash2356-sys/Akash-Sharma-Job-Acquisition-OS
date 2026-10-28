import { hasTerm, prepared } from './keywords';
import type { Job } from '../types';

const STOP = new Set('the and for with you your our are will this that from have has was were been their they them who what when where how can all any not but out into over such per via more most other than then also use using used work working team teams role roles job able about must should within across ability strong good great experience years year including include plus etc new help helps make making build building looking join one two its his her she him should would could may might each both well'.split(' '));

/** One fit number for a job, used everywhere (list, job page, detail panel) so they always agree.
 *  AI score wins; otherwise the live keyword match of the resume against title + description. */
export function jobKeywordText(job: Pick<Job, 'title' | 'description'>) { return `${job.title} ${job.description}`; }
export function jobFit(job: Job, resume: string): { score: number; kind: 'ai' | 'keyword' } | null {
  if (job.score) return { score: job.score.score, kind: 'ai' };
  if (job.found?.fit?.kind === 'ai') return { score: job.found.fit.score, kind: 'ai' };
  if (resume.trim()) return { score: keywordGap(resume, jobKeywordText(job)).pct, kind: 'keyword' };
  return job.found?.fit ? { score: job.found.fit.score, kind: job.found.fit.kind } : null;
}

export function keywordGap(resume: string, description: string) {
  const words = (description.toLowerCase().match(/[a-z][a-z+#./-]{2,}/g) || []).filter((w) => !STOP.has(w));
  const freq = new Map<string, number>();
  words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, 24).map(([w]) => w);
  const r = prepared(resume); // synonym- and tense-aware
  const hit = top.filter((w) => hasTerm('', w, r));
  const miss = top.filter((w) => !hasTerm('', w, r));
  return { hit, miss, pct: top.length ? Math.round((hit.length / top.length) * 100) : 0 };
}

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayStr = () => ymd(new Date());
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };

export function sprintStats(jobs: Job[], target: number) {
  const dates = jobs.map((j) => j.appliedAt).filter(Boolean) as string[];
  const today = dates.filter((d) => d === todayStr()).length;
  let streak = 0;
  for (let i = dates.includes(todayStr()) ? 0 : 1; ; i++) { if (dates.includes(daysAgo(i))) streak++; else break; }
  const week = Array.from({ length: 7 }, (_, i) => { const d = daysAgo(6 - i); return { day: d.slice(5), count: dates.filter((x) => x === d).length }; });
  return { today, streak, target: target || 0, week, last14: dates.filter((d) => d >= daysAgo(13)).length };
}

export function funnel(jobs: Job[]) {
  const applied = jobs.filter((j) => ['Applied', 'Screening', 'Interviewing', 'Offer', 'Accepted', 'Rejected', 'Withdrawn'].includes(j.status) || j.appliedAt).length;
  const interviewing = jobs.filter((j) => ['Interviewing', 'Offer', 'Accepted'].includes(j.status) || j.interviews.length > 0).length;
  const offers = jobs.filter((j) => j.status === 'Offer' || j.status === 'Accepted' || j.offerAmount != null).length;
  return { saved: jobs.length, applied, interviewing, offers };
}

export function projection(jobs: Job[]) {
  const f = funnel(jobs);
  const s = sprintStats(jobs, 0);
  if (f.applied < 5) return { ok: false as const, reason: `Apply to at least 5 jobs to unlock a projection (you have ${f.applied}).` };
  const rate = f.interviewing / f.applied;
  if (rate === 0) return { ok: false as const, reason: 'No interviews yet, so there is nothing real to project from. Keep applying and improve your resume match.' };
  const perDay = s.last14 / 14;
  const appsPerInterview = Math.ceil(1 / rate);
  return { ok: true as const, rate: Math.round(rate * 100), appsPerInterview, daysToNext: perDay > 0 ? Math.ceil(appsPerInterview / perDay) : null, perDay: +perDay.toFixed(1) };
}

export function followUps(jobs: Job[], days = 5) {
  const cutoff = daysAgo(days);
  return jobs.filter((j) => j.status === 'Applied' && j.appliedAt && j.appliedAt <= cutoff && !j.interviews.length).sort((a, b) => (a.appliedAt! < b.appliedAt! ? -1 : 1));
}

export function weeklyApplications(jobs: Job[], weeks = 8) {
  return Array.from({ length: weeks }, (_, i) => {
    const end = new Date(); end.setDate(end.getDate() - (weeks - 1 - i) * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    const a = ymd(start), b = ymd(end);
    return { week: a.slice(5), count: jobs.filter((j) => j.appliedAt && j.appliedAt >= a && j.appliedAt <= b).length };
  });
}

export function skillGaps(jobs: Job[]) {
  const m = new Map<string, number>();
  jobs.forEach((j) => j.score?.gaps.forEach((g) => m.set(g, (m.get(g) || 0) + 1)));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
}

export function bySource(jobs: Job[]) {
  const m = new Map<string, { total: number; interviews: number }>();
  jobs.filter((j) => j.appliedAt || j.status !== 'Saved').forEach((j) => {
    const k = j.source || 'Unspecified';
    const e = m.get(k) || { total: 0, interviews: 0 };
    e.total++; if (j.interviews.length || j.status === 'Interviewing' || j.status === 'Offer') e.interviews++;
    m.set(k, e);
  });
  return [...m.entries()].map(([source, v]) => ({ source, ...v }));
}

export const SOURCES = ['LinkedIn', 'Naukri', 'Indeed', 'Company site', 'Referral', 'Recruiter', 'Other'];

export interface Template { id: string; title: string; channel: 'Cold email' | 'LinkedIn' | 'Follow-up' | 'Warm intro'; subject: string; body: string }
export const TEMPLATES: Template[] = [
  { id: 't1', title: 'Direct application email', channel: 'Cold email', subject: 'Application: {{JobTitle}}, {{Name}}', body: `Dear {{ContactName}},\n\nI'm writing about the {{JobTitle}} role at {{Company}}. My background is a close match, and I've attached a resume tailored to the role.\n\nI'd welcome 10 minutes to talk about how I can contribute.\n\nBest regards,\n{{Name}}\n{{Email}} {{Phone}}` },
  { id: 't2', title: 'Hiring manager pitch', channel: 'Cold email', subject: '{{JobTitle}} at {{Company}}: quick intro from {{Name}}', body: `Hi {{ContactName}},\n\nI saw the {{JobTitle}} opening at {{Company}} and wanted to reach out directly. In short: [your single strongest result relevant to this role].\n\nIf it's useful, I can send a one-page summary. Happy to chat whenever suits you.\n\n{{Name}}` },
  { id: 't3', title: 'LinkedIn connection note', channel: 'LinkedIn', subject: '', body: `Hi {{ContactName}}, I'm exploring the {{JobTitle}} role at {{Company}} and would value connecting. Happy to share how my background fits.` },
  { id: 't4', title: '5-day follow-up', channel: 'Follow-up', subject: 'Following up: {{JobTitle}}', body: `Hi {{ContactName}},\n\nJust following up on my application for {{JobTitle}} at {{Company}}. I remain very interested and can share anything that helps your review.\n\nThank you,\n{{Name}}` },
  { id: 't5', title: 'Warm intro request', channel: 'Warm intro', subject: 'Could you introduce me at {{Company}}?', body: `Hi {{ContactName}},\n\nI'm applying for {{JobTitle}} at {{Company}} and noticed you know the team. Would you be open to a short introduction? I'm happy to send a two-line summary you can forward.\n\nThanks so much,\n{{Name}}` },
];
export const fillTemplate = (t: string, v: Record<string, string>) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => v[k] || `[${k}]`);
