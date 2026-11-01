// Pure filter for live postings (so CI can test it with fixtures). Akash Sync Agent.
import { daysLeft } from './rank';
export interface Filter { q: string; state: string; lesser: boolean; official: boolean; soon: boolean; deputation: boolean }
export interface Filterable { title: string; org: string; location: string; eligibility: string; state: string; lesserKnown: boolean; official: boolean; lastDate: string; employmentType?: string }
export function filterPostings<T extends Filterable>(list: T[], f: Filter, today?: string): T[] {
  return list.filter((p) => (!f.state || p.state === f.state || p.state === 'All India') && (!f.lesser || p.lesserKnown) && (!f.official || p.official) && (!f.soon || daysLeft(p.lastDate, today) <= 7)
    && (f.deputation || p.employmentType !== 'deputation')
    && (!f.q || `${p.title} ${p.org} ${p.location} ${p.eligibility}`.toLowerCase().includes(f.q.toLowerCase())));
}
