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

export function unwrap<T>(response: ApiEnvelope<T>): T {
  return response.data;
}

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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshLock.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  if (!getAccessToken()) return result;

  if (refreshLock.isLocked()) {
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

function dropSession(dispatch: Parameters<BaseQueryFn>[1]["dispatch"]): void {
  clearTokens();
  dispatch(baseApi.util.invalidateTags(["Auth"]));
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "Product", "Category", "Banner", "Cart", "Order", "StaffCall"],
  endpoints: () => ({}),
});
