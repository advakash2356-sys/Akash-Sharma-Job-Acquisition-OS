import { useEffect, useState } from 'react';
/** Announcement / maintenance text set by the admin (empty = nothing shown). Read from /api/status, cached a minute on the server. */
export default function SiteBanner() {
  const [t, setT] = useState('');
  useEffect(() => { fetch('/api/status').then((r) => r.json()).then((d) => setT(String(d?.banner || ''))).catch(() => {}); }, []);
  if (!t) return null;
  return <div role="status" data-testid="site-banner" className="relative z-[70] bg-[#ff6a2b] px-4 py-2 text-center text-sm font-medium text-[#1a0c05]">{t}</div>;
}
