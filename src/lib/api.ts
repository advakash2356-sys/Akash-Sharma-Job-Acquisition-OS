import { getUserApiKey } from './userApiKey';

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

export async function callAi<T = any>(action: string, body: Record<string, unknown>, opts: CallOpts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = getUserApiKey();
  if (key) headers['x-user-gemini-key'] = key;
  const res = await fetchLimited(`/api/ai/${action}`, { method: 'POST', headers, body: JSON.stringify(body) }, opts, 'The AI request');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(data.error || (res.status === 504 ? 'The server timed out waiting for Google.' : `Request failed (${res.status}).`), data.code);
  return data.result as T;
}
