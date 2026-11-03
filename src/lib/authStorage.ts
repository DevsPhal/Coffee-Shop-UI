import type { AuthTokenResponse } from "@/store/api/types";
import { clearPersistentState } from "@/hooks/usePersistentState";

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

const tokenListeners = new Set<() => void>();

/** Calls `listener` whenever the access token changes in this tab or another one (sign-in, sign-out, refresh). */
export function onAccessTokenChange(listener: () => void): () => void {
  if (!canUseStorage()) return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ACCESS_TOKEN_KEY) listener();
  };
  tokenListeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    tokenListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyAccessTokenChange(): void {
  tokenListeners.forEach((listener) => listener());
}

export function setTokens(tokens: AuthTokenResponse): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {
  }
  notifyAccessTokenChange();
}

export function clearTokens(): void {
  if (!canUseStorage()) return;
  clearPersistentState();
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
  }
  notifyAccessTokenChange();
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
