"use client";

import { isStaffRole } from "@/lib/staffAccess";
import { useLazyGetCurrentUserQuery, useLogoutMutation } from "@/store/api/authApi";

/**
 * Call right after a sign-in has stored fresh tokens. Resolves true for a customer account; a
 * staff account is signed straight back out and resolves false, so the login screen can say why
 * instead of routing a barista or admin into the shop.
 *
 * If the profile lookup itself fails (network blip), this lets the sign-in through — the
 * StaffAccountGuard in the site layout checks the role again once `/me` loads.
 */
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
      // The mutation clears local tokens either way.
    }
    return false;
  };
}
