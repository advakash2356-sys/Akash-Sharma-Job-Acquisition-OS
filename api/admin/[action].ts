import { ApiError } from "../../server/handlers.js";
import { adminCheck, adminData, adminSaveConfig } from "../../server/admin.js";
import { checkOrigin } from "../../server/guard.js";

export default async function handler(req: any, res: any) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow"); res.setHeader("Cache-Control", "no-store");
  try {
    checkOrigin(req.headers);
    const a = String(req.query?.action || "");
    if (a === "check" && req.method === "POST") return res.status(200).json(await adminCheck(req.body));
    if (a === "data" && req.method === "GET") return res.status(200).json(await adminData(req.headers.authorization));
    if (a === "config" && req.method === "POST") return res.status(200).json(await adminSaveConfig(req.headers.authorization, req.body));
    throw new ApiError(404, "Not found", "NOT_FOUND");
  } catch (e: any) {
    res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
  }
}
