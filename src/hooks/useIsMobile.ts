"use client";

import { useSyncExternalStore } from "react";

/** Below Tailwind's `sm` breakpoint — the layout the phone-specific UI is built for. */
const PHONE_QUERY = "(max-width: 639px)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * True on a phone-width viewport, kept in sync as the window resizes. Always false on the
 * server and during hydration, so server and client render the same markup.
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(PHONE_QUERY).matches, () => false);
}
