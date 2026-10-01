"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/common/BrandLogo";
import { adminLoginUrl } from "@/lib/staffAccess";

export function AdminloginpageView() {
  const target = adminLoginUrl();

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#F9FAFC] px-4 text-center">
      <BrandLogo className="h-12" />
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      <p className="text-sm text-gray-500">
        Taking you to the staff dashboard…{" "}
        <a href={target} className="font-semibold text-[#A1255B] underline">
          Continue
        </a>
      </p>
    </main>
  );
}

export default AdminloginpageView;
