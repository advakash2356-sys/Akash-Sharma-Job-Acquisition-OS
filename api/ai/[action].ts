import { handleAction, keyFromHeaders, ApiError } from "../../server/handlers.js";
import { requireUser } from "../../server/requireUser.js";
import { aiRateLimit, checkBody, checkOrigin, clientIp } from "../../server/guard.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    checkOrigin(req.headers); const u = await requireUser(req.headers); checkBody(req.body); const ip = clientIp(req.headers, req.socket?.remoteAddress); aiRateLimit(ip);
    const out = await handleAction(String(req.query.action), req.body || {}, keyFromHeaders(req.headers), `g:${u.sub}`, ip);
    res.status(200).json(out);
  } catch (e: any) {
    const status = e instanceof ApiError ? e.status : 500;
    res.status(status).json({ error: e.message || "Failed", code: e.code });
  }
}
