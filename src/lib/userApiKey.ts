// Bring-your-own-key helper. The key lives ONLY in this browser's localStorage, namespaced per
// signed-in account (or "guest"). It is never committed or logged. It is sent as a request header
// to this app's own /api routes, which pass it to Google for that single request.
let ns = 'guest';
export const setKeyNamespace = (id: string) => { ns = id; };
const k = () => `user_gemini_api_key_v1:${ns}`;
const EVT = 'jaos-key-change';

const GUEST = 'user_gemini_api_key_v1:guest';
const LEGACY = 'user_gemini_api_key_v1';

/** Account key first; if signed in without one, fall back to the key saved in guest mode on this browser
 *  (otherwise a key saved before signing in would silently "stop working"). */
export const getUserApiKey = (): string => {
  try {
    return localStorage.getItem(k()) || (ns !== 'guest' ? localStorage.getItem(GUEST) : '') || localStorage.getItem(LEGACY) || '';
  } catch { return ''; }
};
/** True when the active key is the guest-mode key being used by a signed-in account. */
export const usingGuestKey = (): boolean => {
  try { return ns !== 'guest' && !localStorage.getItem(k()) && !!(localStorage.getItem(GUEST) || localStorage.getItem(LEGACY)); } catch { return false; }
};
export const setUserApiKey = (key: string): void => {
  try { localStorage.setItem(k(), key.trim()); if (ns === 'guest') localStorage.removeItem(LEGACY); } catch { /* unavailable */ }
  window.dispatchEvent(new Event(EVT));
};
/** Removes every key this browser would use for the current account (account key and guest/legacy fallback). */
export const clearUserApiKey = (): void => {
  try { localStorage.removeItem(k()); localStorage.removeItem(LEGACY); if (ns !== 'guest') localStorage.removeItem(GUEST); } catch { /* unavailable */ }
  window.dispatchEvent(new Event(EVT));
};
export const KEY_EVENT = EVT;
