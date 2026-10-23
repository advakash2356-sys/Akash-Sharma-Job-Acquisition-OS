import { useRef, useState } from 'react';
import { callAi, AiError } from './api';
import { normalise, resumeText } from './resumeDoc';
import { useApp } from './state';
import type { Job } from '../types';
import { stripUnsupported } from './merged';
import { defaultSpec, sanitizeSpec, todayIST, type StyleSpec } from './resumeStyle';

/** Today's style spec for this role and country: from the browser cache, else Gemini (search-grounded when the key allows), else the app default. */
export async function styleFor(title: string, location: string): Promise<StyleSpec> {
  const country = /india|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai|pune|kolkata|noida|gurugram|gurgaon/i.test(location || 'India') ? 'India' : (location || 'India').split(',').pop()!.trim().slice(0, 40);
  const role = title.replace(/\s+/g, ' ').slice(0, 120);
  const key = `jaos_style_v1:${todayIST()}:${role.toLowerCase()}:${country.toLowerCase()}`;
  try { const c = localStorage.getItem(key); if (c) return sanitizeSpec(JSON.parse(c), role, JSON.parse(c).source); } catch { /* ignore */ }
  try {
    const r: any = await callAi('resume-style', { title: role, country }, { timeoutMs: 45000 });
    const s = sanitizeSpec(r, role, r?.source === 'grounded' ? 'grounded' : 'ai');
    try { Object.keys(localStorage).filter((k) => k.startsWith('jaos_style_v1:') && !k.startsWith(`jaos_style_v1:${todayIST()}`)).forEach((k) => localStorage.removeItem(k)); localStorage.setItem(key, JSON.stringify(s)); } catch { /* ignore */ }
    return s;
  } catch { return defaultSpec(role); }
}

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
      let r: any;
      try { r = await callAi(ACTION[kind], { ...body(job), ...extra }, { timeoutMs: 75000 }); }
      catch (e) {
        // Google's free tier allows only a few requests per minute. Wait once and retry, and say so.
        if ((e as AiError).code !== 'RATE_LIMIT') throw e;
        setErrors((x) => ({ ...x, [kind]: { message: "Google's free-tier per-minute limit was reached. Retrying automatically in 30 seconds…", code: 'RETRYING' } }));
        await new Promise((res) => setTimeout(res, 30000));
        setErrors((x) => ({ ...x, [kind]: undefined }));
        r = await callAi(ACTION[kind], { ...body(job), ...extra }, { timeoutMs: 75000 });
      }
      const at = new Date().toISOString();
      let patch: Partial<Job>;
      if (kind === 'resume') {
        const doc = typeof r === 'string' ? null : normalise(r);
        if (typeof r !== 'string' && !doc) throw new AiError('The AI returned a resume in an unexpected shape. Try again.', 'EMPTY');
        const style = job.resumeStyle?.source && job.resumeStyle.asOf === todayIST() ? job.resumeStyle : await styleFor(job.title, job.found?.location || profile.location || '');
        patch = doc ? { tailoredResumeDoc: doc, tailoredResume: resumeText(doc), resumeStyle: job.resumeStyle?.userPicked ? { ...style, template: job.resumeStyle.template, accent: job.resumeStyle.accent, userPicked: true } : style } : { tailoredResume: r };
      } else {
        // Auto-remove claims the fact check cannot find in the resume or job post; keep a list so the user sees what was cut.
        const src = `${job.company} ${job.title}`;
        const cut = (t: string) => stripUnsupported(String(t || ''), `${String(profile.resumeText || '')} ${profile.name}`, `${job.description} ${src}`);
        if (kind === 'cover') { const c = cut(r); patch = { coverLetter: c.text, removedClaims: { ...job.removedClaims, cover: c.removed } }; }
        else {
          const o: any = { ...r }; const rm: string[] = [];
          for (const k of ['emailBody', 'linkedinMessage', 'followUp']) { const c = cut(o[k]); o[k] = c.text; rm.push(...c.removed); }
          patch = { outreach: o, removedClaims: { ...job.removedClaims, outreach: rm } };
        }
      }
      setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, ...patch, docsAt: { ...j.docsAt, [kind]: at } } : j)));
      return true;
    } catch (e) {
      const err = e as AiError; setErrors((x) => ({ ...x, [kind]: { message: err.message, code: err.code } }));
      return false;
    } finally { inflight.current.delete(kind); setBusy((b) => ({ ...b, [kind]: false })); }
  }
  /** "Approve & generate all": the three requests run one after another (gentler on free-tier limits). */
  const allRunning = useRef(false);
  async function all() {
    if (allRunning.current) return; // a second press before the button disables must not start a second run
    allRunning.current = true;
    try { for (const k of ['resume', 'cover', 'outreach'] as DocKind[]) await one(k); } finally { allRunning.current = false; }
  }
  const any = Object.values(busy).some(Boolean);
  return { one, all, busy, errors, any };
}
