"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { CheckCircle2, Clock, Download, Loader2, RefreshCw, Share2, XCircle } from "lucide-react";

import { toast } from "@/components/ui/toast";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useConfirmBakongPaymentMutation,
  useGenerateBakongQrMutation,
  useLazyGetMyOrderQuery,
} from "@/store/api/orderApi";
import { useOrderLiveUpdates } from "@/hooks/useOrderLiveUpdates";
import { useMounted } from "@/hooks/useMounted";
import { useCart } from "@/context/CartContext";
import { reorderLines } from "@/lib/reorder";
import { BANK_APPS, type BankAppId } from "@/lib/bankApps";
import type { Currency, OrderResponse } from "@/store/api/types";
import "@/app/globals.scss";

const isPhone = () =>
  typeof navigator !== "undefined" &&
  (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

const PAID_STATUSES: OrderResponse["status"][] = ["PAID", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED", "DELIVERED"];

const POLL_MS = 4000;

function qrFile(dataUrl: string, fileName: string) {
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
  return new File([bytes], fileName, { type: "image/png" });
}

/** True when the phone can hand the QR image to other apps (iOS/Android share sheet). */
function canShareImage(file: File) {
  return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
}

function downloadImage(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

type CheckOutcome = "settled" | "unpaid" | "failed" | "skipped";

type Phase = "loading" | "awaiting_fee" | "waiting" | "expired" | "paid" | "cancelled" | "error";

export function PaymentpageView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return <OrderPaymentView key={orderId} orderId={orderId} />;
}

function OrderPaymentView({ orderId }: { orderId: string | null }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [qrImage, setQrImage] = useState<{ currency: Currency; dataUrl: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  // The order's payment window has closed: no new QR, we only wait for the final payment check.
  const [windowClosed, setWindowClosed] = useState(false);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [settled, setSettled] = useState<"paid" | "cancelled" | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [confirmDelayed, setConfirmDelayed] = useState(false);
  const [awaitingFee, setAwaitingFee] = useState(false);
  const [guideBank, setGuideBank] = useState<BankAppId>("aba");
  const [qrAction, setQrAction] = useState<"save" | "share" | null>(null);

  const [generateQr, { data: qr, isLoading: isGenerating }] = useGenerateBakongQrMutation();
  const [confirmPayment] = useConfirmBakongPaymentMutation();
  const [getOrder] = useLazyGetMyOrderQuery();
  const mounted = useMounted();
  const onPhone = mounted && isPhone();

  const checkInFlightRef = useRef<Promise<CheckOutcome> | null>(null);
  const isRequestingQrRef = useRef(false);
  const hasAdoptedCurrencyRef = useRef(false);
  const isDoneRef = useRef(false);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = true;
    return () => { isActiveRef.current = false; };
  }, []);

  /** Applies the latest order state; true once the order is paid or cancelled and the page is done. */
  const handleOrder = useCallback((next: OrderResponse) => {
    if (!isActiveRef.current || isDoneRef.current) return true;
    setOrder(next);
    if (next.status === "CANCELLED") {
      isDoneRef.current = true;
      setSettled("cancelled");
      return true;
    }
    if (next.paidAt != null || PAID_STATUSES.includes(next.status)) {
      isDoneRef.current = true;
      setSettled("paid");
      toast.add({ type: "success", description: "Payment received. Thank you!" });
      router.replace(`/checkoutdone?orderId=${encodeURIComponent(next.id)}`);
      return true;
    }
    return false;
  }, [router]);

  const requestQr = useCallback(
    async (chosen: Currency) => {
      if (!orderId || isRequestingQrRef.current || isDoneRef.current) return;
      isRequestingQrRef.current = true;
      try {
        await checkInFlightRef.current?.catch(() => null);
        if (!isActiveRef.current || isDoneRef.current) return;
        const existing = await getOrder(orderId, false).unwrap();
        if (handleOrder(existing)) return;
        if (existing.fulfillmentMethod === "DELIVERY" && existing.awaitingDeliveryFee) {
          setAwaitingFee(true);
          return;
        }
        setAwaitingFee(false);
        let wanted = chosen;
        if (!hasAdoptedCurrencyRef.current) {
          hasAdoptedCurrencyRef.current = true;
          if (existing.bakongMd5Hash && existing.bakongCurrency && existing.bakongCurrency !== chosen) {
            wanted = existing.bakongCurrency;
            setCurrency(wanted);
          }
        }
        let issued;
        try {
          issued = await generateQr({ id: orderId, currency: wanted }).unwrap();
        } catch (err) {
          // The order already had a QR and the server won't issue another: its payment time is up.
          if (existing.bakongExpiresAt && (err as { status?: unknown } | null)?.status === 400) {
            setWindowClosed(true);
            return;
          }
          throw err;
        }
        const dataUrl = await QRCode.toDataURL(issued.qrString, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 512,
          color: { dark: "#000000", light: "#ffffff" },
        });
        if (!isActiveRef.current || isDoneRef.current) return;
        setQrImage({ currency: issued.currency, dataUrl });
        setSecondsLeft(Math.max(0, Math.floor(issued.expiresInSeconds)));
        setFailure(null);
      } catch (err) {
        if (!isActiveRef.current || isDoneRef.current) return;
        const message = apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "Could not load the payment QR."
        );
        setFailure(message);
        toast.add({ type: "error", description: message });
      } finally {
        isRequestingQrRef.current = false;
      }
    },
    [orderId, generateQr, getOrder, handleOrder]
  );

  useEffect(() => {
    if (!orderId) return;
    const timer = setTimeout(() => { void requestQr(currency); }, 0);
    return () => clearTimeout(timer);
  }, [orderId, currency, requestQr]);

  useEffect(() => {
    if (!awaitingFee) return;
    const interval = setInterval(() => { void requestQr(currency); }, POLL_MS);
    return () => clearInterval(interval);
  }, [awaitingFee, currency, requestQr]);

  useOrderLiveUpdates((message) => {
    if (message.order.id !== orderId) return;
    if (handleOrder(message.order)) return;
    if (awaitingFee && !message.order.awaitingDeliveryFee) {
      void requestQr(currency);
    }
  });

  const currentQr = qrImage && qrImage.currency === currency ? qrImage.dataUrl : null;

  const effectivePhase: Phase = !orderId
    ? "error"
    : settled ?? (failure
      ? "error"
      : awaitingFee
        ? "awaiting_fee"
        : windowClosed || (currentQr && secondsLeft !== null && secondsLeft <= 0)
          ? "expired"
          : !currentQr || isGenerating
            ? "loading"
            : "waiting");

  useEffect(() => {
    if (effectivePhase !== "waiting" || secondsLeft === null || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((prev) => (prev ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [effectivePhase, secondsLeft]);

  // Asks the server whether Bakong has the payment. The server paces the real Bakong calls, so this is cheap;
  // `promptly` (customer just came back from their bank app) lets it look again sooner.
  const checkPayment = useCallback(async (promptly = false) => {
    if (!orderId || isRequestingQrRef.current || isDoneRef.current || checkInFlightRef.current) return;
    const check = (async (): Promise<CheckOutcome> => {
      try {
        const latest = await confirmPayment({ id: orderId, manual: promptly }).unwrap();
        if (handleOrder(latest)) return "settled";
        setConfirmDelayed(false);
        return "unpaid";
      } catch (err) {
        try {
          if (handleOrder(await getOrder(orderId, false).unwrap())) return "settled";
        } catch {
          // Offline or the API is down — the next poll tries again.
        }
        if (isActiveRef.current) setConfirmDelayed((err as { status?: unknown } | null)?.status === 502);
        return "failed";
      }
    })();
    checkInFlightRef.current = check;
    try {
      await check;
    } finally {
      checkInFlightRef.current = null;
    }
  }, [orderId, confirmPayment, getOrder, handleOrder]);

  useEffect(() => {
    if (effectivePhase !== "waiting" && effectivePhase !== "expired") return;
    const poll = () => { void checkPayment(); };
    const onReturn = () => {
      if (document.visibilityState === "visible") void checkPayment(true);
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    window.addEventListener("focus", onReturn);
    window.addEventListener("online", poll);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onReturn);
      window.removeEventListener("online", poll);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [effectivePhase, checkPayment]);

  // No deep links: the customer keeps the QR (Photos, or straight into an app via the share sheet)
  // and scans it from their photos in their bank app. This page then confirms the payment by itself.
  const keepQr = useCallback(async (mode: "save" | "share") => {
    if (!currentQr || !orderId) return;
    const fileName = `590st-cafe-khqr-${orderId.slice(0, 8)}.png`;
    const file = qrFile(currentQr, fileName);
    setQrAction(mode);
    try {
      // iPhone saves to Photos from the share sheet ("Save Image"); Android and desktop download it.
      const useShareSheet = canShareImage(file) && (mode === "share" || !/Android/i.test(navigator.userAgent));
      if (useShareSheet) {
        await navigator.share({ files: [file], title: "590st Cafe payment QR" });
      } else {
        downloadImage(currentQr, fileName);
        toast.add({ type: "success", description: "QR saved — now scan it from your photos in your bank app." });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.add({ type: "error", description: "Couldn't save the QR. Take a screenshot of it instead." });
    } finally {
      setQrAction(null);
    }
  }, [currentQr, orderId]);

  const orderAgain = () => {
    if (!order) return;
    reorderLines(order).forEach((line) => addItem(line, false));
    openCart();
    router.push("/menu");
  };

  const shareSupported =
    mounted && typeof navigator !== "undefined" && typeof navigator.canShare === "function";

  const formattedTime =
    secondsLeft === null
      ? "--:--"
      : `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const amount = qr
    ? { value: qr.amount, currency }
    : order?.bakongAmount != null
      ? { value: order.bakongAmount, currency: order.bakongCurrency ?? "USD" }
      : null;
  const displayAmount =
    amount == null
      ? null
      : amount.currency === "USD"
        ? `$${Number(amount.value).toFixed(2)}`
        : `${Number(amount.value).toLocaleString()} ៛`;

  if (effectivePhase === "paid") {
    return (
      <StatusScreen
        icon={<CheckCircle2 className="h-16 w-16 text-green-600" />}
        title="Payment received"
        message="Opening your order progress…"
        primary={{
          label: "Track my order",
          onClick: () => router.replace(`/checkoutdone?orderId=${encodeURIComponent(orderId!)}`),
        }}
      />
    );
  }

  if (effectivePhase === "cancelled") {
    const timedOut = windowClosed || (secondsLeft !== null && secondsLeft <= 0);
    return (
      <StatusScreen
        icon={<XCircle className="h-16 w-16 text-red-500" />}
        title="Order cancelled"
        message={
          timedOut
            ? "The payment time ran out before we received your payment, so this order was cancelled."
            : "This order was cancelled."
        }
        primary={order ? { label: "Order again", onClick: orderAgain } : undefined}
        secondary={{ label: "Back to menu", onClick: () => router.push("/menu") }}
      />
    );
  }

  if (effectivePhase === "awaiting_fee") {
    return (
      <StatusScreen
        icon={<Loader2 className="h-12 w-12 animate-spin text-[#A1255B]" />}
        title="Confirming your delivery fee"
        message="The shop is reviewing your pinned location and pricing the delivery. Your payment QR will appear here automatically — no need to refresh."
        secondary={{ label: "Back to checkout", onClick: () => router.push("/checkout") }}
      />
    );
  }

  const isLive = effectivePhase === "waiting";
  const isExpired = effectivePhase === "expired";
  const isUrgent = isLive && secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col px-4 py-4 font-sans sm:py-6">
      <div className="mb-4 flex w-full items-center justify-between">
        <h1 className="m-0 text-xl font-extrabold text-gray-900">Scan to pay</h1>
        <button
          onClick={() => router.push("/checkout")}
          type="button"
          className="cursor-pointer rounded-full border-none bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-200 active:scale-95"
        >
          Back
        </button>
      </div>

      <section className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#E21F26] px-1.5 py-0.5 text-[10px] font-black tracking-wider text-white">KHQR</span>
            <span className="text-sm font-extrabold text-gray-900">590st Cafe</span>
          </div>
          {isLive || isExpired ? (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${
                isExpired
                  ? "bg-red-50 text-red-600"
                  : isUrgent
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-100 text-gray-700"
              }`}
              suppressHydrationWarning
            >
              {isExpired ? "Time's up" : `Pay within ${formattedTime}`}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-center px-5 pb-5 pt-4 text-center">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Amount to pay</p>
          <p className="m-0 mt-1 text-3xl font-extrabold tracking-tight text-gray-900 tabular-nums" suppressHydrationWarning>
            {displayAmount ?? "—"}
          </p>

          {!isExpired ? (
            <div className="mt-3 inline-flex rounded-full bg-gray-100 p-1" role="radiogroup" aria-label="Pay in currency">
              {(["USD", "KHR"] as const).map((option) => {
                const selected = currency === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setCurrency(option)}
                    disabled={!isLive}
                    className={`min-w-[72px] cursor-pointer rounded-full border-none px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${
                      selected ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {option === "USD" ? "USD $" : "KHR ៛"}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="relative mt-4 flex h-[240px] w-[240px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-2">
            {currentQr && isLive ? (
              <Image
                src={currentQr}
                alt="Bakong KHQR for this order"
                width={224}
                height={224}
                unoptimized
                className="h-[224px] w-[224px]"
                priority
              />
            ) : effectivePhase === "loading" ? (
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            ) : isExpired ? (
              <div className="flex flex-col items-center gap-2 px-6">
                <Clock className="h-10 w-10 text-gray-300" />
                <p className="m-0 text-sm font-bold text-gray-800">Payment time is up</p>
                <p className="m-0 text-xs leading-snug text-gray-500">This QR can no longer be paid.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6">
                <p className="m-0 text-sm font-bold text-gray-800">Couldn&apos;t load the QR</p>
                {failure || !orderId ? (
                  <p className="m-0 text-xs leading-snug text-red-500">
                    {orderId ? failure : "This payment link is missing its order. Please start from the checkout."}
                  </p>
                ) : null}
                {orderId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFailure(null);
                      setQrImage(null);
                      void requestQr(currency);
                    }}
                    disabled={isGenerating}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border-none bg-[#A1255B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#881d52] active:scale-95 disabled:opacity-60"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try again
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {isLive ? (
            <p className="m-0 mt-3 text-xs text-gray-500">Scan with ABA, ACLEDA, Bakong or any KHQR banking app</p>
          ) : null}

          {isLive || isExpired ? (
            <p
              role="status"
              aria-live="polite"
              className={`m-0 mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold ${
                isExpired || confirmDelayed ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    isExpired || confirmDelayed ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isExpired || confirmDelayed ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </span>
              {isExpired
                ? "Checking for a last-minute payment…"
                : confirmDelayed
                  ? "Paid? Confirmation is taking a little longer"
                  : "Waiting for payment — confirms automatically"}
            </p>
          ) : null}
          {isExpired ? (
            <p className="m-0 mt-2 text-xs leading-snug text-gray-500">
              If you paid, your order continues automatically. If not, it will be cancelled.
            </p>
          ) : isLive && confirmDelayed ? (
            <p className="m-0 mt-2 text-xs leading-snug text-gray-500">
              Keep this page open — your order continues automatically once the payment is confirmed.
            </p>
          ) : null}
        </div>
      </section>

      {isLive && onPhone ? (
        <PhonePayGuide
          bank={guideBank}
          onBankChange={setGuideBank}
          onSave={() => { void keepQr("save"); }}
          onShare={shareSupported ? () => { void keepQr("share"); } : undefined}
          busy={qrAction}
          disabled={!currentQr}
        />
      ) : null}

      <p className="m-0 mt-5 text-center text-[10px] text-gray-400">
        Powered by Bakong · National Bank of Cambodia
      </p>
    </div>
  );
}

function StatusScreen({
  icon,
  title,
  message,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  primary?: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      {icon}
      <h1 className="m-0 text-2xl font-extrabold text-gray-900">{title}</h1>
      <p className="m-0 text-sm leading-relaxed text-gray-600">{message}</p>
      <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {primary ? (
          <button
            type="button"
            onClick={primary.onClick}
            className="cursor-pointer rounded-full border-none bg-[#A1255B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#881d52] active:scale-95"
          >
            {primary.label}
          </button>
        ) : null}
        {secondary ? (
          <button
            type="button"
            onClick={secondary.onClick}
            className="cursor-pointer rounded-full border-none bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200 active:scale-95"
          >
            {secondary.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PhonePayGuide({
  bank,
  onBankChange,
  onSave,
  onShare,
  busy,
  disabled,
}: {
  bank: BankAppId;
  onBankChange: (bank: BankAppId) => void;
  onSave: () => void;
  onShare?: () => void;
  busy: "save" | "share" | null;
  disabled: boolean;
}) {
  const app = BANK_APPS[bank];
  const steps = [
    { title: "Save the QR", detail: "Tap Save QR, or take a screenshot of it." },
    { title: `Open ${app.name}`, detail: `${app.galleryHint.charAt(0).toUpperCase()}${app.galleryHint.slice(1)}, then pick the saved QR.` },
    { title: "Pay and come back", detail: "Check the amount, pay, then return here — we confirm it automatically." },
  ];

  return (
    <section className="mt-4 w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="m-0 text-sm font-extrabold text-gray-900">Paying on this phone?</h2>
      <p className="m-0 mt-0.5 text-xs text-gray-500">Save the QR, then scan it from your photos.</p>

      <div className={`mt-3 grid gap-2 ${onShare ? "grid-cols-2" : "grid-cols-1"}`}>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || busy !== null}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-[#A1255B] px-4 text-sm font-bold text-white shadow-md shadow-[#A1255B]/20 transition hover:bg-[#881d52] active:scale-98 disabled:opacity-60"
        >
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Save QR
        </button>
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            disabled={disabled || busy !== null}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 transition hover:bg-gray-50 active:scale-98 disabled:opacity-60"
          >
            {busy === "share" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Share QR
          </button>
        ) : null}
      </div>

      <p className="m-0 mt-5 mb-2 text-xs font-bold text-gray-700">Which app do you pay with?</p>
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-gray-100 p-1" role="radiogroup" aria-label="Your banking app">
        {(Object.keys(BANK_APPS) as BankAppId[]).map((id) => {
          const selected = id === bank;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onBankChange(id)}
              className={`min-h-9 cursor-pointer truncate rounded-xl border-none px-1 text-xs font-bold transition ${
                selected ? "bg-white text-[#A1255B] shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {BANK_APPS[id].shortName}
            </button>
          );
        })}
      </div>

      <ol className="m-0 mt-4 flex list-none flex-col gap-3 p-0" aria-live="polite">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A1255B]/10 text-[11px] font-extrabold text-[#A1255B]"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="m-0 text-sm font-bold text-gray-900">{step.title}</p>
              <p className="m-0 mt-0.5 text-xs leading-snug text-gray-500">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default PaymentpageView;
