import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/authStorage";
import type { ApiEnvelope, ApiErrorBody, AuthTokenResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Every controller wraps its payload in `ApiResponse<T>`, so each endpoint unwraps with this
 * rather than repeating `(r) => r.data` inline.
 */
export function unwrap<T>(response: ApiEnvelope<T>): T {
  return response.data;
}

/** Pulls the human-readable message out of an `ErrorResponse` body for toasts. */
export function apiErrorMessage(
  error: FetchBaseQueryError | undefined,
  fallback = "Something went wrong. Please try again."
): string {
  if (!error) return fallback;
  if ("status" in error && error.status === "FETCH_ERROR") {
    return "Cannot reach the API. Check that it is running and NEXT_PUBLIC_API_URL is correct.";
  }
  const body = (error as { data?: Partial<ApiErrorBody> }).data;
  return body?.message ?? fallback;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

/**
 * Serialises refresh attempts: without it, several 401s arriving together would each fire
 * their own /refresh-token call and all but the first would present an already-rotated token.
 * Deliberately tiny — the only thing needed is "is a refresh in flight, and let me await it".
 */
const refreshLock = {
  pending: null as Promise<void> | null,
  isLocked() {
    return this.pending !== null;
  },
  waitForUnlock() {
    return this.pending ?? Promise.resolve();
  },
  acquire() {
    let release!: () => void;
    this.pending = new Promise<void>((resolve) => {
      release = () => {
        this.pending = null;
        resolve();
      };
    });
    return release;
  },
};

/**
 * Wraps the base query so an expired access token is refreshed once and the original request
 * retried. A failed refresh drops the local session; it does not navigate anywhere — see
 * `dropSession` below for why.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshLock.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  // A 401 with no access token on file means this request was never authenticated in the
  // first place — an anonymous visitor hitting a guest-accessible endpoint, or one the backend
  // happens to gate. Either way there is no session to refresh or log out of; only a 401
  // *after* having a token — meaning it just expired — goes through reauth.
  if (!getAccessToken()) return result;

  if (refreshLock.isLocked()) {
    // Another request is already refreshing — wait for it, then retry with the new token.
    await refreshLock.waitForUnlock();
    return rawBaseQuery(args, api, extraOptions);
  }

  const release = refreshLock.acquire();
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      dropSession(api.dispatch);
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "/api/auth/refresh-token",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    const tokens = (refreshResult.data as ApiEnvelope<AuthTokenResponse> | undefined)?.data;
    if (!tokens?.accessToken) {
      dropSession(api.dispatch);
      return result;
    }

    setTokens(tokens);
    result = await rawBaseQuery(args, api, extraOptions);
  } finally {
    release();
  }

  return result;
};

/**
 * Clears an expired session and lets the UI react on its own — it deliberately does not
 * navigate. A raw `window.location.href` here used to fire from deep inside the data layer
 * with no coordination with whatever the Next.js router was already doing; landing right as
 * `router.push()` was mid-transition (e.g. immediately after login, when the destination
 * page's first queries can 401) raced a hard document navigation against a soft one and could
 * leave the browser on a broken "this page couldn't load" state. Every screen that actually
 * requires sign-in (checkout, profile) already watches `isLoggedIn` and redirects itself via
 * `router.push("/login?next=...")` — invalidating "Auth" here is what makes that state change
 * visible to them.
 */
function dropSession(dispatch: Parameters<BaseQueryFn>[1]["dispatch"]): void {
  clearTokens();
  dispatch(baseApi.util.invalidateTags(["Auth"]));
}

/**
 * Single API slice; each domain file injects its own endpoints so the store stays one cache
 * and cross-domain invalidation (checkout emptying the cart and adding an order) works.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "Product", "Category", "Banner", "Cart", "Order"],
  endpoints: () => ({}),
});
