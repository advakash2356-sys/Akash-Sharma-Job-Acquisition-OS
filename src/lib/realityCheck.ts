/** "Reality check": a frank, encouraging risk/reward read built ONLY from the match data already on screen.
 *  No outside numbers: if something is not known (such as applicant counts) it says so instead of guessing. */
export type Tier = 'stretch' | 'fit' | 'safe';
export interface RealityInput { score: number; gaps?: string[]; fixes?: string[]; postedDaysAgo?: number | null }
export interface Reality { tier: Tier; headline: string; risk: string; reward: string; gaps: string[]; competition: string; improve: string[] }
export const tierOf = (s: number): Tier => (s >= 75 ? 'safe' : s >= 55 ? 'fit' : 'stretch');
const clean = (a?: string[]) => (a || []).map((x) => String(x).trim()).filter(Boolean);
export function realityCheck(i: RealityInput): Reality {
  const score = Math.max(0, Math.min(100, Math.round(Number(i.score) || 0)));
  const tier = tierOf(score), gaps = clean(i.gaps).slice(0, 4);
  const improve = (clean(i.fixes).length ? clean(i.fixes) : gaps.map((g) => `Close or address: ${g}`)).slice(0, 2);
  const T = {
    stretch: { headline: `Stretch (${score}/100). Worth a shot only with a sharp pitch.`, risk: 'The resume, as it reads now, misses several things this job asks for, so a screener may pass quickly.', reward: 'A stretch role can move you up a level. Apply if the gaps below are things you can honestly show or learn fast.' },
    fit: { headline: `Fit (${score}/100). A real contender if you fix the gaps.`, risk: 'You match the core, but the gaps below could decide it against closer matches.', reward: 'Good odds-for-effort: a tailored resume aimed at these gaps is the best use of your time here.' },
    safe: { headline: `Safe (${score}/100). Strong match, don't overthink it.`, risk: 'The main risk is a generic application: strong matches still lose to people who tailored theirs.', reward: 'Apply soon and spend the saved time on outreach to the team.' },
  }[tier];
  const d = i.postedDaysAgo;
  const competition = typeof d === 'number' && d >= 0
    ? `Posted ${d} day${d === 1 ? '' : 's'} ago. JAOS has no applicant count for this job; as a general rule, older postings have had more time to collect applicants, so earlier is better.`
    : 'JAOS has no applicant count or posting date for this job, so competition is unknown. Assume others with similar resumes apply too.';
  return { tier, ...T, gaps, competition, improve };
}
