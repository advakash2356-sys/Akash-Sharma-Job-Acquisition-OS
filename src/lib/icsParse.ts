import type { Job } from '../types';
export interface RawItem { source: 'calendar' | 'email' | 'ics'; extId: string; text: string; title: string; start?: string; minutes?: number; link?: string }
// ---- .ics parsing ----
function tzOffsetMs(utc: number, tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(utc)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - utc;
}
/** ICS DTSTART value to an absolute ISO time. Returns '' for all-day or unparseable values. */
export function icsTime(value: string, tzid = ''): string {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/.exec(value.trim());
  if (!m) return '';
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
  if (m[7]) return new Date(guess).toISOString();
  if (!tzid) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`; // floating: user's local time
  try { let t = guess - tzOffsetMs(guess, tzid); t = guess - tzOffsetMs(t, tzid); return new Date(t).toISOString(); } catch { return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`; }
}
const unesc = (s: string) => s.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
export function parseIcs(text: string): RawItem[] {
  const lines = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
  const out: RawItem[] = []; let ev: Record<string, { v: string; tz: string }> | null = null;
  for (const l of lines) {
    if (l === 'BEGIN:VEVENT') { ev = {}; continue; }
    if (l === 'END:VEVENT' && ev) {
      const start = ev.DTSTART ? icsTime(ev.DTSTART.v, ev.DTSTART.tz) : '';
      const end = ev.DTEND ? icsTime(ev.DTEND.v, ev.DTEND.tz) : '';
      if (start) {
        const desc = unesc(ev.DESCRIPTION?.v || ''); const loc = unesc(ev.LOCATION?.v || '');
        const link = ev.URL?.v || (`${loc} ${desc}`.match(/https:\/\/[^\s<>"]*(meet\.google|zoom\.us|teams\.microsoft|teams\.live|webex)[^\s<>"]*/i)?.[0] || '');
        out.push({ source: 'ics', extId: `ics:${ev.UID?.v || start + (ev.SUMMARY?.v || '')}`, title: unesc(ev.SUMMARY?.v || ''), start, minutes: end ? Math.round((Date.parse(end) - Date.parse(start)) / 6e4) : 0, link, text: `Title: ${unesc(ev.SUMMARY?.v || '')}\nWhen: ${start}\nLocation: ${loc}\nLink: ${link}\nDescription: ${desc.slice(0, 3000)}` });
      }
      ev = null; continue;
    }
    if (!ev) continue;
    const i = l.indexOf(':'); if (i < 0) continue;
    const [name, ...params] = l.slice(0, i).split(';');
    ev[name.toUpperCase()] = { v: l.slice(i + 1), tz: params.find((p) => p.toUpperCase().startsWith('TZID='))?.slice(5) || '' };
  }
  return out;
}

/** Absolute or floating ISO time to the browser's local yyyy-mm-ddThh:mm. */
export function toLocalInput(iso: string): string {
  if (!iso) return '';
  const floating = !/(Z|[+-]\d{2}:?\d{2})$/.test(iso);
  if (floating) return iso.slice(0, 16);
  const d = new Date(iso); if (isNaN(+d)) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
export const norm = (s: string) => s.toLowerCase().replace(/\b(pvt|private|ltd|limited|inc|llc|llp|corp|corporation|technologies|solutions|india)\b/g, '').replace(/[^a-z0-9]/g, '');
export function matchJob(jobs: Job[], text: string, company = '', role = ''): string {
  const hay = norm(`${company} ${role} ${text}`);
  const hits = jobs.filter((j) => norm(j.company).length >= 3 && hay.includes(norm(j.company)));
  if (hits.length <= 1) return hits[0]?.id || '';
  return (hits.find((j) => hay.includes(norm(j.title))) || hits[0]).id;
}

