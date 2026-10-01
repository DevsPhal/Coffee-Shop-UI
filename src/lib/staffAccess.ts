import type { Role } from "@/store/api/types";

export function isStaffRole(role: Role | undefined | null): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "BARISTA";
}

export function adminLoginUrl(): string {
  const base = (process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001").replace(/\/$/, "");
  return `${base}/auth/login`;
}

export const STAFF_ACCOUNT_MESSAGE =
  "This is a staff account. Staff sign in on the admin dashboard, not the customer site.";
