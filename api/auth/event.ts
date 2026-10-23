import { ApiError } from "../../server/handlers.js";
import { funnelEvent } from "../../server/events.js";
import { checkOrigin, clientIp } from "../../server/guard.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try { checkOrigin(req.headers); res.status(200).json(await funnelEvent(req.body, clientIp(req.headers, req.socket?.remoteAddress))); }
  catch (e: any) { res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code }); }
}
