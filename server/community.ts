import { ApiError } from "./handlers.js";

// Feedback + public comments. The website's server forwards to a Google Apps Script web app bound to Akash's
// private Google Sheet (scripts/apps-script/Code.gs). The shared secret never reaches the browser.
const URL_ = () => process.env.FEEDBACK_SCRIPT_URL || "";
const SECRET = () => process.env.FEEDBACK_SECRET || "";
export const communityConfigured = () => !!(URL_() && SECRET());

const hits = new Map<string, number[]>();
/** 5 posts per 10 minutes per IP (best effort, in-memory per serverless instance). */
function limit(ip: string) {
  const now = Date.now(), W = 10 * 60_000;
  const l = (hits.get(ip) || []).filter((t) => now - t < W);
  if (l.length >= 5) throw new ApiError(429, "Thanks! You have sent several messages already. Please try again in a few minutes.", "RATE_LIMIT");
  l.push(now); hits.set(ip, l);
  if (hits.size > 2000) hits.clear();
}

const str = (v: unknown, n: number) => String(v ?? "").replace(/[ \t]+\n/g, "\n").trim().slice(0, n);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SPAMMY = /\b(viagra|casino|crypto ?(giveaway|airdrop)|loan offer|escort|porn|bit\.ly|seo services|backlinks?)\b/i;

/** Honeypot, time trap, size, link and word limits. Returns cleaned fields or throws. */
function screen(b: any, minMsg: number, maxMsg: number) {
  if (str(b.website, 200)) throw new ApiError(400, "Could not send.", "SPAM"); // hidden field: people leave it empty
  if ((Number(b.elapsedMs) || 0) < 2500) throw new ApiError(400, "That was very fast. Please wait a moment and send again.", "TOO_FAST");
  const message = str(b.message, maxMsg + 1);
  if (message.length < minMsg) throw new ApiError(400, `Please write at least ${minMsg} characters.`, "TOO_SHORT");
  if (message.length > maxMsg) throw new ApiError(400, `Please keep it under ${maxMsg} characters.`, "TOO_LONG");
  if ((message.match(/https?:\/\//g) || []).length > 2 || SPAMMY.test(message)) throw new ApiError(400, "This looks like spam, so it was not sent. Remove links and try again.", "SPAM");
  const email = str(b.email, 120);
  if (email && !EMAIL.test(email)) throw new ApiError(400, "That email address does not look right. Leave it empty or fix it.", "BAD_EMAIL");
  return { name: str(b.name, 60), email, message, page: str(b.page, 120) };
}

async function call(payload: object) {
  if (!communityConfigured()) throw new ApiError(503, "The feedback inbox is not connected yet. Please use the email link below for now.", "NOT_CONNECTED");
  const r = await fetch(URL_(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, secret: SECRET() }), redirect: "follow", signal: AbortSignal.timeout(15000) });
  const d: any = await r.json().catch(() => ({}));
  if (!d.ok) throw new ApiError(502, "Could not save it right now. Please try again, or use email.", "UPSTREAM");
  return d;
}

export async function postFeedback(b: any, ip: string, ua: string) {
  const f = screen(b, 5, 3000);
  const rating = Math.max(0, Math.min(5, Math.round(Number(b.rating) || 0)));
  limit(ip);
  await call({ type: "feedback", ...f, rating: rating || "", ua: str(ua, 200) });
  return { ok: true };
}

export async function postComment(b: any, ip: string) {
  const f = screen(b, 3, 1500);
  limit(ip);
  await call({ type: "comment", ...f });
  return { ok: true, pending: true };
}

let cache: { at: number; data: any[] } | null = null;
export async function listComments() {
  if (!communityConfigured()) return { comments: [], connected: false };
  if (cache && Date.now() - cache.at < 60_000) return { comments: cache.data, connected: true };
  const u = new URL(URL_()); u.searchParams.set("secret", SECRET());
  const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  const d: any = await r.json().catch(() => ({}));
  if (!d.ok) throw new ApiError(502, "Comments could not be loaded right now.", "UPSTREAM");
  const data = (d.comments || []).map((c: any) => ({ id: str(c.id, 20), at: str(c.at, 30), name: str(c.name, 60) || "Anonymous", message: str(c.message, 1500), page: str(c.page, 120), reply: str(c.reply, 1500), replyAt: str(c.replyAt, 30) }));
  cache = { at: Date.now(), data };
  return { comments: data, connected: true };
}
