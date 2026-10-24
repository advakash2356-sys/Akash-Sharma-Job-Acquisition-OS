import { ApiError } from "./handlers.js";
import { communityConfigured } from "./community.js";
import { verifyGoogleIdToken } from "./googleAuth.js";

// Sign-in log: after the Google ID token is verified, one row per person goes to the "Users" tab of Akash's private Sheet
// (through the same Apps Script web app as feedback). Never blocks sign-in: if the Sheet is not connected, sign-in still works.
const str = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001F]/g, "").trim().slice(0, n);
const DEVICE = /^[a-z0-9-]{16,64}$/i;
const MOBILE = /^\+?[0-9 ()-]{7,20}$/;

async function sheet(payload: object): Promise<boolean> {
  if (!communityConfigured()) return false;
  try {
    const r = await fetch(process.env.FEEDBACK_SCRIPT_URL!, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, secret: process.env.FEEDBACK_SECRET }), redirect: "follow", signal: AbortSignal.timeout(12000) });
    const d: any = await r.json().catch(() => ({}));
    return !!d.ok;
  } catch { return false; }
}

export async function signIn(b: any, ua: string) {
  const p = await verifyGoogleIdToken(b?.credential);
  if (b?.consent !== true) throw new ApiError(400, "Please tick the consent box first.", "NO_CONSENT");
  const deviceId = DEVICE.test(str(b?.deviceId, 64)) ? str(b.deviceId, 64) : "";
  const mobile = str(b?.mobile, 20);
  if (mobile && !MOBILE.test(mobile)) throw new ApiError(400, "That mobile number does not look right. Leave it empty or fix it.", "BAD_MOBILE");
  const logged = await sheet({ type: "user", email: p.email, name: p.name, mobile, deviceId, fp: str(b?.fp, 32), ua: str(ua, 200), source: str(b?.source, 40).toLowerCase().replace(/[^a-z0-9_-]/g, ""), consent: "yes", consentVersion: str(b?.consentVersion, 20), consentAt: new Date().toISOString(), consentAtClient: str(b?.consentAt, 40) });
  return { ...p, logged };
}

const hits = new Map<string, number>();
/** Daily visit ping for an existing signed-in row. Only updates a row whose email AND device id were registered at a verified sign-in. */
export async function visit(b: any, ip: string) {
  const email = str(b?.email, 120).toLowerCase(), deviceId = str(b?.deviceId, 64);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !DEVICE.test(deviceId)) throw new ApiError(400, "Bad visit.", "BAD_INPUT");
  const k = `${ip}|${email}`; const last = hits.get(k) || 0;
  if (Date.now() - last < 60 * 60_000) return { ok: true, skipped: true };
  hits.set(k, Date.now()); if (hits.size > 5000) hits.clear();
  return { ok: await sheet({ type: "visit", email, deviceId, source: str(b?.source, 40).toLowerCase().replace(/[^a-z0-9_-]/g, "") }) };
}
export const googleClientId = () => (process.env.GOOGLE_CLIENT_ID || "").trim();
