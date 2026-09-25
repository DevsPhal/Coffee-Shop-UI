"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { toast, type WelcomeToastData } from "@/components/ui/toast";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useMounted } from "@/hooks/useMounted";
import { isAuthenticated } from "@/lib/authStorage";
import { consumeWelcomePending, firstName, initials, timeOfDayGreeting } from "@/lib/welcomeToast";
import { useGetCurrentUserQuery } from "@/store/api/authApi";

const WELCOME_DURATION = 5000;

/**
 * Greets the customer by name right after they sign in (see lib/welcomeToast). Mounted once in
 * the root layout; renders nothing itself.
 */
export default function LoginWelcome() {
  const { t } = useLanguage();
  const mounted = useMounted();
  // Re-render on navigation: the login screen stores the tokens and then routes away, and this
  // component (in the persistent root layout) must notice the new session to start the lookup.
  usePathname();
  const signedIn = mounted && isAuthenticated();
  const { data: user } = useGetCurrentUserQuery(undefined, { skip: !signedIn });

  useEffect(() => {
    if (!user || !consumeWelcomePending()) return;

    const name = firstName(user.fullName);
    const data: WelcomeToastData = {
      greeting: t(timeOfDayGreeting()),
      initials: initials(user.fullName),
      avatarUrl: user.avatarUrl,
      duration: WELCOME_DURATION,
    };
    toast.add({
      type: "welcome",
      title: name ? `${t("Welcome back")}, ${name}` : t("Welcome back"),
      description: t("Ready for your next cup?"),
      timeout: WELCOME_DURATION,
      data,
    });
  }, [user, t]);

  return null;
}
