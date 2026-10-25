/** Profile match: compares a LinkedIn profile the user pastes or exports with their resume.
 *  Runs only in the browser, on text the user provides. No scraping, no AI, nothing sent anywhere.
 *  Idea ported from Akash Sync Agent's "LinkedIn footprint mapper" (MIT), rebuilt on real user data. */
export interface Role { title: string; company: string; start?: string; end?: string }
export interface MatchReport { onlyLinkedIn: Role[]; onlyResume: string[]; dateMismatch: { role: Role; resumeYears: string[] }[]; emailMismatch?: { linkedin: string; resume: string }; skillsMissing: string[]; matched: number; score: number }

const norm = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]+/g, ' ').replace(/\b(pvt|private|ltd|limited|llp|inc|llc|co|corp|corporation|the)\b/g, ' ').replace(/\s+/g, ' ').trim();
const years = (s = '') => s.match(/\b(19|20)\d{2}\b/g) || [];

/** Parses a CSV line with quotes. */
function csvRow(line: string): string[] {
  const out: string[] = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) { const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c; }
  out.push(cur); return out.map((x) => x.trim());
}
function csvRecords(text: string): string[] { // joins quoted newlines
  const recs: string[] = []; let buf = '';
  for (const l of text.replace(/\r/g, '').split('\n')) { buf = buf ? buf + '\n' + l : l; if ((buf.match(/"/g) || []).length % 2 === 0) { if (buf.trim()) recs.push(buf); buf = ''; } }
  return recs;
}

/** LinkedIn data export Positions.csv: Company Name,Title,Description,Location,Started On,Finished On */
export function parsePositionsCsv(text: string): Role[] | null {
  const recs = csvRecords(text); if (recs.length < 2) return null;
  const h = csvRow(recs[0]).map((x) => x.toLowerCase());
  const ci = h.indexOf('company name'), ti = h.indexOf('title'); if (ci < 0 || ti < 0) return null;
  const si = h.indexOf('started on'), ei = h.indexOf('finished on');
  return recs.slice(1).map(csvRow).filter((r) => r[ci] || r[ti]).map((r) => ({ company: r[ci] || '', title: r[ti] || '', start: si >= 0 ? r[si] : undefined, end: ei >= 0 ? (r[ei] || 'Present') : undefined }));
}

const DATE = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?((?:19|20)\d{2})\s*[-–—]\s*((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}|present|current|now)/i;
/** Pasted "Experience" section from a LinkedIn profile page (Ctrl+A, Ctrl+C). Best effort: title line, company line, date line. */
export function parsePastedProfile(text: string): Role[] {
  const lines = text.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
  const roles: Role[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(DATE); if (!m) continue;
    const before = lines.slice(Math.max(0, i - 3), i).filter((l) => !DATE.test(l) && l.length < 120);
    if (before.length < 2) continue;
    const title = before[before.length - 2], company = before[before.length - 1].split('·')[0].trim();
    roles.push({ title, company, start: `${m[1] || ''}${m[2]}`.trim(), end: m[3] });
  }
  const seen = new Set<string>(); return roles.filter((r) => { const k = norm(r.title + '|' + r.company); if (seen.has(k)) return false; seen.add(k); return true; });
}

export function parseSkills(text: string): string[] {
  const recs = csvRecords(text); const h = recs[0] ? csvRow(recs[0]).map((x) => x.toLowerCase()) : [];
  if (h.length === 1 && h[0] === 'name') return recs.slice(1).map((r) => csvRow(r)[0]).filter(Boolean);
  const m = text.match(/(?:^|\n)\s*(?:top\s+)?skills\s*:?\s*\n?([^\n]+)/i);
  return m ? m[1].split(/[,•·|]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 40) : [];
}

const EMAIL = /[a-z0-9_.+-]+@[a-z0-9-]+\.[a-z0-9.-]+/i;

export function compare(roles: Role[], resume: string, opts: { skills?: string[]; linkedinEmail?: string } = {}): MatchReport {
  const R = norm(resume); const rLines = resume.split('\n');
  const onlyLinkedIn: Role[] = []; const dateMismatch: MatchReport['dateMismatch'] = []; let matched = 0;
  for (const role of roles) {
    const c = norm(role.company); if (!c) continue;
    if (!R.includes(c)) { onlyLinkedIn.push(role); continue; }
    matched++;
    const idx = rLines.findIndex((l) => norm(l).includes(c));
    const near = rLines.slice(Math.max(0, idx - 2), idx + 3).join(' ');
    const ry = [...new Set(years(near))]; const ly = years(`${role.start} ${role.end}`);
    if (ry.length && ly.length && !ly.every((y) => ry.includes(y))) dateMismatch.push({ role, resumeYears: ry });
  }
  const known = new Set(roles.map((r) => norm(r.company)));
  const onlyResume = [...new Set(rLines.filter((l) => /\b(pvt|ltd|limited|llp|inc|llc|corp|associates|chambers|bank|technologies|solutions|services)\b/i.test(l) && l.length < 100)
    .map((l) => l.replace(/[|•·].*$/, '').replace(DATE, '').trim()).filter((l) => l && ![...known].some((k) => k && norm(l).includes(k))))].slice(0, 10);
  const skillsMissing = (opts.skills || []).filter((s) => !R.includes(norm(s)));
  const re = resume.match(EMAIL)?.[0]; const le = opts.linkedinEmail?.match(EMAIL)?.[0];
  const emailMismatch = re && le && re.toLowerCase() !== le.toLowerCase() ? { linkedin: le, resume: re } : undefined;
  const issues = onlyLinkedIn.length + dateMismatch.length + (emailMismatch ? 1 : 0);
  const score = roles.length ? Math.max(0, Math.round(100 * (matched - dateMismatch.length * 0.5) / Math.max(1, roles.length)) - (emailMismatch ? 5 : 0)) : 0;
  return { onlyLinkedIn, onlyResume, dateMismatch, emailMismatch, skillsMissing, matched, score: issues ? Math.min(score, 95) : score };
}
