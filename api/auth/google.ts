import { ApiError } from "../../server/handlers.js";
import { signIn } from "../../server/users.js";
import { checkOrigin } from "../../server/guard.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    checkOrigin(req.headers);
    res.status(200).json(await signIn(req.body, String(req.headers["user-agent"] || "")));
  } catch (e: any) {
    res.status(e instanceof ApiError ? e.status : 500).json({ error: e.message || "Failed", code: e.code });
  }
}
