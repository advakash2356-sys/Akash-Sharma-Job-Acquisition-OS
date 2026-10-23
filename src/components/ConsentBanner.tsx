import { useEffect, useState } from 'react';
import { ANALYTICS_ON, CONSENT_EVENT, gpcOn, setStatsOptOut, statsChoiceMade } from '../lib/analytics';

/** Asks before any usage counting. Nothing is counted and no referral source is saved until "Allow". Hidden when GPC/DNT is on (treated as "no"). */
export default function ConsentBanner() {
  const [show, setShow] = useState(() => ANALYTICS_ON && !gpcOn() && !statsChoiceMade());
  useEffect(() => { const f = () => setShow(false); window.addEventListener(CONSENT_EVENT, f); return () => window.removeEventListener(CONSENT_EVENT, f); }, []);
  if (!show) return null;
  return (
    <div role="region" aria-label="Usage counting choice" data-testid="consent-banner" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-wrap items-center gap-3 rounded-2xl border border-border bg-card-solid p-4 text-sm shadow-2xl">
      <p className="min-w-[240px] flex-1">May we count anonymous usage (page views and a few step names, through GoatCounter, no cookies, no content)? It stays off unless you allow it. <a href="/privacy" className="text-primary underline">Details</a></p>
      <button data-testid="consent-no" onClick={() => setStatsOptOut(true)} className="min-h-11 rounded-full border border-border px-4 cursor-pointer">No thanks</button>
      <button data-testid="consent-yes" onClick={() => setStatsOptOut(false)} className="min-h-11 rounded-full bg-primary px-4 text-primary-foreground cursor-pointer">Allow</button>
    </div>
  );
}
