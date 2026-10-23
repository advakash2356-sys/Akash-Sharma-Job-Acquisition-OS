import { Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export const EARLY_ACCESS = "Free during early access. Paid plans may be introduced later; we'll give advance notice and no one is charged without opting in.";

export default function EarlyAccessNote({ className }: { className?: string }) {
  return (
    <p role="note" data-testid="early-access" className={cn('flex items-start gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm', className)}>
      <Sparkles size={16} className="mt-0.5 shrink-0 text-primary" /><span>{EARLY_ACCESS}</span>
    </p>
  );
}
