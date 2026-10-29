// Voice interview practice: rule-based scoring of content and delivery, all in the browser. Akash Sync Agent.
export type Round = 'hr' | 'technical' | 'behavioural';
export const ROUNDS: Record<Round, string> = { hr: 'HR', technical: 'Technical', behavioural: 'Behavioural' };
/** Generic practice questions. {role} is replaced with the role the user types. */
export const QUESTIONS: Record<Round, { q: string; follow: string; keys: string[] }[]> = {
  hr: [
    { q: 'Tell me about yourself and why you are applying for this {role} role.', follow: 'What is one thing from your last job you are most proud of?', keys: ['experience', 'role', 'skill', 'year', 'team', 'because'] },
    { q: 'Why are you looking to leave your current job?', follow: 'What would make you stay in a role for the long term?', keys: ['growth', 'learn', 'opportunity', 'role', 'responsib'] },
    { q: 'What are your salary expectations for this {role} role?', follow: 'Is that figure flexible if the role has other benefits?', keys: ['range', 'market', 'lakh', 'ctc', 'flexible', 'role'] },
  ],
  technical: [
    { q: 'Walk me through a {role} problem you solved recently, step by step.', follow: 'What would you do differently if you solved it again?', keys: ['problem', 'step', 'first', 'then', 'result', 'because', 'data'] },
    { q: 'Which tools do you use daily as a {role}, and why those?', follow: 'How do you keep your skills up to date?', keys: ['tool', 'use', 'because', 'example', 'faster', 'accurate'] },
    { q: 'How do you check that your work is correct before you hand it over?', follow: 'Tell me about a time a mistake slipped through. What happened?', keys: ['check', 'test', 'review', 'verify', 'step'] },
  ],
  behavioural: [
    { q: 'Tell me about a time you handled a difficult customer or colleague.', follow: 'What did you learn from that situation?', keys: ['situation', 'task', 'action', 'result', 'learn', 'calm'] },
    { q: 'Describe a time you missed a deadline. What did you do?', follow: 'How do you plan your work now to avoid that?', keys: ['deadline', 'action', 'result', 'communicat', 'plan'] },
    { q: 'Tell me about a time you led a team or took ownership of something.', follow: 'How did you measure whether it worked?', keys: ['team', 'lead', 'own', 'result', 'percent', '%'] },
  ],
};
export const FILLERS = ['um', 'umm', 'uh', 'uhh', 'er', 'basically', 'actually', 'you know', 'like', 'i mean', 'sort of', 'kind of', 'literally', 'so yeah'];
const SLANG = ['gonna', 'wanna', 'gotta', 'yeah', 'dude', 'bro', 'cool', 'stuff', 'chill', 'kinda', 'ya'];
const STIFF = ['herewith', 'kindly', 'do the needful', 'hereby', 'aforementioned', 'revert back', 'pursuant'];
const HEDGE = ['i think maybe', 'i guess', 'not sure', 'probably', 'i hope', 'sorry'];
const STAR = { situation: /\b(when|situation|at my (last|previous)|while i was|once)\b/i, task: /\b(task|goal|needed to|had to|responsib)/i, action: /\b(i (decided|built|led|called|created|set up|spoke|changed|wrote|fixed|organi[sz]ed|trained|analy[sz]ed))\b/i, result: /\b(result|so that|which (led|meant)|increased|reduced|saved|improved|\d+ ?%|percent)\b/i };
const count = (t: string, w: string) => (t.match(new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'gi')) || []).length;
export interface Analysis { words: number; wpm: number | null; fillers: { w: string; n: number }[]; fillerRate: number; slang: string[]; stiff: string[]; hedges: string[]; star: Record<keyof typeof STAR, boolean>; relevance: number; content: number; delivery: number; score: number; tips: string[]; rewrite: string; noAnswer: boolean }
export function analyze(text: string, seconds: number | null, keys: string[], round: Round): Analysis {
  const t = (text || '').trim(), lower = t.toLowerCase(), words = t ? t.split(/\s+/).length : 0;
  const wpm = seconds && seconds > 3 ? Math.round(words / (seconds / 60)) : null;
  const fillers = FILLERS.map((w) => ({ w, n: count(lower, w) })).filter((x) => x.n > 0);
  const fn = fillers.reduce((a, x) => a + x.n, 0), fillerRate = words ? fn / words : 0;
  const slang = SLANG.filter((w) => count(lower, w)), stiff = STIFF.filter((w) => count(lower, w)), hedges = HEDGE.filter((w) => lower.includes(w));
  const star = Object.fromEntries(Object.entries(STAR).map(([k, re]) => [k, re.test(t)])) as Analysis['star'];
  const hit = keys.filter((k) => lower.includes(k)).length, relevance = Math.min(1, hit / Math.max(2, Math.ceil(keys.length / 2)));
  const starN = Object.values(star).filter(Boolean).length;
  const lengthOk = words >= 40 && words <= 250 ? 1 : words < 40 ? words / 40 : Math.max(0.4, 250 / words);
  const content = Math.round(100 * (0.45 * relevance + (round === 'behavioural' ? 0.4 : 0.25) * (starN / 4) + (round === 'behavioural' ? 0.15 : 0.3) * lengthOk));
  let delivery = 100; const tips: string[] = [];
  if (wpm != null && wpm > 170) { delivery -= 15; tips.push(`You spoke at about ${wpm} words a minute. Slow down to around 120 to 160 so the caller can follow on the phone.`); }
  if (wpm != null && wpm < 100) { delivery -= 10; tips.push(`About ${wpm} words a minute is slow. Practise the opening line so it comes out smoothly.`); }
  if (fillerRate > 0.03) { delivery -= Math.min(30, Math.round(fillerRate * 400)); tips.push(`${fn} filler word${fn > 1 ? 's' : ''} (${fillers.map((x) => x.w).join(', ')}). Pause silently instead.`); }
  if (slang.length) { delivery -= 10; tips.push(`Too casual for an interview: ${slang.join(', ')}.`); }
  if (stiff.length) { delivery -= 8; tips.push(`Sounds stiff or scripted: ${stiff.join(', ')}. Say it the way you would explain it to a senior colleague.`); }
  if (hedges.length) { delivery -= 8; tips.push(`Unsure phrases (${hedges.join(', ')}) lower confidence. State what you did plainly.`); }
  if (words > 250) { delivery -= 12; tips.push(`${words} words is long for a phone answer. Aim for about 1 to 2 minutes and stop after the result.`); }
  if (words && words < 25) tips.push('Very short. Add one example with a result.');
  if (round !== 'hr' && starN < 3) tips.push(`Use STAR: missing ${Object.entries(star).filter(([, v]) => !v).map(([k]) => k).join(', ')}.`);
  delivery = Math.max(0, delivery);
  const fset = new Set(FILLERS.flatMap((f) => f.split(' ')));
  const real = (lower.match(/[a-z\u0900-\u097f']+/g) || []).filter((w) => !fset.has(w) && (/[aeiouy]/.test(w) || /[\u0900-\u097f]/.test(w)) && !/(.)\1{2,}/.test(w));
  const noAnswer = real.length < 5 || real.length / Math.max(1, words) < 0.5;
  if (noAnswer) return { words, wpm, fillers, fillerRate, slang, stiff, hedges, star, relevance: 0, content: 0, delivery: Math.min(delivery, 10), score: Math.min(5, Math.round(real.length)), tips: ['No real answer detected. Answer the question in full sentences: what you did, how, and the result.', ...tips], rewrite: '', noAnswer: true };
  return { noAnswer: false, words, wpm, fillers, fillerRate, slang, stiff, hedges, star, relevance, content, delivery, score: Math.round(0.55 * content + 0.45 * delivery), tips, rewrite: naturalize(t) };
}
/** "Say it more naturally": removes fillers, swaps slang and stiff phrases. Uses only your own words. */
export function naturalize(t: string) {
  let s = ' ' + t + ' ';
  for (const w of [...FILLERS].sort((a, b) => b.length - a.length)) s = s.replace(new RegExp(`[,\\s]*\\b${w.replace(/ /g, '\\s+')}\\b[,]?`, 'gi'), ' ');
  const swap: [RegExp, string][] = [[/\bgonna\b/gi, 'going to'], [/\bwanna\b/gi, 'want to'], [/\bgotta\b/gi, 'have to'], [/\bkinda\b/gi, 'somewhat'], [/\byeah\b/gi, 'yes'], [/\bstuff\b/gi, 'work'], [/\bdo the needful\b/gi, 'take care of it'], [/\brevert back\b/gi, 'reply'], [/\bkindly\b/gi, 'please'], [/\bherewith\b/gi, '']];
  for (const [re, r] of swap) s = s.replace(re, r);
  return s.replace(/\s+/g, ' ').replace(/\s([,.?!])/g, '$1').trim().replace(/^./, (c) => c.toUpperCase());
}
export function highlight(t: string): { text: string; filler: boolean }[] {
  const re = new RegExp(`\\b(${[...FILLERS].sort((a, b) => b.length - a.length).map((w) => w.replace(/ /g, '\\s+')).join('|')})\\b`, 'gi');
  const out: { text: string; filler: boolean }[] = []; let last = 0;
  for (const m of t.matchAll(re)) { if (m.index! > last) out.push({ text: t.slice(last, m.index), filler: false }); out.push({ text: m[0], filler: true }); last = m.index! + m[0].length; }
  if (last < t.length) out.push({ text: t.slice(last), filler: false });
  return out;
}
