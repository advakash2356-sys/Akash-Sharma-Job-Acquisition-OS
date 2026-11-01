import { ApiError } from "../../server/handlers.js";
import { govPostings } from "../../server/govPostings.js";
import { checkOrigin, clientIp } from "../../server/guard.js";

/**
 * Public, read-only list of live government postings (no sign-in, no personal data). Akash Sync Agent.
 * Rate limiting, in layers:
 *  1) Vercel Firewall rule "Rate limit gov postings API": 12 requests / 60 s per IP on /api/gov/postings, enforced at the
 *     edge across all instances and regions (shared counter, returns 429 before this function runs). Free, project config.
 *  2) This in-memory per-instance limiter (same limit) as a backstop for local dev and if the rule is ever disabled.
 *  3) Upstream cost is capped by the 30-minute server cache in govPostings() and the CDN cache below.
 * Query strings are rejected so they can't be used to bust the cache. Vary: Origin keeps the CDN from serving a cached
 * response to a request whose Origin would have been refused.
 */
const WINDOW = 60_000, MAX = 12; const hits = new Map<string, number[]>();
export function postingsLimit(ip: string, now = Date.now()) {
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (list.length >= MAX) { hits.set(ip, list); throw new ApiError(429, `Too many requests for government postings from this connection. Wait ${Math.ceil((WINDOW - (now - list[0])) / 1000)} seconds and try again.`, "RATE_LIMIT"); }
  list.push(now); hits.set(ip, list);
  if (hits.size > 2000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW)) hits.delete(k);
}
export default async function handler(req: any, res: any) {
  res.setHeader("Vary", "Origin");
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  try {
    if (String(req.url || "").includes("?")) throw new ApiError(400, "This endpoint takes no query parameters.", "BAD_QUERY");
    checkOrigin(req.headers); postingsLimit(clientIp(req.headers, req.socket?.remoteAddress));
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    res.status(200).json(await govPostings());
  } catch (e: any) { res.setHeader("Cache-Control", "no-store"); res.status(e instanceof ApiError ? e.status : 502).json({ error: e.message || "Failed" }); }
}
