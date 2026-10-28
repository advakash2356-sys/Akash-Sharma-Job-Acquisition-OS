/** Synonym- and tense-aware keyword matching (no AI). Light suffix stemmer + a small synonym map. Akash Sync Agent. */
const SYN: string[][] = [
  ['js', 'javascript'], ['ts', 'typescript'], ['k8s', 'kubernetes'], ['ml', 'machine learning'], ['ai', 'artificial intelligence'],
  ['nlp', 'natural language processing'], ['ux', 'user experience'], ['ui', 'user interface'], ['pm', 'project manager', 'project management'],
  ['crm', 'customer relationship management'], ['clm', 'contract lifecycle management'], ['sql', 'mysql', 'postgresql', 'postgres'],
  ['excel', 'spreadsheets', 'spreadsheet'], ['lead', 'manage', 'supervise', 'head'], ['build', 'develop', 'create', 'implement'],
  ['analyse', 'analyze', 'analysis', 'analytics'], ['customer', 'client'], ['negotiate', 'negotiation'], ['draft', 'write', 'prepare'],
  ['litigation', 'dispute resolution'], ['compliance', 'regulatory'], ['sales', 'business development', 'bd'],
];
/** "managed", "manages", "managing", "management" -> "manag". */
export function stem(w: string): string {
  let s = w.toLowerCase();
  for (const suf of ['ments', 'ment', 'ings', 'ing', 'ed', 'ers', 'er', 'ies', 'es', 's']) {
    if (s.length - suf.length >= 3 && s.endsWith(suf)) { s = s.slice(0, -suf.length) + (suf === 'ies' ? 'y' : ''); break; }
  }
  return s.replace(/e$/, '').replace(/([a-z])\1$/, '$1');
}
const GROUP = new Map<string, number>();
SYN.forEach((g, i) => g.forEach((t) => GROUP.set(t.split(' ').map(stem).join(' '), i)));
const stems = (text: string) => (text.toLowerCase().match(/[a-z][a-z+#./-]*/g) || []).map(stem);
/** True when the text contains the term, a tense/plural variant of it, or a listed synonym. */
export function hasTerm(text: string, term: string, pre?: string): boolean {
  const t = pre ?? ' ' + stems(text).join(' ') + ' ';
  const k = term.toLowerCase().split(/\s+/).map(stem).join(' ');
  if (t.includes(' ' + k + ' ')) return true;
  const g = GROUP.get(k);
  return g != null && SYN[g].some((x) => t.includes(' ' + x.split(' ').map(stem).join(' ') + ' '));
}
export const prepared = (text: string) => ' ' + stems(text).join(' ') + ' ';
/** Whole days since a posted date (YYYY-MM-DD or any Date-parsable text); -1 when unknown. */
export function daysOld(posted?: string, now = Date.now()): number { const t = Date.parse(posted || ''); return Number.isFinite(t) ? Math.floor((now - t) / 864e5) : -1; }
/** Campaign tags: short channel codes (ig, yt, fb, wa, x) or channel plus a tag, e.g. reddit-3, reel-7, qr_reel20, ig_grp4. */
export const isCampaignTag = (s: string) => /^(ig|yt|fb|wa|x|li|tg|qr)$/.test(s) || /^[a-z]{2,15}[-_][a-z0-9_-]{1,24}$/.test(s);
