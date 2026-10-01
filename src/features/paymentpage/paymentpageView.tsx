"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { CheckCircle2, ChevronDown, Download, ExternalLink, Loader2, RefreshCw, Smartphone } from "lucide-react";

import { toast } from "@/components/ui/toast";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useConfirmBakongPaymentMutation,
  useGenerateBakongDeeplinkMutation,
  useGenerateBakongQrMutation,
  useLazyGetMyOrderQuery,
} from "@/store/api/orderApi";
import { useOrderLiveUpdates } from "@/hooks/useOrderLiveUpdates";
import { useMounted } from "@/hooks/useMounted";
import { BANK_APPS, bankAppLaunch, bankAppPayLaunch, storeUrl, type BankApp, type BankAppId } from "@/lib/bankApps";
import type { Currency, OrderResponse } from "@/store/api/types";
import "@/app/globals.scss";

const isPhone = () =>
  typeof navigator !== "undefined" &&
  (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

const PAID_STATUSES: OrderResponse["status"][] = ["PAID", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED", "DELIVERED"];

const POLL_MS = 4000;

const APP_OPEN_TIMEOUT_MS = 2500;

async function saveQrImage(dataUrl: string, fileName: string, preferDownload = false): Promise<boolean> {
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
  const file = new File([bytes], fileName, { type: "image/png" });
  if (!preferDownload && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return false;
    }
  }
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
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
  const [qrImage, setQrImage] = useState<{ currency: Currency; dataUrl: string; khqr: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [settled, setSettled] = useState<"paid" | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [awaitingFee, setAwaitingFee] = useState(false);

  const [generateQr, { data: qr, isLoading: isGenerating }] = useGenerateBakongQrMutation();
  const [confirmPayment, { isLoading: isChecking }] = useConfirmBakongPaymentMutation();
  const [getOrder] = useLazyGetMyOrderQuery();
  const [generateDeeplink, { isLoading: isOpeningBakong }] = useGenerateBakongDeeplinkMutation();
  const mounted = useMounted();
  const onPhone = mounted && isPhone();

  const checkInFlightRef = useRef<Promise<CheckOutcome> | null>(null);
  const pollingRequestRef = useRef<Promise<OrderResponse> | null>(null);
  const isRequestingQrRef = useRef(false);
  const hasAdoptedCurrencyRef = useRef(false);
  const hasPaidRef = useRef(false);
  const isActiveRef = useRef(true);
  const lastNoticeRef = useRef<string | null>(null);
  const [savingFor, setSavingFor] = useState<BankAppId | "other" | null>(null);
  const [savedFor, setSavedFor] = useState<{ bank: BankAppId; qr: string } | null>(null);

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
        setQrImage({ currency: issued.currency, dataUrl, khqr: issued.qrString });
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
  const currentKhqr = qrImage && qrImage.currency === currency ? qrImage.khqr : null;
  const savedForBank = savedFor && savedFor.qr === currentQr ? savedFor.bank : null;
  const savedQrIsStale = savedFor !== null && currentQr !== null && savedFor.qr !== currentQr;

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

  const launchApp = useCallback((url: string, appName: string, installUrl?: string) => {
    let leftPage = false;
    const onLeave = () => { leftPage = true; };
    const onVisibility = () => { if (document.visibilityState === "hidden") leftPage = true; };
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("blur", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.location.href = url;
    window.setTimeout(() => {
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      if (leftPage || !isActiveRef.current || hasPaidRef.current) return;
      toast.add({
        type: "warning",
        title: `${appName} didn't open`,
        description: "Check the app is installed, or open it yourself and scan the saved QR.",
        ...(installUrl
          ? { actionProps: { children: "Get the app", onClick: () => { window.open(installUrl, "_blank", "noopener"); } } }
          : {}),
      });
    }, APP_OPEN_TIMEOUT_MS);
  }, []);

  const openBakongApp = useCallback(async () => {
    if (!orderId) return;
    try {
      const { deeplink } = await generateDeeplink(orderId).unwrap();
      launchApp(deeplink, "Bakong");
    } catch (err) {
      toast.add({
        type: "warning",
        description: apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "Could not open Bakong. Please pay with your bank app instead."
        ),
      });
    }
  }, [orderId, generateDeeplink, launchApp]);

  const openBankApp = useCallback((bank: BankAppId) => {
    const app = BANK_APPS[bank];
    const payUrl = currentKhqr ? bankAppPayLaunch(app, currentKhqr) : null;
    if (payUrl) {
      launchApp(payUrl, app.name, storeUrl(app));
      return;
    }
    const { url, storePage } = bankAppLaunch(app);
    if (storePage) {
      window.open(url, "_blank", "noopener");
      return;
    }
    launchApp(url, app.name, storeUrl(app));
  }, [launchApp, currentKhqr]);

  const chooseBank = useCallback((bank: BankAppId) => {
    if (!currentQr || !orderId) return;
    setSavedFor({ bank, qr: currentQr });
    if (BANK_APPS[bank].khqrLink) {
      openBankApp(bank);
      return;
    }
    if (/Android/i.test(navigator.userAgent)) {
      void saveQrImage(currentQr, `590st-cafe-khqr-${orderId.slice(0, 8)}.png`, true).catch(() => undefined);
      window.setTimeout(() => openBankApp(bank), 400);
      return;
    }
    openBankApp(bank);
  }, [currentQr, orderId, openBankApp]);

  const saveQrFor = useCallback(async (bank: BankAppId | null) => {
    if (!currentQr || !orderId) return;
    setSavingFor(bank ?? "other");
    try {
      const saved = await saveQrImage(
        currentQr,
        `590st-cafe-khqr-${orderId.slice(0, 8)}.png`,
        /Android/i.test(navigator.userAgent)
      );
      if (saved) {
        toast.add({
          type: "success",
          description: "QR saved. In your bank app, tap Scan, choose the photo from your gallery, then come back here.",
        });
      }
    } catch {
      toast.add({ type: "error", description: "Couldn't save the QR. Take a screenshot and scan that instead." });
    } finally {
      setSavingFor(null);
    }
  }, [currentQr, orderId]);

  const openSavedBankApp = useCallback(() => {
    if (savedForBank) openBankApp(savedForBank);
  }, [savedForBank, openBankApp]);

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
              {savedForBank ? (
                <BankSteps
                  app={BANK_APPS[savedForBank]}
                  onOpen={openSavedBankApp}
                  onSaveQr={() => { void saveQrFor(savedForBank); }}
                  isSaving={savingFor === savedForBank}
                  onBack={() => setSavedFor(null)}
                />
              ) : (
                <>
                  <p className="m-0 text-xs font-bold text-gray-800">Paying on this phone?</p>
                  {savedQrIsStale ? (
                    <p role="status" className="m-0 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                      The QR changed. If you took a screenshot, take a new one before paying.
                    </p>
                  ) : null}
                  <p className="m-0 rounded-xl bg-gray-50 px-3 py-2.5 text-[11px] leading-snug text-gray-600">
                    <b className="text-gray-900">ABA</b> opens straight on this payment — just choose your
                    account and confirm. For <b className="text-gray-900">ACLEDA</b>, screenshot this QR
                    first, then scan it from your gallery in the app.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(BANK_APPS) as BankAppId[]).map((bank) => {
                      const app = BANK_APPS[bank];
                      return (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => chooseBank(bank)}
                          disabled={!currentQr}
                          aria-label={`Open ${app.name}`}
                          className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-2 py-3 transition hover:border-gray-300 hover:bg-gray-50 active:scale-98 disabled:opacity-60 cursor-pointer"
                        >
                          <BankBadge app={app} />
                          <span className="text-sm font-bold text-gray-900">{app.shortName}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500">
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            {app.khqrLink ? "Opens on payment" : "Open app & scan"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => { void openBakongApp(); }}
                    disabled={isOpeningBakong}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-800 transition hover:bg-gray-50 active:scale-98 disabled:opacity-60 cursor-pointer"
                  >
                    {isOpeningBakong ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                    {isOpeningBakong ? "Opening Bakong..." : "Bakong app — no screenshot needed"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { void saveQrFor(null); }}
                    disabled={savingFor !== null || !currentQr}
                    className="inline-flex w-full items-center justify-center gap-1.5 border-none bg-transparent py-1 text-[11px] font-semibold text-gray-500 underline disabled:opacity-60 cursor-pointer"
                  >
                    {savingFor === "other" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    Save QR image instead of a screenshot
                  </button>
                </>
              )}
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

function BankSteps({
  app,
  onOpen,
  onSaveQr,
  isSaving,
  onBack,
}: {
  app: BankApp;
  onOpen: () => void;
  onSaveQr: () => void;
  isSaving: boolean;
  onBack: () => void;
}) {
  const steps = app.khqrLink
    ? [
        { title: `Confirm in ${app.name}`, detail: "The payment opens with the amount filled in. Choose your account and confirm." },
        { title: "Come back here", detail: "This page confirms the payment on its own." },
        {
          title: "Payment didn't show up?",
          detail: `Screenshot this QR, then in the app ${app.galleryHint} and pick it.`,
        },
      ]
    : [
        { title: "Have the QR in your photos", detail: "A screenshot of this page works, or use Save QR image below." },
        { title: `Scan it in ${app.name}`, detail: `In the app, ${app.galleryHint}, then pick the QR and pay.` },
        { title: "Come back here", detail: "This page confirms the payment on its own." },
      ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5" role="status" aria-live="polite">
      <div className="mb-3 flex items-center gap-2.5">
        <BankBadge app={app} small />
        <p className="m-0 text-sm font-extrabold text-gray-900">Pay with {app.name}</p>
      </div>

      <ol className="m-0 mb-3.5 flex list-none flex-col gap-2.5 p-0">
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

      <button
        type="button"
        onClick={onOpen}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border-none px-4 py-3 text-sm font-bold shadow-md transition hover:opacity-90 active:scale-98 cursor-pointer"
        style={{ backgroundColor: app.color, color: app.ink }}
      >
        <ExternalLink className="h-4 w-4" />
        {app.khqrLink ? `Pay in ${app.name}` : `Open ${app.name}`}
      </button>
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="border-none bg-transparent p-1 text-[11px] font-semibold text-gray-500 underline cursor-pointer"
        >
          Choose another bank
        </button>
        <button
          type="button"
          onClick={onSaveQr}
          disabled={isSaving}
          className="inline-flex items-center gap-1 border-none bg-transparent p-1 text-[11px] font-semibold text-gray-500 underline disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          Save QR image
        </button>
      </div>
    </div>
  );
}

export default PaymentpageView;
