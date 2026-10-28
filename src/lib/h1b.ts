/** H-1B 60-Day Sprint. Information only, not legal advice: confirm with an immigration attorney. Akash Sync Agent.
 *  LCA filter idea (allowlisted DOL columns, skip staffing agencies) adapted from aryaminus/h1b-job-search-mcp (MIT), rewritten. */
export const DISCLAIMER = 'Information only, not legal advice. Confirm your dates and options with an immigration attorney. The grace period is discretionary and rules can change.';
export const SOURCES = [
  { label: 'USCIS: Options for nonimmigrant workers following termination of employment (archived page)', href: 'https://www.uscis.gov/archive/options-for-nonimmigrant-workers-following-termination-of-employment-0' },
  { label: '8 CFR 214.1(l)(2): the up to 60-day grace period (eCFR)', href: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.1' },
  { label: 'USCIS: H-1B specialty occupations (change of employer, portability)', href: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations' },
  { label: 'USCIS: Form I-129 (new employer petition)', href: 'https://www.uscis.gov/i-129' },
  { label: 'USCIS: Form I-539 (change or extend status)', href: 'https://www.uscis.gov/i-539' },
  { label: 'USCIS: Form I-765 (employment authorization, incl. compelling circumstances)', href: 'https://www.uscis.gov/i-765' },
  { label: 'US DOL OFLC: LCA disclosure data (public)', href: 'https://www.dol.gov/agencies/eta/foreign-labor/performance' },
  { label: 'Federal Register: check for proposed or final rule changes', href: 'https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=grace+period+214.1' },
];
const DAY = 86_400_000;
const parse = (s: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN; };
const fmt = (t: number) => new Date(t).toISOString().slice(0, 10);
export interface Deadline { basis: string; from: string; lastDay: string; daysLeft: number; cappedByI94: boolean }
/** Day 1 of the grace period is the day after the end date; the last day is end + 60, or the I-94 end if sooner. */
export function deadline(basis: string, end: string, i94: string, today: string): Deadline | null {
  const e = parse(end); if (isNaN(e)) return null;
  let last = e + 60 * DAY; const cap = parse(i94); const capped = !isNaN(cap) && cap < last; if (capped) last = cap;
  return { basis, from: end, lastDay: fmt(last), daysLeft: Math.round((last - parse(today)) / DAY), cappedByI94: capped };
}
export function sprint(d: { lastWorked: string; officialEnd: string; i94End: string; today: string }) {
  return [deadline('If counted from your last day worked', d.lastWorked, d.i94End, d.today), deadline('If counted from the official employment end date (e.g. last day on payroll)', d.officialEnd, d.i94End, d.today)].filter(Boolean) as Deadline[];
}
export const CHECKLIST: { days: string; task: string; src: number }[] = [
  { days: 'Day 1-3', task: 'Collect your termination letter, final pay slip, I-94 record, I-797 approval and passport. Write down both end dates.', src: 0 },
  { days: 'Day 1-7', task: 'Book a consult with an immigration attorney to confirm which end date counts in your case.', src: 1 },
  { days: 'Day 1-45', task: 'Option A, new employer: an employer files a nonfrivolous H-1B petition (I-129) for you. Eligible H-1B workers may start work once USCIS receives it (portability).', src: 2 },
  { days: 'Day 1-45', task: 'Option B, change of status: file Form I-539 (for example to B-2 or F-1, or H-4 if eligible) before the grace period ends.', src: 4 },
  { days: 'Day 1-45', task: 'Option C, adjustment of status or a compelling circumstances EAD (Form I-765), if eligible.', src: 5 },
  { days: 'Day 30', task: 'Check progress. Leave margin: filings must be received by USCIS before the last day, not just posted.', src: 0 },
  { days: 'Day 50-60', task: 'If nothing is filed, plan departure by the last day (or the I-94 end date, if sooner). Dependants are affected too.', src: 0 },
  { days: 'Any day', task: 'Watch the Federal Register for proposed or final changes to the grace period rule.', src: 7 },
];
export const KEEP = ['EMPLOYER_NAME', 'JOB_TITLE', 'SOC_TITLE', 'WORKSITE_CITY', 'WORKSITE_STATE', 'CASE_STATUS', 'WAGE_RATE_OF_PAY_FROM', 'WAGE_UNIT_OF_PAY', 'PREVAILING_WAGE'] as const;
export type Lca = Partial<Record<(typeof KEEP)[number], string>>;
/** RFC-4180-ish CSV parser. Keeps only allowlisted business columns: no contact or attorney names are read. */
export function parseLcaCsv(text: string, max = 200_000): Lca[] {
  const rows: string[][] = []; let row: string[] = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; if (rows.length > max) break; } else f += c; }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = (rows.shift() || []).map((h) => h.trim().toUpperCase()); const idx = KEEP.map((k) => head.indexOf(k));
  if (idx[0] < 0) throw new Error('This file has no EMPLOYER_NAME column. Use the DOL LCA disclosure file saved as CSV.');
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(KEEP.map((k, j) => [k, idx[j] >= 0 ? (r[idx[j]] || '').trim() : '']).filter(([, v]) => v)) as Lca);
}
const STAFFING = /\b(staffing|consult(ing|ancy|ants)?|solutions|technologies|infotech|systems inc|it services)\b/i;
const annual = (r: Lca) => { const v = parseFloat((r.WAGE_RATE_OF_PAY_FROM || r.PREVAILING_WAGE || '').replace(/[$,]/g, '')); if (!v) return 0; const u = (r.WAGE_UNIT_OF_PAY || 'Year').toLowerCase(); return u.startsWith('hour') ? v * 2080 : u.startsWith('week') ? v * 52 : u.startsWith('month') ? v * 12 : u.startsWith('bi') ? v * 26 : v; };
export interface EmployerRow { employer: string; filings: number; titles: string[]; medianWage: number; states: string[] }
export function filterEmployers(rows: Lca[], o: { title?: string; state?: string; city?: string; certifiedOnly?: boolean; skipStaffing?: boolean; minWage?: number }): EmployerRow[] {
  const t = (o.title || '').toLowerCase().trim(), st = (o.state || '').toUpperCase().trim(), ct = (o.city || '').toLowerCase().trim(); const m = new Map<string, Lca[]>();
  for (const r of rows) { if (!r.EMPLOYER_NAME) continue;
    if (o.certifiedOnly !== false && r.CASE_STATUS && !/^certified$/i.test(r.CASE_STATUS)) continue;
    if (t && !`${r.JOB_TITLE || ''} ${r.SOC_TITLE || ''}`.toLowerCase().includes(t)) continue;
    if (st && (r.WORKSITE_STATE || '').toUpperCase() !== st) continue;
    if (ct && !(r.WORKSITE_CITY || '').toLowerCase().includes(ct)) continue;
    if (o.skipStaffing && STAFFING.test(r.EMPLOYER_NAME)) continue;
    if (o.minWage && annual(r) < o.minWage) continue;
    const k = r.EMPLOYER_NAME.toUpperCase(); m.set(k, [...(m.get(k) || []), r]); }
  return [...m.values()].map((rs) => { const w = rs.map(annual).filter(Boolean).sort((a, b) => a - b);
    return { employer: rs[0].EMPLOYER_NAME!, filings: rs.length, titles: [...new Set(rs.map((r) => r.JOB_TITLE || r.SOC_TITLE || '').filter(Boolean))].slice(0, 3), medianWage: w.length ? Math.round(w[Math.floor(w.length / 2)]) : 0, states: [...new Set(rs.map((r) => r.WORKSITE_STATE || '').filter(Boolean))] }; })
    .sort((a, b) => b.filings - a.filings);
}
/** MADE-UP sample rows so the filter can be tried without a download. Not real employers or filings. */
export const SAMPLE_CSV = `EMPLOYER_NAME,JOB_TITLE,SOC_TITLE,WORKSITE_CITY,WORKSITE_STATE,CASE_STATUS,WAGE_RATE_OF_PAY_FROM,WAGE_UNIT_OF_PAY,EMPLOYER_POC_EMAIL
Sample Cloud Co (made up),Software Engineer,Software Developers,Seattle,WA,Certified,"$165,000",Year,x@example.com
Sample Cloud Co (made up),Data Engineer,Software Developers,Seattle,WA,Certified,150000,Year,x@example.com
Sample Health Labs (made up),Data Scientist,Data Scientists,Boston,MA,Certified,140000,Year,x@example.com
Sample Staffing Solutions (made up),Software Engineer,Software Developers,Dallas,TX,Certified,45,Hour,x@example.com
Sample Retail Inc (made up),Software Engineer,Software Developers,Austin,TX,Withdrawn,130000,Year,x@example.com
Sample Fintech (made up),Backend Engineer,Software Developers,New York,NY,Certified,175000,Year,x@example.com`;
