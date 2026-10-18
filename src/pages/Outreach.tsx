import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button, Card, EmptyState, Input, Label, PageHeader, Select } from '../components/ui';
import { AiError_, CopyButton, RunButton, useAiAction } from '../components/AiPanel';
import { useApp } from '../lib/state';
import type { Job } from '../types';

export default function Outreach() {
  const { jobs, setJobs, selectedJobId, go, hasResume, page } = useApp();
  const job = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const ai = useAiAction<NonNullable<Job['outreach']>>('generate-outreach', job);
  const [contact, setContact] = useState({ contactName: '', contactTitle: '' });

  if (!job) return <><PageHeader title="Outreach studio" /><EmptyState icon={<Send size={32} />} title="Add a job first" body="Outreach is written for a specific role and your resume." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} /></>;
  const o = job.outreach;
  const blocks: [string, string][] = o ? [['Email subject', o.emailSubject], ['Email', o.emailBody], ['LinkedIn message', o.linkedinMessage], ['5-day follow-up', o.followUp]] : [];

  return (
    <>
      <PageHeader title="Outreach studio" subtitle="A short email, a LinkedIn note and a follow-up, written from your resume." />
      <Card className="mb-5 grid gap-4 sm:grid-cols-3">
        <div><Label htmlFor="oj">Job</Label><Select id="oj" value={job.id} onChange={(e) => go(page, e.target.value)}>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.company}</option>)}</Select></div>
        <div><Label htmlFor="cn" hint="optional">Contact name</Label><Input id="cn" value={contact.contactName} onChange={(e) => setContact({ ...contact, contactName: e.target.value })} /></div>
        <div><Label htmlFor="ct" hint="optional">Contact title</Label><Input id="ct" value={contact.contactTitle} onChange={(e) => setContact({ ...contact, contactTitle: e.target.value })} /></div>
        <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
          <RunButton loading={ai.loading} disabled={!hasResume} onClick={async () => { const r = await ai.run(contact); if (r) setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, outreach: r } : j))); }}>{o ? 'Regenerate' : 'Generate outreach package'}</RunButton>
          {!hasResume && <span className="text-sm text-muted-foreground">Add your resume first. <button className="underline cursor-pointer" onClick={() => go('resume')}>Go to My resume</button></span>}
        </div>
        <div className="sm:col-span-3 empty:hidden"><AiError_ error={ai.error} go={go} /></div>
      </Card>
      <div className="grid gap-4">
        {blocks.map(([t, text]) => (
          <Card key={t}><div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-medium">{t}</h2><CopyButton text={text} /></div><p className="whitespace-pre-wrap text-sm">{text}</p></Card>
        ))}
        {!o && !ai.loading && !ai.error && <p className="text-sm text-muted-foreground">Nothing generated yet.</p>}
      </div>
    </>
  );
}
