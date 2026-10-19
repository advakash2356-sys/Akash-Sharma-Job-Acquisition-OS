import { OAuth2Client } from "google-auth-library";
import { ApiError } from "./handlers.js";

export interface VerifiedProfile { sub: string; email: string; name: string; picture: string }

/**
 * Verifies a Google Identity Services ID token (signature, expiry, issuer, audience = our client id)
 * and requires a verified email. Nothing is stored or logged; the profile is just returned.
 */
export async function verifyGoogleIdToken(idToken: unknown): Promise<VerifiedProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new ApiError(503, "Google sign-in is not configured on this server (GOOGLE_CLIENT_ID missing).", "NOT_CONFIGURED");
  if (typeof idToken !== "string" || idToken.length < 20 || idToken.length > 4096) throw new ApiError(400, "Missing or malformed credential.", "BAD_INPUT");
  try {
    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken, audience: clientId });
    const p = ticket.getPayload();
    if (!p || !p.sub) throw new Error("no payload");
    if (!p.email || p.email_verified !== true) throw new ApiError(401, "Your Google email is not verified.", "EMAIL_UNVERIFIED");
    return { sub: p.sub, email: p.email, name: p.name || "", picture: p.picture || "" };
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(401, "Google could not verify this sign-in. Try again.", "BAD_TOKEN");
  }
}
