"use client";

import React from "react";
import { useRouter } from "next/navigation";

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

export function useAuth() {
  const router = useRouter();
  const signedIn = isAuthenticated();

  const { data, isLoading } = useGetCurrentUserQuery(undefined, { skip: !signedIn });
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
    isLoggedIn: signedIn && Boolean(data),
    isLoading,
    user: data ? toAuthUser(data) : null,
    logout,
  };
}
