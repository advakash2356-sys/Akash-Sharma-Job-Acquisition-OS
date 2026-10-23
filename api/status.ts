import { serverKeyConfigured } from "../server/handlers.js";
import { googleClientId } from "../server/users.js";

export default function handler(_req: any, res: any) {
  res.status(200).json({ serverKey: serverKeyConfigured(), googleClientId: googleClientId() || null });
}
