"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const PREFIX = "590st-shop:";

export function usePersistentState<T>(
  key: string,
  initial: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(PREFIX + key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
    }
    setRestored(true);
  }, [key]);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
    }
  }, [key, value, restored]);

  return [value, setValue];
}

export function clearPersistentState(key?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (key) {
      window.sessionStorage.removeItem(PREFIX + key);
      return;
    }
    Object.keys(window.sessionStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.sessionStorage.removeItem(k));
  } catch {
  }
}
