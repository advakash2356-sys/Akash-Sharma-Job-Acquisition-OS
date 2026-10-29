// Gamified voice practice: Level 1 to 10, slow capped growth, streaks, badges. Browser-only. Akash Sync Agent.
import type { Analysis } from './voiceInterview';
export interface Skills { delivery: number; content: number; wording: number }
export interface Session { date: string; level: number; rating: number; skills: Skills; answers: number }
export interface Game { level: number | null; baseline: number | null; history: Session[]; xp: number; streak: number; lastDay: string; todayGain: number; badges: string[] }
export const NEW_GAME: Game = { level: null, baseline: null, history: [], xp: 0, streak: 0, lastDay: '', todayGain: 0, badges: [] };
export const DAILY_CAP = 0.3, STEP_UP = 0.1, STEP_DOWN = 0.05, MIN_WORDS = 25;
const r1 = (n: number) => Math.round(n * 10) / 10, clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export const toLevel = (score100: number) => r1(clamp(1 + (9 * score100) / 100, 1, 10));
export function wording(a: Analysis) { return clamp(100 - 12 * a.slang.length - 10 * a.stiff.length - 8 * a.hedges.length - (a.fillerRate > 0.03 ? 15 : 0), 0, 100); }
/** Sanity gate: real words, on-topic, long enough, not gibberish or repeated fillers. */
export function sanity(a: Analysis): { ok: boolean; why: string } {
  if (a.noAnswer) return { ok: false, why: 'No real answer detected' };
  if (a.tooShort || a.words < MIN_WORDS) return { ok: false, why: `Answer too short (at least ${MIN_WORDS} words counts)` };
  if (a.relevance === 0) return { ok: false, why: 'Off-topic: the answer does not touch the question' };
  if (a.fillerRate > 0.25) return { ok: false, why: 'Mostly filler words' };
  return { ok: true, why: '' };
}
export function rate(a: Analysis) { const s: Skills = { delivery: a.delivery, content: a.content, wording: wording(a) }; return { skills: s, rating: toLevel(0.4 * s.content + 0.4 * s.delivery + 0.2 * s.wording) }; }
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
/** Adds one answer. Failing the sanity gate earns 0 and no XP. Growth is small and capped per day. */
export function addAnswer(g: Game, a: Analysis, today = new Date().toISOString().slice(0, 10)): { game: Game; counted: boolean; why: string; rating: number; delta: number } {
  const chk = sanity(a); if (!chk.ok) return { game: g, counted: false, why: chk.why, rating: 0, delta: 0 };
  const { skills, rating } = rate(a); const x: Game = { ...g, history: [...g.history], badges: [...g.badges] };
  if (x.lastDay !== today) { x.streak = x.lastDay && dayDiff(x.lastDay, today) === 1 ? x.streak + 1 : 1; x.todayGain = 0; x.lastDay = today; }
  let delta = 0;
  if (x.level == null) { x.baseline = r1(clamp(rating, 4, 5)); x.level = x.baseline; }
  else { const want = rating > x.level ? Math.min(STEP_UP, DAILY_CAP - x.todayGain) : rating < x.level - 1 ? -STEP_DOWN : 0; delta = r1(Math.max(want, rating > x.level ? 0 : want)); x.level = r1(clamp(x.level + delta, 1, 10)); if (delta > 0) x.todayGain = r1(x.todayGain + delta); }
  x.xp += 10;
  const last = x.history[x.history.length - 1];
  if (last && last.date === today) { const n = last.answers + 1; x.history[x.history.length - 1] = { date: today, level: x.level, rating: r1((last.rating * last.answers + rating) / n), answers: n, skills: { delivery: Math.round((last.skills.delivery * last.answers + skills.delivery) / n), content: Math.round((last.skills.content * last.answers + skills.content) / n), wording: Math.round((last.skills.wording * last.answers + skills.wording) / n) } }; }
  else x.history.push({ date: today, level: x.level, rating, skills, answers: 1 });
  const add = (b: string) => { if (!x.badges.includes(b)) x.badges.push(b); };
  add('First practice'); if (x.streak >= 3) add('3-day streak'); if (x.streak >= 7) add('7-day streak'); if (x.xp >= 100) add('10 real answers');
  if (a.fillers.length === 0) add('Filler-free answer'); if (Object.values(a.star).every(Boolean)) add('Full STAR answer'); if (x.baseline != null && x.level - x.baseline >= 1) add('+1 level');
  return { game: x, counted: true, why: '', rating, delta };
}
export const practisedToday = (g: Game, today = new Date().toISOString().slice(0, 10)) => g.lastDay === today;
export function inQuiet(h: number, from: number, to: number) { return from === to ? false : from < to ? h >= from && h < to : h >= from || h < to; }
/** Daily calendar reminder (.ics) the user imports into their own calendar. */
export function reminderIcs(hour: number, url: string) {
  const d = new Date(); d.setDate(d.getDate() + 1); const ymd = d.toISOString().slice(0, 10).replace(/-/g, ''), hh = String(hour).padStart(2, '0');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Akash Sync Agent//JAOS voice practice//EN', 'BEGIN:VEVENT', `UID:jaos-voice-${ymd}@local`, `DTSTAMP:${ymd}T000000`, `DTSTART:${ymd}T${hh}0000`, `DTEND:${ymd}T${hh}1500`, 'RRULE:FREQ=DAILY', 'SUMMARY:Hi, practise your interview today (10 min)', `DESCRIPTION:Open ${url} and answer 2 questions out loud.`, `URL:${url}`, 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Hi, you forgot to practise today', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
/** "Prepare for any designation": question templates for any job title plus how to answer. Templates, not facts about the job. */
export function designationPack(title: string) {
  const t = title.trim() || 'this role';
  return [
    { q: `Why do you want to work as a ${t}?`, what: 'Name 1 or 2 things in your past work that match the job, then why this job is the next step.', model: `"In my last role I [one task close to ${t} work]. I enjoyed [what], and I did it well: [result with a number]. As a ${t} I want to do more of that, especially [one part of the job]."`, how: 'Calm, about 140 words a minute, under 1 minute. Smile on the first line.' },
    { q: `What does a good first 90 days look like for you as a ${t}?`, what: 'Learn, then small wins, then own something. Ask how they measure success.', model: `"First month: learn the team, the tools and how success is measured for a ${t}. Second: fix one small problem I spot, with my manager's OK. Third: own [a measurable area] and report progress weekly."`, how: 'Count the three phases out loud ("First… second… third…") so it is easy to follow on a call.' },
    { q: `Tell me about a time you solved a problem that a ${t} would face.`, what: 'Use STAR: situation, task, action (what YOU did), result with a number.', model: '"At [company], [situation]. I had to [task]. I [2 or 3 concrete actions]. As a result, [measurable result]. I learned [one lesson]."', how: 'Spend most of the time on the action and result. Stop after the result.' },
    { q: `Which skills make someone good at being a ${t}, and which of them do you have?`, what: 'Pick 3 skills from the job post, and give one proof for each.', model: `"For a ${t}, I'd say [skill 1], [skill 2] and [skill 3]. For [skill 1], I [proof]. For [skill 2], [proof]. [Skill 3] I am still building: I am [how]."`, how: 'Honest about the gap, confident about the rest. No "I think maybe".' },
    { q: 'What is your biggest weakness?', what: 'A real but not job-breaking weakness, and what you are doing about it.', model: '"I used to [weakness]. It caused [small impact] once, so now I [habit or tool]. Last quarter that meant [result]."', how: 'Short and matter-of-fact. Do not apologise.' },
  ];
}
