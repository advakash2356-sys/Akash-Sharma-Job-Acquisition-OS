import { useState } from 'react';
import { funnel } from '../lib/googleAuth';

const KEY = 'jaos_price_pulse_v1';
export const PRICE_CHOICES = [
  { id: 'no', label: 'No' },
  { id: 'coffee', label: 'A coffee (~$3)' },
  { id: 'monthly', label: '$5-10 per month' },
  { id: 'after_job', label: 'Only after I get a job' },
] as const;

/** Click-only interest check. No payment, no card, nothing is charged. Logged as one anonymous-choice event for signed-in users. */
export default function PricePulse() {
  const [done, setDone] = useState(() => { try { return !!localStorage.getItem(KEY); } catch { return false; } });
  if (done) return null;
  const pick = (id: string) => { funnel('price_pulse', `choice=${id}`); try { localStorage.setItem(KEY, id); } catch { /* ignore */ } setDone(true); };
  return (
    <div data-testid="price-pulse" className="rounded-2xl border border-border bg-card-solid p-4 text-sm">
      <p className="font-medium">Would you pay for this later?</p>
      <p className="mt-1 text-xs text-muted-foreground">It is free during early access. This is only a quick question: nothing is charged and no payment details are asked for.</p>
      <div className="mt-3 flex flex-wrap gap-2">{PRICE_CHOICES.map((c) => <button key={c.id} data-testid={`pulse-${c.id}`} onClick={() => pick(c.id)} className="min-h-10 rounded-full border border-border px-3 hover:bg-muted cursor-pointer">{c.label}</button>)}</div>
    </div>
  );
}
