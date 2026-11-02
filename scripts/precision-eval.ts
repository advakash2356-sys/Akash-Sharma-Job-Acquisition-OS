/** Precision@20 on the real snapshot for three test profiles (t347u). Relevance = an independent judge regex per profile
 * applied to the title (plus location for the city requirement). Run: npx tsx scripts/precision-eval.ts */
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { matchSnapshot } from "../server/snapshot.js";
import { rankJobs, MIN_SCORE } from "../src/lib/onestop/rubric.js";
import { nearDuplicate } from "../src/lib/dedupe.js";

export const PROFILES = [
  { name: "Lawyer (5 yrs, Delhi)", roles: ["Lawyer", "Legal Counsel"], resume: "Advocate, 5 years. Corporate law, contract drafting, litigation, due diligence, CLM, GDPR. LLB. New Delhi.", location: "Delhi", expYears: 5,
    judge: /\b(counsel|lawyer|legal (associate|manager|officer|advisor|specialist)|advocate|contracts? (manager|specialist|lead))\b/i },
  { name: "Data analyst (3 yrs, Bengaluru)", roles: ["Data Analyst"], resume: "Data analyst, 3 years. SQL, Python, Power BI, Tableau, Excel, dashboards, A/B tests. Bengaluru.", location: "Bengaluru", expYears: 3,
    judge: /\b(data|business intelligence|bi|analytics|reporting|insights?|product|business|marketing|operations|revenue|financial)\b.*\banalyst\b|\banalytics engineer\b|\b(bi|power bi|tableau) developer\b/i },
  { name: "Team lead (8 yrs, customer support, Pune)", roles: ["Team Lead"], resume: "Team lead, 8 years in customer support and operations. Managed 15 agents, SLAs, Zendesk, quality, escalations. Pune.", location: "Pune", expYears: 8,
    judge: /\b(support|customer|service desk|helpdesk|contact cent(er|re)|call cent(er|re)|cx|success|operations)\b.*\b(team lead(er)?|lead|supervisor|manager)\b|\b(team lead(er)?|lead|supervisor)\b.*\b(support|customer|operations|cx)\b/i },
];
export function run(jobs: any[], strict: boolean) {
  return PROFILES.map((p) => {
    const cand = matchSnapshot(jobs, p.roles, 600, strict);
    let ranked = rankJobs(cand.map((j) => ({ ...j })), { resume: p.resume, roles: p.roles, skills: [], location: p.location, expYears: p.expYears }, strict);
    if (strict) { const kept: any[] = []; for (const j of ranked) { if (j.rubric.total < MIN_SCORE) continue; const key = `${j.title}|${j.company}`.toLowerCase().replace(/\b(sr|senior)\b\.?/g, 'senior').replace(/[^a-z|]/g, ''); if (kept.some((k) => k._k === key || nearDuplicate(k, j))) continue; (j as any)._k = key; kept.push(j); } ranked = kept; }
    const top = ranked.slice(0, 20); // Relevant = right role AND workable for an India-based candidate (India or remote).
    const rel = top.filter((j) => p.judge.test(j.title) && (/india|remote|anywhere|worldwide|apac|asia|delhi|bengaluru|bangalore|pune|mumbai|hyderabad|gurgaon|gurugram|noida|chennai/i.test(j.location) || j.category === 'remote')).length;
    return { profile: p.name, candidates: cand.length, shown: ranked.length, p20: top.length ? rel / top.length : 0, sample: top.slice(0, 5).map((j) => `${j.rubric.total} ${j.title} | ${j.company}`) };
  });
}
if (process.argv[1]?.endsWith("precision-eval.ts")) {
  const jobs = JSON.parse(gunzipSync(readFileSync(process.env.SNAP || "data/jobs-snapshot.json.gz")).toString()).jobs;
  for (const strict of [false, true]) { console.log(strict ? "AFTER (strict)" : "BEFORE"); for (const r of run(jobs, strict)) console.log(JSON.stringify(r)); }
}
