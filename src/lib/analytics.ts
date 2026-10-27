import { isCampaignTag } from './keywords';
// Privacy-first funnel counts via GoatCounter (cookieless, no script loaded).
// Uses VITE_GOATCOUNTER_CODE if set ("off" disables), else the owner's default code. Never counts in local dev.
// Sends ONLY a fixed event name: never resume text, keys, names or job data.
import { GOATCOUNTER_CODE, CHANNELS } from './brand';
const RAW = ((import.meta.env.VITE_GOATCOUNTER_CODE as string | undefined)?.trim() || GOATCOUNTER_CODE);
const CODE = import.meta.env.DEV || RAW.toLowerCase() === 'off' ? '' : RAW.replace(/[^a-z0-9-]/gi, '');
export const ANALYTICS_ON = !!CODE;
export const ANALYTICS_HOST = CODE ? `${CODE}.goatcounter.com` : '';
export const EVENTS = ['landing_view', 'start_setup', 'resume_added', 'key_added', 'first_job_found', 'export', 'feedback_sent', 'share'] as const;
export type EventName = (typeof EVENTS)[number];
const OPT = 'jaos_no_stats';
const OK = 'jaos_stats_ok'; // counting is OFF until the visitor says yes
export const gpcOn = () => { try { return (navigator as any).globalPrivacyControl === true || navigator.doNotTrack === '1'; } catch { return false; } };
export const statsChoiceMade = () => { try { return localStorage.getItem(OK) === '1' || localStorage.getItem(OPT) === '1'; } catch { return true; } };
export const statsOptedOut = () => { try { return gpcOn() || localStorage.getItem(OK) !== '1'; } catch { return true; } };
export const CONSENT_EVENT = 'jaos-stats-consent';
export const setStatsOptOut = (off: boolean) => {
  try { if (off) { localStorage.setItem(OPT, '1'); localStorage.removeItem(OK); localStorage.removeItem('jaos_src_v1'); } else { localStorage.setItem(OK, '1'); localStorage.removeItem(OPT); } } catch { /* ignore */ }
  window.dispatchEvent(new Event(CONSENT_EVENT));
};
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

const SOURCES: readonly string[] = [...CHANNELS, 'share'];
/** Where this visit came from, only if the link carried a known ref / utm_source (e.g. ?ref=instagram). */
export function visitSource(search = location.search): { source: string; campaign: string } | null {
  const q = new URLSearchParams(search);
  const source = (q.get('src') || q.get('ref') || q.get('utm_source') || '').toLowerCase().trim();
  // Known channels, or a campaign tag like ?src=reddit-3 / ?src=reel-7 (channel plus a number).
  if (!SOURCES.includes(source) && !isCampaignTag(source)) return null;
  const c = (q.get('utm_campaign') || '').toLowerCase().trim();
  return { source, campaign: /^[a-z0-9_-]{1,40}$/.test(c) ? c : '' };
}

/** One anonymous page view per page load: the page path plus, if present, the channel the link came from.
 *  GoatCounter shows the source under Campaigns/Referrers; an extra event from_<channel> makes it easy to compare. */
export function countVisit() {
  if (!CODE || statsOptedOut()) return;
  try {
    const path = location.pathname.replace(/[^a-z0-9/_-]/gi, '').slice(0, 40) || '/';
    const src = visitSource();
    const u = new URL(`https://${ANALYTICS_HOST}/count`);
    u.searchParams.set('p', path); u.searchParams.set('t', path);
    if (src) u.searchParams.set('q', `?ref=${src.source}${src.campaign ? `&utm_campaign=${src.campaign}` : ''}`);
    u.searchParams.set('rnd', Math.random().toString(36).slice(2));
    const img = new Image(); img.referrerPolicy = 'no-referrer'; img.src = u.toString();
    if (src) { const ev = new URL(u); ev.search = ''; ev.searchParams.set('p', `from_${src.source}`); ev.searchParams.set('t', `from_${src.source}`); ev.searchParams.set('e', 'true'); ev.searchParams.set('rnd', Math.random().toString(36).slice(2)); const i2 = new Image(); i2.referrerPolicy = 'no-referrer'; i2.src = ev.toString(); }
  } catch { /* never break the app for stats */ }
}
