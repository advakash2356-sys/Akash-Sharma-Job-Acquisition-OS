import React, { useState } from 'react';
import { Download, FileText, Loader2, Mail, Sparkles, Send, Wand2, CheckCircle2 } from 'lucide-react';
import { Badge, Button, Card } from './ui';
import { AiError_, CopyButton } from './AiPanel';
import FactCheckPanel from './FactCheck';
import { useApp } from '../lib/state';
import { useAiReady } from '../lib/aiReady';
import { usePack, DOC_LABEL, forJob, type DocKind } from '../lib/pack';
import { letterDocx, letterPdf, resumeDocx, resumePdf, type ResumeDoc } from '../lib/resumeDoc';
import { exportDocx, exportEml, exportPdf, fileBase, gmailComposeUrl } from '../lib/exporters';
import type { Job } from '../types';
import { asText, normaliseJob } from '../lib/docShape';

/** Per-document boundary: if a preview or fact check fails, show the raw text instead of crashing the page. */
class PanelBoundary extends React.Component<{ raw: string; children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('Document preview error:', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="rounded-lg border border-border bg-muted/50 p-3 text-sm" data-testid="panel-fallback">
        <p className="font-medium">This preview could not be shown ({this.state.error.message}). Here is the saved text; regenerate to get the formatted version.</p>
        <pre className="mt-2 whitespace-pre-wrap font-sans">{this.props.raw || '(empty)'}</pre>
      </div>
    );
  }
}

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

