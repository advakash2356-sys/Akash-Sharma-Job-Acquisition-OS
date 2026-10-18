import { serverKeyConfigured } from "../server/handlers.js";

export default function handler(_req: any, res: any) {
  res.status(200).json({ serverKey: serverKeyConfigured() });
}
