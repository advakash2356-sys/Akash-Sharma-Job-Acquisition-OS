/**
 * JAOS job collector (t345u). Runs every 6 hours in GitHub Actions (.github/workflows/collect-jobs.yml) and writes a
 * compact, de-duplicated snapshot of public, keyless job feeds to data/jobs-snapshot.json.gz.
 *
 * Reused code and data (all permissive licences, credited in NOTICE and README):
 *  - ATS adapters (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Workday) and the company -> ATS board list
 *    data/companies_v2.json: outscal/OpenJobs (MIT), itself a fork of career-ops-hq/career-ops (MIT).
 *  - Politeness model (bounded concurrency, retry with back-off, treat an empty board as suspect) follows
 *    career-ops scan-ats-full.mjs / OpenJobs harvest.mjs.
 * Sources never receive any user data: this job runs with no user input at all. Akash Sync Agent.
 */
import { gzipSync, gunzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import * as greenhouse from "./collect/vendor/openjobs/greenhouse.mjs";
import * as lever from "./collect/vendor/openjobs/lever.mjs";
import * as ashby from "./collect/vendor/openjobs/ashby.mjs";
import * as workable from "./collect/vendor/openjobs/workable.mjs";
import * as smartrecruiters from "./collect/vendor/openjobs/smartrecruiters.mjs";
import * as workday from "./collect/vendor/openjobs/workday.mjs";
import * as recruitee from "./collect/vendor/openjobs/recruitee.mjs";
import * as personio from "./collect/vendor/openjobs/personio.mjs";
import * as teamtailor from "./collect/vendor/openjobs/teamtailor.mjs";
import * as bamboohr from "./collect/vendor/openjobs/bamboohr.mjs";
import * as breezy from "./collect/vendor/openjobs/breezy.mjs";
import * as jobvite from "./collect/vendor/openjobs/jobvite.mjs";
import * as joincom from "./collect/vendor/openjobs/join.mjs";
import { classify } from "../src/lib/onestop/category.js";

const OPENJOBS = "https://raw.githubusercontent.com/outscal/OpenJobs/main/data/companies_v2.json";
const OUT = process.env.OUT || "data/jobs-snapshot.json.gz";
const CONC = Number(process.env.CONCURRENCY || 8);
const WD_CAP = Number(process.env.WORKDAY_CAP || 2000);
const UA = "JAOS-job-collector/1.0 (+https://akash-sharma-job-acquisition-os.vercel.app/about)";
const MAX_AGE_DAYS = 120;

export interface Snap { t: string; c: string; l: string; u: string; d: string; s: string; r: 0 | 1; k: string }
const strip = (s: unknown, n = 200) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim().slice(0, n);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url: string, init: RequestInit = {}, tries = 3): Promise<any> {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, { ...init, headers: { accept: "application/json", "user-agent": UA, ...(init.headers || {}) }, signal: AbortSignal.timeout(20000) });
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) { const e: any = new Error(`HTTP ${r.status}`); e.final = true; throw e; }
      return await r.json();
    } catch (e: any) { if (e.final || i >= tries - 1) throw e; await sleep(800 * 2 ** i); }
  }
}
async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) { const q = [...items]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()!); })); }
const isoDate = (v: unknown) => { const t = typeof v === "number" ? v : Date.parse(String(v || "")); return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : ""; };
/** Workday says "Posted 3 Days Ago" / "Posted 30+ Days Ago". */
const wdDate = (s: string) => { if (/today/i.test(s)) return isoDate(Date.now()); if (/yesterday/i.test(s)) return isoDate(Date.now() - 864e5); const m = s.match(/(\d+)\+?\s*day/i); return m ? isoDate(Date.now() - Number(m[1]) * 864e5) : ""; };

