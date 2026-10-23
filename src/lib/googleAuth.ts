// Optional "Sign in with Google" via Google Identity Services. The ID token is verified by this app's
// serverless function (/api/auth/google). The verified profile is kept in this browser only; there are
// no server-side sessions. This separates local data per account; it is not cloud storage or access control.
// The client ID is public. It comes from the server's GOOGLE_CLIENT_ID (via /api/status) so no rebuild is needed;
// VITE_GOOGLE_CLIENT_ID still works as a build-time fallback.
const BUILD_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';
let cfgP: Promise<string> | null = null;
export function loadClientId(): Promise<string> {
  if (!cfgP) cfgP = fetch('/api/status').then((r) => r.json()).then((d) => String(d?.googleClientId || BUILD_ID)).catch(() => BUILD_ID);
  return cfgP;
}
let CLIENT_ID = BUILD_ID;
export const isClientId = (s: string) => /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/i.test(s);

/** Random id kept in this browser (not a tracker across sites), plus a light, non-identifying device hint. */
export function deviceId(): string {
  try {
    let id = localStorage.getItem('jaos_device_v1');
    if (!id) { id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2)); localStorage.setItem('jaos_device_v1', id); }
    return id;
  } catch { return ''; }
}
export function lightFingerprint(): string {
  const parts = [navigator.platform, navigator.language, Intl.DateTimeFormat().resolvedOptions().timeZone, screen.width + 'x' + screen.height, screen.colorDepth, navigator.hardwareConcurrency || 0].join('|');
  let h = 2166136261; for (let i = 0; i < parts.length; i++) { h ^= parts.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export interface AuthUser { uid: string; name: string; email: string; photo: string }

const SESSION_KEY = 'jaos_session_v1';
const EVT = 'jaos-auth-change';

export function getSession(): AuthUser | null {
  try {
    const u = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return u && typeof u.uid === 'string' && u.uid ? u : null;
  } catch { return null; }
}
export function watchAuth(cb: (u: AuthUser | null) => void): () => void {
  const f = () => cb(getSession());
  window.addEventListener(EVT, f);
  f();
  return () => window.removeEventListener(EVT, f);
}

let scriptP: Promise<any> | null = null;
function loadGsi(): Promise<any> {
  if (scriptP) return scriptP;
  scriptP = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve((window as any).google);
    s.onerror = () => { scriptP = null; reject(new Error('load')); };
    document.head.appendChild(s);
  });
  return scriptP;
}

/** Renders Google's official button into `el`. Calls onError with a short message on failure. */
export async function renderGoogleButton(el: HTMLElement, onError: (m: string) => void, extra: () => { consent: boolean; mobile: string } = () => ({ consent: true, mobile: '' }), o: { prompt?: boolean } = {}) {
  CLIENT_ID = await loadClientId();
  if (!isClientId(CLIENT_ID)) return onError('Google sign-in is not set up on this site yet.');
  try {
    const google = await loadGsi();
    google.accounts.id.initialize({ use_fedcm_for_prompt: true,
      client_id: CLIENT_ID,
      callback: async (resp: { credential?: string }) => {
        try {
          const r = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: resp.credential, ...extra(), deviceId: deviceId(), fp: lightFingerprint(), source: firstSource() }) });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) return onError(d.error || 'Sign-in could not be verified.');
          localStorage.setItem(SESSION_KEY, JSON.stringify({ uid: d.sub, name: d.name, email: d.email, photo: d.picture }));
          setIdToken(resp.credential || '');
          try { localStorage.setItem('jaos_visit_v1', new Date().toDateString()); } catch { /* ignore */ }
          window.dispatchEvent(new Event(EVT));
        } catch { onError('Network error while verifying sign-in.'); }
      },
    });
    google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with' });
    if (o.prompt) try { google.accounts.id.prompt(); } catch { /* the button is still there */ }
  } catch { onError('Could not load Google sign-in. Check your connection or ad blocker.'); }
}

/** Ends the local session only. Your saved data stays on this device. */
export function signOutUser() {
  try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  idToken = '';
  try { (window as any).google?.accounts.id.disableAutoSelect(); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVT));
}

