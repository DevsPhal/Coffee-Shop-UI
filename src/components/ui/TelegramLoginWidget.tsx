"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Loader2, Send } from "lucide-react";
import { useGetTelegramWidgetConfigQuery, useLoginTelegramMutation } from "@/store/api/authApi";
import { apiErrorMessage } from "@/store/api/baseApi";
import { toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/states";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useMounted } from "@/hooks/useMounted";
import type { TelegramWidgetAuthRequest } from "@/store/api/types";

declare global {
  interface Window {
    /** Telegram's widget calls this by name once the customer approves the login prompt. */
    onTelegramAuth?: (user: TelegramWidgetAuthRequest) => void;
  }
}

/** Build-time fallback, used only if the API's widget config can't be fetched. */
const FALLBACK_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

/**
 * Telegram only renders the widget on the domain set with @BotFather's /setdomain, so on
 * localhost it shows "Bot domain invalid". Local testing goes through a public tunnel (ngrok)
 * whose domain is set on a test bot instead.
 */
function isLocalHost() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"].includes(window.location.hostname);
}

/**
 * "Log in with Telegram" via Telegram's own widget script. Register-or-login: the widget proves
 * identity (its `hash` is an HMAC the API verifies against the bot token), so an approved
 * callback goes straight to `/api/auth/login/telegram`, which signs in a known Telegram account
 * or creates a customer account for a new one — no OTP step, unlike email login.
 *
 * The bot comes from the API (`/api/auth/telegram/widget-config`), the same source the backend's
 * own widget test page uses, so frontend and backend can never disagree about which bot's token
 * verifies the login. NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is only a fallback.
 */
export function TelegramLoginWidget({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLanguage();
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loginTelegram] = useLoginTelegramMutation();
  const { data: config, isLoading: isLoadingConfig } = useGetTelegramWidgetConfigQuery();
  const botUsername = config?.botUsername || FALLBACK_BOT_USERNAME;
  // True from the moment Telegram hands back an approved login until our API answers. Without
  // it, the gap between approving in Telegram and the redirect showed nothing at all, so a slow
  // or failed sign-in looked exactly like "nothing happened".
  const [isSigningIn, setIsSigningIn] = useState(false);
  const onLocalHost = mounted && isLocalHost();

  useEffect(() => {
    const container = containerRef.current;
    if (!botUsername || !container || onLocalHost) return;

    window.onTelegramAuth = (user) => {
      setIsSigningIn(true);
      loginTelegram(user)
        .unwrap()
        .then(() => {
          toast.add({ type: "success", description: "Signed in with Telegram." });
          onSuccess();
        })
        .catch((err) => {
          // Logged so a failure can be diagnosed from DevTools, not only the toast.
          console.error("[Telegram login] API rejected the sign-in", err);
          setIsSigningIn(false);
          toast.add({
            type: "error",
            description: apiErrorMessage(err, "Telegram sign-in failed. Please try again."),
          });
        });
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    container.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
      // The script injects its iframe next to itself; clearing both means a re-run (a changed
      // bot, or React's dev double-mount) renders one button instead of stacking a second.
      container.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botUsername, onLocalHost]);

  if (!isLoadingConfig && !botUsername) return null;

  return (
    <div className="w-full">
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t("or")}
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="flex flex-col items-center gap-2">
        {onLocalHost ? (
          <p className="flex max-w-xs items-start gap-1.5 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-left text-[11px] leading-relaxed text-sky-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t(
              "Telegram login doesn't work on localhost. Open the site through its public domain or an ngrok tunnel whose domain is set on the bot."
            )}
          </p>
        ) : (
          <>
            {/* Held at the widget's large size (238×40) until the iframe paints, so the form
                doesn't jump when Telegram's button appears. */}
            <div className="relative flex min-h-10 min-w-59.5 justify-center">
              {(isLoadingConfig || !mounted) && (
                <Skeleton className="absolute inset-0 rounded-[10px]" />
              )}
              <div ref={containerRef} className="relative flex justify-center [&_iframe]:rounded-[10px]!" />
            </div>

            {isSigningIn ? (
              <p role="status" className="flex items-center gap-1.5 text-xs font-semibold text-[#229ED9]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("Signing you in with Telegram...")}
              </p>
            ) : (
              <p className="flex max-w-xs items-start gap-1 text-center text-[11px] leading-relaxed text-gray-400">
                <Send className="mt-0.5 h-3 w-3 shrink-0" />
                {t(
                  "New to 590st Cafe? An account is created for you. Approve the request in your Telegram app to continue."
                )}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TelegramLoginWidget;
