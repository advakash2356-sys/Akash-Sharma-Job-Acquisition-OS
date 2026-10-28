import { ApiError } from "./handlers.js";
import { communityConfigured } from "./community.js";
import { verifyGoogleIdToken } from "./googleAuth.js";
import { computeMetrics } from "./adminMetrics.js";

// Admin dashboard API. Every call re-verifies a fresh Google ID token and compares the verified email with ADMIN_EMAIL.
// Anyone else gets the same 404 as an unknown URL. The Apps Script secret never leaves the server.
export const adminEmail = () => (process.env.ADMIN_EMAIL || "adv.akash2356@gmail.com").trim().toLowerCase();
/** Gmail ignores dots and +tags in the local part, so adv.akash2356@ and advakash2356@ are the same inbox. */
export const normEmail = (e: unknown) => { const v = String(e || "").trim().toLowerCase(); const [l, d] = v.split("@"); return d === "gmail.com" || d === "googlemail.com" ? l.split("+")[0].replace(/\./g, "") + "@gmail.com" : v; };
export const isAdminEmail = (e: unknown) => !!String(e || "").trim() && normEmail(e) === normEmail(adminEmail());
const NOT_FOUND = () => new ApiError(404, "Not found", "NOT_FOUND");

async function requireAdmin(auth: unknown) {
  const m = /^Bearer (.+)$/.exec(String(auth || ""));
  if (!m) throw NOT_FOUND();
  let p; try { p = await verifyGoogleIdToken(m[1]); } catch { throw NOT_FOUND(); }
  if (!isAdminEmail(p.email)) throw NOT_FOUND();
  return p;
}
async function script(payload: object) {
  if (!communityConfigured()) throw new ApiError(503, "The Sheet is not connected (FEEDBACK_SCRIPT_URL / FEEDBACK_SECRET missing).", "NOT_CONFIGURED");
  const r = await fetch(process.env.FEEDBACK_SCRIPT_URL!, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, secret: process.env.FEEDBACK_SECRET }), redirect: "follow", signal: AbortSignal.timeout(25000) });
  const d: any = await r.json().catch(() => ({}));
  if (!d.ok) throw new ApiError(502, `The Sheet said: ${d.error || "no answer"}. Redeploy the Apps Script with the latest Code.gs.`, "SCRIPT");
  return d;
}

export const DEFAULT_PRICING = {
  masterOn: false,
  payment: { provider: "razorpay", connected: false, note: "Not integrated. Needs a Razorpay account, keys in Vercel env, a checkout + webhook. Nothing is charged while this is off." },
  plans: [
    { id: "free", name: "Free", priceInrMonthly: 0, limits: "Everything that is free today" },
    { id: "pro", name: "Pro", priceInrMonthly: 299, limits: "Draft plan, not live" },
  ],
  features: { jobSearch: false, aiTailoring: false, coverLetters: false, outreach: false, resumeDesigns: false, interviewPrep: false, salaryInsights: false },
};
function sanitizePricing(c: any) {
  const out = structuredClone(DEFAULT_PRICING);
  out.masterOn = c?.masterOn === true;
  if (Array.isArray(c?.plans)) out.plans = c.plans.slice(0, 6).map((p: any) => ({ id: String(p.id || "").replace(/[^a-z0-9-]/gi, "").slice(0, 20) || "plan", name: String(p.name || "").slice(0, 40), priceInrMonthly: Math.max(0, Math.min(100000, Number(p.priceInrMonthly) || 0)), limits: String(p.limits || "").slice(0, 200) }));
  for (const k of Object.keys(out.features) as (keyof typeof out.features)[]) out.features[k] = c?.features?.[k] === true;
  return out;
}

export async function adminCheck(b: any) {
  // Only says whether to show the verify button; real access is checked on every data call.
  if (!isAdminEmail(b?.email)) throw NOT_FOUND();
  return { ok: true };
}
/** Lets the app show the Admin link: 200 only for a verified admin ID token, the usual 404 for anyone else. */
export async function adminWhoami(auth: unknown) { await requireAdmin(auth); return { admin: true }; }
export async function adminData(auth: unknown) {
  const p = await requireAdmin(auth);
  const d = await script({ type: "admin-read" });
  let inputs: any = {}; try { inputs = d.inputs ? JSON.parse(d.inputs) : {}; } catch { /* empty */ }
  let pricing = DEFAULT_PRICING; try { if (d.config) pricing = sanitizePricing(JSON.parse(d.config)); } catch { /* keep default */ }
  return { admin: p.email, metrics: computeMetrics(d.users || [], d.events || [], d.feedback || []), pricing, inputs, banner: d.banner || "", autoReplyMode: d.autoReplyMode || "test",
    comments: (d.comments || []).map((c: string[]) => ({ at: c[0], id: c[1], name: c[2], email: c[3], message: c[4], page: c[5], approved: c[6], reply: c[7] })).reverse(),
    adminLog: (d.adminLog || []).map((l: string[]) => ({ at: l[0], admin: l[1], action: l[2], target: l[3], details: l[4] })).reverse(),
    feedbackRows: (d.feedback || []).length, goatcounter: "https://akashsyncagent.goatcounter.com" };
}
const OPS = ["fb-status", "fb-reply", "comment-moderate", "banner", "autoreply-mode", "inputs-save", "user-review", "user-delete"];
/** Every admin change: token re-verified, op allow-listed, and logged by the Apps Script in the "Admin log" tab with the admin's email. */
export async function adminOp(auth: unknown, body: any) {
  const p = await requireAdmin(auth);
  const op = String(body?.op || "");
  if (!OPS.includes(op)) throw new ApiError(400, "Unknown admin action.", "BAD_INPUT");
  if (op === "user-delete" && body?.confirm !== body?.email) throw new ApiError(400, "Type the email again to confirm deletion.", "CONFIRM");
  const { op: _o, confirm: _c, ...rest } = body || {};
  const d = await script({ type: "admin-op", op, ...rest, admin: p.email });
  bannerCache = { at: 0, text: "" };
  return d;
}
let bannerCache = { at: 0, text: "" };
/** Public announcement text for /api/status, cached for a minute so visitors never wait on the Sheet. */
export async function publicBanner(): Promise<string> {
  if (!communityConfigured()) return "";
  if (Date.now() - bannerCache.at < 60_000) return bannerCache.text;
  bannerCache.at = Date.now();
  try { const d = await script({ type: "public-config" }); bannerCache.text = String(d.banner || "").slice(0, 300); } catch { /* keep last */ }
  return bannerCache.text;
}
export async function adminSaveConfig(auth: unknown, body: any) {
  const p = await requireAdmin(auth);
  const pricing = sanitizePricing(body?.pricing);
  await script({ type: "config-save", config: pricing, admin: p.email });
  return { ok: true, pricing };
}
