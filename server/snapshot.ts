import { gunzipSync } from "node:zlib";
import type { FoundJob } from "./jobsSearch.js";
import { coreTitles, expandTitle } from "../src/lib/onestop/clusters.js";
const GENERIC = new Set(["associate", "consultant", "analyst", "engineer", "manager", "executive", "specialist", "officer", "lead", "developer", "designer", "teacher", "trainer", "recruiter"]);

/**
 * Reads the 6-hourly job snapshot written by scripts/collect-jobs.ts (Workday, Greenhouse, Lever, Ashby, SmartRecruiters,
 * Workable, Himalayas, Remote OK, Remotive, Arbeitnow) from the repo's `jobs-data` branch, cached 30 min per instance.
 * Only titles are matched here; the CV never reaches the server. Akash Sync Agent (t345u).
 */
export const SNAPSHOT_URL = process.env.JOBS_SNAPSHOT_URL || "https://raw.githubusercontent.com/advakash2356-sys/Akash-Sharma-Job-Acquisition-OS/jobs-data/data/jobs-snapshot.json.gz";
const TTL = 30 * 60 * 1000;
export interface Snap { t: string; c: string; l: string; u: string; d: string; s: string; r: 0 | 1; k: string; v?: 1 }
let cache: { at: number; jobs: Snap[]; stamp: string; counts: Record<string, number> } | null = null;

export async function loadSnapshot(): Promise<NonNullable<typeof cache>> {
  if (cache && Date.now() - cache.at < TTL) return cache;
  const r = await fetch(SNAPSHOT_URL, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`job snapshot HTTP ${r.status}`);
  const j = JSON.parse(gunzipSync(Buffer.from(await r.arrayBuffer())).toString());
  cache = { at: Date.now(), jobs: j.jobs || [], stamp: j.at || "", counts: j.counts || {} };
  return cache;
}

const norm = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9+#&]+/g, " ").trim()} `;
/** Snapshot postings whose title contains one of the titles or their 5-cluster expansions (whole-phrase match). */
export function matchSnapshot(jobs: Snap[], titles: string[], max = 400, strict = true): FoundJob[] {
  // strict (t347u): only the user's titles and the Core + Platform clusters, multi-word or distinctive phrases only.
  const pool = strict ? titles.flatMap((t) => [t, ...coreTitles(t)]) : titles.flatMap((t) => expandTitle(t));
  const phrases = [...new Set(pool.map((p) => norm(p)))].filter((p) => p.trim().length > 2 && (!strict || p.trim().includes(" ") || !GENERIC.has(p.trim())));
  const out: FoundJob[] = [];
  for (const j of jobs) {
    const nt = norm(j.t); if (!phrases.some((p) => nt.includes(p))) continue;
    out.push({ id: `snap:${j.u}`, title: j.t, company: j.c, location: j.l || (j.r ? "Remote" : ""), url: j.u, listingUrl: j.u, postedAt: j.d, source: j.s, workMode: j.r ? "remote" : "", description: `${j.t} at ${j.c}. ${j.l}${j.v ? ". Visa sponsorship / relocation mentioned in the posting." : ""}`, skills: [], countryCodes: [], category: j.k } as FoundJob);
    if (out.length >= max * 3) break;
  }
  return out.sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, max);
}
export async function snapshotJobs(titles: string[]): Promise<FoundJob[]> { return matchSnapshot((await loadSnapshot()).jobs, titles, 400, true); }
