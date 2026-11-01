// Optional consents (SMS, CV retention). OPTIONAL and UNTICKED by default (Akash t307u); nothing is blocked without them; tick or withdraw any time. Recorded ONLY in this browser.
// DPDP Act 2023 s.6: free, specific, informed, unconditional, unambiguous, with a clear affirmative action; withdrawal as easy as giving. Akash Sync Agent.
export type ConsentKind = 'sms' | 'cv';
export const CONSENT_TEXT: Record<ConsentKind, string> = {
  sms: 'By checking this box, I consent to receive transactional and marketing text messages regarding employment opportunities.',
  cv: '*By checking this box, I consent to the storage of my CV in this browser for six months so that I can share it with employers I choose to assess my suitability for future job opportunities. Job Acquisition OS does not send it to employers.',
};
export const CONSENT_VERSION = '2026-11-01d';
export interface LogEntry { kind: ConsentKind; action: 'given' | 'withdrawn' | 'expired' | 'default-on'; at: string; where: string; text: string; version: string; until?: string }
export interface ConsentState { sms: { given: boolean; at?: string }; cv: { given: boolean; at?: string; until?: string }; log: LogEntry[] }
export const NO_CONSENT: ConsentState = { sms: { given: false }, cv: { given: false }, log: [] };
export const KEY = 'jaos_consent_v1';
export function addMonths(iso: string, n: number) { const d = new Date(iso); const day = d.getUTCDate(); d.setUTCMonth(d.getUTCMonth() + n); if (d.getUTCDate() < day) d.setUTCDate(0); return d.toISOString(); }
export function setConsent(s: ConsentState, kind: ConsentKind, on: boolean, where: string, now = new Date().toISOString()): ConsentState {
  const cur = s[kind].given; if (cur === on) return s;
  const until = kind === 'cv' && on ? addMonths(now, 6) : undefined;
  const entry: LogEntry = { kind, action: on ? 'given' : 'withdrawn', at: now, where, text: CONSENT_TEXT[kind], version: CONSENT_VERSION, ...(until ? { until } : {}) };
  return { ...s, [kind]: on ? { given: true, at: now, ...(until ? { until } : {}) } : { given: false }, log: [...s.log, entry] };
}
/** CV consent lapses on its retention date: recorded as 'expired' and treated as not given. */
export function expire(s: ConsentState, now = new Date().toISOString()): ConsentState {
  if (s.cv.given && s.cv.until && s.cv.until <= now) return { ...s, cv: { given: false }, log: [...s.log, { kind: 'cv', action: 'expired', at: now, where: 'automatic', text: CONSENT_TEXT.cv, version: CONSENT_VERSION }] };
  return s;
}
export function load(): ConsentState {
  try { const raw = localStorage.getItem(KEY); if (!raw) return NO_CONSENT; return expire({ ...NO_CONSENT, ...JSON.parse(raw) }); } catch { return NO_CONSENT; }
}
/** 'Manage consent': set both boxes at once, each change logged. */
export const setBoth = (s: ConsentState, on: boolean, where: string, now?: string) => setConsent(setConsent(s, 'sms', on, where, now), 'cv', on, where, now);
export function save(s: ConsentState) { try { localStorage.setItem(KEY, JSON.stringify(s)); window.dispatchEvent(new Event(KEY)); } catch { /* storage blocked */ } }
export const exportJson = (s: ConsentState) => JSON.stringify({ app: 'Job Acquisition OS', note: 'Consent log kept only in this browser. Nothing was sent to a server.', exportedAt: new Date().toISOString(), version: CONSENT_VERSION, current: { sms: s.sms, cv: s.cv }, log: s.log }, null, 2);
