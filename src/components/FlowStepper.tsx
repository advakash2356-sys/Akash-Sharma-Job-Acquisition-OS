import { ArrowRight, Check } from 'lucide-react';
import { useApp } from '../lib/state';
import { cn } from '../lib/utils';

/** The guided flow, always visible in the app. The app never applies for you: step 6 is done by you on the employer's site. */
export const FLOW = ['Upload resume', 'Review matched jobs', 'Pick a job', 'Generate pack', 'Review & download', 'Apply on employer site'] as const;

export function flowState(ctx: ReturnType<typeof useApp>) {
  const { hasResume, jobs, selectedJobId } = ctx;
  const job = jobs.find((j) => j.id === selectedJobId);
  const packed = !!job && !!job.tailoredResume && !!job.coverLetter && !!job.outreach;
  const done = [hasResume, jobs.length > 0, !!job, packed, !!job?.docsAt?.downloaded, !!job && job.status !== 'Saved'];
  const cur = done.findIndex((d) => !d);
  return { job, done, cur: cur === -1 ? 6 : cur };
}

export default function FlowStepper() {
  const ctx = useApp();
  const { go, page } = ctx;
  const { job, done, cur } = flowState(ctx);
  const next: { label: string; run: () => void } | null = [
    { label: 'Upload your resume', run: () => go('setup') },
    { label: 'Find matching jobs', run: () => go('setup') },
    { label: 'Pick a job from the list', run: () => go('jobs') },
    { label: 'Generate the pack for this job', run: () => { go('job', job!.id); setTimeout(() => document.getElementById('pack')?.scrollIntoView({ behavior: 'smooth' }), 300); } },
    { label: 'Review & download your documents', run: () => { go('job', job!.id); setTimeout(() => document.getElementById('pack')?.scrollIntoView({ behavior: 'smooth' }), 300); } },
    { label: 'Apply on the employer site', run: () => go('job', job!.id) },
    { label: 'Pick another job', run: () => go('jobs') },
  ][cur];
  // The "Next step" call to action only fits the main flow pages; on side tools (Interview prep, Profile match, ...) it was confusing.
  const onFlow = (['setup', 'overview', 'jobs', 'job'] as string[]).includes(page);
  return (
    <nav aria-label="Your progress" className="mb-6 rounded-2xl border border-border bg-card-solid p-3 shadow-sm sm:p-4 lg:sticky lg:top-3 lg:z-20" data-testid="flow-stepper">
      <ol className="flex gap-2 overflow-x-auto pb-1 text-xs sm:gap-3">
        {FLOW.map((s, i) => (
          <li key={s} aria-current={i === cur ? 'step' : undefined} className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1', i === cur ? 'bg-primary text-primary-foreground' : done[i] ? 'text-primary' : 'text-muted-foreground')}>
            <span className={cn('grid h-5 w-5 place-items-center rounded-full border text-[11px]', i === cur ? 'border-primary-foreground' : done[i] ? 'border-primary bg-primary/10' : 'border-border')}>{done[i] && i !== cur ? <Check size={11} /> : i + 1}</span>{s}
          </li>
        ))}
      </ol>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        {job && <span className="min-w-0 truncate text-muted-foreground">Selected job: <b className="text-foreground">{job.title}</b> · {job.company}</span>}
        {onFlow && next && !(cur === 3 && page === 'job') && <button onClick={next.run} className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 cursor-pointer" data-testid="next-step">Next step: {next.label} <ArrowRight size={15} /></button>}
        {onFlow && next && cur === 3 && page === 'job' && <span className="ml-auto text-sm font-medium text-primary">Next step: press "Approve & generate all" below</span>}
      </div>
      {onFlow && next && (
        <button onClick={cur === 3 && page === 'job' ? () => document.getElementById('pack')?.scrollIntoView({ behavior: 'smooth' }) : next.run} className="fixed inset-x-3 bottom-3 z-30 flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-2xl lg:hidden cursor-pointer" data-testid="next-step-mobile">
          {cur < 6 ? `Step ${cur + 1} of 6 · ` : ''}{cur === 3 && page === 'job' ? 'Approve & generate all, below' : next.label} <ArrowRight size={15} />
        </button>
      )}
    </nav>
  );
}
