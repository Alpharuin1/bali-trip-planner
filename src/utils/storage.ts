import { useEffect, useState } from "react";

/**
 * useState wrapper that mirrors its value into localStorage under `key`.
 * Falls back gracefully when storage is unavailable (e.g. SSR / privacy mode).
 */
export function usePersistedState<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue];
}
