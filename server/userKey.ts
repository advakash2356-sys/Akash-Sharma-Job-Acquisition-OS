import { AsyncLocalStorage } from 'node:async_hooks';

// Per-request, in-memory only. The user's key (header x-user-gemini-key) is never stored or logged.
const store = new AsyncLocalStorage<string>();

export function userKeyMiddleware(req: any, _res: any, next: () => void) {
  const raw = req.headers?.['x-user-gemini-key'];
  const key = typeof raw === 'string' ? raw.trim() : '';
  if (key && key.length <= 256) store.run(key, next);
  else next();
}

/** The caller's own key if supplied, else the server's GEMINI_API_KEY env var. */
export const resolveGeminiKey = (): string | undefined => store.getStore() || process.env.GEMINI_API_KEY;
/** True when the current request supplied its own key (so cached clients must be bypassed). */
export const hasRequestKey = (): boolean => !!store.getStore();
