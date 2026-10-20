import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { wipeEverything } from '../lib/storage';
import { cn } from '../lib/utils';

export const DELETE_CONFIRM = 'Delete all Job Acquisition OS data from this browser (resume, jobs, API keys, preferences)? This cannot be undone.';

/** One "Delete my data" control, used in the app header, the menu/sidebar, Settings and /privacy. Always asks first. */
export default function DeleteDataButton({ variant = 'button', label = 'Delete my data', className }: { variant?: 'button' | 'icon' | 'link'; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const onClick = () => {
    if (!confirm(DELETE_CONFIRM)) return;
    wipeEverything(); setDone(true);
    setTimeout(() => { location.href = '/'; }, 900);
  };
  const base = variant === 'icon'
    ? 'grid h-11 w-11 place-items-center rounded-lg text-danger hover:bg-muted cursor-pointer'
    : variant === 'link'
      ? 'inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-sm text-danger hover:bg-muted cursor-pointer'
      : 'inline-flex min-h-11 items-center gap-2 rounded-full border border-danger/50 px-4 text-sm font-medium text-danger hover:bg-danger/10 cursor-pointer';
  return (
    <>
      <button type="button" onClick={onClick} aria-label={label} title={label} data-delete-data className={cn(base, className)}>
        <Trash2 size={variant === 'icon' ? 18 : 16} />{variant !== 'icon' && <span>{done ? 'Deleted' : label}</span>}
      </button>
      {done && <span role="status" className="sr-only">Deleted. Reloading.</span>}
    </>
  );
}
