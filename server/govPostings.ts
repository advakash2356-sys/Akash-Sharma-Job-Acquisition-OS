/**
 * Government job POSTINGS feed (public, read-only). Akash Sync Agent.
 * Sources, read on the server only (the browser talks to our own /api/gov/postings, so CSP gains no new origin):
 *  1) FreeHire public API (MIT project, keyless), Telegram-sourced Indian notices. Kept ONLY when the text carries an
 *     official .gov.in / .nic.in / s3waas.gov.in notification link AND a last date that has not passed.
 *  2) SarkariMap public RSS (documented as free for feed readers). Aggregator page, labelled as such; kept only with a future last date.
 * We read job facts only (title, organisation, place, dates, pay, vacancies, links). No personal contact data is kept:
 * emails and phone numbers are stripped from snippets. Nothing is invented: a missing field is shown as "see notice".
 */
import { dmy } from "./govtFeed.js";
import { inDomain } from "../src/lib/gov/domain.js";

const FH = "https://freehire.me/api/v1/jobs/search";
const RSS = "https://sarkarimap.org/rss.xml";
const TTL = 30 * 60 * 1000;
let cache: { at: number; out: GovFeed } | null = null;

export interface GovPosting {
  id: string; title: string; org: string; state: string; location: string; lastDate: string; startDate?: string;
  pay: string; vacancies: string; eligibility: string; noticeUrl: string; official: boolean; applyUrl?: string;
  postedAt: string; source: "FreeHire (Telegram notices)" | "SarkariMap RSS"; lesserKnown: boolean; verifiedAt: string;
  /** Playbook §5 fields (best effort from the notice text; empty when not stated). */
  level?: Level; employmentType?: EmpType; trust?: "GOV_TLD" | "WHITELIST_PSU" | "UNTRUSTED"; minAge?: number; maxAge?: number; eduTags?: string[];
}
export type Level = "central" | "state" | "psu" | "autonomous" | "judiciary" | "defence" | "regulator" | "local";
export type EmpType = "permanent" | "contractual" | "deputation" | "apprenticeship" | "fellowship";
export function levelOf(t: string): Level {
  if (/high court|supreme court|district court|tribunal|judicial/i.test(t)) return "judiciary";
  if (/\b(RBI|SEBI|IRDAI|PFRDA|NABARD|SIDBI|TRAI|CCI)\b/.test(t)) return "regulator";
  if (/\b(army|navy|air force|coast guard|territorial army|agniveer|BSF|CRPF|CISF|ITBP|SSB|assam rifles|ordnance)\b/i.test(t)) return "defence";
  if (/\b(limited|ltd|corporation|NTPC|ONGC|BHEL|IOCL|GAIL|SAIL|HAL|BEL|ECIL|NHPC|POWERGRID|BECIL|EdCIL|NPCC|bank)\b/i.test(t)) return "psu";
  if (/municipal|nagar|panchayat|zila|district/i.test(t)) return "local";
  if (/\b(CSIR|ICAR|ICMR|DRDO|ISRO|BARC|AIIMS|IIT|NIT|IIIT|IISER|IISc|IIM|ISI|university|institute|laboratory|KVS|NVS)\b/i.test(t)) return "autonomous";
  if (/\b(UPSC|SSC|RRB|railway|ministry|department of|central|government of india|EPFO|ESIC|India Post)\b/i.test(t)) return "central";
  return "state";
}
export function empTypeOf(t: string): EmpType {
  if (/deputation|absorption/i.test(t)) return "deputation";
  if (/apprentice/i.test(t)) return "apprenticeship";
  if (/\b(JRF|SRF|fellow(ship)?|young professional)\b/i.test(t)) return "fellowship";
  if (/contract|contractual|project (associate|assistant|scientist)|walk-?in|consultant|tenure/i.test(t)) return "contractual";
  return "permanent";
}
export function agesOf(t: string): { minAge?: number; maxAge?: number } {
  const r = t.match(/(\d{2})\s*(?:-|to|–)\s*(\d{2})\s*(?:years|yrs)/i); if (r && +r[1] >= 14 && +r[2] <= 65 && +r[1] < +r[2]) return { minAge: +r[1], maxAge: +r[2] };
  const m = t.match(/(?:max(?:imum)?\.?\s*age(?:\s*limit)?|upper age(?:\s*limit)?|age limit)[^\d]{0,20}(\d{2})/i) || t.match(/(\d{2})\s*(?:saal|years)\s*(?:hai|max|maximum)/i);
  return m && +m[1] >= 18 && +m[1] <= 65 ? { maxAge: +m[1] } : {};
}
export function eduTagsOf(t: string): string[] {
  const tags: [string, RegExp][] = [["10TH", /\b10th|matric|SSLC\b/i], ["12TH", /\b12th|intermediate|HSC\b/i], ["ITI", /\bITI\b/], ["DIPLOMA", /diploma/i], ["GRADUATE", /graduat|bachelor|degree\b/i], ["ENGINEERING", /B\.?\s?E\b|B\.?\s?Tech|engineering|GATE/i], ["LAW", /LL\.?B|\blaw\b|legal/i], ["MEDICAL", /MBBS|nursing|medical|B\.?Sc nursing|pharm/i], ["PG", /post ?graduat|master'?s|M\.?Sc|M\.?A\b|MBA|M\.?Tech|MCA/i], ["PHD", /Ph\.?\s?D/i]];
  return tags.filter(([, re]) => re.test(t)).map(([k]) => k);
}
/** Playbook §7 scam heuristics: personal UPI/WhatsApp payment or fee-disguise wording. */
export const SCAM = /@(okaxis|ybl|paytm|oksbi|okhdfcbank|okicici|upi)\b|whats ?app\s*(no|number|pe)|security deposit|training kit charge|laptop charge|confirmed (sarkari )?job without exam|joining fee/i;
export function enrich(p: GovPosting, text: string): GovPosting | null {
  const all = `${p.title} ${p.org} ${text}`;
  if (SCAM.test(all)) return null;
  const tr = inDomain(p.noticeUrl).tier;
  return { ...p, level: levelOf(`${p.org} ${p.title}`), employmentType: empTypeOf(all), trust: tr, official: p.official && tr !== "UNTRUSTED", ...agesOf(all), eduTags: eduTagsOf(`${p.title} ${p.eligibility} ${text}`) };
}
export interface GovFeed { postings: GovPosting[]; checkedAt: string; warnings: string[]; sources: string[] }

export const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar","Chandigarh","Dadra and Nagar Haveli","Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"];
const STATE_HINT: [RegExp, string][] = [
  [/\b(UKSSSC|UKPSC|Dehradun|Haridwar|Nainital)\b/i, "Uttarakhand"], [/\b(UPSSSC|UPPSC|Varanasi|Lucknow|Allahabad|Prayagraj|Kanpur|Noida)\b/i, "Uttar Pradesh"],
  [/\b(BPSC|BSSC|Patna)\b/i, "Bihar"], [/\b(RPSC|RSMSSB|RSSB|Jaipur|Jodhpur)\b/i, "Rajasthan"], [/\b(MPPSC|MPESB|Bhopal|Indore)\b/i, "Madhya Pradesh"],
  [/\b(HPSC|HSSC|Gurugram|Gurgaon|Faridabad)\b/i, "Haryana"], [/\b(PPSC|PSSSB|Chandigarh|Mohali|Ludhiana)\b/i, "Punjab"], [/\b(TNPSC|Chennai|Madurai|Coimbatore)\b/i, "Tamil Nadu"],
  [/\b(KPSC|Bengaluru|Bangalore|Mysuru)\b/i, "Karnataka"], [/\b(Kerala PSC|Calicut|Kozhikode|Thiruvananthapuram|Kochi)\b/i, "Kerala"], [/\b(TSPSC|TGPSC|Hyderabad)\b/i, "Telangana"],
  [/\b(APPSC|Vijayawada|Visakhapatnam|Tirupati)\b/i, "Andhra Pradesh"], [/\b(MPSC|Mumbai|Pune|Nagpur)\b/i, "Maharashtra"], [/\b(GPSC|GSSSB|Ahmedabad|Gandhinagar|Vadodara)\b/i, "Gujarat"],
  [/\b(WBPSC|WBSSC|Kolkata)\b/i, "West Bengal"], [/\b(OPSC|OSSC|OSSSC|Bhubaneswar|Cuttack)\b/i, "Odisha"], [/\b(JPSC|JSSC|Ranchi)\b/i, "Jharkhand"], [/\b(CGPSC|Raipur)\b/i, "Chhattisgarh"],
  [/\b(APSC|Guwahati)\b/i, "Assam"], [/\b(HPPSC|HPRCA|Shimla)\b/i, "Himachal Pradesh"], [/\b(JKSSB|JKPSC|Srinagar|Jammu)\b/i, "Jammu and Kashmir"], [/\b(DSSSB|New Delhi|Delhi)\b/i, "Delhi"],
];
/** Organisations people rarely track (PSUs, courts, research, defence civilian, regulators, cooperative banks, institutes). */
export const LESSER = /\b(High Court|District Court|Supreme Court|Tribunal|CSIR|ICAR|ICMR|DRDO|ISRO|BARC|NPCIL|IGCAR|AIIMS|NIT|IIT|IIIT|IISER|NISER|Central University|KVS|NVS|Navodaya|ECIL|BEL|BHEL|HAL|NTPC|ONGC|IOCL|GAIL|SAIL|Coal India|NHPC|POWERGRID|PGCIL|AAI|FCI|EPFO|ESIC|NABARD|SEBI|IRDAI|RBI|SIDBI|EXIM|Cooperative|Gramin Bank|Coast Guard|Territorial Army|Cantonment|Ordnance|Lok Sabha|Rajya Sabha|Secretariat|Development Commissioner|Project Associate|Project Assistant|Young Professional|Deputation|Institute|Laboratory|Research)\b/i;

const MON = "(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)";
/** Dates like 05.10.2026, 05/10/2026, 5 October 2026, 5th Oct 2026. Returns YYYY-MM-DD or "". */
export function anyDate(s: string): string {
  let m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](20\d{2})/);
  if (m) { const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])); return d.getUTCDate() === +m[1] ? d.toISOString().slice(0, 10) : ""; }
  m = s.match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?[\\s-]+${MON}[\\s,-]+(20\\d{2})`, "i"));
  return m ? dmy(m[1], m[2], m[3]) : "";
}
const strip = (h: string) => h.replace(/<br\s*\/?>|<\/p>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+/g, " ");
/** Never keep personal contact data in snippets. */
export const noContacts = (s: string) => s.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email removed]").replace(/(?:\+91[\s-]?)?\b[6-9]\d{9}\b/g, "[phone removed]");
const field = (t: string, re: RegExp, n = 140) => { const m = t.match(re); return m ? noContacts(m[1].trim().replace(/\s+/g, " ")).slice(0, n) : ""; };
const OFFICIAL = /https?:\/\/[^\s"'<>)]*\.(?:gov|nic)\.in[^\s"'<>)]*/gi;

export function stateOf(text: string): string {
  for (const s of STATES) if (new RegExp(`\\b${s.replace(/ /g, "\\s+")}\\b`, "i").test(text)) return s; // nosemgrep: detect-non-literal-regexp -- STATES is a fixed constant list
  for (const [re, s] of STATE_HINT) if (re.test(text)) return s;
  return /\b(all india|across india|anywhere in india|pan india)\b/i.test(text) ? "All India" : "";
}
export function payOf(t: string): string {
  const p = field(t, /((?:level|pay level)[\s-]*\d{1,2}[^.\n]{0,40}(?:pay matrix|7th cpc)[^.\n]{0,20})/i)
    || field(t, /(\d{1,2}(?:st|nd|rd|th)? level of pay matrix[^.\n]{0,30})/i)
    || field(t, /(?:pay scale|pay band|salary|emoluments|stipend|remuneration|fellowship)\s*[:\-–]?\s*([^\n]{3,90})/i)
    || field(t, /((?:rs\.?|₹|inr)\s?[\d,]{4,}(?:\s*(?:-|to|–)\s*(?:rs\.?|₹)?\s?[\d,]{4,})?(?:\s*(?:per month|\/-|p\.m\.|pm|per annum))?)/i);
  return /\d/.test(p) ? p : ""; // pay must contain a number; never a stray word
}

export function fromFreeHire(raw: any, today: string): GovPosting | null {
  const t = strip(String(raw?.description || "")); const title = String(raw?.title || "").trim().slice(0, 160); if (!title) return null;
  const links = t.match(OFFICIAL) || []; if (!links.length) return null;
  const last = anyDate(field(t, /(?:application\s+)?last date[^:\n]{0,30}[:\-–]?\s*([^\n]{4,40})/i, 60) || field(t, /closing date[^:\n]{0,20}[:\-–]?\s*([^\n]{4,40})/i, 60));
  if (!last || last < today) return null;
  const notice = field(t, /notification[^:\n]{0,20}:\s*(https?:\/\/\S+)/i, 300).replace(/[.,;]+$/, "") || links[0].replace(/[.,;]+$/, "");
  const org = String(raw?.company || "").trim().slice(0, 120) || field(t, /(?:recruiting authority|organi[sz]ation)\s*:\s*([^\n]{3,100})/i);
  const loc = String(raw?.location || "").trim() || field(t, /job location\s*:\s*([^\n]{2,80})/i);
  const all = `${title} ${org} ${loc} ${t}`;
  return {
    id: `fh:${raw.public_slug || notice + title}`, title, org, location: noContacts(loc).slice(0, 100), state: stateOf(`${loc} ${org} ${title}`) || stateOf(all), lastDate: last,
    startDate: anyDate(field(t, /(?:start|opening) date[^:\n]{0,20}[:\-–]?\s*([^\n]{4,40})/i, 60)) || undefined,
    pay: payOf(t), vacancies: field(t, /(?:total\s+)?(?:vacanc(?:y|ies)|posts)\s*:\s*([^\n]{1,60})/i, 60),
    eligibility: field(t, /(?:who can apply|qualification|eligibility|educational qualification)\s*:\s*([^\n]{3,200})/i, 200),
    noticeUrl: notice, official: /\.(gov|nic)\.in\//i.test(notice), applyUrl: field(t, /apply (?:online )?link\s*:\s*(https:\/\/\S+)/i, 300) || undefined,
    postedAt: String(raw?.posted_at || "").slice(0, 10), source: "FreeHire (Telegram notices)", lesserKnown: LESSER.test(`${org} ${title}`), verifiedAt: today,
  };
}
const unCdata = (s: string) => s.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim();
const tag = (it: string, t: string) => { const m = it.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)); return m ? unCdata(m[1]) : ""; }; // nosemgrep: detect-non-literal-regexp -- t is a fixed tag name
const NOT_A_JOB = /\b(result|admit card|answer key|admission|time ?table|score ?card|syllabus|cut ?off|counselling|exam date|city slip)\b/i;
export function fromRss(xml: string, today: string): GovPosting[] {
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).flatMap((it) => {
    const title = tag(it, "title"), url = tag(it, "link"), d = strip(tag(it, "description"));
    if (!title || !/^https:\/\/sarkarimap\.org\//.test(url) || NOT_A_JOB.test(title)) return [];
    const last = anyDate(d.match(/(?:last date|tak|till|before|interview)[^.]{0,60}/i)?.[0] || "") || anyDate(d);
    if (!last || last < today) return [];
    const pub = Date.parse(tag(it, "pubDate")); const org = title.replace(/\s+(Recruitment|Vacancy|Bharti).*$/i, "").trim();
    const off = (d.match(OFFICIAL) || [])[0];
    return [{ id: `sm:${url}`, title, org, location: "", state: stateOf(`${title} ${d}`), lastDate: last, pay: payOf(d), vacancies: field(d, /(\d+)\s+(?:vacanc|post)/i, 20),
      eligibility: noContacts(d).slice(0, 220), noticeUrl: off || url, official: !!off, postedAt: Number.isFinite(pub) ? new Date(pub).toISOString().slice(0, 10) : "",
      source: "SarkariMap RSS" as const, lesserKnown: LESSER.test(title), verifiedAt: today }];
  });
}

async function get(url: string, accept: string) {
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 9000);
  try { const r = await fetch(url, { signal: ctl.signal, headers: { accept, "user-agent": "job-acquisition-os (gov postings reader)" } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r; }
  catch (e: any) { throw new Error(e?.name === "AbortError" ? "no answer within 9 seconds" : e.message || "failed"); } finally { clearTimeout(timer); }
}

export async function govPostings(now = Date.now()): Promise<GovFeed> {
  if (cache && now - cache.at < TTL) return cache.out;
  const today = new Date(now).toISOString().slice(0, 10); const warnings: string[] = []; const out: GovPosting[] = []; const sources: string[] = [];
  const qs = ["Recruitment 2026", "Last Date", "Apply Online notification", "Vacancy", "Posts", "Notification"];
  const fh = await Promise.allSettled(qs.map((q) => get(`${FH}?${new URLSearchParams({ q, source: "telegram", countries: "IN", sort: "posted_at", limit: "100" })}`, "application/json").then((r) => r.json())));
  let fhOk = false;
  fh.forEach((r, i) => { if (r.status === "rejected") { warnings.push(`FreeHire "${qs[i]}": ${r.reason?.message}`); return; } fhOk = true; for (const raw of (r.value as any)?.data || []) { const p = fromFreeHire(raw, today); const e = p && enrich(p, strip(String(raw?.description || ""))); if (e) out.push(e); } });
  if (fhOk) sources.push("FreeHire public API (Telegram-sourced Indian notices with official links)");
  try { for (const p of fromRss(await (await get(RSS, "application/rss+xml")).text(), today)) { const e = enrich(p, p.eligibility); if (e) out.push(e); } sources.push("SarkariMap public RSS (aggregator)"); } catch (e: any) { warnings.push(`SarkariMap RSS: ${e.message}`); }
  const seen = new Set<string>(); const postings = out.filter((p) => { const k = `${p.title}|${p.org}|${p.lastDate}`.toLowerCase(); if (seen.has(k) || seen.has(p.id)) return false; seen.add(k); seen.add(p.id); return true; })
    .sort((a, b) => a.lastDate.localeCompare(b.lastDate) || Number(b.official) - Number(a.official)).slice(0, 300);
  const res = { postings, checkedAt: new Date(now).toISOString(), warnings, sources };
  if (postings.length || !cache) cache = { at: now, out: res };
  return res;
}
