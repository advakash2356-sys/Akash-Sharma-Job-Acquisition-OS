// Browser-only persistence (localStorage). Nothing is sent to any server. Akash Sync Agent.
import { useEffect, useState } from 'react';
export function usePersisted<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); if (!s) return init; const j = JSON.parse(s); return init && typeof init === 'object' && !Array.isArray(init) ? { ...init, ...j } : j; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full or blocked */ } }, [key, v]);
  return [v, setV];
}
export const clearPersisted = (...keys: string[]) => keys.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