const jobs: Snap[] = []; const counts: Record<string, number> = {}; const errors: Record<string, number> = {}; const wdOk: string[] = []; const wdFail: string[] = [];
function add(src: string, company: string, raw: { title: string; url: string; location?: string; date?: string; remote?: boolean; desc?: string }) {
  const t = strip(raw.title, 140), u = String(raw.url || ""); if (!t || !/^https?:\/\//.test(u)) return;
  if (raw.date && Date.now() - Date.parse(raw.date) > MAX_AGE_DAYS * 864e5) return;
  const l = strip(raw.location, 100); const c = strip(company, 80);
  const k = classify({ title: t, company: c, location: l, description: raw.desc, remote: raw.remote });
  jobs.push({ t, c, l, u, d: raw.date || "", s: src, r: raw.remote ? 1 : 0, k });
  counts[src] = (counts[src] || 0) + 1;
}

async function ats() {
  const companies: any[] = await fetchJson(OPENJOBS);
  // More boards: career-ops templates/portals.example.yml (MIT) URLs, plus boards discovered from apply links in the
  // previous snapshot and this run's open feeds (a public apply URL on an ATS host means a public board).
  const extra = readFileSync(new URL("./collect/career-ops-boards.txt", import.meta.url), "utf8").split(/\s+/).filter(Boolean);
  for (const u of [...extra, ...discovered]) companies.push({ name: "", ats_links: [u] });
  const adapters: [string, any][] = [["Greenhouse", greenhouse], ["Lever", lever], ["Ashby", ashby], ["Workable", workable], ["SmartRecruiters", smartrecruiters], ["Recruitee", recruitee], ["Personio", personio], ["Teamtailor", teamtailor], ["BambooHR", bamboohr], ["Breezy", breezy], ["Jobvite", jobvite], ["JOIN", joincom]];
  const work: { name: string; src: string; a: any; h: any }[] = []; const seen = new Set<string>();
  for (const co of companies) for (const [src, a] of adapters) { const h = a.detect(co); const id = h?.apiUrl || h?.apiBase; if (id && !seen.has(id)) { seen.add(id); work.push({ name: String(co.name || "").trim(), src, a, h }); break; } }
  const ctx = { fetchJson: (u: string, init?: RequestInit) => fetchJson(u, init), logWarn: (m: string) => { const s = m.split(" ")[0]; errors[s] = (errors[s] || 0) + 1; } };
  await pool(work, CONC, async (w) => {
    const list = await w.a.fetchJobs(w.h, ctx).catch(() => []);
    const name = w.name || String(w.h.slug || w.h.tenant || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    for (const j of list) add(w.src, name, { title: j.title, url: j.apply_url || j.detail_url, location: j.location, date: isoDate(j.posted_date), remote: j.remote });
  });
}
async function workdays() {
  const tenants: { name: string; tenant: string; wd: string; site: string }[] = JSON.parse(readFileSync(new URL("./collect/workday-tenants.json", import.meta.url), "utf8"));
  await pool(tenants, 10, async (t) => {
    const h = workday.detect({ ats_links: [`https://${t.tenant}.wd${t.wd}.myworkdayjobs.com/${t.site}`] });
    const list = await workday.fetchJobs(h, { workdayCap: WD_CAP, fetchJson: (u: string, init?: RequestInit) => fetchJson(u, init) } as any).catch(() => []);
    (list.length ? wdOk : wdFail).push(t.name);
    for (const j of list) add("Workday", t.name, { title: j.title, url: j.detail_url, location: j.location, date: wdDate(j.posted_date), remote: j.remote });
  });
}
async function remoteFeeds() {
  // Himalayas: cursor pagination, as its feed asks (21/08/2026 note). Link back to himalayas.app on every card.
  try { let cursor = ""; for (let p = 0; p < Number(process.env.HIMALAYAS_PAGES || 1500); p++) { const j = await fetchJson(`https://himalayas.app/jobs/api?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`); for (const x of j.jobs || []) add("Himalayas", x.companyName, { title: x.title, url: x.applicationLink || x.guid, location: (x.locationRestrictions || []).join(", ") || "Remote (worldwide)", date: isoDate(x.pubDate * 1000 || x.pubDate), remote: true, desc: x.excerpt }); if (!j.nextCursor) break; cursor = j.nextCursor; await sleep(250); } } catch { errors.Himalayas = 1; }
  // Remote OK: terms require a followed link back to remoteok.com and naming Remote OK as the source.
  try { const j = await fetchJson("https://remoteok.com/api"); for (const x of j.slice(1)) add("Remote OK", x.company, { title: x.position, url: x.url, location: x.location || "Remote", date: isoDate(x.date), remote: true }); } catch { errors["Remote OK"] = 1; }
  // Remotive: max 4 calls a day; must link back to the Remotive URL and name Remotive as the source.
  try { const j = await fetchJson("https://remotive.com/api/remote-jobs"); for (const x of j.jobs || []) add("Remotive", x.company_name, { title: x.title, url: x.url, location: x.candidate_required_location || "Remote", date: isoDate(x.publication_date), remote: true }); } catch { errors.Remotive = 1; }
  // Jobicy: credit Jobicy with a direct link; apply buttons go to the original URL (its API notice).
  try { const j = await fetchJson("https://jobicy.com/api/v2/remote-jobs?count=100"); for (const x of j.jobs || []) add("Jobicy", x.companyName, { title: x.jobTitle, url: x.url, location: x.jobGeo || "Remote", date: isoDate(x.pubDate), remote: true }); } catch { errors.Jobicy = 1; }
  // Working Nomads public API; links go back to workingnomads.com.
  try { const j = await fetchJson("https://www.workingnomads.com/api/exposed_jobs/"); for (const x of j || []) add("Working Nomads", x.company_name, { title: x.title, url: x.url, location: x.location || "Remote", date: isoDate(x.pub_date), remote: true }); } catch { errors["Working Nomads"] = 1; }
  // Public RSS feeds (We Work Remotely, NoDesk); every card links back to the board.
  for (const [src, url] of [["We Work Remotely", "https://weworkremotely.com/remote-jobs.rss"], ["NoDesk", "https://nodesk.co/remote-jobs/index.xml"]] as const) {
    try { const xml = await (await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) })).text();
      for (const it of xml.split(/<item>/).slice(1)) { const g = (t: string) => (it.match(new RegExp(`<${t}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`)) || [])[1] || ""; let title = strip(g("title")), co = "";
        const m = title.match(/^([^:]{2,60}):\s*(.+)$/); if (src === "We Work Remotely" && m) { co = m[1]; title = m[2]; }
        add(src, co || src, { title, url: g("link").trim(), location: strip(g("region")) || "Remote", date: isoDate(g("pubDate")), remote: true }); } } catch { errors[src] = 1; }
  }
  // Arbeitnow: free API, link back to arbeitnow.com.
  try { for (let p = 1; p <= 10; p++) { const j = await fetchJson(`https://www.arbeitnow.com/api/job-board-api?page=${p}`); for (const x of j.data || []) add("Arbeitnow", x.company_name, { title: x.title, url: x.url, location: x.location, date: isoDate((x.created_at || 0) * 1000), remote: !!x.remote, desc: strip(x.description, 600) }); if (!j.links?.next) break; await sleep(500); } } catch { errors.Arbeitnow = 1; }
}

