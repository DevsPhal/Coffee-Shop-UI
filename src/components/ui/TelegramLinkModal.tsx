"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Copy, Check, ExternalLink } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useGetCurrentUserQuery, useGetTelegramLinkCodeMutation } from "@/store/api/authApi";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Linking Telegram is a bot conversation, not a widget: POST /api/users/me/telegram/link-code
 * hands back a short-lived `code` plus a `deepLink` (a t.me URL). Opening that link starts a
 * chat with the bot pre-filled with the code, and Telegram's webhook completes the link
 * server-side — this modal's only job is to display that link/code and notice when it lands.
 */
export function TelegramLinkModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLanguage();
  const [getLinkCode, { isLoading }] = useGetTelegramLinkCodeMutation();
  const { data: user, refetch: refetchUser } = useGetCurrentUserQuery();
  const [linkCode, setLinkCode] = useState<{ code: string; deepLink: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestCode = async () => {
    try {
      const result = await getLinkCode().unwrap();
      setLinkCode({ code: result.code, deepLink: result.deepLink });
      setSecondsLeft(result.expiresInSeconds);
    } catch (err) {
      toast.add({
        type: "warning",
        description: apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "Could not start linking Telegram. Please try again."
        ),
      });
    }
  };

  // Fetch a code as soon as the modal opens, so there's no extra click before the customer
  // sees anything actionable.
  useEffect(() => {
    if (open && !linkCode) {
      // requestCode's own setState calls run inside its async body, after this effect has
      // already returned — not synchronously here — but the linter can't see that boundary.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      requestCode();
    }
    if (!open) {
      setLinkCode(null);
      setCopied(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Countdown, and a light poll for `telegramLinked` flipping true once the customer has
  // actually gone and chatted with the bot — the modal has no other way to know that happened.
  useEffect(() => {
    if (!open || !linkCode) return;
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    pollRef.current = setInterval(() => void refetchUser(), 4000);
    return () => {
      clearInterval(tick);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, linkCode, refetchUser]);

  useEffect(() => {
    if (user?.telegramLinked && open) {
      toast.add({ type: "success", description: "Telegram linked! You can now log in with it too." });
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.telegramLinked]);

  const copyCode = async () => {
    if (!linkCode) return;
    try {
      await navigator.clipboard.writeText(linkCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the code is still on screen to copy by hand.
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md p-6 text-left" showCloseButton>
        <div className="modal_header_group">
          <div className="modal_icon_box !bg-sky-50 !text-sky-600">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h3 className="modal_title">{t("Link Telegram")}</h3>
            <p className="modal_subtitle">
              {t("Open the link below to connect your Telegram account.")}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {isLoading || !linkCode ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500">
              {t("Getting your link ready...")}
            </div>
          ) : (
            <>
              <a
                href={linkCode.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-600"
              >
                <Send className="h-4 w-4" />
                {t("Open in Telegram")}
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("Or enter this code in the bot")}
                  </p>
                  <p className="font-mono text-lg font-bold tracking-widest text-gray-900">
                    {linkCode.code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? t("Copied") : t("Copy")}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                {secondsLeft > 0
                  ? `${t("Code expires in")} ${formatCountdown(secondsLeft)}`
                  : t("This code has expired.")}
              </p>

              {secondsLeft === 0 ? (
                <Button type="button" onClick={requestCode} className="w-full">
                  {t("Get a new code")}
                </Button>
              ) : (
                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                  {t("Waiting for you to open Telegram...")}
                </p>
              )}
            </>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}

export default TelegramLinkModal;
