import React from 'react';
import { Wand2 } from 'lucide-react';
import { Button, Card, EmptyState, Label, PageHeader, Select } from '../components/ui';
import { AiError_, CopyButton, RunButton, useAiAction } from '../components/AiPanel';
import { Download } from 'lucide-react';
import { exportDocx, exportPdf, fileBase } from '../lib/exporters';
import { useApp } from '../lib/state';
import FactCheckPanel from '../components/FactCheck';

export default function Tailor() {
  const { jobs, setJobs, selectedJobId, go, hasResume, page, profile } = useApp();
  const job = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const tailor = useAiAction<string>('tailor-resume', job);
  const cover = useAiAction<string>('generate-cover-letter', job);
  const save = (p: object) => setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, ...p } : j)));

  if (!job) return <><PageHeader title="Tailor & cover letter" /><EmptyState icon={<Wand2 size={32} />} title="Add a job first" body="Pick a job to tailor your resume and write a cover letter for it." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} /></>;

  return (
    <>
      <PageHeader title="Tailor & cover letter" subtitle="Rewrites use only the facts in your resume. Review everything before sending." />
      <div className="mb-5 max-w-md"><Label htmlFor="jp">Job</Label>
        <Select id="jp" value={job.id} onChange={(e) => go(page, e.target.value)}>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.company}</option>)}</Select>
      </div>
      {!hasResume && <p className="mb-4 rounded-lg bg-muted p-3 text-sm">Add your resume first. <button className="underline cursor-pointer" onClick={() => go('resume')}>Go to My resume</button></p>}
      <div className="grid gap-5">
        {([['Tailored resume', tailor, 'tailoredResume', 'Tailor my resume'], ['Cover letter', cover, 'coverLetter', 'Write cover letter']] as const).map(([title, ai, field, label]) => {
          const text = job[field];
          return (
            <Card key={field}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-medium">{title}</h2>
                <div className="flex gap-2">{text && <CopyButton text={text} />}{text && <><Button size="sm" variant="outline" onClick={() => exportPdf(text, `${title}: ${job.title}, ${job.company}`, fileBase(profile, job, field === 'coverLetter' ? 'cover-letter' : 'resume'))}><Download size={14} /> PDF</Button><Button size="sm" variant="outline" onClick={() => exportDocx(text, `${title}: ${job.title}, ${job.company}`, fileBase(profile, job, field === 'coverLetter' ? 'cover-letter' : 'resume'))}><Download size={14} /> DOCX</Button></>}<RunButton loading={ai.loading} disabled={!hasResume} onClick={async () => { const r = await ai.run(); if (r) save({ [field]: r }); }}>{text ? 'Regenerate' : label}</RunButton></div>
              </div>
              <AiError_ error={ai.error} go={go} />
              {text && <FactCheckPanel text={text} resume={`${profile.resumeText} ${profile.name} ${profile.email} ${profile.phone} ${profile.location} ${profile.noticePeriod || ""} ${profile.availableFrom || ""}`} jobText={`${job.title} ${job.company} ${job.description}`} />}{text ? <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">{text}</pre> : !ai.error && <p className="text-sm text-muted-foreground">Nothing generated yet.</p>}
            </Card>
          );
        })}
      </div>
    </>
  );
}
