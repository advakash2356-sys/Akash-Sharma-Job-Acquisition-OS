import { serverKeyConfigured } from "../server/handlers.js";
import { googleClientId } from "../server/users.js";
import { publicBanner } from "../server/admin.js";

export default async function handler(_req: any, res: any) {
  res.status(200).json({ serverKey: serverKeyConfigured(), googleClientId: googleClientId() || null, banner: await publicBanner() });
}
