import { ApiError } from "./handlers.js";
import { communityConfigured } from "./community.js";
const OK = ["profile_done", "job_viewed", "docs_generated", "apply_click"];
const hits = new Map<string, number>();
/** Funnel event for a signed-in user. Apps Script only accepts it for an email + device id registered at a verified sign-in. */
export async function funnelEvent(b: any, ip: string) {
  const email = String(b?.email || "").trim().toLowerCase().slice(0, 120), deviceId = String(b?.deviceId || "").slice(0, 64), event = String(b?.event || "");
  const source = String(b?.source || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  if (!OK.includes(event) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !/^[a-z0-9-]{16,64}$/i.test(deviceId)) throw new ApiError(400, "Bad event.", "BAD_INPUT");
  const k = `${ip}|${email}|${event}`;
  if (Date.now() - (hits.get(k) || 0) < 10 * 60_000) return { ok: true, skipped: true };
  hits.set(k, Date.now()); if (hits.size > 5000) hits.clear();
  if (!communityConfigured()) return { ok: false };
  try {
    const r = await fetch(process.env.FEEDBACK_SCRIPT_URL!, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "event", email, deviceId, event, source, secret: process.env.FEEDBACK_SECRET }), redirect: "follow", signal: AbortSignal.timeout(12000) });
    return { ok: !!(await r.json().catch(() => ({})))?.ok };
  } catch { return { ok: false }; }
}
