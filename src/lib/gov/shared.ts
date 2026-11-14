// One profile drives both searches (t332u): read the main JAOS job-search profile (jaos_profile_v1, browser only) and map it to gov fields + ranking keywords. Akash Sync Agent.
import type { Profile as AppProfile } from '../../types';
import type { Edu, Profile as GovProfile, Spec } from '../govJobs';
const STOP = new Set('and or the of in for with to a an at on as by from my me i we our years year experience work worked working team senior junior lead manager executive officer assistant'.split(' '));
export function expYearsOf(a: Partial<AppProfile>): number | undefined {
  const t = `${a.experience || ''}\n${a.headline || ''}\n${(a.resumeText || '').slice(0, 4000)}`;
  const m = [...t.matchAll(/(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\b/gi)].map((x) => Number(x[1])).filter((n) => n > 0 && n <= 45);
  return m.length ? Math.round(Math.max(...m)) : undefined;
}
export function specOf(a: Partial<AppProfile>): Spec {
  const t = `${a.headline || ''} ${a.targetRoles || ''} ${a.skills || ''} ${a.experience || ''} ${(a.resumeText || '').slice(0, 4000)}`;
  if (/\b(ll\.?b|ll\.?m|advocate|lawyer|legal|litigation|law officer|counsel|bar council)\b/i.test(t)) return 'law';
  if (/\b(chartered accountant|\bca\b|cma|icwa|company secretary|accountant|finance|audit)\b/i.test(t)) return 'finance';
  if (/\b(mbbs|doctor|nurse|pharmacist|physician|dental)\b/i.test(t)) return 'medical';
  if (/\b(b\.?\s?ed|teacher|lecturer|assistant professor|faculty)\b/i.test(t)) return 'teaching';
  if (/\b(b\.?tech|b\.?e\.|engineer|engineering|developer|software)\b/i.test(t)) return 'engineering';
  return '';
}
export function eduOf(a: Partial<AppProfile>): Edu | undefined {
  const t = `${a.headline || ''} ${(a.resumeText || '').slice(0, 4000)}`;
  if (/\b(ph\.?\s?d|doctorate)\b/i.test(t)) return 'phd';
  if (/\b(ll\.?m|m\.?a\.?|m\.?sc|m\.?com|mba|pgdm|post[- ]?graduat\w*|master'?s)\b/i.test(t)) return 'pg';
  if (/\b(b\.?tech|b\.?e\.)\b/i.test(t)) return 'eng';
  if (/\b(ll\.?b|b\.?a\.?|b\.?com|b\.?sc|bba|bca|graduat\w*|bachelor'?s)\b/i.test(t) || a.education === 'graduate') return 'grad';
  const m: Record<string, Edu> = { '10': '10', '12': '12', iti: 'iti', diploma: 'diploma' }; return a.education ? m[a.education] : undefined;
}
/** Words that describe the person's work: target roles, headline, skills. Used to weight title/eligibility overlap. */
export function profileKeywords(a: Partial<AppProfile>): string[] {
  const words = `${a.targetRoles || ''},${a.headline || ''},${a.skills || ''}`.toLowerCase().split(/[^a-z+#.]+/).filter((w) => w.length > 2 && !STOP.has(w));
  return [...new Set(words)].slice(0, 25);
}
/** Fill only the gov fields the user has not set yet; never overwrite their own gov answers. */
export function prefillGov(g: GovProfile, a?: Partial<AppProfile> | null, states: string[] = []): GovProfile {
  if (!a) return g; const out = { ...g };
  if (out.expYears === undefined) { const y = expYearsOf(a); if (y !== undefined) out.expYears = y; }
  if (!out.spec) { const s = specOf(a); if (s) out.spec = s; }
  if (!out.state && a.location) { const st = states.find((s) => a.location!.toLowerCase().includes(s.toLowerCase())); if (st) out.state = st; }
  if (!out.dob && a.age && /^\d{2}$/.test(a.age)) { /* age only: leave DOB for the user, never guess a birth date */ }
  if (!out.eduSet) { const e = eduOf(a); if (e) out.edu = e; }
  return out;
}
