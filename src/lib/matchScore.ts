/** Stronger match score: skills, experience and keyword-gap breakdown, scored by Gemini.
 *  Weighting idea adapted from Shubhamsaboo/awesome-llm-apps "resume_job_matcher" (Apache-2.0); rewritten. */
export interface MatchScore { skills: number; experience: number; keywords: number; overall: number; matchedSkills: string[]; missingSkills: string[]; missingKeywords: string[]; experienceNote: string; fixes: string[] }
export const WEIGHTS = { skills: 0.4, experience: 0.35, keywords: 0.25 } as const;
const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
const list = (a: unknown) => (Array.isArray(a) ? a.map((x) => String(x).trim()).filter(Boolean).slice(0, 20) : []);
/** Cleans the model output and computes the overall score here, so the model cannot inflate it. */
export function normalizeScore(raw: any): MatchScore {
  const skills = clamp(raw?.skills), experience = clamp(raw?.experience), keywords = clamp(raw?.keywords);
  return { skills, experience, keywords, overall: Math.round(skills * WEIGHTS.skills + experience * WEIGHTS.experience + keywords * WEIGHTS.keywords),
    matchedSkills: list(raw?.matchedSkills), missingSkills: list(raw?.missingSkills), missingKeywords: list(raw?.missingKeywords), experienceNote: String(raw?.experienceNote || '').slice(0, 600), fixes: list(raw?.fixes).slice(0, 6) };
}
