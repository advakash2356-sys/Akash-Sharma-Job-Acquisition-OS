import { ArrowLeft, ExternalLink, MapPin, CalendarDays } from 'lucide-react';
import { Badge, Button, Card, EmptyState, PageHeader, Select } from '../components/ui';
import DocsPanel from '../components/DocsPanel';
import { useApp } from '../lib/state';
import { today } from '../lib/utils';
import { JOB_STATUSES, type Job, type JobStatus } from '../types';
import { JobDetail } from './Jobs';
import { Briefcase } from 'lucide-react';
import { useEffect } from 'react';
import { funnel } from '../lib/googleAuth';
import { setStage } from '../lib/tracker';
import JobFacts from '../components/JobFacts';

/** One-stop page for a single job: details, the original posting, Apply on site, and this job's documents. */
export default function JobPage() {
  const { jobs, selectedJobId, setJobs, go } = useApp();
  const job = jobs.find((j) => j.id === selectedJobId);
  useEffect(() => { if (job) funnel('job_viewed'); }, [job?.id]);
  if (!job) return <><PageHeader title="Job" /><EmptyState icon={<Briefcase size={32} />} title="Pick a job" body="Open a job from your list to see its details, apply link and documents." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} /></>;
  const patch = (p: Partial<Job>) => setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, ...p } : j)));
  const fit = job.score?.score ?? job.found?.fit?.score;
  return (
    <>
      <button onClick={() => go('jobs')} className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary cursor-pointer"><ArrowLeft size={15} /> All jobs</button>
      <PageHeader eyebrow={job.company} title={job.title} subtitle={job.found ? `Real posting found via ${job.found.source === 'Himalayas' || job.found.source === 'Remote OK' ? job.found.source : 'FreeHire'} (source: ${job.found.source}). Postings can go stale: check it is still open on the employer's site.` : 'A job you added yourself.'} />
      <Card className="mb-5 grid gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {job.found?.location && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {job.found.location}</span>}
          {job.found?.postedAt && <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> Posted {job.found.postedAt}</span>}
          {job.found?.decision && <Badge tone={job.found.decision.kind === 'remote-unclear' ? 'muted' : 'primary'}><span data-testid="elig-badge">{job.found.decision.badge}</span></Badge>}
          {job.found?.govt && <Badge tone="gold">Govt · last date {job.found.govt.lastDate}</Badge>}
          {fit != null && <Badge tone="gold">Fit {fit}/100 {job.score ? '(AI)' : job.found?.fit?.kind === 'ai' ? '(AI)' : '(keyword)'}</Badge>}
          <Badge>{job.status}</Badge>
        </div>
        <JobFacts job={job} />
        {job.found?.decision && <p className="text-sm" data-testid="elig-reason"><b>Who can apply:</b> {job.found.decision.reason}{job.found.evidence?.length ? <span className="text-muted-foreground"> Based on: {job.found.evidence.join('; ')}.</span> : null}</p>}
        <div>
          <div className="label mb-2 text-primary">Step 6 · Apply yourself</div>
          <div className="flex flex-wrap items-center gap-2">
            {job.url
              ? <a href={job.url} target="_blank" rel="noreferrer" data-testid="apply-on-site" onClick={() => { funnel('apply_click'); if (job.status === 'Saved') setTimeout(() => { if (window.confirm('Did you apply on the employer\'s site? Mark this job as Applied?')) patch(setStage(job, 'Applied')); }, 400); }} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"><ExternalLink size={16} /> Apply on employer site</a>
              : <span className="text-sm text-muted-foreground">No link saved for this job. Add one under "More for this job" below.</span>}
            {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 px-2 text-sm underline">Open original posting</a>}
            {job.status === 'Saved'
              ? <Button variant="outline" className="h-11" onClick={() => patch(setStage(job, 'Applied'))}>I applied, mark as applied</Button>
              : <Select aria-label="Status" className="h-11 w-44" value={job.status} onChange={(e) => patch(setStage(job, e.target.value as JobStatus))}>{JOB_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">The app does not apply for you. The button opens the employer's own page; you submit the application there. <button className="underline cursor-pointer" onClick={() => go('prep')}>Prepare for the screening</button> · <button className="underline cursor-pointer" onClick={() => go('tracker')}>Tracker and reminders</button></p>
        </div>
        <details className="text-sm"><summary className="cursor-pointer font-medium">Job description</summary><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{job.description}</p></details>
      </Card>
      <div className="mb-5"><DocsPanel key={job.id} job={job} /></div>
      <details className="mb-5"><summary className="mb-3 cursor-pointer text-xl">More for this job: fit score, recruiter's read, follow-ups, notes</summary><JobDetail job={job} inline onClose={() => go('jobs')} /></details>
    </>
  );
}
