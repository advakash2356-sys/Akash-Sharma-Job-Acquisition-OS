import { normalise, resumeText, type ResumeDoc } from './resumeDoc';
import type { Job } from '../types';
import { sanitizeSpec } from './resumeStyle';

/** Any saved document value (string, structured resume, array, object, number, null) as plain text. Never throws. */
export function asText(x: unknown, depth = 0): string {
  if (x == null) return '';
  if (typeof x === 'string') return x;
  if (typeof x === 'number' || typeof x === 'boolean') return String(x);
  if (depth > 4) return '';
  if (Array.isArray(x)) return x.map((v) => asText(v, depth + 1)).filter(Boolean).join('\n');
  if (typeof x === 'object') {
    const doc = normalise(x);
    if (doc) { try { return resumeText(doc); } catch { /* fall through */ } }
    return Object.values(x as Record<string, unknown>).map((v) => asText(v, depth + 1)).filter(Boolean).join('\n');
  }
  return '';
}

const strList = (x: unknown) => (Array.isArray(x) ? x.map((v) => asText(v)).filter(Boolean) : []);

/** Brings a saved job's documents into the current shape (older builds, backups and imports stored other shapes). */
export function normaliseJob(j: Job): Job {
  if (!j || typeof j !== 'object') return j;
  const raw: any = j;
  let doc: ResumeDoc | null = raw.tailoredResumeDoc ? normalise(raw.tailoredResumeDoc) : null;
  if (!doc && raw.tailoredResume && typeof raw.tailoredResume === 'object') doc = normalise(raw.tailoredResume);
  if (doc && !resumeText(doc).replace(/\s/g, '')) doc = null; // empty/garbled structured doc: keep the text instead
  const tr = doc ? resumeText(doc) : asText(raw.tailoredResume);
  let outreach = raw.outreach;
  if (outreach != null) {
    if (typeof outreach !== 'object' || Array.isArray(outreach)) outreach = { emailSubject: '', emailBody: asText(outreach), linkedinMessage: '', followUp: '' };
    else outreach = { emailSubject: asText(outreach.emailSubject), emailBody: asText(outreach.emailBody), linkedinMessage: asText(outreach.linkedinMessage), followUp: asText(outreach.followUp) };
  }
  const rc = raw.removedClaims && typeof raw.removedClaims === 'object' ? { cover: strList(raw.removedClaims.cover), outreach: strList(raw.removedClaims.outreach) } : undefined;
  const out: any = { ...j };
  if (raw.tailoredResume != null || doc) out.tailoredResume = tr || undefined; 
  if (doc) out.tailoredResumeDoc = doc; else delete out.tailoredResumeDoc;
  if (raw.coverLetter != null) out.coverLetter = asText(raw.coverLetter) || undefined;
  if (outreach != null) out.outreach = outreach;
  if (rc) out.removedClaims = rc; else delete out.removedClaims;
  if (raw.resumeStyle != null) out.resumeStyle = sanitizeSpec(raw.resumeStyle, String(raw.title || ''), ['grounded', 'ai', 'default'].includes(raw.resumeStyle?.source) ? raw.resumeStyle.source : 'default', raw.resumeStyle?.asOf);
  return out as Job;
}

/** True when normaliseJob would change something worth saving. */
export const needsMigration = (j: any) => !!j && ((j.tailoredResume != null && typeof j.tailoredResume !== 'string') || (j.coverLetter != null && typeof j.coverLetter !== 'string')
  || (j.outreach != null && (typeof j.outreach !== 'object' || ['emailSubject', 'emailBody', 'linkedinMessage', 'followUp'].some((k) => j.outreach[k] != null && typeof j.outreach[k] !== 'string')))
  || (j.tailoredResumeDoc != null && !normalise(j.tailoredResumeDoc)) || (j.removedClaims != null && Object.values(j.removedClaims).some((v: any) => !Array.isArray(v) || v.some((x: any) => typeof x !== 'string'))));
