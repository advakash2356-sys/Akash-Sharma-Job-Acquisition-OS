/** Course pointers for a missing skill. Links are built ONLY to real provider search pages (never model-written URLs),
 *  free providers first, then low-cost. No affiliate or tracking parameters. */
export interface CourseLink { provider: string; cost: 'Free' | 'Free to audit' | 'Low cost (subscription)'; url: string; hours: string }
const q = encodeURIComponent;
export function courseLinks(skill: string): CourseLink[] {
  const s = q(skill.trim().slice(0, 80));
  return [
    { provider: 'Google Skills', cost: 'Free', url: `https://www.skills.google/catalog?keywords=${s}`, hours: 'listed on each course page' },
    { provider: 'Microsoft Learn', cost: 'Free', url: `https://learn.microsoft.com/en-us/training/browse/?terms=${s}`, hours: 'listed on each module' },
    { provider: 'freeCodeCamp', cost: 'Free', url: `https://www.freecodecamp.org/news/search/?query=${s}`, hours: 'listed on each course' },
    { provider: 'Coursera', cost: 'Free to audit', url: `https://www.coursera.org/search?query=${s}`, hours: 'listed on each course page' },
    { provider: 'LinkedIn Learning', cost: 'Low cost (subscription)', url: `https://www.linkedin.com/learning/search?keywords=${s}`, hours: 'listed on each course' },
  ];
}
/** The exact line of the job post that mentions the skill, or '' if the post never names it (then nothing is quoted). */
export function quoteFor(skill: string, jobText = ''): string {
  const k = skill.trim().toLowerCase(); if (!k) return '';
  const line = jobText.split(/\r?\n|(?<=[.;])\s+/).map((l) => l.trim()).find((l) => l.toLowerCase().includes(k));
  return line ? line.slice(0, 300) : '';
}
export const COURSE_DISCLAIMER = 'I understand: these suggestions are generated automatically (from an AI match result) and may be wrong. I will check with the employer what they really need. There are no affiliate links and JAOS earns nothing from them. JAOS is not responsible for any course I buy. This is not career advice.';
