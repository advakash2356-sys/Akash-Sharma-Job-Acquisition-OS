import { ApiError } from "./handlers.js";

// Small, honest abuse guards shared by the Vercel functions and the dev server.
const ORIGIN_OK = /^(https:\/\/akash-sharma-job-acquisition-os\.vercel\.app|https:\/\/akash-sharma-job-acquisition-[a-z0-9-]+-akash-sync-agent\.vercel\.app|http:\/\/localhost(:\d+)?|http:\/\/127\.0\.0\.1(:\d+)?)$/;
const MAX_BODY = 200_000; // characters of JSON; a long resume plus a job description fits easily
const AI_WINDOW_MS = 60_000, AI_MAX = 10; // AI calls per client per minute (best effort: in-memory per instance)
const aiHits = new Map<string, number[]>();

// Trust Vercel-set headers; the first X-Forwarded-For value is client-spoofable.
export const clientIp = (h: any, fallback?: string) => {
  const xff = String(h?.["x-forwarded-for"] || "").split(",").map((v) => v.trim()).filter(Boolean);
  return String(h?.["x-vercel-forwarded-for"] || h?.["x-real-ip"] || xff[xff.length - 1] || fallback || "anon").split(",")[0].trim();
};

/** Browsers send Origin on POST: only this site (and its previews / local dev) may call the API from a web page. */
export function checkOrigin(h: any) {
  const o = h?.origin;
  if (o && !ORIGIN_OK.test(String(o))) throw new ApiError(403, "This API only serves the Job Acquisition OS site.", "BAD_ORIGIN");
}
export function checkBody(body: unknown) {
  let n = 0; try { n = JSON.stringify(body ?? {}).length; } catch { n = MAX_BODY + 1; }
  if (n > MAX_BODY) throw new ApiError(413, `The request is too large (${Math.round(n / 1000)} KB). Shorten the resume or job text and try again.`, "TOO_LARGE");
}
export function aiRateLimit(client: string) {
  const now = Date.now();
  const list = (aiHits.get(client) || []).filter((t) => now - t < AI_WINDOW_MS);
  if (list.length >= AI_MAX) { aiHits.set(client, list); throw new ApiError(429, `Too many AI requests from this connection. Wait ${Math.ceil((AI_WINDOW_MS - (now - list[0])) / 1000)} seconds and try again.`, "RATE_LIMIT"); }
  list.push(now); aiHits.set(client, list);
  if (aiHits.size > 1000) for (const [k, v] of aiHits) if (!v.some((t) => now - t < AI_WINDOW_MS)) aiHits.delete(k);
}
