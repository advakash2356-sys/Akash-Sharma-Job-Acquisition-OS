import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getSession, renderGoogleButton } from '../lib/googleAuth';

export const CONSENT_VERSION = '2026-10-24';
const CONSENT_KEY = 'jaos_consent_v1';
/** Consent record kept in this browser: { at: ISO time, v: notice version }. Also sent to the server on sign-in. */
export function savedConsent(): { at: string; v: string } | null {
  try { const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); return c && c.v === CONSENT_VERSION && c.at ? c : null; } catch { return null; }
}

/** Sign-in step: tick the consent box, then Continue with Google (Google's own button, so the popup opens from a direct tap). */
export default function SignInGate({ openPrivacy, openTerms, back }: { openPrivacy: () => void; openTerms?: () => void; back: () => void }) {
  const prior = savedConsent();
  const [agreed, setAgreed] = useState(!!prior);
  const [at, setAt] = useState(prior?.at || '');
  const [mobile, setMobile] = useState('');
  const [err, setErr] = useState('');
  const btn = useRef<HTMLDivElement>(null);
  const live = useRef({ consent: true, mobile: '', consentAt: '', consentVersion: CONSENT_VERSION });
  live.current = { consent: agreed, mobile: mobile.trim(), consentAt: at, consentVersion: CONSENT_VERSION };
  const tick = (v: boolean) => {
    setAgreed(v);
    const t = v ? new Date().toISOString() : '';
    setAt(t);
    try { v ? localStorage.setItem(CONSENT_KEY, JSON.stringify({ at: t, v: CONSENT_VERSION })) : localStorage.removeItem(CONSENT_KEY); } catch { /* ignore */ }
  };
  // Google's button is rendered only once the box is ticked; tapping it opens Google's popup directly.
  // Returning users who already agreed also get Google's quick account prompt.
  useEffect(() => {
    if (!agreed || !btn.current || getSession()) return;
    btn.current.innerHTML = '';
    const w = Math.min(400, Math.max(200, Math.floor(btn.current.clientWidth || 300)));
    renderGoogleButton(btn.current, setErr, () => live.current, { prompt: !!prior, width: w });
  }, [agreed]);
  return (
    <main data-testid="signin-gate" className="grid min-h-screen place-items-center bg-background p-4">
      <div className="glass w-full max-w-lg rounded-[28px] p-6 sm:p-7">
        <div className="mb-2 flex items-center gap-2 text-primary"><ShieldCheck size={20} /><span className="text-sm font-medium">Job Acquisition OS</span></div>
        <h1 className="display mb-2 text-3xl sm:text-4xl">Start your path</h1>
        <p className="mb-4 text-sm text-muted-foreground">Agree to the terms below, then continue with Google. Your resume, jobs and API key stay in this browser; they are not sent to the Sheet.</p>
        <div data-testid="gate-consent" className="mb-4 max-h-56 overflow-y-auto rounded-xl border border-border p-3 text-xs text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Consent notice (India DPDP Act, 2023)</p>
          <p>When you sign in, Akash Sync Agent will store your name and email, the mobile number below (if you add one), when you first and last used the app and how many times, a random device id with a light device hint, and the time you gave this consent, in a private Google Sheet. This is used only to run and protect this service. You can withdraw consent and ask for deletion at any time, as set out in the Privacy Notice. This service is only for people aged 18 or older.</p>
        </div>
        <details className="mb-4 text-sm"><summary className="cursor-pointer text-muted-foreground">Add a mobile number (optional)</summary>
          <label className="mb-1 mt-2 block text-sm font-medium" htmlFor="gate-mobile">Mobile number <span className="font-normal text-muted-foreground">(optional, not verified)</span></label>
          <input id="gate-mobile" inputMode="tel" autoComplete="tel" maxLength={20} value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98xxxxxxxx" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base" />
          <p className="mt-1 text-xs text-muted-foreground">Leave it empty to skip; enter it before you continue with Google.</p>
        </details>
        <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm">
          <input data-testid="gate-agree" type="checkbox" required checked={agreed} onChange={(e) => tick(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#ff6a2b]" />
          <span>I am 18 or older, and I have read and agree to the <button type="button" onClick={(e) => { e.preventDefault(); openTerms?.(); }} className="underline text-primary">Terms</button> and <button type="button" onClick={(e) => { e.preventDefault(); openPrivacy(); }} className="underline text-primary">Privacy Notice</button>, and I consent to the processing described above.</span>
        </label>
        {!agreed && <button data-testid="gate-continue" type="button" disabled aria-disabled="true" className="w-full rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground opacity-40 cursor-not-allowed">Continue</button>}
        <div ref={btn} data-testid="gate-google" className={agreed ? 'flex min-h-[44px] w-full justify-center' : 'hidden'} />
        {agreed && <p className="mt-2 text-center text-xs text-muted-foreground">Tap “Continue with Google” to sign in.</p>}
        {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}
        <button onClick={back} className="mt-5 text-sm text-muted-foreground underline cursor-pointer">Back to home</button>
        <p className="mt-4 text-xs text-muted-foreground">Made by Akash Sync Agent</p>
      </div>
    </main>
  );
}

/** Shown instead of the app when the site has no Google client ID: there is no guest access. */
export function SignInUnavailable({ back }: { back: () => void }) {
  return (
    <main data-testid="signin-unavailable" className="grid min-h-screen place-items-center bg-background p-4">
      <div className="glass w-full max-w-lg rounded-[28px] p-7">
        <h1 className="display mb-2 text-4xl">Sign-in unavailable</h1>
        <p className="mb-4 text-sm text-muted-foreground">The app needs Google sign-in, and sign-in is not set up on this site right now. Please try again later. The privacy, terms, security, accessibility and feedback pages are still open.</p>
        <button onClick={back} className="text-sm text-primary underline cursor-pointer">Back to home</button>
        <p className="mt-4 text-xs text-muted-foreground">Made by Akash Sync Agent</p>
      </div>
    </main>
  );
}
