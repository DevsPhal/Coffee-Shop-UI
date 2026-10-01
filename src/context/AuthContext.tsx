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
  avatarUrl: string;
  telegramLinked: boolean;
  role: Role;
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
