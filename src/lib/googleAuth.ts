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
export async function renderGoogleButton(el: HTMLElement, onError: (m: string) => void, extra: () => { consent: boolean; mobile: string } = () => ({ consent: true, mobile: '' })) {
  CLIENT_ID = await loadClientId();
  if (!isClientId(CLIENT_ID)) return onError('Google sign-in is not set up on this site yet.');
  try {
    const google = await loadGsi();
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (resp: { credential?: string }) => {
        try {
          const r = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: resp.credential, ...extra(), deviceId: deviceId(), fp: lightFingerprint() }) });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) return onError(d.error || 'Sign-in could not be verified.');
          localStorage.setItem(SESSION_KEY, JSON.stringify({ uid: d.sub, name: d.name, email: d.email, photo: d.picture }));
          try { localStorage.setItem('jaos_visit_v1', new Date().toDateString()); } catch { /* ignore */ }
          window.dispatchEvent(new Event(EVT));
        } catch { onError('Network error while verifying sign-in.'); }
      },
    });
    google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with' });
  } catch { onError('Could not load Google sign-in. Check your connection or ad blocker.'); }
}

/** Ends the local session only. Your saved data stays on this device. */
export function signOutUser() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
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
    fetch('/api/auth/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, deviceId: deviceId() }) }).catch(() => {});
  } catch { /* ignore */ }
}
