// Optional "Sign in with Google" via Google Identity Services. The ID token is verified by this app's
// serverless function (/api/auth/google). The verified profile is kept in this browser only; there are
// no server-side sessions. This separates local data per account; it is not cloud storage or access control.
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';
export const googleEnabled = CLIENT_ID.length > 10;

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
export async function renderGoogleButton(el: HTMLElement, onError: (m: string) => void) {
  if (!googleEnabled) return;
  try {
    const google = await loadGsi();
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (resp: { credential?: string }) => {
        try {
          const r = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: resp.credential }) });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) return onError(d.error || 'Sign-in could not be verified.');
          localStorage.setItem(SESSION_KEY, JSON.stringify({ uid: d.sub, name: d.name, email: d.email, photo: d.picture }));
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
