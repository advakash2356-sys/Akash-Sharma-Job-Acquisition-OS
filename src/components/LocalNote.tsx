import { Lock } from 'lucide-react';
/** Shown on every tool page: data stays in the browser. */
export function LocalNote({ onClear }: { onClear?: () => void }) {
  return <p className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm" data-testid="local-note"><Lock size={14} aria-hidden /> <b>Saved only in your browser. We don't collect it.</b>{onClear && <button type="button" className="min-h-11 text-primary underline" onClick={onClear}>Clear my saved data</button>}</p>;
}
