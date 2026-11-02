/**
 * Deterministic 100-point fit score, no AI key (t345u). Akash Sync Agent.
 *  Platform/skills 35 · Role/seniority 30 · Domain 20 · Location/shift 15, then penalties (-30 to -50).
 * Pattern from srbhr/Resume-Matcher (Apache-2.0) services/ats.py: skills coverage + literal title match + keyword
 * match as separate sub-scores. BM25 relevance via lucaong/minisearch (MIT). Runs in the browser; the CV never leaves it.
 */
import MiniSearch from 'minisearch';
import { expandTitle, familyOf } from './clusters';
import { ageCapped, type Category } from './category';

export interface RubricJob { id: string; title: string; company: string; location: string; description: string; category?: Category; workMode?: string }
export interface RubricProfile { resume: string; roles: string[]; skills: string[]; location: string; expYears?: number; age?: number; remoteOk?: boolean }
export interface Breakdown { total: number; skills: number; role: number; domain: number; location: number; penalty: number; reasons: string[] }

const SKILL_RE = /\b(python|java(script)?|typescript|react|node(\.js)?|angular|vue|sql|excel|power ?bi|tableau|aws|azure|gcp|docker|kubernetes|terraform|linux|go(lang)?|rust|c\+\+|c#|\.net|spark|hadoop|airflow|snowflake|salesforce|sap|oracle|workday|servicenow|jira|figma|photoshop|seo|google ads|hubspot|tally|gst|ifrs|gaap|siem|splunk|qradar|sentinel|crowdstrike|nmap|iso 27001|soc ?2|gdpr|dpdp|clm|icertis|ironclad|contract drafting|litigation|due diligence|pmp|scrum|agile|six sigma|autocad|solidworks|matlab|r\b|pandas|pytorch|tensorflow|llm|nlp|genai|machine learning|deep learning|selenium|cypress|graphql|kafka|redis|mongodb|postgres(ql)?|mysql)\b/gi;
export const skillsIn = (t: string) => [...new Set((t.match(SKILL_RE) || []).map((s) => s.toLowerCase().replace(/\s+/g, ' ')))];
const SENIOR = /\b(senior|sr\.?|lead|principal|staff|head|director|vp|manager|architect)\b/i, JUNIOR = /\b(intern|junior|jr\.?|trainee|graduate|fresher|associate|entry)\b/i;
const LICENCE: [RegExp, RegExp, string][] = [
  [/\b(bar admission|admitted to (the )?(state )?bar|licensed attorney|jd required|solicitor qualified)\b/i, /\b(bar|attorney|solicitor|jd)\b/i, 'needs a foreign bar licence'],
  [/\b(cpa required|licensed cpa|chartered accountant required|\bca required)\b/i, /\b(cpa|chartered accountant|\bca\b|icai)\b/i, 'needs a CPA/CA licence'],
  [/\b(rn licen[cs]e|registered nurse licen[cs]e|nclex|medical licen[cs]e|board certified)\b/i, /\b(rn|nclex|nursing council|mci|nmc)\b/i, 'needs a medical licence'],
];
const CLEARANCE = /\b(security clearance|ts\/sci|secret clearance|public trust|us citizen(ship)? required|must be a us citizen|sc clearance|dv clearance)\b/i;

/** Ranks jobs: BM25 (MiniSearch) over title+description against the CV, plus the 100-point rubric. Highest first. */
export function rankJobs<T extends RubricJob>(jobs: T[], p: RubricProfile): (T & { rubric: Breakdown })[] {
  const ms = new MiniSearch<RubricJob>({ fields: ['title', 'description'], storeFields: [], searchOptions: { boost: { title: 3 }, fuzzy: 0.15, prefix: true } });
  ms.addAll(jobs.map((j) => ({ ...j, id: j.id })));
  const q = [...p.roles.flatMap((r) => expandTitle(r, 6)), ...p.skills].join(' ') || p.resume.slice(0, 600);
  const bm = new Map<string, number>(); let top = 0;
  for (const r of ms.search(q, { combineWith: 'OR' })) { bm.set(String(r.id), r.score); top = Math.max(top, r.score); }
  return jobs.map((j) => ({ ...j, rubric: score(j, p, top ? (bm.get(j.id) || 0) / top : 0) })).sort((a, b) => b.rubric.total - a.rubric.total);
}

export function score(j: RubricJob, p: RubricProfile, bm25 = 0): Breakdown {
  const reasons: string[] = []; const text = `${j.title} ${j.description}`; const cvSkills = new Set([...p.skills.map((s) => s.toLowerCase()), ...skillsIn(p.resume)]);
  // Skills / platform 35: Resume-Matcher style coverage of the job's named skills; BM25 fills in when the job names none.
  const js = skillsIn(text); const hit = js.filter((s) => cvSkills.has(s));
  const skills = Math.round(js.length ? 35 * (0.75 * hit.length / js.length + 0.25 * bm25) : 35 * bm25 * 0.8);
  if (hit.length) reasons.push(`Skills: ${hit.slice(0, 4).join(', ')}`);
  // Role / seniority 30: literal title match 20 (Resume-Matcher title_match), seniority fit 10.
  const t = j.title.toLowerCase(); const exact = p.roles.some((r) => r && t.includes(r.toLowerCase()));
  const fam = p.roles.map(familyOf).filter(Boolean); const sameFam = fam.length && fam.includes(familyOf(j.title));
  let role = exact ? 20 : sameFam ? 14 : Math.round(12 * bm25);
  const y = p.expYears ?? -1; const sen = SENIOR.test(j.title), jun = JUNIOR.test(j.title);
  const lvl = y < 0 ? 6 : sen ? (y >= 5 ? 10 : y >= 3 ? 6 : 1) : jun ? (y <= 2 ? 10 : y <= 4 ? 5 : 2) : (y >= 1 && y <= 8 ? 10 : 6);
  role += lvl; if (exact) reasons.push('Title matches your target role'); else if (sameFam) reasons.push('Related title (same role family)');
  // Domain 20: shared domain words (BM25 relevance) between CV and posting.
  const domain = Math.round(20 * Math.min(1, bm25 * 1.1));
  // Location / shift 15.
  const loc = (j.location || '').toLowerCase(); const home = p.location.toLowerCase().split(/[,/]/)[0].trim();
  const remote = j.category === 'remote' || /remote/.test(loc) || /remote/i.test(j.workMode || '');
  const location = home && loc.includes(home) ? 15 : remote ? (p.remoteOk === false ? 5 : 13) : /india/.test(loc) && /india|delhi|mumbai|bengal|bangalore|pune|hyderabad|chennai|noida|gurgaon|gurugram/.test(p.location.toLowerCase()) ? 10 : j.category === 'international' ? 4 : loc ? 6 : 8;
  if (location >= 13) reasons.push(remote ? 'Remote' : 'In your city');
  // Penalties.
  let penalty = 0;
  for (const [need, has, why] of LICENCE) if (need.test(text) && !has.test(p.resume)) { penalty -= 50; reasons.push(`Penalty: ${why}`); break; }
  if (CLEARANCE.test(text) && !CLEARANCE.test(p.resume)) { penalty -= 50; reasons.push('Penalty: needs security clearance / citizenship'); }
  if (j.category && ageCapped(j.category) && p.age) { const m = text.match(/(?:upper )?age (?:limit)?[^0-9]{0,20}(\d{2})\s*(?:-|to)\s*(\d{2})/i); if (m && (p.age > Number(m[2]) || p.age < Number(m[1]))) { penalty -= 50; reasons.push(`Penalty: age limit ${m[1]}-${m[2]}`); } }
  if (y >= 0 && ((sen && y < 1) || (jun && y > 6))) { penalty -= 30; reasons.push(sen ? 'Penalty: more senior than your experience' : 'Penalty: below your level'); }
  const total = Math.max(0, Math.min(100, skills + role + domain + location + penalty));
  return { total, skills, role, domain, location, penalty, reasons };
}
