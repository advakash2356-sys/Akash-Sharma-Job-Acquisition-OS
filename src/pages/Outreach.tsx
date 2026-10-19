import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button, Card, EmptyState, Input, Label, PageHeader, Select } from '../components/ui';
import { AiError_, CopyButton, RunButton, useAiAction } from '../components/AiPanel';
import { Download, Mail } from 'lucide-react';
import FactCheckPanel from '../components/FactCheck';
import TestModeToggle from '../components/TestModeToggle';
import { TEST_EVENT, exportEml, fileBase, gmailComposeUrl } from '../lib/exporters';
import { TEMPLATES, fillTemplate } from '../lib/insights';
import { useApp } from '../lib/state';
import type { Job } from '../types';

export default function Outreach() {
  const { jobs, setJobs, selectedJobId, go, hasResume, page, profile } = useApp();
  const [, bumpTest] = React.useState(0);
  React.useEffect(() => { const f = () => bumpTest((n) => n + 1); window.addEventListener(TEST_EVENT, f); return () => window.removeEventListener(TEST_EVENT, f); }, []);
  const job = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const ai = useAiAction<NonNullable<Job['outreach']>>('generate-outreach', job);
  const [to, setTo] = useState('');
  const [contact, setContact] = useState({ contactName: '', contactTitle: '' });

  if (!job) return <><PageHeader title="Outreach studio" />
      <EmptyState icon={<Send size={32} />} title="Add a job first" body="Outreach is written for a specific role and your resume." action={<Button onClick={() => go('jobs')}>Go to Jobs</Button>} /></>;
  const o = job.outreach;
  const blocks: [string, string][] = o ? [['Email subject', o.emailSubject], ['Email', o.emailBody], ['LinkedIn message', o.linkedinMessage], ['5-day follow-up', o.followUp]] : [];

  return (
    <>
      <PageHeader title="Outreach studio" subtitle="A short email, a LinkedIn note and a follow-up, written from your resume." />
      <TestModeToggle />
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
      {o && (
        <Card className="mb-4">
          <h2 className="mb-1 text-lg font-medium">Send it yourself</h2>
          <FactCheckPanel text={`${o.emailSubject}\n${o.emailBody}\n${o.linkedinMessage}\n${o.followUp}`} resume={`${profile.resumeText} ${profile.name} ${profile.email} ${profile.phone} ${profile.location} ${profile.noticePeriod || ""} ${profile.availableFrom || ""}`} jobText={`${job.title} ${job.company} ${job.description} ${contact.contactName} ${contact.contactTitle}`} />
          <p className="mb-3 mt-3 text-sm text-muted-foreground">Nothing is sent for you and no account is connected. Open a pre-filled Gmail draft, or download an .eml draft for any mail app.</p>
          <div className="mb-3 max-w-sm"><Label htmlFor="to" hint="optional">Recipient email</Label><Input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <div className="flex flex-wrap gap-2">
            <a href={gmailComposeUrl({ to, subject: o.emailSubject, body: o.emailBody })} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"><Mail size={16} /> Open in Gmail</a>
            <Button variant="outline" onClick={() => exportEml({ to, subject: o.emailSubject, body: o.emailBody }, fileBase(profile, job, 'outreach'))}><Download size={16} /> Download .eml</Button>
          </div>
        </Card>
      )}
      <Card className="mb-4">
        <h2 className="mb-1 text-3xl">Template library</h2>
        <p className="mb-3 text-sm text-muted-foreground">Fill-in-the-blank messages. Placeholders use your profile and the selected job.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {TEMPLATES.map((t) => {
            const v = { Name: profile.name, Email: profile.email, Phone: profile.phone, JobTitle: job.title, Company: job.company, ContactName: contact.contactName || 'Hiring team' };
            const body = fillTemplate(t.body, v), subject = fillTemplate(t.subject, v);
            return (
              <div key={t.id} className="rounded-2xl border border-border p-4">
                <div className="label mb-1 text-primary">{t.channel}</div>
                <div className="mb-2 font-medium">{t.title}</div>
                <p className="mb-3 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{body}</p>
                <div className="flex flex-wrap gap-2"><CopyButton text={subject ? `${subject}\n\n${body}` : body} />{t.channel !== 'LinkedIn' && <a href={gmailComposeUrl({ to, subject, body })} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-sm hover:bg-muted"><Mail size={14} /> Gmail</a>}</div>
              </div>
            );
          })}
        </div>
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
