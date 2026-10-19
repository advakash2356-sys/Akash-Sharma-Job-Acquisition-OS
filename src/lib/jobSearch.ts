import { AiError, fetchLimited, type CallOpts } from './api';
import { keywordGap } from './insights';
import type { Profile } from '../types';

export interface FoundJob { id: string; title: string; company: string; location: string; url: string; postedAt: string; source: string; workMode: string; description: string; skills: string[] }
export interface SearchResult { jobs: FoundJob[]; total: number; queries: string[]; warnings: string[]; cached: boolean }

const COUNTRIES: [RegExp, string][] = [
  [/india|bengaluru|bangalore|mumbai|delhi|gurgaon|gurugram|noida|hyderabad|chennai|pune|kolkata|ahmedabad|jaipur|kochi/i, 'IN'],
  [/united states|\busa\b|\bus\b|new york|san francisco|texas|california/i, 'US'],
  [/united kingdom|\buk\b|london|manchester/i, 'GB'],
  [/canada|toronto|vancouver/i, 'CA'], [/germany|berlin|munich/i, 'DE'], [/singapore/i, 'SG'],
  [/uae|dubai|abu dhabi|emirates/i, 'AE'], [/australia|sydney|melbourne/i, 'AU'],
];
export const COUNTRY_NAMES: Record<string, string> = { IN: 'India', US: 'United States', GB: 'United Kingdom', CA: 'Canada', DE: 'Germany', SG: 'Singapore', AE: 'UAE', AU: 'Australia' };

export function deriveCountries(location: string): string[] {
  const hit = COUNTRIES.find(([re]) => re.test(location || ''));
  return hit ? [hit[1]] : [];
}
export const splitTitles = (s: string) => s.split(/[,;\n]/).map((t) => t.trim()).filter(Boolean).slice(0, 4);

/** Sends only job titles and place filters to /api/jobs/search. Never resume text. */
export async function searchJobsApi(titles: string[], countries: string[], remote: boolean, opts: CallOpts = {}): Promise<SearchResult> {
  const res = await fetchLimited('/api/jobs/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titles, countries, remote }) }, { timeoutMs: 30000, ...opts }, 'The job search');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(data.error || `Job search failed (${res.status}).`, data.code);
  return data.result as SearchResult;
}

/** Plain keyword overlap between the resume and the posting text. No AI. */
export function keywordFit(resume: string, j: FoundJob) {
  const text = `${j.title} ${j.skills.join(' ')} ${j.description}`;
  const g = keywordGap(resume, text);
  return { score: g.pct, summary: g.hit.length ? `Resume mentions ${g.hit.slice(0, 5).join(', ')}.` : 'Few keyword overlaps with your resume.' };
}

export function dedupeAgainst<T extends { url: string }>(incoming: T[], existing: { url: string }[]) {
  const have = new Set(existing.map((e) => e.url).filter(Boolean));
  return incoming.filter((j) => !have.has(j.url));
}
export type { Profile };

const TITLE_RE = /\b(manager|counsel|lead|analyst|engineer|officer|associate|executive|specialist|director|consultant|developer|designer|head|coordinator|administrator|advisor|architect|scientist|accountant)\b/i;
/** Guess job titles from resume lines, without AI. Looks for short lines that read like a title. */
export function guessTitles(resume: string): string[] {
  const out: string[] = [];
  for (const raw of resume.split('\n').slice(0, 80)) {
    const line = raw.replace(/^[\s•*\-–]+/, '').trim();
    if (line.length < 4 || line.length > 70 || !TITLE_RE.test(line)) continue;
    const t = line.split(/\s*(?:\bat\b|@|\||,|\(|\s-\s|–|—)\s*/i)[0].trim();
    if (t.length >= 4 && t.length <= 50 && TITLE_RE.test(t) && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= 3) break;
  }
  return out;
}
export function guessLocation(resume: string): string {
  const head = resume.split('\n').slice(0, 15).join(' ');
  const m = head.match(/\b(Bengaluru|Bangalore|Mumbai|Delhi|New Delhi|Gurugram|Gurgaon|Noida|Hyderabad|Chennai|Pune|Kolkata|Ahmedabad|India|London|Singapore|Dubai|Toronto|New York|San Francisco|Berlin|Sydney)\b[^|\n]{0,20}/i);
  return m ? m[0].trim().replace(/[,;]\s*$/, '') : '';
}
