import { useEffect, useState } from 'react';

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      const parsed = JSON.parse(raw);
      if (Array.isArray(initial)) return (Array.isArray(parsed) ? parsed : initial) as T;
      return { ...(initial as object), ...parsed } as T;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or unavailable */ }
  }, [key, value]);
  return [value, setValue] as const;
}
