import React, { useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { ACCEPT, ParseError, parseResumeFile } from '../lib/resumeParser';
import { cn } from '../lib/utils';

/** Drag-and-drop / choose-file area. Files are parsed in this browser only. */
export default function ResumeDrop({ hasText, onText }: { hasText: boolean; onText: (t: string, name: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handle = async (f?: File) => {
    if (!f) return;
    setErr(''); setBusy(true);
    try { onText(await parseResumeFile(f), f.name); }
    catch (e) { setErr(e instanceof ParseError ? e.message : 'Could not read this file. Try another format or paste the text.'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div
        role="button" tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current?.click())}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files?.[0]); }}
        className={cn('flex cursor-pointer flex-col items-center gap-2 rounded-[20px] border-2 border-dashed px-6 py-10 text-center transition-colors',
          over ? 'border-primary bg-accent' : 'border-border hover:border-primary/60 hover:bg-muted')}
      >
        {busy ? <Loader2 className="animate-spin text-primary" /> : <FileUp className="text-primary" />}
        <div className="display text-3xl">{busy ? 'Reading your resume…' : hasText ? 'Replace with another file' : 'Drop your resume here'}</div>
        <p className="text-sm text-muted-foreground">or <span className="underline text-primary">choose a file</span>. PDF, DOCX, TXT or MD. Old .doc files are not supported: save as .docx or PDF first.</p>
        <p className="label text-muted-foreground">Read in your browser · the file is never uploaded</p>
        <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {err && <p role="alert" className="mt-3 rounded-lg bg-muted p-3 text-sm text-danger">{err}</p>}
      <p data-testid="free-tier-warning" className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm">Before AI reads your resume: on Google's free Gemini tier, Google may use what you send to improve its products, and people at Google may review it. Use a paid (billing-enabled) key, or remove sensitive details (ID numbers, health, family, exact address) first. <a className="underline text-primary" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Google's terms</a></p>
    </div>
  );
}
