/**
 * "read-notice" for a SIGNED-IN user's OWN Gemini key (sent by the browser in x-user-gemini-key, the existing per-user key
 * feature). The server never falls back to any server key for this. It only fetches the official PDF (the court CDNs do not
 * allow the browser to fetch it cross-origin) and returns the model's answer in a FIXED JSON schema; the browser merges and
 * caches it per notice. Akash Sync Agent.
 */
import { asGeminiFacts, isOfficialPdfUrl, NOTICE_PROMPT, NOTICE_SCHEMA, type GeminiFacts } from "../src/lib/gov/noticeAi.js";
import { assertPublicHost, pinnedFetch, resolveHost, type Resolver } from "./safeFetch.js";

const MAX_BYTES = 6 * 1024 * 1024;
const MAX_HOPS = 3;
/** Fetches an official notice PDF. Redirects are followed by hand (redirect: 'manual'), at most 3 hops, and every hop's URL is
 * re-validated with isOfficialPdfUrl, so a redirect can never take the server off an official https .gov.in / .nic.in PDF.
 * Before every hop the host is resolved and refused if any address is private / loopback / link-local (v4 and v6); the default
 * transport (pinnedFetch) re-checks the address at connect time. A caller that injects its own transport (tests) passes its own
 * resolver; by default the DNS check runs whenever the real network transport is used. */
export async function fetchPdf(url: string, ms = 8000, fetchImpl: typeof fetch = pinnedFetch, resolve: Resolver | null = fetchImpl === pinnedFetch ? resolveHost : null): Promise<Uint8Array | null> {
  if (!isOfficialPdfUrl(url)) return null; // official PDFs only
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try {
    let cur = url; let r: Response | null = null;
    for (let hop = 0; ; hop++) {
      if (resolve) await assertPublicHost(new URL(cur).hostname, resolve);
      r = await fetchImpl(cur, { signal: ctl.signal, redirect: "manual", headers: { "User-Agent": "JAOS-gov-feed/1.0 (+https://akash-sharma-job-acquisition-os.vercel.app)", Accept: "application/pdf" } });
      if (r.status < 300 || r.status >= 400) break;
      const loc = r.headers.get("location"); if (!loc || hop >= MAX_HOPS) return null;
      let next: string; try { next = new URL(loc, cur).href; } catch { return null; }
      if (!isOfficialPdfUrl(next)) return null; cur = next;
    }
    if (!r || !r.ok) return null; const len = Number(r.headers.get("content-length") || 0); if (len > MAX_BYTES) return null;
    const b = new Uint8Array(await r.arrayBuffer()); return b.byteLength > MAX_BYTES || b.byteLength < 100 ? null : b;
  } catch { return null; } finally { clearTimeout(t); }
}
export type Generate = (key: string, req: { pdfBase64: string; prompt: string; schema: unknown; signal: AbortSignal }) => Promise<string>;
const gen: Generate = async (key, req) => {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: key });
  const r = await ai.models.generateContent({ model: "gemini-flash-lite-latest", contents: [{ role: "user", parts: [{ inlineData: { mimeType: "application/pdf", data: req.pdfBase64 } }, { text: req.prompt }] }],
    config: { responseMimeType: "application/json", responseSchema: req.schema as any, temperature: 0, abortSignal: req.signal } });
  return r.text || "{}";
};
/** userKey is REQUIRED (the signed-in user's own key); there is no server-key path. */
export async function readNoticeWithKey(url: string, userKey: string | undefined, deps: { fetch?: typeof fetchPdf; generate?: Generate } = {}): Promise<GeminiFacts | null> {
  if (!userKey) throw Object.assign(new Error("Add your own Gemini key in Settings to read scanned notices."), { code: "NO_USER_KEY" });
  if (!isOfficialPdfUrl(url)) throw Object.assign(new Error("Only official .gov.in / .nic.in notice PDFs can be read."), { code: "BAD_URL" });
  const data = await (deps.fetch || fetchPdf)(url, 10000); if (!data) return null;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
  try { return asGeminiFacts(JSON.parse(await (deps.generate || gen)(userKey, { pdfBase64: Buffer.from(data).toString("base64"), prompt: NOTICE_PROMPT, schema: NOTICE_SCHEMA, signal: ctl.signal }))); }
  catch { return null; } finally { clearTimeout(t); }
}
