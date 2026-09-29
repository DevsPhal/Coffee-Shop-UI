"use client";

import React, { useState } from "react";
import { Loader2, LogOut, ShieldAlert, ExternalLink } from "lucide-react";

import { BrandLogo } from "@/components/common/BrandLogo";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useAuth } from "@/context/AuthContext";
import { adminLoginUrl, isStaffRole, STAFF_ACCOUNT_MESSAGE } from "@/lib/staffAccess";

/**
 * Keeps staff sessions out of the storefront. The login screen already signs a staff account
 * straight back out; this catches the rest — a session restored from storage, or one whose role
 * changed after sign-in — and blocks every shop page until they sign out.
 *
 * While the session is still being checked the page renders normally, so customers and guests
 * never wait on `/me` just to see the menu.
 */
export function StaffAccountGuard({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [signingOut, setSigningOut] = useState(false);

  if (!user || !isStaffRole(user.role)) return <>{children}</>;

  return (
    <main className="flex min-h-svh flex-1 items-center justify-center bg-[#F9FAFC] px-4">
      <div
        role="alert"
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm"
      >
        <div className="flex justify-center">
          <BrandLogo className="h-12" />
        </div>
        <div className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-full bg-[#A1255B]/10">
          <ShieldAlert className="h-7 w-7 text-[#A1255B]" />
        </div>
        <h1 className="mt-5 text-lg font-bold text-gray-900">
          {t("This is a staff account")}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{t(STAFF_ACCOUNT_MESSAGE)}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={adminLoginUrl()} className={buttonVariants()}>
            <ExternalLink className="h-4 w-4" />
            {t("Go to admin dashboard")}
          </a>
          <Button
            variant="outline"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await logout();
              setSigningOut(false);
            }}
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {t("Sign out")}
          </Button>
        </div>
      </div>
    </main>
  );
}

export default StaffAccountGuard;
