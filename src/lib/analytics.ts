// Privacy-first funnel counts via GoatCounter (cookieless, no script loaded).
// Uses VITE_GOATCOUNTER_CODE if set ("off" disables), else the owner's default code. Never counts in local dev.
// Sends ONLY a fixed event name: never resume text, keys, names or job data.
import { GOATCOUNTER_CODE } from './brand';
const RAW = ((import.meta.env.VITE_GOATCOUNTER_CODE as string | undefined)?.trim() || GOATCOUNTER_CODE);
const CODE = import.meta.env.DEV || RAW.toLowerCase() === 'off' ? '' : RAW.replace(/[^a-z0-9-]/gi, '');
export const ANALYTICS_ON = !!CODE;
export const ANALYTICS_HOST = CODE ? `${CODE}.goatcounter.com` : '';
export const EVENTS = ['landing_view', 'start_setup', 'resume_added', 'key_added', 'first_job_found', 'export', 'feedback_sent', 'share'] as const;
export type EventName = (typeof EVENTS)[number];
const OPT = 'jaos_no_stats';
export const statsOptedOut = () => { try { return localStorage.getItem(OPT) === '1' || navigator.doNotTrack === '1' || (navigator as any).globalPrivacyControl === true; } catch { return true; } };
export const setStatsOptOut = (off: boolean) => { try { off ? localStorage.setItem(OPT, '1') : localStorage.removeItem(OPT); } catch { /* ignore */ } };
const ONCE: EventName[] = ['resume_added', 'key_added', 'first_job_found'];

/** Count one anonymous event. Funnel steps that should happen once per browser are only sent once. */
export function track(e: EventName) {
  if (!CODE || statsOptedOut() || !EVENTS.includes(e)) return;
  try {
    if (ONCE.includes(e)) { const k = `jaos_ev_${e}`; if (localStorage.getItem(k)) return; localStorage.setItem(k, '1'); }
    const u = new URL(`https://${ANALYTICS_HOST}/count`);
    u.searchParams.set('p', e); u.searchParams.set('t', e); u.searchParams.set('e', 'true'); u.searchParams.set('rnd', Math.random().toString(36).slice(2));
    const img = new Image(); img.referrerPolicy = 'no-referrer'; img.src = u.toString();
  } catch { /* never break the app for stats */ }
}
