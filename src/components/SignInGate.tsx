import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { renderGoogleButton } from '../lib/googleAuth';

/** Full-page sign-in step shown before the app when the owner has set GOOGLE_CLIENT_ID. Public pages (privacy, terms, about, feedback) stay open. */
export default function SignInGate({ openPrivacy, back }: { openPrivacy: () => void; back: () => void }) {
  const [consent, setConsent] = useState(false);
  const [mobile, setMobile] = useState('');
  const [err, setErr] = useState('');
  const btn = useRef<HTMLDivElement>(null);
  const live = useRef({ consent, mobile });
  live.current = { consent, mobile: mobile.trim() };
  useEffect(() => { if (consent && btn.current) { btn.current.innerHTML = ''; renderGoogleButton(btn.current, setErr, () => live.current); } }, [consent]);
  return (
    <main data-testid="signin-gate" className="grid min-h-screen place-items-center bg-background p-4">
      <div className="glass w-full max-w-lg rounded-[28px] p-7">
        <div className="mb-2 flex items-center gap-2 text-primary"><ShieldCheck size={20} /><span className="text-sm font-medium">Job Acquisition OS</span></div>
        <h1 className="display mb-2 text-4xl">Sign in to continue</h1>
        <p className="mb-5 text-sm text-muted-foreground">Sign in with Google to use the app. Your resume, jobs and API key stay in this browser; they are not sent to the Sheet.</p>
        <label className="mb-1 block text-sm font-medium" htmlFor="gate-mobile">Mobile number (optional, not verified)</label>
        <input id="gate-mobile" inputMode="tel" autoComplete="tel" maxLength={20} value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98xxxxxxxx" className="mb-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
        <p className="mb-4 text-xs text-muted-foreground">Only if you want us to be able to reach you. We do not check it by OTP.</p>
        <label className="mb-4 flex items-start gap-2 text-sm">
          <input data-testid="gate-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4" />
          <span>I am 18 or older, and I agree that Akash Sync Agent may store my name, email, the mobile number above (if given), when I first and last used the app, how many times, and a random device id with a light device hint, in a private Google Sheet, to run and protect this service. I can ask for deletion at any time. <button type="button" onClick={openPrivacy} className="underline text-primary cursor-pointer">Read the privacy notice</button>.</span>
        </label>
        <div ref={btn} className="min-h-[44px]">{!consent && <p className="text-sm text-muted-foreground">Tick the box to show the Google button.</p>}</div>
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
