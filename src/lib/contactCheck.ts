/** Checks that the user's own name, email, phone and links in a draft match the profile exactly (problem: AI misspells names). */
export interface ContactIssue { kind: 'name' | 'email' | 'phone' | 'url'; found: string; expected: string }
const lev = (a: string, b: string) => { const d = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[b.length]; };
export function contactCheck(text: string, p: { name?: string; email?: string; phone?: string; links?: string }): ContactIssue[] {
  const out: ContactIssue[] = []; const t = text || '';
  for (const part of (p.name || '').split(/\s+/).filter((w) => w.length >= 4)) {
    const re = new RegExp(`\\b${part[0]}[a-z]{${part.length - 2},${part.length}}\\b`, 'gi');
    for (const w of t.match(re) || []) if (w.toLowerCase() !== part.toLowerCase() && lev(w.toLowerCase(), part.toLowerCase()) === 1) out.push({ kind: 'name', found: w, expected: part });
  }
  if (p.email) for (const e of t.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) || []) if (e.toLowerCase() !== p.email.toLowerCase() && lev(e.toLowerCase(), p.email.toLowerCase()) <= 3) out.push({ kind: 'email', found: e, expected: p.email });
  const pd = (p.phone || '').replace(/\D/g, '').slice(-10);
  if (pd.length === 10) for (const ph of t.match(/\+?\d[\d\s-]{8,}\d/g) || []) { const d = ph.replace(/\D/g, '').slice(-10); if (d.length === 10 && d !== pd && lev(d, pd) <= 2) out.push({ kind: 'phone', found: ph.trim(), expected: p.phone! }); }
  const links = (p.links || '').match(/https?:\/\/[^\s,]+|(?:linkedin\.com|github\.com)\/[^\s,]+/gi) || [];
  for (const u of t.match(/https?:\/\/[^\s,)]+|(?:linkedin\.com|github\.com)\/[^\s,)]+/gi) || []) {
    const n = (s: string) => s.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const near = links.find((l) => n(l) !== n(u) && n(l).split('/')[0] === n(u).split('/')[0] && lev(n(l), n(u)) <= 3);
    if (near) out.push({ kind: 'url', found: u, expected: near });
  }
  return out.filter((x, i, a) => a.findIndex((y) => y.found === x.found) === i);
}
