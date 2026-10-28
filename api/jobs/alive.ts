import { ApiError } from "../../server/handlers.js";
import { checkLink } from "../../server/linkCheck.js";
import { requireUser } from "../../server/requireUser.js";
import { aiRateLimit, checkOrigin, clientIp } from "../../server/guard.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    checkOrigin(req.headers); await requireUser(req.headers);
    aiRateLimit("alive:" + clientIp(req.headers, req.socket?.remoteAddress));
    res.status(200).json(await checkLink(String(req.body?.url || "").slice(0, 2000)));
  } catch (e: any) { res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code }); }
}