export function dedupe(list: Snap[]): Snap[] {
  const byUrl = new Set<string>(), bySig = new Set<string>(); const out: Snap[] = [];
  for (const j of list) { const sig = `${j.t}|${j.c}|${j.l}`.toLowerCase().replace(/[^a-z0-9|]/g, ""); if (byUrl.has(j.u) || bySig.has(sig)) continue; byUrl.add(j.u); bySig.add(sig); out.push(j); }
  return out;
}

const discovered = new Set<string>();
const ATS_HOST = /^https?:\/\/(?:(?:job-)?boards(?:\.eu)?\.greenhouse\.io\/[^/?#]+|jobs(?:\.eu)?\.lever\.co\/[^/?#]+|jobs\.ashbyhq\.com\/[^/?#]+|apply\.workable\.com\/[^/?#]+|(?:careers|jobs)\.smartrecruiters\.com\/[^/?#]+|[a-z0-9-]+\.recruitee\.com|[a-z0-9-]+\.jobs\.personio\.(?:de|com)|[a-z0-9-]+\.teamtailor\.com|[a-z0-9-]+\.bamboohr\.com|[a-z0-9-]+\.breezy\.hr|jobs\.jobvite\.com\/[^/?#]+)/i;
async function main() {
  const t0 = Date.now();
  if (existsSync(OUT)) for (const j of (JSON.parse(gunzipSync(readFileSync(OUT)).toString()).jobs || []) as Snap[]) { const m = j.u.match(ATS_HOST); if (m) discovered.add(m[0]); }
  await Promise.all([workdays(), remoteFeeds()]);
  for (const j of jobs) { const m = j.u.match(ATS_HOST); if (m) discovered.add(m[0]); }
  await ats();
  const all = dedupe(jobs);
  // A sudden drop to 0 (or below 40% of the last snapshot) for a source is suspect: keep that source's previous jobs.
  if (existsSync(OUT)) {
    const prev: { jobs: Snap[]; counts: Record<string, number> } = JSON.parse(gunzipSync(readFileSync(OUT)).toString());
    for (const [src, n] of Object.entries(prev.counts || {})) {
      const now = all.filter((j) => j.s === src).length;
      if (n >= 20 && now < n * 0.4) { console.warn(`SUSPECT: ${src} dropped ${n} -> ${now}; keeping previous ${src} jobs`); const keep = prev.jobs.filter((j) => j.s === src); all.splice(0, all.length, ...all.filter((j) => j.s !== src), ...keep); }
    }
  }
  const final = dedupe(all); const c: Record<string, number> = {}; for (const j of final) c[j.s] = (c[j.s] || 0) + 1;
  if (final.length < 500) throw new Error(`Only ${final.length} jobs collected; refusing to overwrite the snapshot.`);
  const snap = { at: new Date().toISOString(), counts: c, workday: { ok: wdOk.sort(), failed: wdFail.sort() }, attribution: "Company boards via outscal/OpenJobs (MIT). Remote jobs from Himalayas, Remote OK, Remotive and Arbeitnow (linked back on every card).", jobs: final };
  mkdirSync(OUT.replace(/\/[^/]+$/, "") || ".", { recursive: true });
  writeFileSync(OUT, gzipSync(JSON.stringify(snap)));
  console.log(JSON.stringify({ total: final.length, counts: c, workdayOk: wdOk.length, workdayFailed: wdFail.length, errors, secs: Math.round((Date.now() - t0) / 1000) }));
}
if (process.argv[1]?.endsWith("collect-jobs.ts")) main().catch((e) => { console.error(e); process.exit(1); });
