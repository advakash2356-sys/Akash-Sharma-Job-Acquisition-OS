// 5-cluster title expansion via a fixed lookup (src/lib/onestop/titleClusters.json). Akash Sync Agent.
import TABLE from './titleClusters.json' with { type: 'json' };
export const CLUSTER_NAMES = ['Core', 'Platform / systems owner', 'Commercial & ops adjacent', 'Government equivalent', 'AI-era hybrid'] as const;
const T = TABLE as unknown as Record<string, string[][]>;
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9& ]/g, ' ').split(/\s+/).filter((w) => w.length > 1);
/** The family whose name or Core titles best overlap the given title, or null. */
export function familyOf(title: string): string | null {
  const w = new Set(words(title)); let best: string | null = null, top = 0;
  for (const [k, cl] of Object.entries(T)) { if (k.startsWith('_')) continue; for (const t of [k, ...cl[0]]) { const tw = words(t); const s = tw.filter((x) => w.has(x)).length / tw.length; if (s > top) { top = s; best = k; } } }
  return top >= 0.5 ? best : null;
}
/** Title plus up to `max` related titles from all 5 clusters. */
export function expandTitle(title: string, max = 12): string[] {
  const f = familyOf(title); const out = [title];
  if (f) for (let i = 0; i < 5 && out.length < max; i++) for (const t of T[f][i]) if (out.length < max && !out.some((o) => o.toLowerCase() === t)) out.push(t);
  return out;
}
/** Core + Platform/systems-owner titles only (strict matching, t347u). */
export function coreTitles(title: string): string[] { const f = familyOf(title); return f ? [...T[f][0], ...T[f][1]] : []; }
