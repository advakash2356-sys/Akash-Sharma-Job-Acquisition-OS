/** Same role reposted under another company name or aggregator: same normalised title and very similar description. */
export const normTitle = (t = '') => t.toLowerCase().replace(/\(.*?\)|[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const words = (s = '') => new Set(s.toLowerCase().match(/[a-z0-9]{3,}/g) || []);
export function nearDuplicate(a: { title?: string; description?: string; url?: string }, b: { title?: string; description?: string; url?: string }) {
  if (a.url && a.url === b.url) return true;
  if (!a.title || normTitle(a.title) !== normTitle(b.title)) return false;
  const A = words(a.description), B = words(b.description);
  if (A.size < 15 || B.size < 15) return false;
  let inter = 0; A.forEach((w) => { if (B.has(w)) inter++; });
  return inter / (A.size + B.size - inter) >= 0.6;
}
