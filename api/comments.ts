import { ApiError } from "../server/handlers.js";
import { checkBody, checkOrigin, clientIp } from "../server/guard.js";
import { listComments, postComment } from "../server/community.js";

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "GET") { res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300"); return res.status(200).json(await listComments()); }
    if (req.method !== "POST") return res.status(405).json({ error: "GET or POST only" });
    checkOrigin(req.headers); checkBody(req.body);
    if (!req.headers.origin) throw new ApiError(403, "Comment from the website.", "BAD_ORIGIN");
    res.status(200).json(await postComment(req.body || {}, clientIp(req.headers, req.socket?.remoteAddress)));
  } catch (e: any) {
    res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
  }
}
