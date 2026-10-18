// Bring-your-own-key helper. The key lives ONLY in this browser's localStorage.
// It is never committed or logged. It is sent as a header to this app's own /api routes,
// which pass it to Google for that single request without storing it.
const STORAGE_KEY = 'user_gemini_api_key_v1';

export const getUserApiKey = (): string => {
  try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
};
export const setUserApiKey = (key: string): void => {
  try { localStorage.setItem(STORAGE_KEY, key.trim()); } catch { /* unavailable */ }
};
export const clearUserApiKey = (): void => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* unavailable */ }
};
