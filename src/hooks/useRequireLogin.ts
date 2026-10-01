"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { isAuthenticated } from "@/lib/authStorage";

let signInToastId: string | null = null;

export function useRequireLogin() {
  const router = useRouter();

  return (): boolean => {
    if (isAuthenticated()) return true;
    const here = window.location.pathname + window.location.search;
    if (signInToastId) toast.close(signInToastId);
    signInToastId = toast.add({
      type: "info",
      title: "Sign in to order",
      description: "Browse freely — sign in to add items to your cart and check out.",
      timeout: 8000,
      actionProps: {
        children: "Sign in",
        onClick: () => {
          if (signInToastId) toast.close(signInToastId);
          router.push(`/login?next=${encodeURIComponent(here)}`);
        },
      },
    });
    return false;
  };
}
