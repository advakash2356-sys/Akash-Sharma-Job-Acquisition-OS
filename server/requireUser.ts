import { createHash } from "crypto";
import { ApiError } from "./handlers.js";
import { verifyGoogleIdToken, type VerifiedProfile } from "./googleAuth.js";

// Every app API call (AI, job search) must carry a Google ID token: Authorization: Bearer <id_token>.
// google-auth-library checks the signature against Google's keys, aud = GOOGLE_CLIENT_ID, iss = accounts.google.com, and exp.
// Verified tokens are cached (by hash) until they expire, so repeat calls do not re-verify.
const cache = new Map<string, { p: VerifiedProfile; exp: number }>();

export async function requireUser(headers: any): Promise<VerifiedProfile> {
  const m = /^Bearer ([A-Za-z0-9._-]{20,4096})$/.exec(String(headers?.authorization || ""));
  if (!m) throw new ApiError(401, "Please sign in with Google to use this.", "AUTH_REQUIRED");
  const k = createHash("sha256").update(m[1]).digest("hex");
  const hit = cache.get(k);
  if (hit && hit.exp > Date.now()) return hit.p;
  let p: VerifiedProfile;
  try { p = await verifyGoogleIdToken(m[1]); }
  catch (e: any) {
    if (e instanceof ApiError && e.code === "NOT_CONFIGURED") throw e;
    throw new ApiError(401, "Your sign-in has expired or is not valid. Sign in again.", "AUTH_EXPIRED");
  }
  let exp = Date.now() + 5 * 60_000;
  try { exp = Math.min(exp, JSON.parse(Buffer.from(m[1].split(".")[1], "base64url").toString()).exp * 1000); } catch { /* keep 5 min */ }
  if (cache.size > 2000) cache.clear();
  cache.set(k, { p, exp });
  return p;
}
