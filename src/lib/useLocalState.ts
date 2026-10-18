import { useEffect, useState } from 'react';

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? ({ ...(typeof initial === 'object' && !Array.isArray(initial) ? initial : {}), ...JSON.parse(raw) } as T) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or unavailable */ }
  }, [key, value]);
  return [value, setValue] as const;
}
