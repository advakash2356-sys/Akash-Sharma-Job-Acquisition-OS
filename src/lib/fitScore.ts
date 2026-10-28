/** Fit score without AI. Idea from srbhr/Resume-Matcher (Apache-2.0): blend keyword coverage with whole-text similarity.
 *  Rewritten here (TF-IDF cosine over Porter stems); no Resume-Matcher code copied. Akash Sync Agent. */
import { porterStem } from './porter';
import { keywordGap } from './insights';

const STOP = new Set('the and for with you your our are will this that from have has was were been their they them who what when where how can all any not but out into over such per via more most other than then also using use able work working team role job company'.split(' '));
const toks = (t: string) => (t.toLowerCase().match(/[a-z][a-z+#]{2,}/g) || []).filter((w) => !STOP.has(w)).map(porterStem);
export function cosine(a: string, b: string): number {
  const A = toks(a), B = toks(b); if (!A.length || !B.length) return 0;
  const df = new Map<string, number>(); for (const w of new Set([...A])) df.set(w, (df.get(w) || 0) + 1); for (const w of new Set([...B])) df.set(w, (df.get(w) || 0) + 1);
  const vec = (x: string[]) => { const v = new Map<string, number>(); x.forEach((w) => v.set(w, (v.get(w) || 0) + 1)); for (const [w, n] of v) v.set(w, n * Math.log(1 + 2 / df.get(w)!)); return v; };
  const va = vec(A), vb = vec(B); let dot = 0, na = 0, nb = 0;
  for (const [w, x] of va) { na += x * x; const y = vb.get(w); if (y) dot += x * y; } for (const y of vb.values()) nb += y * y;
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
export interface Fit { score: number; coverage: number; similarity: number; hit: string[]; miss: string[] }
/** 70% keyword coverage (synonym/tense aware) + 30% text similarity, scaled so a strong match reads 80-100. */
export function fitScore(resume: string, job: string): Fit {
  const g = keywordGap(resume, job); const sim = Math.min(1, cosine(resume, job) / 0.5);
  return { score: Math.round(0.7 * g.pct + 30 * sim), coverage: g.pct, similarity: Math.round(sim * 100), hit: g.hit, miss: g.miss };
}
