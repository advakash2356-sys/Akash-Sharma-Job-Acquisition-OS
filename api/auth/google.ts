import { ApiError } from "../../server/handlers.js";
import { verifyGoogleIdToken } from "../../server/googleAuth.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    res.status(200).json(await verifyGoogleIdToken(req.body?.credential));
  } catch (e: any) {
    res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
  }
}
