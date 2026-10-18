// Bring-your-own-key helper. The key lives ONLY in this browser's localStorage.
// It is never committed, never logged, and only attached (as a request header) to calls
// to this app's own origin so the server can forward it to the AI provider for that request.
const STORAGE_KEY = 'user_gemini_api_key_v1';

export const getUserApiKey = (): string => {
  try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
};
export const setUserApiKey = (key: string): void => {
  try { localStorage.setItem(STORAGE_KEY, key.trim()); } catch { /* storage unavailable */ }
};
export const clearUserApiKey = (): void => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable */ }
};

let installed = false;
export function installApiKeyFetch(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const key = getUserApiKey();
    if (!key) return originalFetch(input, init);
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const sameOrigin = url.startsWith('/') || url.startsWith(window.location.origin);
    if (!sameOrigin) return originalFetch(input, init);
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set('x-user-gemini-key', key);
    return originalFetch(input, { ...init, headers });
  };
}
installApiKeyFetch();
