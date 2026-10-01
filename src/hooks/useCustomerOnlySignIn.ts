"use client";

import { isStaffRole } from "@/lib/staffAccess";
import { useLazyGetCurrentUserQuery, useLogoutMutation } from "@/store/api/authApi";

export function useCustomerOnlySignIn() {
  const [fetchCurrentUser] = useLazyGetCurrentUserQuery();
  const [logout] = useLogoutMutation();

  return async function confirmCustomer(): Promise<boolean> {
    let role;
    try {
      role = (await fetchCurrentUser(undefined, false).unwrap()).role;
    } catch {
      return true;
    }
    if (!isStaffRole(role)) return true;
    try {
      await logout().unwrap();
    } catch {
    }
    return false;
  };
}
