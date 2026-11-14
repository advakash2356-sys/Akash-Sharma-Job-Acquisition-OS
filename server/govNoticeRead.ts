/**
 * Reads the official notice PDF behind a District Court (S3WaaS) row, once per notice, so the structured facts come from the
 * notice itself and not from the one-line listing. Akash Sync Agent.
 *  1) Text layer (pdfjs, no network beyond the official PDF): retired-only, appointment, list / test notices and positive
 *     evidence of an open call (applications invited, last date, vacancies); the qualification and age clauses when the row
 *     states none (verbatim from the notice).
 *  2) No server AI key is used. A scanned (no text layer) or unreadable notice is flagged (facts.pdf) and shown as
 *     "Check notice: scanned notice, verify manually"; a signed-in user with their OWN Gemini key can have the browser read
 *     it (src/lib/gov/noticeAi.ts). Cached per PDF URL for 24 hours (per instance) on top of the 3-hour S3 cache.
 */
import type { GovPosting } from "./govPostings.js";
import { ageWordsIn, agesOf, eligibilityFromText, noticeTypeFromPdf, parseNotice, type NoticeFacts, type NoticeType } from "../src/lib/gov/notice.js";
import { mergeFacts } from "../src/lib/gov/noticeAi.js";
import { fetchPdf } from "./govNoticeAi.js";
export { mergeFacts };

const DAY = 24 * 3600 * 1000;
export interface NoticeRead { at: number; type: NoticeType | null; text: boolean; elig?: string; ages?: { min: number | null; max: number | null }; ageWords?: boolean; unreadable?: boolean }
const cache = new Map<string, NoticeRead>();
let pdfjsP: Promise<any> | null = null;
export async function pdfText(data: Uint8Array, pages = 3): Promise<string> {
  try {
    pdfjsP ||= (async () => { const w = await import("pdfjs-dist/legacy/build/pdf.worker.mjs"); (globalThis as any).pdfjsWorker = w; return import("pdfjs-dist/legacy/build/pdf.mjs"); })();
    const pdfjs = await pdfjsP;
    const doc = await pdfjs.getDocument({ data: data.slice(), isEvalSupported: false, disableFontFace: true, useSystemFonts: false, verbosity: 0 }).promise;
    let out = ""; for (let i = 1; i <= Math.min(pages, doc.numPages); i++) { const pg = await doc.getPage(i); const c = await pg.getTextContent(); out += " " + c.items.map((x: any) => x.str || "").join(" "); }
    await doc.destroy?.(); return out.replace(/\s+/g, " ").trim();
  } catch { return ""; }
}
async function readOne(url: string, deadline: number): Promise<NoticeRead> {
  const hit = cache.get(url); if (hit && Date.now() - hit.at < DAY) return hit;
  const data = await fetchPdf(url, Math.min(8000, Math.max(1000, deadline - Date.now())));
  if (!data) return { at: Date.now(), type: null, text: false, unreadable: true }; // not cached: retry next round
  const text = await pdfText(data); const type = noticeTypeFromPdf(text);
  const r: NoticeRead = { at: Date.now(), type, text: text.replace(/\s/g, '').length >= 80, elig: eligibilityFromText(text), ages: agesOf(text.slice(0, 8000)), ageWords: ageWordsIn(text.slice(0, 8000)) };
  if (cache.size > 2000) cache.clear(); cache.set(url, r); return r;
}
/** The feed row states no qualification: use the qualification clauses printed in the official PDF's text layer (verbatim). */
export function withPdfText(p: GovPosting, rules: NoticeFacts, r: Pick<NoticeRead, 'elig' | 'ages' | 'ageWords'>): NoticeFacts {
  let f = rules;
  if (!f.stated && r.elig) { const q = parseNotice({ ...p, eligibility: r.elig }); if (q.stated) f = { ...f, essential: q.essential, preferred: q.preferred, essentialText: q.essentialText, preferredText: q.preferredText, minEdu: q.minEdu, experience: q.experience, licences: [...new Set([...f.licences, ...q.licences])], stated: true, source: "pdf" }; }
  if (f.ageMax === null && f.ageMin === null && r.ages && (r.ages.max !== null || r.ages.min !== null)) f = { ...f, ageMax: r.ages.max, ageMin: r.ages.min, source: "pdf" };
  // the PDF talks about age but no upper limit could be read (OCR noise): "verify age: unreadable in PDF", never "not stated"
  if (f.ageMax === null && r.ageWords) f = { ...f, ageUnreadable: true };
  return f;
}
/** Reads each S3 row's notice (concurrency 5, total budget). Returns the rows that stay open calls or unclear, with facts attached. */
export async function readNotices(posts: GovPosting[], budgetMs = 25000): Promise<{ posts: GovPosting[]; read: number; scanned: number; dropped: number }> {
  const deadline = Date.now() + budgetMs; const out: GovPosting[] = new Array(posts.length); let read = 0, scanned = 0, dropped = 0; let i = 0;
  const work = async () => { while (i < posts.length) { const k = i++; const p = posts[k];
    const rules = parseNotice(p);
    if (p.linkKind !== "notice") { out[k] = { ...p, facts: rules }; continue; }
    if (Date.now() > deadline - 1500) { out[k] = { ...p, facts: { ...rules, pdf: "unreadable" } }; scanned++; continue; }
    const r = await readOne(p.noticeUrl, deadline); if (r.text) read++; else scanned++;
    const f = mergeFacts(withPdfText(p, rules, r), null, r.type);
    out[k] = { ...p, facts: { ...f, pdf: r.text ? "text" : r.unreadable ? "unreadable" : "scanned" } }; } };
  await Promise.all(Array.from({ length: 5 }, work));
  const kept = out.filter((p) => { const ok = !p.facts || p.facts.noticeType === "open_call" || p.facts.noticeType === "unclear" || p.facts.noticeType === "other"; if (!ok) dropped++; return ok; });
  return { posts: kept, read, scanned, dropped };
}
