import { AiError } from './api';
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
export async function searchJobsApi(titles: string[], countries: string[], remote: boolean): Promise<SearchResult> {
  let res: Response;
  try {
    res = await fetch('/api/jobs/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titles, countries, remote }) });
  } catch { throw new AiError('Network error while searching jobs. Check your connection and try again.'); }
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
