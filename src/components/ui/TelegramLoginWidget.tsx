"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, HelpCircle, Info, Loader2, RotateCcw, Send } from "lucide-react";
import { useGetTelegramWidgetConfigQuery, useLoginTelegramMutation } from "@/store/api/authApi";
import { apiErrorMessage } from "@/store/api/baseApi";
import { toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/states";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useMounted } from "@/hooks/useMounted";
import type { TelegramWidgetAuthRequest } from "@/store/api/types";

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramWidgetAuthRequest) => void;
  }
}

const FALLBACK_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

const TROUBLESHOOTING_TIPS = [
  "The confirmation comes from the chat named \"Telegram\" (blue check), not from the 590st Cafe bot. Open it and tap Confirm.",
  "Choose Cambodia (+855) and type your number without the leading 0, e.g. 12 345 678.",
  "Use the number of an existing Telegram account, and keep the Telegram app signed in.",
  "Allow pop-ups for this site. The phone prompt opens in a new window.",
  "After several tries Telegram pauses confirmations for a while. Wait a few minutes, then try again.",
];

function isUnsupportedHost(loginDomain: string | null | undefined) {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  if (loginDomain) return host !== loginDomain;
  return ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"].includes(host);
}

export function TelegramLoginWidget({
  onSuccess,
}: {
  onSuccess: () => Promise<boolean> | boolean | void;
}) {
  const { t } = useLanguage();
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loginTelegram] = useLoginTelegramMutation();
  const { data: config, isLoading: isLoadingConfig } = useGetTelegramWidgetConfigQuery();
  const botUsername = config?.botUsername || FALLBACK_BOT_USERNAME;
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [scriptState, setScriptState] = useState<"loading" | "ready" | "failed">("loading");
  const [attempt, setAttempt] = useState(0);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  const signingInRef = useRef(false);
  const loginDomain = config?.loginDomain;
  const onUnsupportedHost = mounted && !isLoadingConfig && isUnsupportedHost(loginDomain);

  useEffect(() => {
    const container = containerRef.current;
    if (!botUsername || !container || isLoadingConfig || onUnsupportedHost) return;

    window.onTelegramAuth = async (user) => {
      if (signingInRef.current) return;
      signingInRef.current = true;
      setIsSigningIn(true);
      try {
        await loginTelegram(user).unwrap();
      } catch (err) {
        console.error("[Telegram login] API rejected the sign-in", err);
        signingInRef.current = false;
        setIsSigningIn(false);
        toast.add({
          type: "error",
          description: apiErrorMessage(
            err as Parameters<typeof apiErrorMessage>[0],
            "Telegram sign-in failed. Please try again."
          ),
        });
        return;
      }
      const accepted = (await onSuccessRef.current()) !== false;
      if (accepted) {
        toast.add({ type: "success", description: "Signed in with Telegram." });
        return;
      }
      signingInRef.current = false;
      setIsSigningIn(false);
    };

    setScriptState("loading");

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.onload = () => setScriptState("ready");
    script.onerror = () => setScriptState("failed");
    container.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
      container.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botUsername, isLoadingConfig, onUnsupportedHost, attempt]);

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
        {onUnsupportedHost ? (
          <div className="flex max-w-xs items-start gap-1.5 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-left text-[11px] leading-relaxed text-sky-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {loginDomain ? (
              <span>
                {t("Telegram login only works on")}{" "}
                <a
                  href={`https://${loginDomain}${window.location.pathname}${window.location.search}`}
                  className="inline-flex items-center gap-0.5 font-semibold underline"
                >
                  {loginDomain}
                  <ExternalLink className="h-3 w-3" />
                </a>
                . {t("Open the site there, or sign in with email.")}
              </span>
            ) : (
              t(
                "Telegram login doesn't work on localhost. Open the site through its public domain or an ngrok tunnel whose domain is set on the bot."
              )
            )}
          </div>
        ) : (
          <>
            <div className="relative flex min-h-10 min-w-59.5 justify-center">
              {(isLoadingConfig || !mounted || scriptState === "loading") && (
                <Skeleton className="absolute inset-0 rounded-[10px]" />
              )}
              <div ref={containerRef} className="relative flex justify-center [&_iframe]:rounded-[10px]!" />
            </div>

            {scriptState === "failed" && (
              <div role="alert" className="flex max-w-xs flex-col items-center gap-1.5 text-center text-[11px] leading-relaxed text-gray-500">
                <span>
                  {t("Telegram login couldn't load. Check your connection or ad blocker, or sign in with email.")}
                </span>
                <button
                  type="button"
                  onClick={() => setAttempt((n) => n + 1)}
                  className="inline-flex items-center gap-1 font-semibold text-[#229ED9] cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("Try again")}
                </button>
              </div>
            )}

            {isSigningIn ? (
              <p role="status" className="flex items-center gap-1.5 text-xs font-semibold text-[#229ED9]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("Signing you in with Telegram...")}
              </p>
            ) : (
              <>
                <p className="flex max-w-xs items-start gap-1 text-center text-[11px] leading-relaxed text-gray-400">
                  <Send className="mt-0.5 h-3 w-3 shrink-0" />
                  {t(
                    "New to 590st Cafe? An account is created for you. After entering your phone number, open the \"Telegram\" chat in your app and tap Confirm."
                  )}
                </p>
                <details className="w-full max-w-xs text-[11px] leading-relaxed text-gray-500">
                  <summary className="flex cursor-pointer list-none items-center justify-center gap-1 font-semibold text-[#229ED9]">
                    <HelpCircle className="h-3.5 w-3.5" />
                    {t("Didn't get the confirmation in Telegram?")}
                  </summary>
                  <ul className="mt-2 list-disc space-y-1 rounded-xl border border-gray-100 bg-gray-50 py-2 pl-6 pr-3 text-left">
                    {TROUBLESHOOTING_TIPS.map((tip) => (
                      <li key={tip}>{t(tip)}</li>
                    ))}
                  </ul>
                </details>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TelegramLoginWidget;
