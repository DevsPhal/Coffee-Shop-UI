"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { CircleCheck, ExternalLink, Loader2, Send, TriangleAlert } from "lucide-react";
import {
  useCheckTelegramLoginMutation,
  useGetTelegramWidgetConfigQuery,
  useStartTelegramLoginMutation,
} from "@/store/api/authApi";
import { apiErrorMessage } from "@/store/api/baseApi";
import { toast } from "@/components/ui/toast";
import { useLanguage } from "@/components/ui/translatetokhmer";
import type { TelegramLoginChallenge } from "@/store/api/types";

const FALLBACK_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
const POLL_INTERVAL_MS = 2000;

type Phase =
  | { kind: "idle" }
  | { kind: "connecting" }
  | { kind: "waiting"; challenge: TelegramLoginChallenge; expiresAt: number; botStarted: boolean }
  | { kind: "signing-in" }
  | { kind: "failed"; message: string; fromApi: boolean };

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const EXPIRED_MESSAGE = "Your verification request has expired. Please try again.";

function isTransientError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("status" in err)) return false;
  const status = err.status;
  return typeof status === "number" ? status >= 500 : status === "FETCH_ERROR" || status === "TIMEOUT_ERROR";
}

function apiFailure(err: unknown, fallback: string): Phase {
  const message = apiErrorMessage(err as Parameters<typeof apiErrorMessage>[0], "");
  return { kind: "failed", message: message || fallback, fromApi: message !== "" };
}

