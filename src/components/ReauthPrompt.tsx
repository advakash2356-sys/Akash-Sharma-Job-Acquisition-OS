import { useEffect, useRef, useState } from 'react';
import { finishReauth, REAUTH_EVENT, renderReauthButton, signOutUser } from '../lib/googleAuth';

/** Dialog over the current page when the Google sign-in has expired and could not be refreshed silently.
 *  Nothing on the page is reset; the request that needed it continues after you sign in. */
export default function ReauthPrompt() {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');
  const btn = useRef<HTMLDivElement>(null);
  useEffect(() => { const f = () => { setErr(''); setOpen(true); }; window.addEventListener(REAUTH_EVENT, f); return () => window.removeEventListener(REAUTH_EVENT, f); }, []);
  useEffect(() => { if (open && btn.current) { btn.current.innerHTML = ''; renderReauthButton(btn.current, (t) => { setOpen(false); finishReauth(t); }, setErr); } }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="reauth-title" data-testid="reauth-prompt">
      <div className="w-full max-w-md rounded-2xl bg-card-solid p-6 shadow-2xl">
        <h2 id="reauth-title" className="mb-2 text-2xl font-semibold">Sign in again to continue</h2>
        <p className="mb-4 text-sm text-muted-foreground">Your Google sign-in expired. Your work on this page is kept; what you were doing will carry on after you sign in.</p>
        <div ref={btn} className="min-h-[44px]" />
        {err && <p role="alert" className="mt-2 text-sm text-danger">{err}</p>}
        <div className="mt-4 flex gap-3 text-sm">
          <button className="underline cursor-pointer" onClick={() => { setOpen(false); finishReauth(null); }}>Not now</button>
          <button className="text-muted-foreground underline cursor-pointer" onClick={() => { finishReauth(null); signOutUser(); }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
