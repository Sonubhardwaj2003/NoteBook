import { useState, useEffect } from "react";

/**
 * Persists state to localStorage under `key`, syncing on every change.
 * Falls back to `initialValue` if nothing is stored yet or JSON parsing fails.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (err) {
      console.warn(`Could not read localStorage key "${key}":`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Could not write localStorage key "${key}":`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
