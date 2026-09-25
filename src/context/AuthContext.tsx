"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { useMounted } from "@/hooks/useMounted";
import { clearTokens, isAuthenticated } from "@/lib/authStorage";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/store/api/authApi";
import type { UserResponse } from "@/store/api/types";

/**
 * The signed-in customer, backed by the API.
 *
 * This used to wrap a zustand store that kept a fabricated user list in the browser. It now
 * reads `/api/users/me` through RTK Query, so `user` is the real account or null.
 *
 * Sign-in and sign-up are no longer exposed here: both are two-step OTP flows that the login
 * and registration screens drive against the API directly, and a one-shot `login()` could not
 * represent the challenge step.
 */

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  avatarUrl: string;
  telegramLinked: boolean;
}

const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";

function toAuthUser(user: UserResponse): AuthUser {
  return {
    userId: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phoneNumber ?? undefined,
    gender: user.gender ?? undefined,
    avatarUrl: user.avatarUrl ?? DEFAULT_AVATAR,
    telegramLinked: user.telegramLinked,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Where the session stands right now. "checking" covers both the server render / first client
 * render (localStorage is unreadable on the server) and a stored token whose `/me` lookup is
 * still in flight — the two moments the UI must not guess, or a signed-in customer sees a
 * "Login" button flash on every reload.
 */
export type AuthStatus = "checking" | "signedIn" | "signedOut";

export function useAuth() {
  const router = useRouter();
  const mounted = useMounted();
  const signedIn = mounted && isAuthenticated();

  const { data, isLoading, isFetching } = useGetCurrentUserQuery(undefined, { skip: !signedIn });

  const status: AuthStatus = !mounted
    ? "checking"
    : !signedIn
      ? "signedOut"
      : data
        ? "signedIn"
        : isLoading || isFetching
          ? "checking"
          : "signedOut";
  const [logoutMutation] = useLogoutMutation();

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // The session is cleared locally either way.
      clearTokens();
    }
    router.push("/");
  };

  return {
    isLoggedIn: status === "signedIn",
    isLoading,
    status,
    user: data ? toAuthUser(data) : null,
    logout,
  };
}
