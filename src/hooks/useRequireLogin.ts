"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { isAuthenticated } from "@/lib/authStorage";

/** One sign-in prompt at a time, so tapping several "Add" buttons doesn't queue a pile of them. */
let signInToastId: string | null = null;

/**
 * Guests can browse the menu, but adding to cart and ordering need a customer login.
 * Returns true when signed in; otherwise suggests signing in with a toast whose button goes to
 * login and comes back here after — the guest stays on the menu until they choose to go.
 */
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