/** ATS preview of the structured resume: same single-column order as the PDF/DOCX. */
export function ResumePreview({ r }: { r: ResumeDoc }) {
  const H = ({ children }: { children: React.ReactNode }) => <h4 className="mt-4 border-b border-border pb-1 text-xs font-semibold uppercase tracking-wider">{children}</h4>;
  return (
    <div className="rounded-xl border border-border bg-white p-5 font-sans text-[13px] leading-relaxed text-black" data-testid="resume-preview">
      <div className="text-xl font-bold">{r.basics.name}</div>
      {r.basics.label && <div>{r.basics.label}</div>}
      <div className="text-xs text-neutral-700">{[r.basics.location, r.basics.email, r.basics.phone, r.basics.url].filter(Boolean).join(' | ')}</div>
      {r.basics.summary && <><H>Summary</H><p>{r.basics.summary}</p></>}
      {r.work.length > 0 && <><H>Experience</H>{r.work.map((w, i) => <div key={i} className="mt-2"><div className="flex justify-between gap-3 font-semibold"><span>{[w.position, w.name].filter(Boolean).join(' | ')}</span><span className="shrink-0 font-normal">{[w.startDate, w.endDate].filter(Boolean).join(' – ')}</span></div>{w.location && <div className="text-xs italic">{w.location}</div>}<ul className="list-disc pl-5">{w.highlights.map((h, k) => <li key={k}>{h}</li>)}</ul></div>)}</>}
      {r.skills.length > 0 && <><H>Skills</H>{r.skills.map((s, i) => <p key={i}>{s.name && s.keywords.length ? <><b>{s.name}:</b> {s.keywords.join(', ')}</> : s.name || s.keywords.join(', ')}</p>)}</>}
      {r.projects.length > 0 && <><H>Projects</H>{r.projects.map((p, i) => <div key={i} className="mt-1"><b>{p.name}</b>{p.description && <p>{p.description}</p>}<ul className="list-disc pl-5">{p.highlights.map((h, k) => <li key={k}>{h}</li>)}</ul></div>)}</>}
      {r.education.length > 0 && <><H>Education</H>{r.education.map((e, i) => <div key={i} className="flex justify-between gap-3"><span><b>{[[e.studyType, e.area].filter(Boolean).join(', '), e.institution].filter(Boolean).join(' | ')}</b>{e.score && ` · ${e.score}`}</span><span className="shrink-0">{[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span></div>)}</>}
      {r.certificates.length > 0 && <><H>Certifications</H>{r.certificates.map((c, i) => <p key={i}>{[c.name, c.issuer, c.date].filter(Boolean).join(' | ')}</p>)}</>}
      {r.languages.length > 0 && <><H>Languages</H><p>{r.languages.map((l) => (l.fluency ? `${l.language} (${l.fluency})` : l.language)).join(', ')}</p></>}
    </div>
  );
}

/** One job's application pack: tailored resume, cover letter, outreach. Each is labelled with the job it is for and stored on that job. */
export default function DocsPanel({ job: job0 }: { job: Job }) {
  const job = normaliseJob(job0);
  const { profile, go, hasResume, setJobs } = useApp();
  const { ready } = useAiReady();
  const pack = usePack(job);
  const [open, setOpen] = useState<DocKind | null>(null);
  const label = forJob(job);
  const base = (k: string) => fileBase(profile, job, k);
  const markDl = () => setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, docsAt: { ...j.docsAt, downloaded: new Date().toISOString() } } : j)));
  const resumeSrc = `${asText(profile.resumeText)} ${profile.name} ${profile.email} ${profile.phone} ${profile.location} ${profile.noticePeriod || ''} ${profile.availableFrom || ''}`;
  const jobText = `${asText(job.title)} ${asText(job.company)} ${asText(job.description)}`;
  const has: Record<DocKind, boolean> = { resume: !!job.tailoredResume, cover: !!job.coverLetter, outreach: !!job.outreach };
  const allDone = has.resume && has.cover && has.outreach;
  const canRun = hasResume && ready;
  const reSubject = `Application for ${job.title} – ${job.company}`;

  const row = (k: DocKind, icon: React.ReactNode, actions: React.ReactNode, body: React.ReactNode, text: string) => (
    <div className="scroll-mt-44 rounded-2xl border border-border p-4" data-doc={k}>
      <div className="flex flex-wrap items-center gap-2">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="font-medium">{DOC_LABEL[k]} <span className="text-muted-foreground">for</span> {label}</div>
          <div className="text-xs text-muted-foreground">{pack.busy[k] ? 'Generating…' : has[k] ? `Generated ${when(job.docsAt?.[k])}${k === 'resume' && !job.tailoredResumeDoc ? ' (older plain-text version)' : ''}` : 'Not generated yet'}</div>
        </div>
        {pack.busy[k] ? <Loader2 size={18} className="animate-spin text-primary" /> : has[k] && <Badge tone="primary">Ready</Badge>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant={has[k] ? 'outline' : 'primary'} disabled={!canRun || !!pack.busy[k]} onClick={() => pack.one(k)}>{pack.busy[k] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{has[k] ? 'Regenerate' : `Create ${DOC_LABEL[k].toLowerCase()}`}</Button>
        {has[k] && <Button size="sm" variant="outline" onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k}>{open === k ? 'Hide' : 'Review'}</Button>}
        {has[k] && actions}
        {has[k] && <CopyButton text={text} />}
      </div>
      <div className="mt-2 empty:hidden"><AiError_ error={pack.errors[k] || null} go={go} /></div>
      {has[k] && k !== 'resume' && (job.removedClaims?.[k as 'cover' | 'outreach']?.length || 0) > 0 && (
        <details className="mt-2 rounded-lg border border-gold/40 bg-muted/50 p-3 text-sm" data-testid={`removed-${k}`}>
          <summary className="cursor-pointer font-medium">Removed {job.removedClaims![k as 'cover' | 'outreach']!.length} sentence(s) not backed by your resume or the job post</summary>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">{job.removedClaims![k as 'cover' | 'outreach']!.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p className="mt-1 text-xs">If any of these is true, add it to your resume and regenerate, or edit the copied text yourself.</p>
        </details>
      )}
      {has[k] && open === k && <div className="mt-3"><PanelBoundary raw={asText(text)}><FactCheckPanel text={k === 'resume' ? asText(text).split('\n').filter((l) => !/^[A-Z][A-Z &]+$/.test(l.trim())).join('\n') : asText(text)} resume={resumeSrc} jobText={jobText} /><div className="mt-3">{body}</div></PanelBoundary></div>}
    </div>
  );

  return (
    <Card id="pack" className="grid scroll-mt-44 gap-4">
      <div>
        <div className="label mb-1 text-primary">Steps 4 and 5 · Your application pack</div>
        <h2 className="text-3xl">Documents for {label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Written only from the facts in your resume, for this job. Review each one, then download it. Nothing is sent or submitted for you.</p>
      </div>
      {!hasResume && <p className="rounded-lg bg-muted p-3 text-sm">Add your resume first. <button className="underline cursor-pointer" onClick={() => go('setup')}>Upload resume</button></p>}
      {hasResume && !ready && <p className="rounded-lg bg-muted p-3 text-sm">Add your free Gemini key to create documents. <button className="underline cursor-pointer" onClick={() => go('settings')}>Add it in Settings</button></p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={!canRun || pack.any} onClick={() => pack.all()} data-testid="generate-all">{pack.any ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}{pack.any ? 'Generating your pack…' : allDone ? 'Regenerate all three' : 'Approve & generate all'}</Button>
        <span className="text-xs text-muted-foreground">Creates the tailored resume, cover letter and outreach for this job, one after another (about 20 to 60 seconds).</span>
      </div>
      {row('resume', <FileText size={18} className="text-primary" />,
        <>
          <Button size="sm" variant="outline" onClick={() => { job.tailoredResumeDoc ? resumePdf(job.tailoredResumeDoc, base('resume')) : exportPdf(job.tailoredResume!, `Tailored resume: ${label}`, base('resume')); markDl(); }}><Download size={14} /> PDF</Button>
          <Button size="sm" variant="outline" onClick={async () => { job.tailoredResumeDoc ? await resumeDocx(job.tailoredResumeDoc, base('resume')) : await exportDocx(job.tailoredResume!, `Tailored resume: ${label}`, base('resume')); markDl(); }}><Download size={14} /> DOCX</Button>
        </>,
        job.tailoredResumeDoc ? <ResumePreview r={job.tailoredResumeDoc} /> : <pre className="whitespace-pre-wrap font-sans text-sm">{job.tailoredResume}</pre>, job.tailoredResume || '')}
      {row('cover', <FileText size={18} className="text-primary" />,
        <>
          <Button size="sm" variant="outline" onClick={() => { letterPdf(job.coverLetter!, `Re: ${reSubject}`, base('cover-letter')); markDl(); }}><Download size={14} /> PDF</Button>
          <Button size="sm" variant="outline" onClick={async () => { await letterDocx(job.coverLetter!, `Re: ${reSubject}`, base('cover-letter')); markDl(); }}><Download size={14} /> DOCX</Button>
        </>,
        <div className="rounded-xl border border-border bg-white p-5 text-sm leading-relaxed text-black"><p className="mb-3 text-xs font-semibold text-neutral-600">Re: {reSubject}</p><p className="whitespace-pre-wrap">{job.coverLetter}</p></div>, job.coverLetter || '')}
      {row('outreach', <Send size={18} className="text-primary" />,
        <>
          <a href={gmailComposeUrl({ subject: job.outreach?.emailSubject || '', body: job.outreach?.emailBody || '' })} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-sm hover:bg-muted"><Mail size={14} /> Gmail draft</a>
          <Button size="sm" variant="outline" onClick={() => { exportEml({ subject: job.outreach!.emailSubject, body: job.outreach!.emailBody }, base('outreach')); markDl(); }}><Download size={14} /> .eml</Button>
        </>,
        job.outreach && <div className="grid gap-3 text-sm">{([['Email subject', job.outreach.emailSubject], ['Email', job.outreach.emailBody], ['LinkedIn message', job.outreach.linkedinMessage], ['5-day follow-up', job.outreach.followUp]] as const).map(([t, v]) => <div key={t}><div className="label mb-1 text-muted-foreground">{t}</div><p className="whitespace-pre-wrap">{v}</p></div>)}</div>,
        job.outreach ? `${job.outreach.emailSubject}\n\n${job.outreach.emailBody}\n\n${job.outreach.linkedinMessage}\n\n${job.outreach.followUp}` : '')}
      {allDone && <p className="flex items-center gap-2 text-sm text-primary"><CheckCircle2 size={16} /> Pack ready. Review each document, download what you need, then apply on the employer's site.</p>}
    </Card>
  );
}
