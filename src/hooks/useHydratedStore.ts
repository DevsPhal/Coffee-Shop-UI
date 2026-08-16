"use client";

import { useState, useEffect } from "react";

export function useHydratedStore<T, F>(
  store: (callback: (state: T) => F) => F,
  callback: (state: T) => F
): F | undefined {
  const result = store(callback);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? result : undefined;
}
