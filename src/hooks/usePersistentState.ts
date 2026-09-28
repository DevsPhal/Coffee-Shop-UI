"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * `useState` that survives a page refresh.
 *
 * Backed by sessionStorage, so a reload brings back what the customer had typed or picked —
 * checkout details, the menu's category and search, the open profile tab — while closing the
 * tab starts clean. Values must be JSON-serialisable: keep `File`s, passwords and OTPs in
 * plain `useState`.
 *
 * These pages are server-rendered, and the server has no sessionStorage. So the first render
 * always uses `initial` (matching the server HTML) and the saved value is restored right after
 * mount; nothing is written back until then, so the restore can't be clobbered by `initial`.
 */

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring after hydration is the point
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Unreadable or corrupt — keep the initial value.
    }
    setRestored(true);
  }, [key]);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Private mode or a full quota — the state still works, it just won't survive a reload.
    }
  }, [key, value, restored]);

  return [value, setValue];
}

/** Forgets saved state: one key, or everything when called with no key (on sign-out). */
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
    // Nothing to clear.
  }
}
