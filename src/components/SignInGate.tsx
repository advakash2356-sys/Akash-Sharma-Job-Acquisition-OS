import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { renderGoogleButton } from '../lib/googleAuth';

/** Full-page sign-in step shown before the app when the owner has set GOOGLE_CLIENT_ID. Public pages (privacy, terms, about, feedback) stay open. */
export default function SignInGate({ openPrivacy, back }: { openPrivacy: () => void; back: () => void }) {
  const [mobile, setMobile] = useState('');
  const [err, setErr] = useState('');
  const btn = useRef<HTMLDivElement>(null);
  const live = useRef({ consent: true, mobile: '' });
  live.current = { consent: true, mobile: mobile.trim() };
  // Opens Google's sign-in straight away (One Tap / account chooser), and also shows the Google button.
  useEffect(() => { if (btn.current) { btn.current.innerHTML = ''; renderGoogleButton(btn.current, setErr, () => live.current, { prompt: true }); } }, []);
  return (
    <main data-testid="signin-gate" className="grid min-h-screen place-items-center bg-background p-4">
      <div className="glass w-full max-w-lg rounded-[28px] p-7">
        <div className="mb-2 flex items-center gap-2 text-primary"><ShieldCheck size={20} /><span className="text-sm font-medium">Job Acquisition OS</span></div>
        <h1 className="display mb-2 text-4xl">Sign in to continue</h1>
        <p className="mb-5 text-sm text-muted-foreground">Sign in with Google to use the app. Your resume, jobs and API key stay in this browser; they are not sent to the Sheet.</p>
        <div ref={btn} className="mb-4 min-h-[44px]" />
        <p data-testid="gate-consent" className="mb-4 text-xs text-muted-foreground">By continuing with Google you confirm you are 18 or older and agree that Akash Sync Agent may store your name and email, the mobile number below (if you add one), when you first and last used the app and how many times, and a random device id with a light device hint, in a private Google Sheet, to run and protect this service. You can withdraw and ask for deletion at any time. <button type="button" onClick={openPrivacy} className="underline text-primary cursor-pointer">Privacy notice</button>.</p>
        <details className="mb-2 text-sm"><summary className="cursor-pointer text-muted-foreground">Add a mobile number (optional)</summary>
          <label className="mb-1 mt-2 block text-sm font-medium" htmlFor="gate-mobile">Mobile number <span className="font-normal text-muted-foreground">(optional, not verified)</span></label>
          <input id="gate-mobile" inputMode="tel" autoComplete="tel" maxLength={20} value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98xxxxxxxx" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          <p className="mt-1 text-xs text-muted-foreground">Only if you want us to be able to reach you. Leave it empty to skip; enter it before you continue with Google.</p>
        </details>
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
