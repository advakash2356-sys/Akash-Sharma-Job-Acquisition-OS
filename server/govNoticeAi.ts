/**
 * "read-notice" for a SIGNED-IN user's OWN Gemini key (sent by the browser in x-user-gemini-key, the existing per-user key
 * feature). The server never falls back to any server key for this. It only fetches the official PDF (the court CDNs do not
 * allow the browser to fetch it cross-origin) and returns the model's answer in a FIXED JSON schema; the browser merges and
 * caches it per notice. Akash Sync Agent.
 */
import { asGeminiFacts, NOTICE_PROMPT, NOTICE_SCHEMA, type GeminiFacts } from "../src/lib/gov/noticeAi.js";

const MAX_BYTES = 6 * 1024 * 1024;
export const OFFICIAL_PDF = /^https:\/\/[^/]*(?:\.gov\.in|\.nic\.in)\/.+\.pdf(?:$|\?)/i;
export async function fetchPdf(url: string, ms = 8000): Promise<Uint8Array | null> {
  if (!OFFICIAL_PDF.test(url)) return null; // official PDFs only
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { "User-Agent": "JAOS-gov-feed/1.0 (+https://akash-sharma-job-acquisition-os.vercel.app)", Accept: "application/pdf" } });
    if (!r.ok) return null; const len = Number(r.headers.get("content-length") || 0); if (len > MAX_BYTES) return null;
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
  if (!OFFICIAL_PDF.test(url)) throw Object.assign(new Error("Only official .gov.in / .nic.in notice PDFs can be read."), { code: "BAD_URL" });
  const data = await (deps.fetch || fetchPdf)(url, 10000); if (!data) return null;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
  try { return asGeminiFacts(JSON.parse(await (deps.generate || gen)(userKey, { pdfBase64: Buffer.from(data).toString("base64"), prompt: NOTICE_PROMPT, schema: NOTICE_SCHEMA, signal: ctl.signal }))); }
  catch { return null; } finally { clearTimeout(t); }
}
