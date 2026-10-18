import { useEffect, useState } from 'react';
import { KEY_EVENT, getUserApiKey } from './userApiKey';

let serverKey: boolean | null = null;
let pending: Promise<void> | null = null;
function fetchStatus() {
  if (!pending) pending = fetch('/api/status').then((r) => r.json()).then((d) => { serverKey = !!d.serverKey; }).catch(() => { serverKey = false; });
  return pending;
}

/** True when AI calls can work: the user has saved a key, or the site owner configured a server key. */
export function useAiReady() {
  const [, bump] = useState(0);
  useEffect(() => {
    const f = () => bump((n) => n + 1);
    window.addEventListener(KEY_EVENT, f);
    fetchStatus().then(f);
    return () => window.removeEventListener(KEY_EVENT, f);
  }, []);
  const hasKey = !!getUserApiKey();
  return { ready: hasKey || serverKey === true, hasKey, checking: serverKey === null && !hasKey };
}
