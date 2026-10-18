import { getUserApiKey } from './userApiKey';

export class AiError extends Error {
  constructor(message: string, public code?: string) { super(message); }
}

export async function callAi<T = any>(action: string, body: Record<string, unknown>): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = getUserApiKey();
  if (key) headers['x-user-gemini-key'] = key;
  let res: Response;
  try {
    res = await fetch(`/api/ai/${action}`, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch {
    throw new AiError('Network error. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(data.error || `Request failed (${res.status}).`, data.code);
  return data.result as T;
}
