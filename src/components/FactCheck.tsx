import { ShieldCheck, TriangleAlert } from 'lucide-react';
import { factCheck } from '../lib/merged';

/** Browser-only check of AI output against the resume. No AI involved. */
export default function FactCheckPanel({ text, resume, jobText }: { text: string; resume: string; jobText?: string }) {
  if (!text || typeof text !== 'string') return null;
  const r = factCheck(text, String(resume ?? ''), String(jobText ?? ''));
  const n = r.numbers.length + r.terms.length + r.cliches.length;
  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3 text-sm" data-testid="fact-check">
      <div className="flex items-center gap-2 font-medium">{n ? <TriangleAlert size={15} className="text-gold" /> : <ShieldCheck size={15} className="text-primary" />}Fact check {n ? `· ${n} item${n > 1 ? 's' : ''} to confirm` : '· nothing new found'}</div>
      <p className="mt-1 text-muted-foreground">Compares this text with your resume{jobText ? ' and the job description' : ''} in your browser. Anything listed does not appear there: keep it only if it is true.</p>
      {r.numbers.length > 0 && <p className="mt-2"><b>Numbers:</b> {r.numbers.join(', ')}</p>}
      {r.terms.length > 0 && <p className="mt-1"><b>Names and skills:</b> {r.terms.join(', ')}</p>}
      {r.cliches.length > 0 && <p className="mt-1"><b>Stock phrases:</b> {r.cliches.join(', ')} (recruiters skim past these)</p>}
    </div>
  );
}
