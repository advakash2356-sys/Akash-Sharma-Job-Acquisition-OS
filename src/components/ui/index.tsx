import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Button({ variant = 'primary', size = 'md', className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md' }) {
  return (
    <button
      {...p}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 text-sm',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:opacity-90',
        variant === 'outline' && 'border border-border bg-card-solid hover:bg-muted',
        variant === 'ghost' && 'hover:bg-muted',
        variant === 'danger' && 'border border-border text-danger hover:bg-muted',
        className,
      )}
    />
  );
}

export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...p} className={cn('rounded-[20px] glass p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]', className)} />
);

const field = 'w-full rounded-lg border border-border bg-card-solid/60 px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-primary';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, r) => (
  <input ref={r} {...p} className={cn(field, 'h-10', className)} />
));
export const Textarea = ({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={cn(field, 'py-2 leading-relaxed', className)} />
);
export const Select = ({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={cn(field, 'h-10', className)} />
);

export const Label = ({ children, hint, htmlFor }: { children: React.ReactNode; hint?: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
    {children}
    {hint && <span className="ml-2 font-normal text-muted-foreground">{hint}</span>}
  </label>
);

export const Badge = ({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'primary' | 'gold' | 'danger' }) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    tone === 'muted' && 'bg-muted text-muted-foreground',
    tone === 'primary' && 'bg-accent text-primary',
    tone === 'gold' && 'bg-muted text-gold',
    tone === 'danger' && 'bg-muted text-danger')}>{children}</span>
);

const BANNERS = ['/ridges-path.jpg', '/hero-poster.jpg', '/desk-offer.jpg'];
export function PageHeader({ title, subtitle, action, eyebrow }: { title: string; subtitle?: string; action?: React.ReactNode; eyebrow?: string }) {
  const img = BANNERS[(title.length + title.charCodeAt(0)) % BANNERS.length];
  return (
    <header className="grain relative mb-8 overflow-hidden rounded-[28px] fade-up">
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
      <div className="relative flex flex-wrap items-end justify-between gap-4 px-6 pb-7 pt-20 text-[#f4ede2] sm:px-10 sm:pt-28">
        <div>
          {eyebrow && <p className="label mb-2 text-[#ffb089]">{eyebrow}</p>}
          <h1 className="text-5xl leading-[0.95] sm:text-7xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-white/75">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border px-6 py-14 text-center">
      <div className="mb-3 text-muted-foreground">{icon}</div>
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="mt-1 max-w-md text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Dialog({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn('max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card-solid p-6 shadow-2xl outline-none sm:rounded-2xl fade-up', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-medium">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 hover:bg-muted cursor-pointer"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
