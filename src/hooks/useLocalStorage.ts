import { useState, useCallback, useEffect } from 'react';

/**
 * useState backed by localStorage. Auto-saves on change, restores on mount.
 * Falls back to initialValue if localStorage is empty or parsing fails.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Ignore parse errors
    }
    return initialValue;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [key, state]);

  // Reset to initial value and clear localStorage
  const reset = useCallback(() => {
    localStorage.removeItem(key);
    setState(initialValue);
  }, [key, initialValue]);

  return [state, setState, reset];
}
