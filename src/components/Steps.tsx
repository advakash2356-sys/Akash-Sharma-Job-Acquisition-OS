import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Card } from './ui';
import { usePersisted } from '../lib/persist';

export interface Step { title: ReactNode; body?: ReactNode }
/** Numbered Step 1, Step 2… checklist with tick marks saved in this browser (localStorage key jaos_steps_<id>). */
export function Steps({ id, title, steps }: { id: string; title: string; steps: Step[] }) {
  const [done, setDone] = usePersisted<boolean[]>(`jaos_steps_${id}`, []);
  const n = steps.filter((_, i) => done[i]).length;
  const toggle = (i: number) => setDone((d) => { const x = [...d]; x[i] = !x[i]; return x; });
  return (
    <Card className="mb-5 grid min-w-0 gap-3" data-testid={`steps-${id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-medium">{title}</h2>
        <span className="text-sm text-muted-foreground" data-testid="steps-progress">{n} of {steps.length} done{n > 0 && <> · <button type="button" className="min-h-11 underline" onClick={() => setDone([])}>Reset ticks</button></>}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden><div className="h-full bg-primary transition-all" style={{ width: `${(n / steps.length) * 100}%` }} /></div>
      <ol className="grid gap-2">{steps.map((s, i) => (
        <li key={i} className={`flex min-w-0 gap-3 rounded-lg border border-border p-3 text-sm [overflow-wrap:anywhere] ${done[i] ? 'bg-muted/50' : ''}`}>
          <button type="button" role="checkbox" aria-checked={!!done[i]} aria-label={`Mark step ${i + 1} done`} onClick={() => toggle(i)} data-testid="step-tick"
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${done[i] ? 'border-primary bg-primary text-white' : 'border-border'}`}>{done[i] && <Check size={16} />}</button>
          <div className="min-w-0"><div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step {i + 1}{done[i] && ' · done'}</div><div className={done[i] ? 'line-through decoration-muted-foreground/60' : ''}><b>{s.title}</b></div>{s.body && <div className="mt-1 text-muted-foreground">{s.body}</div>}</div>
        </li>))}</ol>
    </Card>
  );
}
