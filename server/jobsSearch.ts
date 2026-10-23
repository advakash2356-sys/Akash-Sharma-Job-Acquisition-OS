import { ApiError } from "./handlers.js";
import { dmy, govtNotices } from "./govtFeed.js";

/**
 * Real job postings from FreeHire's public keyless API (https://freehire.me/docs/api, MIT).
 * Only search keywords and place filters are sent upstream. Never resume text.
 */
const BASE = "https://freehire.me/api/v1/jobs/search";
const TTL_MS = 10 * 60 * 1000;
const MAX_CACHE = 200;
const PER_TITLE = 25;
const MAX_RESULTS = 40;
const MAX_TITLES = 14;
const MAX_AGE_DAYS = 180; // older postings are dropped even if FreeHire still lists them as open
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 12; // searches per client per minute (each = up to 8 upstream calls; FreeHire allows 600/min)

export interface FoundJob {
  id: string; title: string; company: string; location: string; url: string;
  postedAt: string; source: string; workMode: string; description: string; skills: string[];
  /** Government posting: official notification link (a .gov.in / .nic.in URL found in the posting text) and its last date. */
  official?: { url: string; lastDate: string };
  listingUrl?: string;
  countryCodes?: string[];
  /** From the SarkariMap RSS feed: an aggregator page, not the official notice. */
  govtFeed?: { lastDate: string };
}
export interface SearchOut { jobs: FoundJob[]; total: number; queries: string[]; warnings: string[]; cached: boolean; provider: "freehire" }

const cache = new Map<string, { at: number; out: SearchOut }>();
const hits = new Map<string, number[]>();

