import { createHash } from "crypto";
import { ApiError } from "./handlers.js";

// Per-user daily cap for AI results paid for by the site's own (free-tier) keys. Users with their own Gemini key are not capped.
// Storage: Upstash Redis REST (free plan) when UPSTASH_REDIS_REST_URL/TOKEN (or Vercel KV_REST_API_URL/TOKEN) are set,
// otherwise an in-memory map (best effort: resets on a cold start and is per serverless instance).
export const dailyCap = () => { const n = Number(process.env.FREE_AI_DAILY_CAP); return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 3; };
const day = (now = Date.now()) => new Date(now).toISOString().slice(0, 10); // UTC day
export const quotaKey = (userId: string, now?: number) => `jaos:aiq:${day(now)}:${createHash("sha256").update(String(userId)).digest("hex").slice(0, 32)}`;

const mem = new Map<string, number>();
const redis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
};
async function cmd(r: { url: string; token: string }, args: (string | number)[]) {
  const res = await fetch(r.url, { method: "POST", headers: { Authorization: `Bearer ${r.token}`, "Content-Type": "application/json" }, body: JSON.stringify(args), signal: AbortSignal.timeout(4000) });
  const d: any = await res.json();
  if (!res.ok || d.error) throw new Error(d.error || `redis ${res.status}`);
  return d.result;
}
export async function usedToday(userId: string): Promise<number> {
  const k = quotaKey(userId), r = redis();
  if (r) { try { return Number(await cmd(r, ["GET", k])) || 0; } catch { /* fall through to memory */ } }
  return mem.get(k) || 0;
}
export async function addUse(userId: string): Promise<number> {
  const k = quotaKey(userId), r = redis();
  if (r) { try { const n = Number(await cmd(r, ["INCR", k])); if (n === 1) await cmd(r, ["EXPIRE", k, 172800]); return n; } catch { /* memory */ } }
  if (mem.size > 20000) mem.clear();
  const n = (mem.get(k) || 0) + 1; mem.set(k, n); return n;
}
export const CAP_MESSAGE = (cap: number) => `You've used today's ${cap} free AI results. They refill tomorrow (midnight UTC). Want unlimited now? Add your own free Gemini key in Settings, it takes a minute and no card.`;
/** Extra guard against one person cycling Google accounts: a looser cap per connection (IP hash). */
export const ipCap = () => { const n = Number(process.env.FREE_AI_DAILY_IP_CAP); return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 15; };
export async function checkCap(userId: string, ip?: string) {
  const cap = dailyCap(), used = await usedToday(userId);
  if (used >= cap) throw new ApiError(429, CAP_MESSAGE(cap), "DAILY_CAP");
  if (ip && (await usedToday(`ip:${ip}`)) >= ipCap()) throw new ApiError(429, CAP_MESSAGE(cap), "DAILY_CAP");
  return { cap, used };
}
export const _resetMem = () => mem.clear();
