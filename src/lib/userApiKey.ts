// Bring-your-own-key helper. The key lives ONLY in this browser's localStorage, namespaced per
// signed-in account (or "guest"). It is never committed or logged. It is sent as a request header
// to this app's own /api routes, which pass it to Google for that single request.
let ns = 'guest';
export const setKeyNamespace = (id: string) => { ns = id; };
const k = () => `user_gemini_api_key_v1:${ns}`;
const EVT = 'jaos-key-change';

export const getUserApiKey = (): string => {
  try { return localStorage.getItem(k()) || (ns === 'guest' ? localStorage.getItem('user_gemini_api_key_v1') || '' : ''); } catch { return ''; }
};
export const setUserApiKey = (key: string): void => {
  try { localStorage.setItem(k(), key.trim()); if (ns === 'guest') localStorage.removeItem('user_gemini_api_key_v1'); } catch { /* unavailable */ }
  window.dispatchEvent(new Event(EVT));
};
export const clearUserApiKey = (): void => {
  try { localStorage.removeItem(k()); if (ns === 'guest') localStorage.removeItem('user_gemini_api_key_v1'); } catch { /* unavailable */ }
  window.dispatchEvent(new Event(EVT));
};
export const KEY_EVENT = EVT;
