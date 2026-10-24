// All app data lives in this browser's localStorage, namespaced by account id ("guest" when signed out).
// Guest data keeps the original un-suffixed keys so nothing is lost when this feature shipped.
export const PROFILE_KEY = 'jaos_profile_v1';
export const JOBS_KEY = 'jaos_jobs_v1';
export const scoped = (base: string, uid: string) => (uid === 'guest' ? base : `${base}:${uid}`);

/** Copy guest data into the signed-in account namespace (only fills empty slots). */
export function importGuestData(uid: string): boolean {
  let copied = false;
  for (const base of [PROFILE_KEY, JOBS_KEY]) {
    const g = localStorage.getItem(base);
    const t = scoped(base, uid);
    if (g && !localStorage.getItem(t)) { localStorage.setItem(t, g); copied = true; }
  }
  return copied;
}

/** Remove every key this app has written in this browser, for every account namespace. */
export function wipeEverything() {
  Object.keys(localStorage).filter((x) => x.startsWith('jaos_') || x.startsWith('user_gemini_api_key_v1')).forEach((x) => localStorage.removeItem(x));
  try { Object.keys(sessionStorage).filter((x) => x.startsWith('jaos_')).forEach((x) => sessionStorage.removeItem(x)); } catch { /* ignore */ }
  // Google sign-in's own first-party cookie (g_state) and any other cookie on this site.
  try { document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter(Boolean).forEach((n) => { document.cookie = `${n}=; Max-Age=0; path=/`; }); } catch { /* ignore */ }
}
