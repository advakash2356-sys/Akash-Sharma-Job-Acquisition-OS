import { useEffect, useState } from 'react';
import { getSession, watchAuth } from '../lib/googleAuth';
import { ANALYTICS_ON, CONSENT_EVENT, gpcOn, setStatsOptOut, statsChoiceMade } from '../lib/analytics';

/** Asks before any usage counting. Nothing is counted and no referral source is saved until "Allow". Hidden when GPC/DNT is on (treated as "no"). */
export default function ConsentBanner() {
  const [show, setShow] = useState(() => ANALYTICS_ON && !gpcOn() && !statsChoiceMade());
  const [signedIn, setSignedIn] = useState(() => !!getSession());
  useEffect(() => watchAuth((u) => setSignedIn(!!u)), []);
  // Shown only after sign-in, so it never sits over the sign-in/consent step; reserves space so it never covers page buttons.
  useEffect(() => { const on = show && signedIn; document.body.style.paddingBottom = on ? '96px' : ''; return () => { document.body.style.paddingBottom = ''; }; }, [show, signedIn]);
  useEffect(() => { const f = () => setShow(false); window.addEventListener(CONSENT_EVENT, f); return () => window.removeEventListener(CONSENT_EVENT, f); }, []);
  if (!show || !signedIn) return null;
  return (
    <div role="region" aria-label="Usage counting choice" data-testid="consent-banner" className="relative z-50 mx-2 my-2 flex sm:fixed sm:inset-x-2 sm:bottom-2 sm:mx-auto sm:my-0 max-w-2xl items-center gap-2 rounded-2xl border border-border bg-card-solid px-3 py-2 text-xs shadow-2xl sm:gap-3 sm:p-4 sm:text-sm">
      <p className="min-w-0 flex-1">Count anonymous usage (GoatCounter, no cookies, no content)? Off unless you allow. <a href="/privacy" className="text-primary underline">Details</a></p>
      <button data-testid="consent-no" onClick={() => { setShow(false); setStatsOptOut(true); }} className="min-h-11 shrink-0 rounded-full border border-border px-3 cursor-pointer">No</button>
      <button data-testid="consent-yes" onClick={() => { setShow(false); setStatsOptOut(false); }} className="min-h-11 shrink-0 rounded-full bg-primary px-3 text-primary-foreground cursor-pointer">Allow</button>
    </div>
  );
}
