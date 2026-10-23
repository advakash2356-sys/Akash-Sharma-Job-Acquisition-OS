import { ApiError } from "../server/handlers.js";
import { checkBody, checkOrigin, clientIp } from "../server/guard.js";
import { postFeedback } from "../server/community.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    checkOrigin(req.headers); checkBody(req.body);
    if (!req.headers.origin) throw new ApiError(403, "Send feedback from the website.", "BAD_ORIGIN");
    res.status(200).json(await postFeedback(req.body || {}, clientIp(req.headers, req.socket?.remoteAddress), String(req.headers["user-agent"] || "")));
  } catch (e: any) {
    res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
  }
}
