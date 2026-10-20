import React, { useRef, useState } from 'react';
import { Loader2, Sparkles, Copy, Check, KeyRound, FileWarning } from 'lucide-react';
import { Button } from './ui';
import { callAi, AiError } from '../lib/api';
import { useApp } from '../lib/state';
import { useAiReady } from '../lib/aiReady';
import type { Job } from '../types';

/** Shared "run an AI action for this job using the user's resume" runner with loading + clear errors. */
export function useAiAction<T>(action: string, job: Job | undefined) {
  const { profile, go } = useApp();
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const run = async (extra: Record<string, unknown> = {}): Promise<T | undefined> => {
    if (!job || busy.current) return;
    busy.current = true;
    setError(null);
    setLoading(true);
    try {
      return await callAi<T>(action, {
        title: job.title, company: job.company, description: job.description,
        resume: profile.resumeText, name: profile.name, targetRoles: profile.targetRoles, minCtc: profile.minCtc, instructions: [profile.aiInstructions, profile.noticePeriod || profile.availableFrom ? `Candidate availability (from the candidate, use only if relevant): notice period ${profile.noticePeriod || 'not stated'}; can start ${profile.availableFrom || 'not stated'}.` : ''].filter(Boolean).join('\n'), ...extra,
      });
    } catch (e) {
      const err = e as AiError;
      setError({ message: err.message, code: err.code });
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };
  return { run, loading, error, go };
}

export function AiError_({ error, go }: { error: { message: string; code?: string } | null; go: (p: any) => void }) {
  if (!error) return null;
  const needsKey = error.code === 'NO_API_KEY' || error.code === 'BAD_API_KEY';
  const needsResume = error.code === 'NO_RESUME';
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted p-3 text-sm">
      {needsKey ? <KeyRound size={16} className="text-danger" /> : <FileWarning size={16} className="text-danger" />}
      <span className="flex-1">{error.message}</span>
      {needsKey && <Button size="sm" variant="outline" onClick={() => go('settings')}>Open Settings</Button>}
      {needsResume && <Button size="sm" variant="outline" onClick={() => go('resume')}>Add resume</Button>}
    </div>
  );
}

export function RunButton({ loading, onClick, children, disabled }: { loading: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  const { ready, checking } = useAiReady();
  const { go } = useApp();
  const blocked = !ready && !checking;
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button onClick={onClick} disabled={loading || disabled || blocked} aria-busy={loading} aria-describedby={blocked ? 'need-key' : undefined}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {loading ? 'Working…' : children}
      </Button>
      {blocked && <span id="need-key" className="text-xs text-muted-foreground">Needs your free API key. <button type="button" className="underline text-primary cursor-pointer" onClick={() => go('settings')}>Add it in Settings</button></span>}
    </span>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>
      {ok ? <Check size={14} /> : <Copy size={14} />} {ok ? 'Copied' : 'Copy'}
    </Button>
  );
}