/** Once a day per device: bumps "Last seen" and "Visits" in the private Users tab. Best effort, silent. */
export function pingVisit(u: AuthUser | null) {
  if (!u?.email) return;
  try {
    const today = new Date().toDateString();
    if (localStorage.getItem('jaos_visit_v1') === today) return;
    localStorage.setItem('jaos_visit_v1', today);
    fetch('/api/auth/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, deviceId: deviceId(), source: firstSource() }) }).catch(() => {});
  } catch { /* ignore */ }
}

/** Channel of this browser's first visit (?ref= / utm_source), kept locally so sign-ups can be attributed. */
export function firstSource(): string { try { return localStorage.getItem('jaos_src_v1') || ''; } catch { return ''; } }
let pendingSrc = '';
/** Written only after the visitor agrees to usage counting; until then it is held in memory for this page load. */
export function rememberSource(src: string, consented: boolean) { if (src) pendingSrc = src; try { if (consented && pendingSrc && !localStorage.getItem('jaos_src_v1')) localStorage.setItem('jaos_src_v1', pendingSrc); } catch { /* ignore */ } }

export type FunnelEvent = 'profile_done' | 'job_viewed' | 'docs_generated' | 'apply_click' | `stage_${'applied' | 'screening' | 'interviewing' | 'offer' | 'accepted' | 'rejected' | 'withdrawn' | 'saved'}`;
/** Signed-in users only: one funnel step per day per device, to the private Events tab. Silent, best effort. */
export function funnel(event: FunnelEvent) {
  const u = getSession(); if (!u?.email) return;
  try {
    const k = `jaos_fn_${event}`, today = new Date().toDateString();
    if (localStorage.getItem(k) === today) return; localStorage.setItem(k, today);
    fetch('/api/auth/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, deviceId: deviceId(), event, source: firstSource() }), keepalive: true }).catch(() => {});
  } catch { /* ignore */ }
}

/** Renders a Google button that hands back the raw ID token (used by /admin, which re-sends it on every call). */
export async function renderTokenButton(el: HTMLElement, onToken: (t: string) => void, onError: (m: string) => void) {
  CLIENT_ID = await loadClientId();
  if (!isClientId(CLIENT_ID)) return onError('Not available.');
  try {
    const google = await loadGsi();
    google.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r: { credential?: string }) => r.credential ? onToken(r.credential) : onError('No credential.') });
    google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with' });
  } catch { onError('Could not load Google sign-in.'); }
}

/* ---------- ID token for app API calls ----------
 * The Google ID token (about 1 hour) is kept in memory and sessionStorage (this tab only), sent as
 * Authorization: Bearer on AI and job-search calls, and refreshed silently with Google One Tap (auto_select). */
const TOKEN_KEY = 'jaos_idt_v1';
let idToken = (() => { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } })();
const claims = (t: string): any => { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return null; } };
export function setIdToken(t: string) { idToken = t; try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } }
const fresh = (t: string) => { const c = claims(t); return !!c && c.exp * 1000 > Date.now() + 60_000; };
/** True when the token belongs to the signed-in account (same Google sub). */
export const tokenMatchesSession = (t: string) => { const c = claims(t), u = getSession(); return !!c && !!u && c.sub === u.uid; };

let refreshing: Promise<string> | null = null;
/** Silent refresh via One Tap. Resolves '' if Google cannot do it without the user (then the app shows a re-sign-in prompt). */
export function refreshIdToken(): Promise<string> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const id = await loadClientId(); if (!isClientId(id)) return '';
      const google = await loadGsi();
      return await new Promise<string>((resolve) => {
        const done = (t: string) => { clearTimeout(timer); resolve(t); };
        const timer = setTimeout(() => done(''), 10_000);
        google.accounts.id.initialize({ client_id: id, auto_select: true, use_fedcm_for_prompt: true, callback: (r: { credential?: string }) => done(r.credential && tokenMatchesSession(r.credential) ? r.credential : '') });
        google.accounts.id.prompt((n: any) => { try { if (n?.isNotDisplayed?.() || n?.isSkippedMoment?.() || n?.isDismissedMoment?.()) done(''); } catch { /* ignore */ } });
      });
    } catch { return ''; }
  })().then((t) => { if (t) setIdToken(t); refreshing = null; return t; });
  return refreshing;
}
/** A valid token for API calls, refreshing silently if it is missing or about to expire. */
export async function getIdToken(): Promise<string> { return fresh(idToken) ? idToken : refreshIdToken(); }

export const REAUTH_EVENT = 'jaos-reauth';
let waiting: { resolve: (t: string) => void; reject: (e: Error) => void }[] = [];
/** Asks the user to sign in again in a dialog over the current page (nothing is lost); resolves with the new token. */
export function requestReauth(): Promise<string> {
  return new Promise((resolve, reject) => { waiting.push({ resolve, reject }); if (waiting.length === 1) window.dispatchEvent(new Event(REAUTH_EVENT)); });
}
export function finishReauth(t: string | null) {
  const w = waiting; waiting = [];
  if (t) { setIdToken(t); w.forEach((x) => x.resolve(t)); } else w.forEach((x) => x.reject(new Error('Sign-in needed')));
}
/** Google button for the re-sign-in dialog. Only accepts the same Google account that is signed in. */
export async function renderReauthButton(el: HTMLElement, onToken: (t: string) => void, onError: (m: string) => void) {
  const id = await loadClientId(); if (!isClientId(id)) return onError('Google sign-in is not available right now.');
  try {
    const google = await loadGsi();
    google.accounts.id.initialize({ client_id: id, callback: (r: { credential?: string }) => (r.credential && tokenMatchesSession(r.credential) ? onToken(r.credential) : onError('Please use the same Google account you signed in with.')) });
    google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with' });
  } catch { onError('Could not load Google sign-in. Check your connection.'); }
}
