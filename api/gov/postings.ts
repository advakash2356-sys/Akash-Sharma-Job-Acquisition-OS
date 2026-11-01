import { ApiError } from "../../server/handlers.js";
import { govPostings } from "../../server/govPostings.js";
import { checkOrigin, clientIp } from "../../server/guard.js";
import { rateLimit } from "../../server/jobsSearch.js";

/** Public, read-only list of live government postings (no sign-in, no personal data). Cached 30 min on the server and CDN. */
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  try {
    checkOrigin(req.headers); rateLimit(clientIp(req.headers, req.socket?.remoteAddress));
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    res.status(200).json(await govPostings());
  } catch (e: any) { res.status(e instanceof ApiError ? e.status : 502).json({ error: e.message || "Failed" }); }
}
