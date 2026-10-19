import { AiError, fetchLimited, type CallOpts } from './api';
import { keywordGap } from './insights';
import type { Profile } from '../types';

export interface FoundJob { id: string; title: string; company: string; location: string; url: string; postedAt: string; source: string; workMode: string; description: string; skills: string[]; official?: { url: string; lastDate: string }; govtFeed?: { lastDate: string } }
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

export interface SearchQuery { titles: string[]; countries: string[]; cities?: string[]; remote: boolean; entryLevel?: boolean; govt?: boolean; education?: string }

/** Sends only job titles, places, and the flags above to /api/jobs/search. Never resume text, name, age or contact details. */
export async function searchJobsApi(q: SearchQuery, opts: CallOpts = {}): Promise<SearchResult> {
  const res = await fetchLimited('/api/jobs/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) }, { timeoutMs: 30000, ...opts }, 'The job search');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(data.error || `Job search failed (${res.status}).`, data.code);
  return data.result as SearchResult;
}

export const NCR = ['Delhi', 'New Delhi', 'Gurugram', 'Gurgaon', 'Noida', 'Ghaziabad', 'Faridabad'];
export const isNcr = (loc: string) => /delhi|ncr|noida|gurgaon|gurugram|ghaziabad|faridabad/i.test(loc || '');

/** Preferred-work chips for the short form. Hindi labels, English search terms. */
export const WORK_CHOICES: { id: string; en: string; hi: string; terms: string[] }[] = [
  { id: 'driver', en: 'Driver', hi: 'ड्राइवर', terms: ['driver', 'chauffeur'] },
  { id: 'delivery', en: 'Delivery', hi: 'डिलीवरी', terms: ['delivery executive', 'delivery partner', 'delivery boy'] },
  { id: 'warehouse', en: 'Warehouse', hi: 'वेयरहाउस', terms: ['warehouse', 'loader', 'packer', 'picker'] },
  { id: 'security', en: 'Security guard', hi: 'सिक्योरिटी गार्ड', terms: ['security guard', 'security supervisor'] },
  { id: 'electrician', en: 'Electrician', hi: 'इलेक्ट्रीशियन', terms: ['electrician', 'technician'] },
  { id: 'helper', en: 'Helper', hi: 'हेल्पर', terms: ['helper', 'housekeeping'] },
  { id: 'technician', en: 'Technician / Mechanic', hi: 'टेक्नीशियन / मैकेनिक', terms: ['technician', 'mechanic'] },
  { id: 'housekeeping', en: 'Housekeeping', hi: 'हाउसकीपिंग', terms: ['housekeeping'] },
  { id: 'field', en: 'Field / sales executive', hi: 'फील्ड / सेल्स', terms: ['field executive'] },
  { id: 'operator', en: 'Machine operator', hi: 'मशीन ऑपरेटर', terms: ['machine operator'] },
];
export const EDU_LABELS: Record<string, string> = { '8': '8th pass / 8वीं', '10': '10th pass / 10वीं', '12': '12th pass / 12वीं', iti: 'ITI', diploma: 'Diploma / डिप्लोमा', graduate: 'Graduate / ग्रेजुएट' };

export function manualQuery(p: { workPrefs?: string[]; location: string; education?: string; wantsGovt?: boolean }): SearchQuery {
  const chosen = WORK_CHOICES.filter((w) => (p.workPrefs || []).includes(w.id));
  // one term from each chosen kind first, then the rest, up to 10
  const first = chosen.map((w) => w.terms[0]); const rest = chosen.flatMap((w) => w.terms.slice(1));
  const titles = [...first, ...rest].slice(0, 14);
  const countries = deriveCountries(p.location).length ? deriveCountries(p.location) : ['IN'];
  return { titles, countries, cities: isNcr(p.location) ? NCR : p.location ? [p.location.split(',')[0].trim()] : [], remote: false, entryLevel: true, govt: !!p.wantsGovt, education: p.education || '' };
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
  for (const raw of resume.split(/\n|(?<=[a-z])\.\s+/).slice(0, 120)) {
    const line = raw.replace(/^[\s•*\-–]+/, '').trim();
    if (line.length < 4 || line.length > 70 || !TITLE_RE.test(line) || /certif|licen[cs]|degree|diploma|bachelor|master of|universit|college|school|\b(LLB|LLM|MBA|B\.?A|B\.?Tech)\b/i.test(line)) continue;
    const t = line.split(/\s*(?:\bat\b|@|\||,|\(|\s-\s|–|—)\s*/i)[0].trim();
    if (t.length >= 4 && t.length <= 50 && TITLE_RE.test(t) && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= 3) break;
  }
  return out;
}
export function guessLocation(resume: string): string {
  const head = resume.split('\n').slice(0, 15).join(' ');
  const m = head.match(/\b(Bengaluru|Bangalore|Mumbai|Delhi|New Delhi|Gurugram|Gurgaon|Noida|Hyderabad|Chennai|Pune|Kolkata|Ahmedabad|India|London|Singapore|Dubai|Toronto|New York|San Francisco|Berlin|Sydney)\b(?:,\s*(?:India|UK|USA|Singapore|UAE|Germany|Canada|Australia)\b)?/i);
  return m ? m[0].trim().replace(/[,;]\s*$/, '') : '';
}
