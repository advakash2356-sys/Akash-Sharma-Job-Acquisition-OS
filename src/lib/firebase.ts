// Optional Google sign-in via Firebase Authentication. Loaded lazily and only when configured.
// If VITE_FIREBASE_* variables are missing the app runs in guest mode and never touches Firebase.
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};
export const firebaseEnabled = !!(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);

export interface AuthUser { uid: string; name: string; email: string; photo: string }
const toUser = (u: any): AuthUser => ({ uid: u.uid, name: u.displayName || '', email: u.email || '', photo: u.photoURL || '' });

let mod: Promise<{ auth: any; m: typeof import('firebase/auth') }> | null = null;
function load() {
  if (!mod) {
    mod = (async () => {
      const [{ initializeApp }, m] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
      const app = initializeApp(cfg as any);
      return { auth: m.getAuth(app), m };
    })();
  }
  return mod;
}

export async function watchAuth(cb: (u: AuthUser | null) => void): Promise<() => void> {
  if (!firebaseEnabled) { cb(null); return () => {}; }
  try {
    const { auth, m } = await load();
    return m.onAuthStateChanged(auth, (u: any) => cb(u ? toUser(u) : null), () => cb(null));
  } catch { cb(null); return () => {}; }
}

export async function signInWithGoogle(): Promise<string | null> {
  if (!firebaseEnabled) return 'Google sign-in is not configured for this deployment.';
  try {
    const { auth, m } = await load();
    await m.signInWithPopup(auth, new m.GoogleAuthProvider());
    return null;
  } catch (e: any) {
    const c = String(e?.code || '');
    if (c.includes('popup-closed') || c.includes('cancelled')) return null;
    if (c.includes('unauthorized-domain')) return 'This domain is not authorised in Firebase yet (see FIREBASE_SETUP.md).';
    if (c.includes('popup-blocked')) return 'Your browser blocked the sign-in popup. Allow popups and try again.';
    return 'Sign-in failed. Please try again.';
  }
}

export async function signOutUser() {
  if (!firebaseEnabled) return;
  try { const { auth, m } = await load(); await m.signOut(auth); } catch { /* ignore */ }
}
