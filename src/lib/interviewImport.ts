/* Interview auto-add: Google Calendar (read-only, client-side token), pasted invite emails and .ics files.
 * The calendar access token lives only in memory for this tab; it is never sent to our server or stored. */
import { callAi } from './api';
import { getSession, loadClientId } from './googleAuth';
import type { Job } from '../types';
import { matchJob, norm, toLocalInput, type RawItem } from './icsParse';
export { parseIcs, icsTime, matchJob, toLocalInput } from './icsParse';

export const CAL_SCOPE = 'https://www.googleapis.com/auth/calendar.events.readonly';
export const KEYWORDS = /\b(interview|interviews|screening|screen|round|hr|hiring|recruiter|recruitment|technical|panel|assessment|onsite|offer discussion)\b/i;

export interface Candidate {
  key: string; source: 'calendar' | 'email' | 'ics'; extId: string;
  title: string; company: string; role: string; round: string;
  date: string; // local yyyy-mm-ddThh:mm
  minutes: number; link: string; interviewer: string; jobId: string;
  tzNote: string; aiChecked: boolean; selected: boolean;
}

let calToken = '';
let gsi: Promise<any> | null = null;
const loadGis = () => gsi ||= new Promise((res, rej) => { if ((window as any).google?.accounts?.oauth2) return res((window as any).google); const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = () => res((window as any).google); s.onerror = () => { gsi = null; rej(new Error('Could not load Google sign-in.')); }; document.head.appendChild(s); });

/** Opens Google's consent popup for read-only calendar events (incremental consent). Must be called from a click. */
export async function connectCalendar(): Promise<string> {
  const [google, clientId] = await Promise.all([loadGis(), loadClientId()]);
  if (!google?.accounts?.oauth2) throw new Error('Google sign-in is unavailable.');
  return new Promise((resolve, reject) => {
    const tc = google.accounts.oauth2.initTokenClient({
      client_id: clientId, scope: CAL_SCOPE, include_granted_scopes: true, login_hint: getSession()?.email || undefined, prompt: '',
      callback: (r: any) => {
        if (r?.error || !r?.access_token) return reject(new Error(r?.error === 'access_denied' ? 'Calendar access was not granted.' : 'Could not connect Google Calendar.'));
        if (!google.accounts.oauth2.hasGrantedAllScopes(r, CAL_SCOPE)) return reject(new Error('Calendar access was not granted.'));
        calToken = r.access_token; resolve(calToken);
      },
      error_callback: (e: any) => reject(new Error(e?.type === 'popup_closed' ? 'The Google window was closed.' : 'Could not open the Google window. Allow pop-ups and try again.')),
    });
    tc.requestAccessToken();
  });
}
export const calendarConnected = () => !!calToken;
export function disconnectCalendar() { const g = (window as any).google; if (calToken && g?.accounts?.oauth2) g.accounts.oauth2.revoke(calToken, () => undefined); calToken = ''; }

export async function calendarItems(days = 60): Promise<RawItem[]> {
  if (!calToken) throw new Error('Connect Google Calendar first.');
  const now = new Date(), max = new Date(now.getTime() + days * 864e5);
  const q = new URLSearchParams({ timeMin: now.toISOString(), timeMax: max.toISOString(), singleEvents: 'true', orderBy: 'startTime', maxResults: '250', fields: 'items(id,status,summary,description,location,start,end,hangoutLink,conferenceData(entryPoints(uri,entryPointType)))' });
  const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${q}`, { headers: { Authorization: `Bearer ${calToken}` } });
  if (r.status === 401) { calToken = ''; throw new Error('Calendar access expired. Connect again.'); }
  if (!r.ok) throw new Error('Could not read your calendar.');
  const d = await r.json();
  return (d.items || []).filter((e: any) => e.status !== 'cancelled' && e.start?.dateTime).map((e: any): RawItem => {
    const link = e.hangoutLink || e.conferenceData?.entryPoints?.find((p: any) => p.entryPointType === 'video')?.uri || '';
    const mins = e.end?.dateTime ? Math.round((Date.parse(e.end.dateTime) - Date.parse(e.start.dateTime)) / 6e4) : 0;
    return { source: 'calendar', extId: `cal:${e.id}`, title: e.summary || '', start: e.start.dateTime, minutes: mins, link, text: `Title: ${e.summary || ''}\nWhen: ${e.start.dateTime}\nLocation: ${e.location || ''}\nLink: ${link}\nDescription: ${String(e.description || '').replace(/<[^>]+>/g, ' ').slice(0, 3000)}` };
  });
}

/** Calendar/.ics items: keyword filter first, then AI classify. Pasted email: AI extract. Falls back to keywords + matching if AI is unavailable. */
export async function toCandidates(raw: RawItem[], jobs: Job[], known: Set<string>): Promise<{ list: Candidate[]; aiError: string }> {
  const items = raw.filter((r) => !known.has(r.extId) && (r.source === 'email' || KEYWORDS.test(`${r.title} ${r.text}`) || jobs.some((j) => norm(j.company).length >= 3 && norm(r.text).includes(norm(j.company)))));
  if (!items.length) return { list: [], aiError: '' };
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let ai: any[] = [], aiError = '';
  try {
    const r = await callAi<{ items: any[] }>('interview-extract', { items: items.map((i) => ({ source: i.source, text: i.text })), tracked: jobs.map((j) => ({ id: j.id, title: j.title, company: j.company })), userTz: tz });
    ai = r.items || [];
  } catch (e: any) { aiError = e?.message || 'AI unavailable'; }
  const list: Candidate[] = [];
  items.forEach((it, idx) => {
    const a = ai.find((x) => x.index === idx);
    if (a && !a.isInterview) return;
    if (!a && it.source === 'email') return;
    const start = it.start || a?.start || '';
    const jobId = (a?.jobId && jobs.some((j) => j.id === a.jobId)) ? a.jobId : matchJob(jobs, it.text, a?.company, a?.role);
    const link = it.link || (a?.link && /^https:\/\//.test(a.link) && it.text.includes(a.link) ? a.link : '');
    list.push({ key: `${it.extId}#${idx}`, source: it.source, extId: it.extId, title: it.title || a?.round || 'Interview', company: a?.company || '', role: a?.role || '', round: a?.round || it.title || 'Interview', date: toLocalInput(start), minutes: it.minutes || a?.minutes || 60, link, interviewer: a?.interviewer || '', jobId, aiChecked: !!a,
      tzNote: it.source === 'email' && a && !a.tzStated ? `No time zone in the email: assumed your local time (${tz}). Check it.` : '', selected: !!jobId });
  });
  return { list, aiError };
}
export const emailItem = (text: string): RawItem => ({ source: 'email', extId: `email:${Date.now()}`, title: '', text: text.slice(0, 6000) });
