// Features carried over from Autonomous-Job-Outreach-Agent-Platform / Recruiter-Scraper-and-Matcher-Game
// (see docs/MERGE_PLAN.md). All run in the browser on the user's own data. Nothing is sent anywhere.
import type { Job } from '../types';
import { sprintStats } from './insights';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9%.+#]/g, ' ').replace(/\s+/g, ' ');

/** Stock phrases recruiters skim past (from the "Voice DNA" banned-phrase idea). */
export const CLICHES = ['passionate', 'synergy', 'go-getter', 'team player', 'hard-working', 'hardworking', 'results-driven', 'think outside the box', 'dynamic', 'rockstar', 'ninja', 'guru', 'detail-oriented', 'self-starter', 'best of breed', 'leverage synergies', 'thought leader', 'world-class'];

export interface FactCheck { numbers: string[]; terms: string[]; cliches: string[] }

/** Flags numbers, capitalised terms and acronyms in AI output that never appear in the resume or the job text. */
export function factCheck(output: string, resume: string, jobText = ''): FactCheck {
  const src = norm(`${resume} ${jobText}`);
  const has = (t: string) => src.includes(norm(t).trim());
  const uniq = (a: string[]) => [...new Set(a)];
  const body = output.replace(/\[[^\]]*\]/g, ' '); // ignore [placeholders]
  const numbers = uniq((body.match(/\b\d[\d,.]*\s?(%|\+|x|k|lpa|lakh|crore|years?|yrs?|months?)?/gi) || []).map((n) => n.trim()))
    .filter((n) => !has((n.match(/\d[\d,.]*/) || [n])[0].replace(/[.,]$/, '')));
  const words = body.match(/\b([A-Z][a-zA-Z+#.]{1,}(?:\s[A-Z][a-zA-Z+#.]+){0,2}|[A-Z]{2,}[a-z]?)\b/g) || [];
  const COMMON = /^(I|The|A|An|And|Dear|Hiring|Manager|Team|Best|Regards|Sincerely|Thank|Thanks|Hello|Hi|Yours|My|In|At|For|With|As|To|Of|On|This|That|It|We|You|Your|Our|Professional|Summary|Experience|Skills|Education|Objective|Key|Core|Work|Profile|Contact|Email|Phone|Subject|Re|Name|City|Age|Languages?|Certifications?|Achievements?|Projects?|Responsibilities|Highlights|Strengths|Open|Available|Looking|Reliable|Delivered|Managed|Led|Built|Worked|Handled|Ensured|Maintained|Reduced|Improved|Increased|Achieved|Developed|Created|Supported|Coordinated|Present|Current|Today|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December|LinkedIn|Gmail)$/;
  const terms = uniq(words.map((w) => w.trim())).filter((w) => !COMMON.test(w) && !w.split(' ').every((x) => COMMON.test(x)) && !has(w)).slice(0, 25);
  const lower = output.toLowerCase();
  const cliches = CLICHES.filter((c) => lower.includes(c) && !norm(resume).includes(c));
  return { numbers: numbers.slice(0, 20), terms, cliches };
}

const csvCell = (v: unknown) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function jobsCsv(jobs: Job[]) {
  const head = ['title', 'company', 'status', 'applied_at', 'added', 'url', 'source', 'posted', 'location', 'fit_score', 'fit_kind', 'govt_last_date', 'salary_min', 'salary_max', 'offer', 'interviews', 'notes'];
  const rows = jobs.map((j) => [j.title, j.company, j.status, j.appliedAt, j.createdAt, j.url, j.found?.source || j.source, j.found?.postedAt, j.found?.location, j.score?.score ?? j.found?.fit?.score, j.score ? 'ai' : j.found?.fit?.kind, j.found?.govt?.lastDate, j.salaryMin, j.salaryMax, j.offerAmount, j.interviews.length, j.notes]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}
export function download(text: string, name: string, type: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** One calendar event as an .ics file. `start` is local yyyy-mm-ddThh:mm or yyyy-mm-dd (all-day). */
export function ics(ev: { uid: string; title: string; start: string; minutes?: number; description?: string; url?: string }) {
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (m) => `\\${m}`);
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const allDay = /^\d{4}-\d{2}-\d{2}$/.test(ev.start);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Momentum Job OS//EN', 'BEGIN:VEVENT', `UID:${ev.uid}@momentum`, `DTSTAMP:${fmt(new Date())}`];
  if (allDay) { const d = ev.start.replace(/-/g, ''); const n = new Date(ev.start + 'T00:00'); n.setDate(n.getDate() + 1); lines.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${n.getFullYear()}${pad(n.getMonth() + 1)}${pad(n.getDate())}`); }
  else { const s = new Date(ev.start); lines.push(`DTSTART:${fmt(s)}`, `DTEND:${fmt(new Date(s.getTime() + (ev.minutes || 60) * 60000))}`); }
  lines.push(`SUMMARY:${esc(ev.title)}`);
  if (ev.description) lines.push(`DESCRIPTION:${esc(ev.description)}`);
  if (ev.url) lines.push(`URL:${ev.url}`);
  lines.push('BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', `DESCRIPTION:${esc(ev.title)}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
export function followUpDate(appliedAt: string, days = 5) { const d = new Date(appliedAt + 'T00:00'); d.setDate(d.getDate() + days); const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }

export interface Milestone { id: string; label: string; done: boolean; progress: string }
/** Badges from real counts only (trimmed from the Achievement Center). */
export function milestones(jobs: Job[]): Milestone[] {
  const applied = jobs.filter((j) => j.appliedAt).length;
  const tailored = jobs.filter((j) => j.tailoredResume || j.coverLetter).length;
  const interviews = jobs.reduce((n, j) => n + j.interviews.length, 0);
  const offers = jobs.filter((j) => j.status === 'Offer' || j.offerAmount != null).length;
  const streak = sprintStats(jobs, 0).streak;
  const m = (id: string, label: string, have: number, need: number): Milestone => ({ id, label, done: have >= need, progress: `${Math.min(have, need)}/${need}` });
  return [m('first', 'First application sent', applied, 1), m('ten', '10 applications', applied, 10), m('tailor', '3 tailored applications', tailored, 3), m('streak', '5-day applying streak', streak, 5), m('int', 'First interview', interviews, 1), m('offer', 'First offer', offers, 1)];
}

/** Job-description fingerprint (normalised word set) to spot the same posting added twice. */
export function similar(a: string, b: string) {
  const set = (s: string) => new Set(norm(s).split(' ').filter((w) => w.length > 3));
  const A = set(a), B = set(b); if (A.size < 8 || B.size < 8) return 0;
  let n = 0; A.forEach((w) => B.has(w) && n++);
  return n / Math.min(A.size, B.size);
}
export function findDuplicate(jobs: Job[], j: { title: string; company: string; url: string; description: string }) {
  const u = (x: string) => x.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
  return jobs.find((o) => (j.url && o.url && u(o.url) === u(j.url)) || (o.company.trim().toLowerCase() === j.company.trim().toLowerCase() && o.title.trim().toLowerCase() === j.title.trim().toLowerCase()) || similar(o.description, j.description) > 0.9);
}

// ---- Ideas ported from hokage-job-finder (rewritten for the browser; see docs/MERGE_PLAN.md) ----
const ymdLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Adds n business days (Mon-Fri) to a yyyy-mm-dd date. */
export function addBusinessDays(from: string, n: number) {
  const d = new Date(from + 'T00:00'); let k = 0;
  while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) k++; }
  return ymdLocal(d);
}
/** Follow-up cadence: one polite note 5 business days after applying, a second after 10, then stop. Stops on any reply. */
export function cadence(j: Job) {
  if (!j.appliedAt || j.status !== 'Applied' || j.interviews.length || j.reply) return [];
  const sent = j.followUpsSent || 0;
  return [{ n: 1, date: addBusinessDays(j.appliedAt, 5) }, { n: 2, date: addBusinessDays(j.appliedAt, 10) }].filter((s) => s.n > sent);
}

export type ReplyKind = 'interview' | 'rejection' | 'question' | 'positive' | 'auto_reply' | 'bounce' | 'unclear';
const BOUNCE = /(mailer-daemon|postmaster|delivery status notification|undeliverable|address not found|delivery has failed|wasn'?t delivered|could not be delivered)/i;
const AUTO = /(out of (the )?office|auto(matic)?[- ]?reply|autoreply|on (annual )?leave|away from (the )?office|mailbox is not monitored|thank you for (your )?(email|message|application)[^.]{0,60}(received|review))/i;
const REJECT = /(regret to inform|not (be )?(moving|proceeding) forward|decided to (move|go) (forward )?with other|unfortunately[^.]{0,80}(not|unable)|position has been filled|not selected|will not be progressing)/i;
const INTERVIEW = /(schedule (an |a )?(interview|call)|interview (invitation|slot|round)|invite you (to|for)|available for (a|an) (call|interview)|calendly\.com|meet\.google\.com|zoom\.us\/j|teams\.microsoft)/i;
const POSITIVE = /(interested in your profile|would like to (learn|know) more|great fit|impressed|move (you )?forward|happy to connect|let'?s connect|share your availability)/i;
const QUESTION = /\?|(could you (share|send|tell)|please (share|send|confirm|let us know)|what is your|notice period|expected (ctc|salary|compensation))/i;
/** Classifies a reply the user pasted. Rules only, no AI; the user decides what to do. */
export function classifyReply(text: string): ReplyKind {
  const t = text || '';
  if (BOUNCE.test(t)) return 'bounce';
  if (REJECT.test(t)) return 'rejection';
  if (INTERVIEW.test(t)) return 'interview';
  if (AUTO.test(t)) return 'auto_reply';
  if (POSITIVE.test(t)) return 'positive';
  if (QUESTION.test(t)) return 'question';
  return 'unclear';
}
export const REPLY_ADVICE: Record<ReplyKind, { label: string; status?: Job['status']; tip: string }> = {
  interview: { label: 'Interview invite', status: 'Interviewing', tip: 'Add the interview on the Interviews page and generate prep.' },
  rejection: { label: 'Rejection', status: 'Rejected', tip: 'Follow-ups stop. A short thank-you can keep the door open.' },
  question: { label: 'They asked something', tip: 'Answer from your resume facts; notice period and start date are on My resume.' },
  positive: { label: 'Positive reply', tip: 'Reply soon and offer two or three time slots.' },
  auto_reply: { label: 'Auto-reply', tip: 'Not a real answer; your follow-up schedule stays on.' },
  bounce: { label: 'Bounced', tip: 'The address does not work. Find another contact on the company site.' },
  unclear: { label: 'Unclear', tip: 'Read it yourself and set the status by hand.' },
};

/** Fields stated in a government notice. Missing fields stay empty: never guessed. */
export function parseNotice(text: string) {
  const t = (text || '').replace(/\s+/g, ' ');
  const f = (rx: RegExp) => (t.match(rx)?.[1] || '').trim();
  const yrs = t.match(/(?:not less than|minimum|at least)\s*(\d+)\s*\+?\s*years?/i);
  return {
    notificationNo: f(/(?:advt\.?|advertisement|notification|vacancy notice)\s*(?:no\.?|number)\s*[:.-]?\s*([A-Z0-9][A-Za-z0-9/().-]{2,40})/i),
    pay: f(/((?:Rs\.?|₹|INR)\s?[\d,]{4,}(?:\s*(?:-|to)\s*(?:Rs\.?|₹)?\s?[\d,]{4,})?(?:\s*(?:\/-|per month|p\.m\.|a month))?)/i) || f(/(pay level[- ]?\d{1,2})/i),
    age: f(/((?:not (?:more|exceeding)|upper age limit|age limit)[^.]{0,50}?\d{2}\s*years)/i),
    minYears: yrs ? Number(yrs[1]) : undefined,
  };
}
export function daysLeftLabel(last: string) {
  const d = Math.round((new Date(last + 'T00:00').getTime() - new Date(ymdLocal(new Date()) + 'T00:00').getTime()) / 86400000);
  return d < 0 ? 'closed' : d === 0 ? 'closes today' : d <= 3 ? `closing soon (${d} day${d > 1 ? 's' : ''} left)` : `${d} days left`;
}
