"use client";

import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { useLoginTelegramMutation } from "@/store/api/authApi";
import { apiErrorMessage } from "@/store/api/baseApi";
import { toast } from "@/components/ui/toast";
import { useLanguage } from "@/components/ui/translatetokhmer";
import type { TelegramWidgetAuthRequest } from "@/store/api/types";

declare global {
  interface Window {
    /** Telegram's widget calls this by name once the customer approves the login prompt. */
    onTelegramAuth?: (user: TelegramWidgetAuthRequest) => void;
  }
}

/**
 * "Log in with Telegram" via Telegram's own widget script — the only supported entry point for
 * Telegram sign-in; there is no Telegram sign-up (see the link card on the profile page for how
 * an account gets connected to Telegram in the first place). The widget itself proves identity
 * (its `hash` is an HMAC the backend verifies against the bot token), so a successful callback
 * goes straight to `/api/auth/login/telegram` for tokens — no OTP step, unlike email login.
 *
 * Requires NEXT_PUBLIC_TELEGRAM_BOT_USERNAME — the bot's @username as registered with
 * @BotFather, with this app's domain set via /setdomain. Renders nothing when unset rather than
 * showing a button that can never work.
 */
export function TelegramLoginWidget({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loginTelegram] = useLoginTelegramMutation();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    if (!botUsername || !containerRef.current) return;

    window.onTelegramAuth = (user) => {
      loginTelegram(user)
        .unwrap()
        .then(onSuccess)
        .catch((err) => {
          toast.add({
            type: "warning",
            description: apiErrorMessage(
              err,
              "This Telegram account isn't linked to a 590st Cafe account yet. Log in with email, then link Telegram from your profile."
            ),
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
    containerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botUsername]);

  if (!botUsername) return null;

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
        <div ref={containerRef} className="flex justify-center [&_iframe]:!rounded-[10px]" />
        <p className="flex items-center gap-1 text-[11px] text-gray-400">
          <Send className="h-3 w-3" />
          {t("Only works if Telegram is already linked to your account")}
        </p>
      </div>
    </div>
  );
}

export default TelegramLoginWidget;
