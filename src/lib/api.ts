import { getUserApiKey } from './userApiKey';
import { getIdToken, refreshIdToken, requestReauth } from './googleAuth';

export class AiError extends Error {
  constructor(message: string, public code?: string) { super(message); }
}

export interface CallOpts { timeoutMs?: number; signal?: AbortSignal }

/** fetch with a hard timeout and optional outside cancel. Never waits forever. */
export async function fetchLimited(url: string, init: RequestInit, opts: CallOpts = {}, what = 'The request'): Promise<Response> {
  const ctl = new AbortController();
  const ms = opts.timeoutMs ?? 60000;
  let timedOut = false;
  let wentOffline = false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new AiError('You are offline. Check your connection and try again.', 'NETWORK');
  const onOffline = () => { wentOffline = true; ctl.abort(); };
  window.addEventListener('offline', onOffline);
  const timer = setTimeout(() => { timedOut = true; ctl.abort(); }, ms);
  const onAbort = () => ctl.abort();
  opts.signal?.addEventListener('abort', onAbort);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } catch {
    if (timedOut) throw new AiError(`${what} took longer than ${Math.round(ms / 1000)} seconds and was stopped. Try again.`, 'TIMEOUT');
    if (wentOffline) throw new AiError('You went offline, so the request was stopped. Check your connection and try again.', 'NETWORK');
    if (opts.signal?.aborted) throw new AiError('Cancelled.', 'CANCELLED');
    throw new AiError('Network error. Check your connection and try again.', 'NETWORK');
  } finally { clearTimeout(timer); opts.signal?.removeEventListener('abort', onAbort); window.removeEventListener('offline', onOffline); }
}

/** App API call with the Google ID token. On 401: refresh silently and retry once; if that fails, ask the user to sign in
 *  again in a dialog (the page and any typed work stay as they are), then retry. */
export async function authedFetch(url: string, init: RequestInit, opts: CallOpts = {}, what = 'The request'): Promise<Response> {
  const go = (t: string) => fetchLimited(url, { ...init, headers: { ...(init.headers as Record<string, string>), ...(t ? { Authorization: `Bearer ${t}` } : {}) } }, opts, what);
  let res = await go(await getIdToken());
  if (res.status !== 401) return res;
  // Only a sign-in problem should trigger re-auth; any other 401 (e.g. an older server's bad-API-key reply) is returned as is.
  try { const c = (await res.clone().json())?.code; if (c && !/^AUTH_|^BAD_TOKEN$|^EMAIL_UNVERIFIED$/.test(c)) return res; } catch { /* not JSON */ }
  const t = await refreshIdToken();
  if (t) { res = await go(t); if (res.status !== 401) return res; }
  let t2 = '';
  try { t2 = await requestReauth(); } catch { throw new AiError('Please sign in again to continue. Your work on this page is kept.', 'AUTH_REQUIRED'); }
  return go(t2);
}

export async function callAi<T = any>(action: string, body: Record<string, unknown>, opts: CallOpts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = getUserApiKey();
  if (key) headers['x-user-gemini-key'] = key;
  const res = await authedFetch(`/api/ai/${action}`, { method: 'POST', headers, body: JSON.stringify(body) }, opts, 'The AI request');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(data.error || (res.status === 504 ? 'The server timed out waiting for Google.' : `Request failed (${res.status}).`), data.code);
  return data.result as T;
}
