import type { Role } from "@/store/api/types";

/**
 * The storefront is for customers only. Staff (SUPER_ADMIN, ADMIN, BARISTA) work in the admin
 * dashboard — a separate app with its own login — so a staff session here is turned away rather
 * than treated as a shopper. The API remains the real authorization boundary.
 */
export function isStaffRole(role: Role | undefined | null): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "BARISTA";
}

/** Where staff sign in. Defaults to the dashboard's local dev port. */
export function adminLoginUrl(): string {
  const base = (process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001").replace(/\/$/, "");
  return `${base}/auth/login`;
}

export const STAFF_ACCOUNT_MESSAGE =
  "This is a staff account. Staff sign in on the admin dashboard, not the customer site.";
