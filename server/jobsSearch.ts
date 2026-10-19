import { ApiError } from "./handlers.js";

/**
 * Real job postings from FreeHire's public keyless API (https://freehire.me/docs/api, MIT).
 * Only search keywords and place filters are sent upstream. Never resume text.
 */
const BASE = "https://freehire.me/api/v1/jobs/search";
const TTL_MS = 10 * 60 * 1000;
const MAX_CACHE = 200;
const PER_TITLE = 25;
const MAX_RESULTS = 40;
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 12; // searches per client per minute (each = up to 8 upstream calls; FreeHire allows 600/min)

export interface FoundJob {
  id: string; title: string; company: string; location: string; url: string;
  postedAt: string; source: string; workMode: string; description: string; skills: string[];
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

export function parseInput(body: any) {
  const titles = [...new Set((Array.isArray(body?.titles) ? body.titles : []).map((t: unknown) => clean(t, 80)).filter((t: string) => t.length >= 2))].slice(0, 4) as string[];
  if (!titles.length) throw new ApiError(400, "Add at least one target job title to search for.", "BAD_INPUT");
  const countries = [...new Set((Array.isArray(body?.countries) ? body.countries : []).map((c: unknown) => String(c).toUpperCase()).filter((c: string) => /^[A-Z]{2}$/.test(c)))].slice(0, 3) as string[];
  const remote = body?.remote !== false;
  if (!countries.length && !remote) throw new ApiError(400, "Pick a country or include remote roles.", "BAD_INPUT");
  return { titles, countries, remote };
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
  const { titles, countries, remote } = parseInput(body);
  const key = JSON.stringify([titles.map((t) => t.toLowerCase()), countries, remote]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return { ...hit.out, cached: true };

  const reqs: { label: string; params: Record<string, string> }[] = [];
  for (const t of titles) {
    const base = { q: `"${t}"`, q_fields: "title", limit: String(PER_TITLE) };
    if (countries.length) reqs.push({ label: `"${t}" in ${countries.join("/")}`, params: { ...base, countries: countries.join(",") } });
    if (remote) reqs.push({ label: `"${t}" remote (global/APAC)`, params: { ...base, work_mode: "remote", regions: "global,apac" } });
  }
  const results = await Promise.allSettled(reqs.map((r) => fetchOne(r.params)));
  const warnings: string[] = [];
  const seen = new Set<string>(); const sig = new Set<string>(); const jobs: FoundJob[] = [];
  let total = 0, ok = 0;
  results.forEach((r, i) => {
    if (r.status === "rejected") { warnings.push(`${reqs[i].label}: ${r.reason?.message || "failed"}`); return; }
    ok++; total += r.value.total;
    for (const raw of r.value.data) {
      const j = validate(raw); if (!j) continue;
      const s = `${j.title}|${j.company}|${j.location}`.toLowerCase();
      if (seen.has(j.id) || seen.has(j.url) || sig.has(s)) continue;
      seen.add(j.id); seen.add(j.url); sig.add(s); jobs.push(j);
    }
  });
  if (!ok) throw new ApiError(502, `FreeHire could not be reached. ${warnings[0] || ""}`.trim(), "FREEHIRE_DOWN");
  const exact = (j: FoundJob) => (titles.some((t) => j.title.toLowerCase().includes(t.toLowerCase())) ? 1 : 0);
  jobs.sort((a, b) => exact(b) - exact(a) || b.postedAt.localeCompare(a.postedAt)); // exact title phrase first, then newest
  const out: SearchOut = { jobs: jobs.slice(0, MAX_RESULTS), total, queries: reqs.map((r) => r.label), warnings, cached: false, provider: "freehire" };
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), out });
  return out;
}
