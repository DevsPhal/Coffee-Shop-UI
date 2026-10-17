"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  useCheckTelegramLoginMutation,
  useGetTelegramWidgetConfigQuery,
  useStartTelegramLoginMutation,
} from "@/store/api/authApi";
import { apiErrorMessage } from "@/store/api/baseApi";
import { toast } from "@/components/ui/toast";
import type { TelegramLoginChallenge } from "@/store/api/types";

const FALLBACK_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
const POLL_INTERVAL_MS = 2000;
const QR_CODE_PIXELS = 320;

export type TelegramLoginFailure = "expired" | "rejected" | "network" | "error";

export type TelegramLoginPhase =
  | { kind: "idle" }
  | { kind: "connecting" }
  | { kind: "waiting"; challenge: TelegramLoginChallenge; expiresAt: number; botStarted: boolean }
  | { kind: "signing-in" }
  | { kind: "failed"; reason: TelegramLoginFailure; message: string; fromApi: boolean };

const EXPIRED_MESSAGE = "Your verification request has expired. Please try again.";

function isTransientError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("status" in err)) return false;
  const status = err.status;
  return typeof status === "number" ? status >= 500 : status === "FETCH_ERROR" || status === "TIMEOUT_ERROR";
}

function isUnreachable(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("status" in err)) return false;
  const status = err.status;
  return status === "FETCH_ERROR" || status === "TIMEOUT_ERROR" || status === 502 || status === 504;
}

function apiFailure(err: unknown, fallback: string): TelegramLoginPhase {
  const message = apiErrorMessage(err as Parameters<typeof apiErrorMessage>[0], "");
  return { kind: "failed", reason: "error", message: message || fallback, fromApi: message !== "" };
}

export function useTelegramLogin(onSuccess: () => Promise<boolean> | boolean | void) {
  const { data: config, isLoading: isLoadingConfig } = useGetTelegramWidgetConfigQuery();
  const [startTelegramLogin] = useStartTelegramLoginMutation();
  const [checkTelegramLogin] = useCheckTelegramLoginMutation();
  const [phase, setPhase] = useState<TelegramLoginPhase>({ kind: "idle" });
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
      setPhase(
        isUnreachable(err)
          ? { kind: "failed", reason: "network", message: "Unable to reach Telegram.", fromApi: false }
          : apiFailure(err, "Unable to connect to Telegram. Please try again.")
      );
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

    const finish = (next: TelegramLoginPhase) => {
      stopped = true;
      clearTimeout(timer);
      if (next.kind !== "signing-in") busyRef.current = false;
      setPhase(next);
    };

    const poll = async () => {
      if (stopped || inFlight) return;
      clearTimeout(timer);
      if (Date.now() >= expiresAt) {
        finish({ kind: "failed", reason: "expired", message: EXPIRED_MESSAGE, fromApi: false });
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
              reason: "rejected",
              message: "The login was cancelled in Telegram. Nobody was signed in.",
              fromApi: false,
            });
            return;
          case "EXPIRED":
            finish({ kind: "failed", reason: "expired", message: EXPIRED_MESSAGE, fromApi: false });
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
    QRCode.toDataURL(challenge.deepLink, { margin: 1, width: QR_CODE_PIXELS })
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

  const botHandle = `@${challenge?.botUsername ?? config?.botUsername ?? FALLBACK_BOT_USERNAME ?? ""}`.replace(
    /^@@/,
    "@"
  );

  return {
    phase,
    start,
    cancel,
    isActive: phase.kind !== "idle",
    isLoadingConfig,
    isAvailable: isLoadingConfig || Boolean(config?.botUsername || FALLBACK_BOT_USERNAME),
    botHandle,
    secondsLeft,
    totalSeconds: challenge?.expiresInSeconds ?? 0,
    qrCode,
  };
}

export type TelegramLogin = ReturnType<typeof useTelegramLogin>;
