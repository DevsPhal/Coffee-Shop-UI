"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { CheckCircle2, ChevronDown, Download, Loader2, RefreshCw, Share2 } from "lucide-react";

import { toast } from "@/components/ui/toast";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useConfirmBakongPaymentMutation,
  useGenerateBakongQrMutation,
  useLazyGetMyOrderQuery,
} from "@/store/api/orderApi";
import { useOrderLiveUpdates } from "@/hooks/useOrderLiveUpdates";
import { useMounted } from "@/hooks/useMounted";
import { BANK_APPS, type BankApp, type BankAppId } from "@/lib/bankApps";
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

type CheckOutcome =
  | { kind: "settled" | "unpaid" | "skipped" }
  | { kind: "failed"; message: string };

type Phase = "loading" | "awaiting_fee" | "waiting" | "paid" | "expired" | "error";

export function PaymentpageView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return <OrderPaymentView key={orderId} orderId={orderId} />;
}

function OrderPaymentView({ orderId }: { orderId: string | null }) {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [qrImage, setQrImage] = useState<{ currency: Currency; dataUrl: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [settled, setSettled] = useState<"paid" | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [awaitingFee, setAwaitingFee] = useState(false);

  const [generateQr, { data: qr, isLoading: isGenerating }] = useGenerateBakongQrMutation();
  const [confirmPayment, { isLoading: isChecking }] = useConfirmBakongPaymentMutation();
  const [getOrder] = useLazyGetMyOrderQuery();
  const mounted = useMounted();
  const onPhone = mounted && isPhone();

  const checkInFlightRef = useRef<Promise<CheckOutcome> | null>(null);
  const pollingRequestRef = useRef<Promise<OrderResponse> | null>(null);
  const isRequestingQrRef = useRef(false);
  const hasAdoptedCurrencyRef = useRef(false);
  const hasPaidRef = useRef(false);
  const isActiveRef = useRef(true);
  const lastNoticeRef = useRef<string | null>(null);
  const [guideBank, setGuideBank] = useState<BankAppId>("aba");
  const [qrAction, setQrAction] = useState<"save" | "share" | null>(null);

  useEffect(() => {
    isActiveRef.current = true;
    return () => { isActiveRef.current = false; };
  }, []);

  const notify = useCallback((type: "error" | "warning", description: string) => {
    if (lastNoticeRef.current === description) return;
    lastNoticeRef.current = description;
    toast.add({ type, description });
  }, []);

  const handleOrder = useCallback((order: OrderResponse) => {
    if (!isActiveRef.current || hasPaidRef.current) return true;
    if (order.status === "CANCELLED") {
      setFailure("This order was cancelled.");
      return true;
    }
    if (order.paidAt != null || PAID_STATUSES.includes(order.status)) {
      hasPaidRef.current = true;
      setSettled("paid");
      setFailure(null);
      setVerificationError(null);
      toast.add({ type: "success", description: "Payment received. Thank you!" });
      router.replace(`/checkoutdone?orderId=${encodeURIComponent(order.id)}`);
      return true;
    }
    return false;
  }, [router]);

  const requestQr = useCallback(
    async (chosen: Currency) => {
      if (!orderId || isRequestingQrRef.current || hasPaidRef.current) return;
      isRequestingQrRef.current = true;
      try {
        await pollingRequestRef.current?.catch(() => null);
        if (!isActiveRef.current || hasPaidRef.current) return;
        const existingOrder = await getOrder(orderId, false).unwrap();
        if (handleOrder(existingOrder)) return;
        if (existingOrder.fulfillmentMethod === "DELIVERY" && existingOrder.awaitingDeliveryFee) {
          setAwaitingFee(true);
          return;
        }
        setAwaitingFee(false);
        if (existingOrder.bakongMd5Hash) {
          const checkedOrder = await confirmPayment(orderId).unwrap().catch(() => null);
          if (checkedOrder && handleOrder(checkedOrder)) return;
        }
        let wanted = chosen;
        if (!hasAdoptedCurrencyRef.current) {
          hasAdoptedCurrencyRef.current = true;
          if (existingOrder.bakongMd5Hash && existingOrder.bakongCurrency && existingOrder.bakongCurrency !== chosen) {
            wanted = existingOrder.bakongCurrency;
            setCurrency(wanted);
          }
        }
        const issued = await generateQr({ id: orderId, currency: wanted }).unwrap();
        const dataUrl = await QRCode.toDataURL(issued.qrString, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 512,
          color: { dark: "#000000", light: "#ffffff" },
        });
        if (!isActiveRef.current || hasPaidRef.current) return;
        setQrImage({ currency: issued.currency, dataUrl });
        setSecondsLeft(Math.max(0, Math.floor(issued.expiresInSeconds)));
        setFailure(null);
        setVerificationError(null);
        lastNoticeRef.current = null;
      } catch (err) {
        if (!isActiveRef.current || hasPaidRef.current) return;
        const message = apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "Could not generate the payment QR."
        );
        setFailure(message);
        notify("error", message);
      } finally {
        isRequestingQrRef.current = false;
      }
    },
    [orderId, generateQr, getOrder, confirmPayment, handleOrder, notify]
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
    : settled === "paid"
      ? "paid"
      : failure
        ? "error"
        : awaitingFee
          ? "awaiting_fee"
          : !currentQr || isGenerating
            ? "loading"
            : secondsLeft !== null && secondsLeft <= 0
              ? "expired"
              : "waiting";

  const effectiveMessage = !orderId
    ? "This payment link is missing its order. Please start from the checkout."
    : failure;

  useEffect(() => {
    if (effectivePhase !== "waiting" || secondsLeft === null || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((prev) => (prev ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [effectivePhase, secondsLeft]);

  useEffect(() => {
    if (effectivePhase === "expired") {
      notify("warning", "This QR has expired. Tap “Get a new QR” — if you already paid, we're still checking.");
    }
  }, [effectivePhase, notify]);

  const runCheck = useCallback(async (): Promise<CheckOutcome> => {
    if (!orderId) return { kind: "skipped" };
    try {
      const request = confirmPayment(orderId).unwrap();
      pollingRequestRef.current = request;
      const order = await request;
      if (handleOrder(order)) return { kind: "settled" };
      setVerificationError(null);
      return { kind: "unpaid" };
    } catch (err) {
      try {
        if (handleOrder(await getOrder(orderId, false).unwrap())) return { kind: "settled" };
      } catch {
      }
      const bankUnreachable = (err as { status?: unknown } | null)?.status === 502;
      const message = bankUnreachable
        ? "We can't confirm payments automatically right now. If you've paid, show your bank receipt at the counter — we'll keep checking too."
        : "We couldn't verify your payment yet. We'll keep checking automatically.";
      if (isActiveRef.current && !hasPaidRef.current) setVerificationError(message);
      return { kind: "failed", message };
    } finally {
      pollingRequestRef.current = null;
    }
  }, [orderId, confirmPayment, getOrder, handleOrder]);

  const checkPayment = useCallback(async () => {
    if (!orderId || isRequestingQrRef.current || hasPaidRef.current || checkInFlightRef.current) return;
    const check = runCheck();
    checkInFlightRef.current = check;
    try {
      await check;
    } finally {
      checkInFlightRef.current = null;
    }
  }, [orderId, runCheck]);

  useEffect(() => {
    if (effectivePhase !== "waiting" && effectivePhase !== "expired") return;
    const poll = () => { void checkPayment(); };
    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    window.addEventListener("focus", poll);
    window.addEventListener("online", poll);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", poll);
      window.removeEventListener("online", poll);
      document.removeEventListener("visibilitychange", onVisible);
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

  const shareSupported =
    mounted && typeof navigator !== "undefined" && typeof navigator.canShare === "function";

  const formattedTime =
    secondsLeft === null
      ? "--:--"
      : `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
          secondsLeft % 60
        ).padStart(2, "0")}`;

  const displayAmount =
    qr == null
      ? null
      : currency === "USD"
        ? `$${Number(qr.amount).toFixed(2)}`
        : `${Number(qr.amount).toLocaleString()} ៛`;

  if (effectivePhase === "paid") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h1 className="text-2xl font-extrabold text-gray-900">Payment received</h1>
        <p className="text-sm text-gray-600">Opening your order progress...</p>
        <button type="button" onClick={() => router.replace(`/checkoutdone?orderId=${encodeURIComponent(orderId!)}`)} className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white">
          Track my order
        </button>
      </div>
    );
  }

  if (effectivePhase === "awaiting_fee") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center" role="status" aria-live="polite">
        <Loader2 className="h-12 w-12 animate-spin text-[#A1255B]" />
        <h1 className="text-xl font-extrabold text-gray-900">Confirming your delivery fee</h1>
        <p className="text-sm text-gray-600">
          The shop is reviewing your pinned location and pricing the delivery. Your payment QR
          will appear here automatically — no need to refresh.
        </p>
        <button type="button" onClick={() => router.push("/checkout")} className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700">
          Back to checkout
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 sm:py-6 font-sans min-h-[70vh] flex flex-col justify-center">
      <div>
        <div className="flex items-center justify-between mb-3 w-full">
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 m-0">Scan to pay</h1>
          <button
            onClick={() => router.push("/checkout")}
            type="button"
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 border-none"
          >
            Back
          </button>
        </div>

        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3.5 py-2 shadow-2xs mb-3 w-full">
          <span className="text-xs font-bold text-[#E21F26]">KHQR</span>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
            {effectivePhase === "waiting" ? (
              <Loader2 className="w-3 h-3 text-[#E21F26] animate-spin" />
            ) : null}
            <span className="text-[11px] font-bold text-gray-700" suppressHydrationWarning>
              {effectivePhase === "expired"
                  ? "Expired"
                  : formattedTime}
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm sm:max-w-md mx-auto bg-white rounded-3xl border border-gray-100 shadow-md p-4 sm:p-6 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center mb-2">
            <p className="text-sm font-black tracking-tight text-gray-900 m-0">590st Cafe</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5 mb-0">
              Scan with any Bakong-enabled banking app
            </p>
          </div>

          <div className="relative my-3 flex h-[240px] w-[240px] items-center justify-center rounded-2xl border border-gray-100 bg-white">
            {currentQr && effectivePhase === "waiting" ? (
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
            ) : (
              <div className="px-6">
                <p className="text-sm font-semibold text-gray-700">
                  {effectivePhase === "expired" ? "This QR has expired." : "No QR to show."}
                </p>
                {effectiveMessage ? (
                  <p className="mt-2 text-xs text-red-500">{effectiveMessage}</p>
                ) : null}
              </div>
            )}
          </div>

          {effectivePhase === "waiting" && onPhone ? (
            <div className="mb-3 flex w-full flex-col gap-2.5 text-left">
              <PhonePayGuide
                bank={guideBank}
                onBankChange={setGuideBank}
                onSave={() => { void keepQr("save"); }}
                onShare={shareSupported ? () => { void keepQr("share"); } : undefined}
                busy={qrAction}
                disabled={!currentQr}
              />
            </div>
          ) : null}

          {effectivePhase === "expired" || effectivePhase === "error" ? (
            <button
              type="button"
              onClick={() => {
                setFailure(null);
                setSecondsLeft(null);
                setQrImage(null);
                void requestQr(currency);
              }}
              disabled={!orderId || isChecking || isGenerating}
              className="mb-2 inline-flex items-center gap-2 rounded-xl border-none bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-700 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {effectivePhase === "expired" ? "Get a new QR" : "Try again"}
            </button>
          ) : null}

          <div className="relative mt-2 inline-block">
            <button
              type="button"
              onClick={() => setIsCurrencyDropdownOpen((prev) => !prev)}
              disabled={effectivePhase !== "waiting" || isChecking}
              className="font-extrabold text-gray-900 tracking-tight m-0 text-center flex items-center justify-center gap-1 cursor-pointer bg-transparent border-none p-0 outline-none hover:opacity-85 transition-opacity disabled:opacity-50"
              style={{ fontSize: "16pt" }}
              title="Click to select currency (USD / KHR)"
              suppressHydrationWarning
            >
              <span>{displayAmount ?? "—"}</span>
              <ChevronDown
                className="w-4 h-4 text-gray-900 shrink-0 transition-transform duration-200"
                style={{
                  transform: isCurrencyDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {isCurrencyDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCurrencyDropdownOpen(false)}
                />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 flex flex-col gap-1">
                  {(["USD", "KHR"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setCurrency(option);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer ${
                        currency === option
                          ? "bg-pink-50 text-gray-900"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{option === "USD" ? "USD ($)" : "KHR (៛)"}</span>
                      {currency === option && displayAmount ? (
                        <span className="font-extrabold">{displayAmount}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {effectivePhase === "waiting" || effectivePhase === "expired" ? (
            <p
              role="status"
              aria-live="polite"
              className="mt-3 mb-0 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-700"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {effectivePhase === "waiting"
                ? "Pay with the QR — we confirm it automatically"
                : "Already paid? We're still confirming your transfer"}
            </p>
          ) : null}
          {verificationError ? (
            <p role="status" className="mt-3 mb-0 text-xs text-amber-700">{verificationError}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 w-full">
        <div className="bg-[#E21F26] text-white px-2 py-0.5 rounded text-[9px] font-black tracking-wider shrink-0">
          KHQR
        </div>
        <p className="m-0 leading-tight flex-1 truncate">
          Powered by Bakong · National Bank of Cambodia
        </p>
      </div>
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <span
      className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-[9px] font-bold text-gray-600"
      aria-hidden="true"
    >
      {n}
    </span>
  );
}

function BankBadge({ app, small = false }: { app: BankApp; small?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center whitespace-nowrap font-black tracking-wide ${
        small ? "h-8 min-w-8 rounded-lg px-1.5 text-[9px]" : "h-10 min-w-10 rounded-xl px-2.5 text-[10px]"
      }`}
      style={{ backgroundColor: app.color, color: app.ink }}
      aria-hidden="true"
    >
      {app.shortName}
    </span>
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
    { title: "Save the QR", detail: "Tap Save QR above, or take a screenshot of this QR." },
    { title: `Open ${app.name}`, detail: `In the app, ${app.galleryHint}, then pick the saved QR.` },
    { title: "Check the amount and pay", detail: "Then come back here — we confirm the payment automatically." },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
      <p className="m-0 mb-2.5 text-xs font-bold text-gray-800">Paying on this phone?</p>

      <div className={`grid gap-2 ${onShare ? "grid-cols-2" : "grid-cols-1"}`}>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || busy !== null}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-none bg-[#A1255B] px-4 text-sm font-bold text-white shadow-md transition hover:bg-[#881d52] active:scale-98 disabled:opacity-60 cursor-pointer"
        >
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Save QR
        </button>
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            disabled={disabled || busy !== null}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 transition hover:bg-gray-100 active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            {busy === "share" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Share QR
          </button>
        ) : null}
      </div>

      <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold text-gray-500">Which app do you pay with?</p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Your banking app">
        {(Object.keys(BANK_APPS) as BankAppId[]).map((id) => {
          const option = BANK_APPS[id];
          const selected = id === bank;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onBankChange(id)}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition cursor-pointer ${
                selected ? "border-gray-900 bg-white text-gray-900 shadow-sm" : "border-gray-200 bg-white/60 text-gray-500"
              }`}
            >
              <BankBadge app={option} small />
              {option.shortName}
            </button>
          );
        })}
      </div>

      <ol className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0" aria-live="polite">
        {steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-2.5">
            <StepNumber n={index + 1} />
            <div className="min-w-0">
              <p className="m-0 text-xs font-bold text-gray-900">{step.title}</p>
              <p className="m-0 text-[11px] leading-snug text-gray-500">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default PaymentpageView;