export function TelegramLoginWidget({
  onSuccess,
}: {
  onSuccess: () => Promise<boolean> | boolean | void;
}) {
  const { t, tStatic } = useLanguage();
  const { data: config, isLoading: isLoadingConfig } = useGetTelegramWidgetConfigQuery();
  const [startTelegramLogin] = useStartTelegramLoginMutation();
  const [checkTelegramLogin] = useCheckTelegramLoginMutation();
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [now, setNow] = useState(() => Date.now());
  const [qrCode, setQrCode] = useState<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const busyRef = useRef(false);
  const challenge = phase.kind === "waiting" ? phase.challenge : null;
  const expiresAt = phase.kind === "waiting" ? phase.expiresAt : 0;
  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));

  const start = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setQrCode(null);
    setPhase({ kind: "connecting" });
    try {
      const created = await startTelegramLogin().unwrap();
      setNow(Date.now());
      setPhase({
        kind: "waiting",
        challenge: created,
        expiresAt: Date.now() + created.expiresInSeconds * 1000,
        botStarted: false,
      });
    } catch (err) {
      busyRef.current = false;
      setPhase(apiFailure(err, "Unable to connect to Telegram. Please try again."));
    }
  };

  const cancel = () => {
    busyRef.current = false;
    setPhase({ kind: "idle" });
  };

  useEffect(() => {
    if (!challenge) return;
    let stopped = false;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (next: Phase) => {
      stopped = true;
      clearTimeout(timer);
      if (next.kind !== "signing-in") busyRef.current = false;
      setPhase(next);
    };

    const poll = async () => {
      if (stopped || inFlight) return;
      clearTimeout(timer);
      if (Date.now() >= expiresAt) {
        finish({ kind: "failed", message: EXPIRED_MESSAGE, fromApi: false });
        return;
      }
      inFlight = true;
      try {
        const result = await checkTelegramLogin({
          requestId: challenge.requestId,
          pollToken: challenge.pollToken,
        }).unwrap();
        if (stopped) return;
        switch (result.status) {
          case "PENDING":
          case "AWAITING_CONFIRMATION":
            setPhase((prev) =>
              prev.kind === "waiting"
                ? { ...prev, botStarted: result.status === "AWAITING_CONFIRMATION" }
                : prev
            );
            break;
          case "APPROVED": {
            finish({ kind: "signing-in" });
            const accepted = (await onSuccessRef.current()) !== false;
            if (accepted) {
              toast.add({ type: "success", description: "Signed in with Telegram." });
            } else {
              busyRef.current = false;
              setPhase({ kind: "idle" });
            }
            return;
          }
          case "REJECTED":
            finish({
              kind: "failed",
              message: "The login was cancelled in Telegram. Nobody was signed in.",
              fromApi: false,
            });
            return;
          case "EXPIRED":
            finish({ kind: "failed", message: EXPIRED_MESSAGE, fromApi: false });
            return;
        }
      } catch (err) {
        if (stopped) return;
        if (!isTransientError(err)) {
          finish(apiFailure(err, "Telegram sign-in failed. Please try again."));
          return;
        }
      } finally {
        inFlight = false;
      }
      if (!stopped) timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    const pollWhenVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    timer = setTimeout(poll, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", pollWhenVisible);
    window.addEventListener("focus", pollWhenVisible);

    return () => {
      stopped = true;
      clearTimeout(timer);
      clearInterval(ticker);
      document.removeEventListener("visibilitychange", pollWhenVisible);
      window.removeEventListener("focus", pollWhenVisible);
    };
  }, [challenge, expiresAt, checkTelegramLogin]);

  useEffect(() => {
    if (!challenge) return;
    let cancelled = false;
    QRCode.toDataURL(challenge.deepLink, { margin: 1, width: 176 })
      .then((dataUrl) => {
        if (!cancelled) setQrCode(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrCode(null);
      });
    return () => {
      cancelled = true;
    };
  }, [challenge]);

  if (!isLoadingConfig && !config?.botUsername && !FALLBACK_BOT_USERNAME) return null;

  const botHandle = `@${challenge?.botUsername ?? config?.botUsername ?? FALLBACK_BOT_USERNAME ?? ""}`.replace(
    /^@@/,
    "@"
  );

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
        {phase.kind === "waiting" ? (
          <div
            role="status"
            aria-live="polite"
            className="flex w-full max-w-xs flex-col items-center gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-4 text-center"
          >
            <p className="text-sm font-semibold text-sky-900">
              {phase.botStarted
                ? t("Almost there! Tap “Confirm login” in Telegram.")
                : t("Please open Telegram and press Start to continue.")}
            </p>

            <a
              href={phase.challenge.deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#229ED9] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1c8cc2]"
            >
              <Send className="h-4 w-4" />
              {t("Open Telegram")}
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
            <span className="text-[11px] text-sky-800">
              {t("Official bot")}: <strong className="font-semibold">{botHandle}</strong>
            </span>

            {qrCode && (
              <div className="hidden flex-col items-center gap-1 sm:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode}
                  alt={t("QR code that opens the 590st Cafe Telegram bot")}
                  width={132}
                  height={132}
                  className="rounded-lg border border-sky-100 bg-white p-1"
                />
                <span className="text-[11px] text-sky-800">
                  {t("Telegram on your phone? Scan this code instead.")}
                </span>
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-sky-800">
              {t("In Telegram: tap Start, then tap “Confirm login”. This page signs you in automatically.")}
            </p>

            <div className="flex w-full items-center justify-between text-[11px] text-sky-800">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("Waiting for Telegram")} · {formatCountdown(secondsLeft)}
              </span>
              <button
                type="button"
                onClick={cancel}
                className="cursor-pointer font-semibold text-sky-700 underline"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        ) : phase.kind === "signing-in" ? (
          <p role="status" className="flex items-center gap-1.5 text-xs font-semibold text-[#229ED9]">
            <CircleCheck className="h-3.5 w-3.5" />
            {t("Telegram verification successful. Signing you in...")}
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={start}
              disabled={phase.kind === "connecting" || isLoadingConfig}
              className="flex w-full max-w-70 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#229ED9] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1c8cc2] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {phase.kind === "connecting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("Connecting to Telegram...")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {phase.kind === "failed" ? t("Try again with Telegram") : t("Log in with Telegram")}
                </>
              )}
            </button>

            {phase.kind === "failed" ? (
              <p
                role="alert"
                className="flex max-w-xs items-start gap-1.5 text-center text-[11px] leading-relaxed text-red-600"
              >
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {phase.fromApi ? tStatic(phase.message) : t(phase.message)}
              </p>
            ) : (
              <p className="flex max-w-xs items-start gap-1 text-center text-[11px] leading-relaxed text-gray-400">
                <Send className="mt-0.5 h-3 w-3 shrink-0" />
                {t(
                  "Opens our Telegram bot: tap Start, then Confirm. New to 590st Cafe? An account is created for you."
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
