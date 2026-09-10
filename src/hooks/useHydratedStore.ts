"use client";

import { useMounted } from "./useMounted";

export function useHydratedStore<T, F>(
  store: (callback: (state: T) => F) => F,
  callback: (state: T) => F
): F | undefined {
  const result = store(callback);
  const isHydrated = useMounted();

  return isHydrated ? result : undefined;
}