export function rateLimit(client: string) {
  const now = Date.now();
  const list = (hits.get(client) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(client, list);
    throw new ApiError(429, `Too many job searches from this connection. Wait ${Math.ceil((WINDOW_MS - (now - list[0])) / 1000)} seconds and try again.`, "RATE_LIMIT");
  }
  list.push(now); hits.set(client, list);
  if (hits.size > 1000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
}

const clean = (s: unknown, n: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Common Hindi (Devanagari) job words mapped to the English titles FreeHire indexes. Unknown Devanagari words are dropped. */
const HINDI: [RegExp, string][] = [
  [/ड्राइवर|चालक|ड्राईवर/g, "Driver"], [/डिलीवरी|डिलिवरी/g, "Delivery"], [/गोदाम|वेयरहाउस|वेयर हाउस/g, "Warehouse"], [/हेल्पर|सहायक/g, "Helper"],
  [/सुरक्षा गार्ड|गार्ड|चौकीदार/g, "Security Guard"], [/रसोइया|कुक|बावर्ची/g, "Cook"], [/इलेक्ट्रीशियन|बिजली मिस्त्री/g, "Electrician"], [/प्लंबर/g, "Plumber"],
  [/शिक्षक|अध्यापक|टीचर/g, "Teacher"], [/नर्स/g, "Nurse"], [/लेखाकार|अकाउंटेंट/g, "Accountant"], [/सेल्स|बिक्री/g, "Sales"], [/कार्यकारी|एग्जीक्यूटिव/g, "Executive"],
  [/ऑपरेटर/g, "Operator"], [/मैकेनिक|मिस्त्री/g, "Mechanic"], [/दर्जी|टेलर/g, "Tailor"], [/सफाई कर्मचारी|सफाई/g, "Housekeeping"], [/क्लर्क|लिपिक/g, "Clerk"],
  [/रिसेप्शनिस्ट/g, "Receptionist"], [/कंप्यूटर ऑपरेटर/g, "Computer Operator"], [/डेटा एंट्री/g, "Data Entry"], [/पैकर|पैकिंग/g, "Packer"], [/लोडर/g, "Loader"],
  [/वकील|अधिवक्ता/g, "Lawyer"], [/कानूनी/g, "Legal"], [/प्रबंधक|मैनेजर/g, "Manager"], [/वेल्डर/g, "Welder"], [/फिटर/g, "Fitter"], [/कारपेंटर|बढ़ई/g, "Carpenter"],
];
export function englishTitle(t: string): string {
  if (!/[\u0900-\u097F]/.test(t)) return t;
  let out = t; for (const [re, en] of HINDI) out = out.replace(re, ` ${en} `);
  return out.replace(/[\u0900-\u097F]+/g, " ").replace(/\s+/g, " ").trim();
}

/** US states (so "Sellersburg, IN" is Indiana, not India). */
const US_STATES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
const US_NAMES = /\b(united states|usa|u\.s\.|alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/i;
const IN_PLACES = /\b(india|delhi|new delhi|ncr|gurugram|gurgaon|noida|ghaziabad|faridabad|bengaluru|bangalore|mumbai|navi mumbai|thane|hyderabad|chennai|pune|kolkata|ahmedabad|jaipur|kochi|lucknow|chandigarh|indore|bhopal|nagpur|surat|vadodara|coimbatore|visakhapatnam|patna|bhubaneswar|mohali|kanpur|ludhiana|mysuru|mysore|trivandrum|thiruvananthapuram|goa|haryana|karnataka|maharashtra|tamil nadu|telangana|uttar pradesh|west bengal|gujarat|rajasthan|kerala|punjab)\b/i;
const OTHER: [RegExp, string][] = [[/\b(united kingdom|england|scotland|london|manchester|uk)\b/i, "GB"], [/\b(canada|toronto|vancouver|ontario)\b/i, "CA"], [/\b(germany|berlin|munich)\b/i, "DE"], [/\bsingapore\b/i, "SG"], [/\b(uae|dubai|abu dhabi)\b/i, "AE"], [/\b(australia|sydney|melbourne)\b/i, "AU"], [/\b(philippines|manila)\b/i, "PH"], [/\b(pakistan|karachi|lahore)\b/i, "PK"], [/\b(netherlands|amsterdam)\b/i, "NL"], [/\b(ireland|dublin)\b/i, "IE"], [/\b(france|paris)\b/i, "FR"], [/\b(poland|warsaw)\b/i, "PL"], [/\b(mexico)\b/i, "MX"], [/\b(brazil)\b/i, "BR"], [/\b(spain|madrid)\b/i, "ES"]];
/** Countries a posting is in, from FreeHire's country list plus the location text. Empty = not stated (e.g. "Remote"). */
export function jobCountries(location: string, codes: string[] = []): string[] {
  const loc = location || "";
  const foreign = new Set<string>();
  for (const part of loc.split(/[;|/]/)) {
    const bits = part.split(",").map((x) => x.trim()).filter(Boolean);
    // "Sellersburg, IN", "IN, US", "AL, GA, IN, TX": US state codes, not India.
    if (bits.some((x) => /^[A-Z]{2}$/.test(x) && US_STATES.has(x) && x !== "IN") || (bits.length > 1 && /^IN$/.test(bits[bits.length - 1]) && !IN_PLACES.test(part)) || bits.some((x) => /^(US|USA|us|usa)$/.test(x))) foreign.add("US");
  }
  if (US_NAMES.test(loc.replace(/\bnew delhi\b/gi, "")) || /\b(US|USA|U\.S\.A?\.?)\b/.test(loc)) foreign.add("US");
  for (const [re, c] of OTHER) if (re.test(loc)) foreign.add(c);
  const explicitIndia = /\bindia\b|\bIND\b/i.test(loc.replace(/indiana/gi, ""));
  const out = new Set<string>(foreign);
  // FreeHire sometimes reads the Indiana code "IN" as India; trust its IN only when nothing points abroad.
  for (const c of codes.map((x) => (x === "UK" ? "GB" : x))) if (c !== "IN" || !foreign.size || explicitIndia) out.add(c);
  if (explicitIndia || (IN_PLACES.test(loc) && !foreign.size)) out.add("IN");
  if (foreign.size && !explicitIndia) out.delete("IN");
  return [...out];
}
/** Keep only postings in the user's country. A posting with no country stated is kept only when the user asked for remote roles and it says remote/worldwide. */
export function placeOk(location: string, codes: string[], workMode: string, countries: string[], remote: boolean): boolean {
  if (!countries.length) return remote;
  // Zip codes or US state codes anywhere ("TX - KAO Logistics", "VA-Richmond", "IN 46552") mean the US.
  if (!countries.includes("US") && (/\b\d{5}(-\d{4})?\b/.test(location) && !/india/i.test(location) || (location.match(/\b[A-Z]{2}\b/g) || []).some((x) => US_STATES.has(x) && x !== "IN") || /^[A-Z]{2}-/.test(location))) return false;
  // India: the location text itself must name India or an Indian place; FreeHire's country code alone is not enough.
  if (countries.length === 1 && countries[0] === "IN" && !IN_PLACES.test(location) && !/\bIND\b/.test(location)) return remote && /remote|anywhere|worldwide|global|apac|asia/i.test(location) && !jobCountries(location, []).length;
  const cs = jobCountries(location, codes);
  if (cs.length) return cs.some((c) => countries.includes(c));
  return remote && (/remote|anywhere|worldwide|global|apac|asia/i.test(location) || /remote/i.test(workMode));
}

export type Education = "8" | "10" | "12" | "iti" | "diploma" | "graduate" | "";
export function parseInput(body: any) {
  const titles = [...new Set((Array.isArray(body?.titles) ? body.titles : []).map((t: unknown) => englishTitle(clean(t, 80))).filter((t: string) => t.length >= 2))].slice(0, MAX_TITLES) as string[];
  const govt = body?.govt === true;
  if (!titles.length && !govt) throw new ApiError(400, "Add at least one target job title to search for.", "BAD_INPUT");
  const countries = [...new Set((Array.isArray(body?.countries) ? body.countries : []).map((c: unknown) => String(c).toUpperCase()).filter((c: string) => /^[A-Z]{2}$/.test(c)))].slice(0, 3) as string[];
  const cities = [...new Set((Array.isArray(body?.cities) ? body.cities : []).map((c: unknown) => clean(c, 40)).filter((c: string) => /^[A-Za-z .'-]{2,40}$/.test(c)))].slice(0, 8) as string[];
  const remote = body?.remote === true; // remote/abroad only when the user opts in
  if (!countries.length && !cities.length && !remote && !govt) throw new ApiError(400, "Pick a place or include remote roles.", "BAD_INPUT");
  const entryLevel = body?.entryLevel === true;
  const education = (["8", "10", "12", "iti", "diploma", "graduate"].includes(String(body?.education)) ? String(body.education) : "") as Education;
  return { titles, countries, cities, remote, entryLevel, govt, education };
}

const STOP = new Set(["and", "the", "for", "with", "job", "jobs"]);
const SENIOR = /\b(managers?|engineers?|analysts?|developers?|architects?|directors?|head|lead|principal|consultants?|scientists?|vp|president|specialists?|software|programmers?|designers?|migrations?)\b/i;
/** Every word of one searched title must start a word in the posting title. Cuts FreeHire's loose stemmed matches. */
export function titleRelevant(jobTitle: string, titles: string[], entryLevel: boolean) {
  const words = jobTitle.toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean);
  const at = (t: string, from: number) => { for (let i = from; i < words.length; i++) if (words[i].startsWith(t)) return i; return -1; };
  return titles.some((q) => {
    const toks = q.toLowerCase().split(/[^a-z0-9+#]+/).filter((t) => t.length >= 3 && !STOP.has(t));
    if (!toks.length) return false;
    // Words in the searched order, close together ("Contract Analyst" no longer matches "Paralegal Analyst - Contract Data ...").
    const ordered = (ts: string[], start = 0) => { let i = at(ts[0], start); if (i < 0) return false; const first = i; for (const t of ts.slice(1)) { i = at(t, i + 1); if (i < 0) return false; } return i - first <= ts.length + 1; };
    let ok = ordered(toks);
    // "Manager - Legal Operations" form: head noun first, then a qualifier of 2+ words.
    if (!ok && toks.length >= 3) { const h = at(toks[toks.length - 1], 0); ok = h >= 0 && ordered(toks.slice(0, -1), h + 1); }
    if (!ok) return false;
    // Head noun of the search must be the role, not a modifier: "Driver" does not match "Driver Development Engineer".
    const seg = jobTitle.toLowerCase().split(/\s[-–|(]\s?|,|\//)[0] || "";
    const sw = seg.split(/[^a-z0-9+#]+/).filter(Boolean); const hi = sw.findIndex((w) => w.startsWith(toks[toks.length - 1]));
    if (hi >= 0 && sw.slice(hi + 1).some((w) => ROLE.test(w) && !q.toLowerCase().includes(w))) return false;
    if (entryLevel) { const m = jobTitle.match(SENIOR); if (m && !q.toLowerCase().includes(m[1].toLowerCase())) return false; }
    return true;
  });
}

const ROLE = /^(engineers?|developers?|managers?|analysts?|controllers?|specialists?|officers?|executives?|consultants?|designers?|architects?|scientists?|technicians?|assistance|projects?|programs?|leads?|directors?|coordinators?|associates?|systems?|software)$/;
const GOV_URL = /https?:\/\/[^\s"'<>)]*\.(?:gov|nic)\.in[^\s"'<>)]*/gi;
const ELIGIBLE: Record<string, RegExp> = {
  "8": /\b(8th|10th|12th|matric|class (?:viii|x|xii)|any qualification|intermediate)\b/i,
  "10": /\b(10th|12th|matric|class (?:x|xii)|any qualification|intermediate)\b/i,
  "12": /\b(10th|12th|matric|intermediate|class (?:x|xii)|any qualification|any graduate|graduate)\b/i,
  iti: /\b(ITI|10th|12th|matric|diploma|any qualification)\b/i,
  diploma: /\b(diploma|ITI|12th|graduate)\b/i,
  graduate: /./,
  "": /./,
};
const stripHtml = (h: string) => h.replace(/<br\s*\/?>|<\/p>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+/g, " ");

/** Government posting check. Needs an official .gov.in / .nic.in link and a last date that has not passed. Never guesses either. */
export function govtInfo(rawDesc: string, education: Education, now = Date.now()): { url: string; lastDate: string } | null {
  const text = stripHtml(rawDesc);
  const urls = text.match(GOV_URL) || [];
  if (!urls.length) return null;
  const m = text.match(/last date[^:\n]{0,40}[:\-]\s*(\d{1,2})(?:st|nd|rd|th)?[ -]+([A-Za-z]{3,9})[ -,]+(\d{4})/i);
  const day = m ? dmy(m[1], m[2], m[3]) : "";
  const t = day ? Date.parse(day) : NaN;
  if (!Number.isFinite(t) || t < now - 86400000) return null; // no last date, or already closed
  if (!ELIGIBLE[education || ""].test(text)) return null;
  const notif = text.match(/notification[^:\n]{0,20}:\s*(https?:\/\/[^\s"'<>)]*\.(?:gov|nic)\.in[^\s"'<>)]*)/i);
  return { url: (notif ? notif[1] : urls[0]).replace(/[.,;]+$/, ""), lastDate: day };
}

function validate(raw: any): FoundJob | null {
  if (!raw || typeof raw !== "object" || raw.closed_at) return null;
  const title = clean(raw.title, 160), company = clean(raw.company, 120);
  let url = "";
  try { const u = new URL(String(raw.url)); if (u.protocol === "https:" || u.protocol === "http:") url = u.toString(); } catch { /* invalid */ }
  const id = clean(raw.public_slug, 200);
  if (!title || !company || !url || !id) return null;
  const t = Date.parse(raw.posted_at || raw.created_at);
  return {
    id, title, company, url,
    location: clean(raw.location, 120),
    postedAt: Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : "",
    source: clean(raw.source, 40) || "freehire",
    workMode: clean(raw.work_mode, 12),
    description: clean(raw.description, 1800),
    skills: Array.isArray(raw.skills) ? raw.skills.slice(0, 12).map((s: unknown) => clean(s, 30)) : [],
    listingUrl: url,
    countryCodes: Array.isArray(raw.countries) ? raw.countries.map((c: unknown) => String(c).toUpperCase()) : [],
  };
}

async function fetchOne(params: Record<string, string>): Promise<{ data: any[]; total: number }> {
  const u = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(u, { signal: ctl.signal, headers: { accept: "application/json", "user-agent": "momentum-job-os (browser-only job tracker)" } });
    if (!r.ok) throw new Error(`FreeHire answered HTTP ${r.status}${r.status === 429 ? " (its rate limit)" : ""}`);
    const j: any = await r.json();
    if (!Array.isArray(j?.data)) throw new Error("FreeHire returned an unexpected response shape");
    return { data: j.data, total: Number(j.meta?.total) || 0 };
  } catch (e: any) {
    throw new Error(e?.name === "AbortError" ? "FreeHire did not answer within 9 seconds" : e.message || "FreeHire request failed");
  } finally { clearTimeout(timer); }
}

export async function searchJobs(body: any): Promise<SearchOut> {
  const { titles, countries, cities, remote, entryLevel, govt, education } = parseInput(body);
  const key = JSON.stringify([titles.map((t) => t.toLowerCase()), countries, cities, remote, entryLevel, govt, education]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return { ...hit.out, cached: true };

  const reqs: { label: string; params: Record<string, string>; govt?: boolean }[] = [];
  // FreeHire ORs cities with countries, so with cities we send only cities and keep the country as a local filter (stops Delhi, USA).
  const place = cities.length ? { cities: cities.join(",") } : countries.length ? { countries: countries.join(",") } : null;
  for (const t of titles) {
    const base = { q: t.includes(" ") ? `"${t}"` : t, q_fields: "title", limit: String(PER_TITLE) };
    if (place) reqs.push({ label: `"${t}" in ${(cities.length ? cities : countries).join("/")}`, params: { ...base, ...place } });
    if (cities.length && countries.length) reqs.push({ label: `"${t}" in ${countries.join("/")}`, params: { ...base, countries: countries.join(",") } });
    if (remote) reqs.push({ label: `"${t}" remote (global/APAC)`, params: { ...base, work_mode: "remote", regions: "global,apac" } });
  }
  if (govt) {
    for (const q of ["Last Date Apply Online notification", "Recruitment 2026 Posts", education === "10" || education === "8" ? "Eligibility 10th pass" : "Eligibility 12th pass"]) {
      reqs.push({ label: `government notices: ${q}`, govt: true, params: { q, source: "telegram", countries: "IN", sort: "posted_at", limit: "100" } });
    }
  }
  const results = await Promise.allSettled(reqs.map((r) => fetchOne(r.params)));
  const warnings: string[] = [];
  const seen = new Set<string>(); const sig = new Set<string>(); const jobs: FoundJob[] = [];
  let total = 0, ok = 0;
  results.forEach((r, i) => {
    if (r.status === "rejected") { warnings.push(`${reqs[i].label}: ${r.reason?.message || "failed"}`); return; }
    ok++; if (!reqs[i].govt) total += r.value.total;
    for (const raw of r.value.data) {
      const j = validate(raw); if (!j) continue;
      if (reqs[i].govt) {
        const g = govtInfo(String(raw.description || ""), education);
        if (!g) continue;
        j.official = g; j.url = g.url; j.description = clean(stripHtml(String(raw.description || "")), 1800);
      } else {
        if (!titleRelevant(j.title, titles, entryLevel)) continue;
        if (!placeOk(j.location, j.countryCodes || [], j.workMode, countries, remote)) continue;
        if (j.postedAt && Date.now() - Date.parse(j.postedAt) > MAX_AGE_DAYS * 86400000) continue;
      }
      const s = `${j.title}|${j.company}|${j.location}`.toLowerCase();
      if (seen.has(j.id) || seen.has(j.url) || sig.has(s)) continue;
      seen.add(j.id); seen.add(j.url); sig.add(s); jobs.push(j);
    }
  });
  if (govt) {
    try {
      for (const g of await govtNotices(education)) {
        const j: FoundJob = { id: g.id, title: g.title, company: "Government of India / State (via SarkariMap)", location: "India", url: g.url, postedAt: g.postedAt, source: "sarkarimap-rss", workMode: "", description: g.summary, skills: [], govtFeed: { lastDate: g.lastDate }, listingUrl: g.url };
        if (!seen.has(j.url)) { seen.add(j.url); jobs.push(j); }
      }
      ok++;
    } catch (e: any) { warnings.push(`extra government list (SarkariMap) unavailable from the server right now (${e.message}); official notices and portal links still shown`); }
  }
  if (!ok) throw new ApiError(502, `FreeHire could not be reached. ${warnings[0] || ""}`.trim(), "FREEHIRE_DOWN");
  const exact = (j: FoundJob) => (titles.some((t) => j.title.toLowerCase().includes(t.toLowerCase())) ? 1 : 0);
  const near = (j: FoundJob) => (cities.some((c) => `${j.location}`.toLowerCase().includes(c.toLowerCase())) ? 1 : 0);
  jobs.sort((a, b) => (b.official || b.govtFeed ? 1 : 0) - (a.official || a.govtFeed ? 1 : 0) || (a.official?.lastDate || a.govtFeed?.lastDate || "9").localeCompare(b.official?.lastDate || b.govtFeed?.lastDate || "9") * ((a.official || a.govtFeed) && (b.official || b.govtFeed) ? 1 : 0) || near(b) - near(a) || exact(b) - exact(a) || b.postedAt.localeCompare(a.postedAt));
  const out: SearchOut = { jobs: jobs.slice(0, MAX_RESULTS + 15), total, queries: reqs.map((r) => r.label), warnings, cached: false, provider: "freehire" };
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), out });
  return out;
}
