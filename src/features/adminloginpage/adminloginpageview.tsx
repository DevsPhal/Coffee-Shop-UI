"use client";

import { useEffect } from "react";
import { Loader } from "@/components/ui/states";

import { BrandLogo } from "@/components/common/BrandLogo";
import { adminLoginUrl } from "@/lib/staffAccess";

export function AdminloginpageView() {
  const target = adminLoginUrl();

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-(--gray-50) px-4 text-center">
      <BrandLogo className="h-12" />
      <p className="text-sm text-gray-500">
        <Loader label="Taking you to the staff dashboard…" />{" "}
        <a href={target} className="font-semibold text-brand underline">
          Continue
        </a>
      </p>
    </main>
  );
}

export default AdminloginpageView;
