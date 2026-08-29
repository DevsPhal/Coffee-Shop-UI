"use client";

import React from "react";
import { useAuthStore, UserData, userDataSchema } from "@/store/useAuthStore";

export { userDataSchema };
export type { UserData };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const store = useAuthStore();

  return {
    isLoggedIn: store.isLoggedIn,
    user: store.user,
    registeredUsers: store.registeredUsers,
    login: store.login,
    signup: store.signup,
    updateUser: store.updateUser,
    logout: store.logout,
  };
}
