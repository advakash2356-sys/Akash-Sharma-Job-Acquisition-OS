import { AiError, authedFetch, fetchLimited, type CallOpts } from './api';
import { keywordGap } from './insights';
import { nearDuplicate } from './dedupe';
export { nearDuplicate } from './dedupe';
import type { Profile } from '../types';
import { inferCandidate, type Candidate, type Decision, type WorkMode } from './eligibility';

export interface FoundJob { id: string; title: string; company: string; location: string; url: string; postedAt: string; source: string; workMode: string; description: string; skills: string[]; official?: { url: string; lastDate: string }; govtFeed?: { lastDate: string }; mode?: WorkMode; decision?: Decision; eligibility?: { evidence: string[] }; category?: import('./onestop/category').Category }
export interface SearchResult { jobs: FoundJob[]; total: number; queries: string[]; warnings: string[]; cached: boolean; hidden?: { total: number; reasons: { badge: string; count: number; example: string }[] }; sources?: string[] }

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

export interface SearchQuery { titles: string[]; countries: string[]; cities?: string[]; remote: boolean; candidate?: Candidate; location?: string; entryLevel?: boolean; govt?: boolean; education?: string }

/** Sends only job titles, places, and the flags above to /api/jobs/search. Never resume text, name, age or contact details. */
export async function searchJobsApi(q: SearchQuery, opts: CallOpts = {}): Promise<SearchResult> {
  const res = await authedFetch('/api/jobs/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) }, { timeoutMs: 30000, ...opts }, 'The job search');
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

/** Search scope from the candidate's eligibility profile (inferred from the resume, editable on My resume):
 *  on-site/hybrid in their city (all of NCR for Delhi-area places) and country (plus relocation countries), remote only where they are eligible. */
export function candidateOf(p: Pick<Profile, 'location' | 'resumeText' | 'targetRoles' | 'headline' | 'elig'>, loc = p.location): Candidate {
  return inferCandidate({ location: loc, resumeText: p.resumeText, targetRoles: p.targetRoles, headline: p.headline, elig: p.elig });
}
export function placeQuery(titles: string[], location: string, p: Pick<Profile, 'location' | 'resumeText' | 'targetRoles' | 'headline' | 'elig'>): SearchQuery {
  const cand = candidateOf(p, location || p.location);
  const city = cand.city || (location || '').split(',')[0].trim();
  const cities = isNcr(location) || isNcr(city) ? NCR : city && !/^(india|remote)$/i.test(city) && /^[A-Za-z .'-]{2,40}$/.test(city) ? [city] : [];
  return { titles, countries: [cand.residence], cities, remote: cand.modes.includes('remote'), candidate: cand, location };
}

/** Location part of the fit, from the eligibility decision: 0 near you or eligible remote, -10 elsewhere in your country or relocation, -15 unclear. */
export function locationAdjust(jobLocation: string, q: SearchQuery, d?: Decision): { delta: number; label: string } {
  const l = (jobLocation || '').toLowerCase();
  if (d?.kind === 'remote-ok') return { delta: 0, label: d.badge };
  if (d?.kind === 'remote-unclear') return { delta: -15, label: d.badge };
  if (d?.kind === 'relocate') return { delta: -10, label: d.badge };
  if (q.cities?.some((c) => l.includes(c.toLowerCase()))) return { delta: 0, label: `in ${q.cities.length > 2 ? 'your area' : q.cities[0]}` };
  return { delta: -10, label: d?.badge || 'elsewhere in your country' };
}

/** Plain keyword overlap between the resume and the posting text. No AI. */
export function keywordFit(resume: string, j: FoundJob) {
  const text = `${j.title} ${j.description}`; // same text as jobKeywordText, so list, job page and detail agree
  const g = keywordGap(resume, text);
  return { score: g.pct, summary: g.hit.length ? `Resume mentions ${g.hit.slice(0, 5).join(', ')}.` : 'Few keyword overlaps with your resume.' };
}

export function dedupeAgainst<T extends { url: string; title?: string; description?: string }>(incoming: T[], existing: { url: string; title?: string; description?: string }[]) {
  const have = new Set(existing.map((e) => e.url).filter(Boolean));
  const kept: { title?: string; description?: string }[] = [...existing];
  return incoming.filter((j) => {
    if (have.has(j.url) || kept.some((k) => nearDuplicate(k, j))) return false;
    kept.push(j); return true;
  });
}

export type { Profile };

export { guessTitles } from './guessTitles';
import { guessTitles } from './guessTitles';
export function guessLocation(resume: string): string {
  const head = resume.split('\n').slice(0, 15).join(' ');
  const m = head.match(/\b(Bengaluru|Bangalore|Mumbai|Delhi|New Delhi|Gurugram|Gurgaon|Noida|Hyderabad|Chennai|Pune|Kolkata|Ahmedabad|India|London|Singapore|Dubai|Toronto|New York|San Francisco|Berlin|Sydney)\b(?:,\s*(?:India|UK|USA|Singapore|UAE|Germany|Canada|Australia)\b)?/i);
  return m ? m[0].trim().replace(/[,;]\s*$/, '') : '';
}
