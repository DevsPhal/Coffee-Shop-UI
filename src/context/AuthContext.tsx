"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { useMounted } from "@/hooks/useMounted";
import { clearTokens, isAuthenticated } from "@/lib/authStorage";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/store/api/authApi";
import type { Role, UserResponse } from "@/store/api/types";

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  /** Null when there's no photo; `UserAvatar` then shows the person's initials. */
  avatarUrl: string | null;
  telegramLinked: boolean;
  role: Role;
}

function toAuthUser(user: UserResponse): AuthUser {
  return {
    userId: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phoneNumber ?? undefined,
    gender: user.gender ?? undefined,
    avatarUrl: user.avatarUrl,
    telegramLinked: user.telegramLinked,
    role: user.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export type AuthStatus = "checking" | "signedIn" | "signedOut";

export function useAuth() {
  const router = useRouter();
  const mounted = useMounted();
  const signedIn = mounted && isAuthenticated();

  // Refetch when the tab regains focus or the network returns, so edits made elsewhere (the admin dashboard, a
  // Telegram login on another device) show up without a reload.
  const { data, isLoading, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: !signedIn,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

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
