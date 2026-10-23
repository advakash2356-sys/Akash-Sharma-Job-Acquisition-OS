import { ApiError } from "../../server/handlers.js";
import { rateLimit, searchJobs } from "../../server/jobsSearch.js";
import { requireUser } from "../../server/requireUser.js";
import { checkBody, checkOrigin } from "../../server/guard.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    checkOrigin(req.headers); await requireUser(req.headers); checkBody(req.body);
    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "anon").split(",")[0].trim();
    rateLimit(ip);
    res.status(200).json({ result: await searchJobs(req.body || {}) });
  } catch (e: any) {
    const status = e instanceof ApiError ? e.status : 500;
    res.status(status).json({ error: e.message || "Failed", code: e.code });
  }
}
