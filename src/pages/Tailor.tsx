import { Wand2 } from 'lucide-react';
import { Button, EmptyState, Label, PageHeader, Select } from '../components/ui';
import DocsPanel from '../components/DocsPanel';
import { useApp } from '../lib/state';

/** All application packs, one job at a time. The same panel appears on each job's own page. */
export default function Tailor() {
  const { jobs, selectedJobId, go, page } = useApp();
  const job = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  if (!job) return <><PageHeader title="Application packs" /><EmptyState icon={<Wand2 size={32} />} title="Pick a job first" body="A pack (tailored resume, cover letter, outreach) is written for one specific job." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} /></>;
  const withDocs = jobs.filter((j) => j.tailoredResume || j.coverLetter || j.outreach).length;
  return (
    <>
      <PageHeader title="Application packs" subtitle={`Each pack is written for one job, from your resume only, and stored with that job. ${withDocs} of ${jobs.length} jobs have documents.`} />
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-0 max-w-md flex-1"><Label htmlFor="jp">Job</Label>
          <Select id="jp" value={job.id} onChange={(e) => go(page, e.target.value)}>{jobs.map((j) => <option key={j.id} value={j.id}>{(j.tailoredResume || j.coverLetter || j.outreach) ? '● ' : ''}{j.title} · {j.company}</option>)}</Select>
        </div>
        <Button variant="outline" className="h-11" onClick={() => go('job', job.id)}>Open job page</Button>
      </div>
      <DocsPanel key={job.id} job={job} />
    </>
  );
}
