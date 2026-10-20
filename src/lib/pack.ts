import { useRef, useState } from 'react';
import { callAi, AiError } from './api';
import { normalise, resumeText } from './resumeDoc';
import { useApp } from './state';
import type { Job } from '../types';

export type DocKind = 'resume' | 'cover' | 'outreach';
export const DOC_LABEL: Record<DocKind, string> = { resume: 'Tailored resume', cover: 'Cover letter', outreach: 'Outreach messages' };
export const forJob = (j: Pick<Job, 'title' | 'company'>) => `${j.title} · ${j.company}`;
const ACTION: Record<DocKind, string> = { resume: 'tailor-resume', cover: 'generate-cover-letter', outreach: 'generate-outreach' };

/** Generates one, or all three, documents for ONE job and stores them on that job. */
export function usePack(job: Job | undefined) {
  const { profile, setJobs } = useApp();
  const [busy, setBusy] = useState<Partial<Record<DocKind, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<DocKind, { message: string; code?: string }>>>({});
  const inflight = useRef<Set<DocKind>>(new Set());

  const body = (j: Job) => ({
    title: j.title, company: j.company, description: j.description,
    resume: profile.resumeText, name: profile.name, targetRoles: profile.targetRoles, minCtc: profile.minCtc,
    instructions: [profile.aiInstructions, profile.noticePeriod || profile.availableFrom ? `Candidate availability (from the candidate, use only if relevant): notice period ${profile.noticePeriod || 'not stated'}; can start ${profile.availableFrom || 'not stated'}.` : ''].filter(Boolean).join('\n'),
  });

  async function one(kind: DocKind, extra: Record<string, unknown> = {}) {
    if (!job || inflight.current.has(kind)) return false;
    inflight.current.add(kind);
    setBusy((b) => ({ ...b, [kind]: true })); setErrors((e) => ({ ...e, [kind]: undefined }));
    try {
      const r: any = await callAi(ACTION[kind], { ...body(job), ...extra }, { timeoutMs: 75000 });
      const at = new Date().toISOString();
      let patch: Partial<Job>;
      if (kind === 'resume') {
        const doc = typeof r === 'string' ? null : normalise(r);
        if (typeof r !== 'string' && !doc) throw new AiError('The AI returned a resume in an unexpected shape. Try again.', 'EMPTY');
        patch = doc ? { tailoredResumeDoc: doc, tailoredResume: resumeText(doc) } : { tailoredResume: r };
      } else if (kind === 'cover') patch = { coverLetter: String(r) };
      else patch = { outreach: r };
      setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, ...patch, docsAt: { ...j.docsAt, [kind]: at } } : j)));
      return true;
    } catch (e) {
      const err = e as AiError; setErrors((x) => ({ ...x, [kind]: { message: err.message, code: err.code } }));
      return false;
    } finally { inflight.current.delete(kind); setBusy((b) => ({ ...b, [kind]: false })); }
  }
  /** "Approve & generate all": the three requests run one after another (gentler on free-tier limits). */
  async function all() { for (const k of ['resume', 'cover', 'outreach'] as DocKind[]) await one(k); }
  const any = Object.values(busy).some(Boolean);
  return { one, all, busy, errors, any };
}
