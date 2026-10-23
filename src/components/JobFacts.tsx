import type { Job } from '../types';
import { jobFacts } from '../lib/jobFacts';

const MODE: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' };
/** Location, mode, shift, pay, type, experience and who can apply, read from the posting. Missing facts say so; nothing is guessed. */
export default function JobFacts({ job, compact }: { job: Job; compact?: boolean }) {
  const f = jobFacts(job.description);
  const pay = job.salaryMin || job.salaryMax ? `${job.salaryMin ?? '?'}–${job.salaryMax ?? '?'} (you entered)` : f.salary;
  const rows: [string, string][] = [
    ['Location', job.found?.location || 'Not stated'],
    ['Work mode', MODE[(job.found as any)?.mode] || 'Not stated'],
    ['Shift / time zone', f.shift],
    ['Salary', pay],
    ['Employment type', f.employment],
    ['Experience', f.experience],
  ];
  if (!compact && job.found?.decision) rows.push(['Who can apply', job.found.decision.reason]);
  return (
    <dl data-testid="job-facts" className={compact ? 'mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs sm:grid-cols-3' : 'grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2'}>
      {rows.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-muted-foreground">{k}</dt><dd className={`truncate ${/^Not (stated|disclosed)/.test(v) ? 'text-muted-foreground italic' : 'font-medium'}`} title={v}>{v}</dd></div>)}
    </dl>
  );
}
