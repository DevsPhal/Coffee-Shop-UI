"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { Check, CheckCircle2, ChevronDown, Download, ExternalLink, Loader2, RefreshCw, Smartphone } from "lucide-react";

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
import { BANK_APPS, bankAppLaunch, storeUrl, type BankApp, type BankAppId } from "@/lib/bankApps";
import type { Currency, OrderResponse } from "@/store/api/types";
import "@/app/globals.scss";

/**
 * Bank-app links only work on a phone that has the app installed. iPadOS reports a desktop
 * Safari user agent, so a touch-capable "Macintosh" is treated as an iPad too.
 */
const isPhone = () =>
  typeof navigator !== "undefined" &&
  (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

/** How often to ask the API whether the transfer has landed. */
const POLL_MS = 4000;

/**
 * If the page is still in front this long after handing off to a bank-app link, the app most
 * likely isn't installed — Android does nothing at all and iOS only shows its own error.
 */
const APP_OPEN_TIMEOUT_MS = 2500;

/**
 * Hands the QR to the phone's share sheet ("Save Image" on iOS) so it can be picked from the
 * gallery inside ABA, ACLEDA or any other KHQR app; falls back to a plain download. Resolves
 * false only when the customer backed out of the share sheet.
 */
async function saveQrImage(dataUrl: string, fileName: string, preferDownload = false): Promise<boolean> {
  // Decoded synchronously: Safari drops the tap's user activation across an await, and then
  // refuses to open the share sheet.
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
  const file = new File([bytes], fileName, { type: "image/png" });
  if (!preferDownload && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return false;
      // Some browsers expose share but refuse files at call time — fall through to download.
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

type Phase = "loading" | "awaiting_fee" | "waiting" | "paid" | "expired" | "error";

/**
 * The Bakong payment screen for a customer order.
 *
 * The QR is generated server-side against the shop's Bakong account and rendered here from the
 * returned KHQR payload — it is a real, scannable code tied to this order and amount. The
 * amount shown is the one the API encoded into the QR rather than a client-side conversion, so
 * what the customer reads is always what their wallet will charge.
 *
 * Payment cannot be self-declared: the page polls the confirm endpoint, which checks the
 * transfer against Bakong, and only moves on once the order actually comes back with a
 * payment recorded against it.
 */
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
  /** Only the terminal outcomes are stored; everything else is derived from the query state. */
  const [settled, setSettled] = useState<"paid" | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  // A delivery order has no delivery fee until the shop prices it from the pinned location, and
  // the QR must encode the final total — so payment waits here until that fee lands.
  const [awaitingFee, setAwaitingFee] = useState(false);

  const [generateQr, { data: qr, isLoading: isGenerating }] = useGenerateBakongQrMutation();
  const [confirmPayment, { isLoading: isChecking }] = useConfirmBakongPaymentMutation();
  const [getOrder] = useLazyGetMyOrderQuery();
  const [generateDeeplink, { isLoading: isOpeningBakong }] = useGenerateBakongDeeplinkMutation();
  const mounted = useMounted();
  const onPhone = mounted && isPhone();

  // Guards the poll so a slow request cannot overlap the next tick.
  const isPollingRef = useRef(false);
  const pollingRequestRef = useRef<Promise<OrderResponse> | null>(null);
  const isRequestingQrRef = useRef(false);
  const hasAdoptedCurrencyRef = useRef(false);
  const hasPaidRef = useRef(false);
  const isActiveRef = useRef(true);
  /** The last automatic toast, so a retry loop hitting the same problem doesn't stack them. */
  const lastNoticeRef = useRef<string | null>(null);
  /** Which picker button is saving right now ("other" = the plain save link), for its spinner. */
  const [savingFor, setSavingFor] = useState<BankAppId | "other" | null>(null);
  /**
   * The bank the QR was saved for, and which QR. Confirmation only checks the order's current
   * QR, so once it changes (currency switch, expiry) the saved image is stale and must not be
   * presented as ready to pay.
   */
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
    if (order.paidAt != null || ["PAID", "PREPARING", "COMPLETED"].includes(order.status)) {
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
        // Let an in-flight check finish before changing the QR it is checking.
        await pollingRequestRef.current?.catch(() => null);
        if (!isActiveRef.current || hasPaidRef.current) return;
        // A refreshed payment link may already be paid. Check the existing transfer before
        // replacing its QR/hash, including when the customer asks for a new QR after expiry.
        const existingOrder = await getOrder(orderId, false).unwrap();
        if (handleOrder(existingOrder)) return;
        // deliveryFee defaults to 0 once an order exists, not null — awaitingDeliveryFee is the
        // real "has the shop actually priced this yet" flag. Generating a QR while this is true
        // would encode a total that's missing the fee entirely.
        if (existingOrder.fulfillmentMethod === "DELIVERY" && existingOrder.awaitingDeliveryFee) {
          setAwaitingFee(true);
          return;
        }
        setAwaitingFee(false);
        if (existingOrder.bakongMd5Hash) {
          const checkedOrder = await confirmPayment(orderId).unwrap();
          if (handleOrder(checkedOrder)) return;
        }
        // Reopening the page (a reload, or the phone dropping the tab while the bank app was
        // open) must show the QR the customer may already be paying, in its own currency — the
        // API hands that same QR back while it's still valid.
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

  // While the shop hasn't priced the delivery yet, re-check on the same interval as the payment
  // poll below; requestQr itself flips awaitingFee back off once a fee (or a paid/cancelled
  // order) shows up, which lets the effect above take over and generate the real QR.
  useEffect(() => {
    if (!awaitingFee) return;
    const interval = setInterval(() => { void requestQr(currency); }, POLL_MS);
    return () => clearInterval(interval);
  }, [awaitingFee, currency, requestQr]);

  // The push already carries the full order, so this settles paid/cancelled the instant the API
  // broadcasts it (staff marking cash paid, a webhook, ...) without waiting on the next poll
  // tick — and while still pricing the delivery, an instant nudge to fetch the real QR the
  // moment the fee lands rather than waiting up to POLL_MS.
  useOrderLiveUpdates((message) => {
    if (message.order.id !== orderId) return;
    if (handleOrder(message.order)) return;
    if (awaitingFee && !message.order.awaitingDeliveryFee) {
      void requestQr(currency);
    }
  });

  // The QR is tagged with the currency it was issued for, so a stale code is never shown while
  // a switch to the other currency is still in flight.
  const currentQr = qrImage && qrImage.currency === currency ? qrImage.dataUrl : null;
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

  // Countdown to the QR's real expiry, which the API reports as a duration so no timezone
  // reconciliation is needed between the phone and the shop. Expiry is derived from the
  // remaining seconds rather than pushed into state, so the effect only ever schedules a tick.
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

  /**
   * `manual` is the "I've paid" button: the background poll stays quiet, but a customer who
   * pressed the button always gets an answer, including "nothing has arrived yet".
   */
  const checkPayment = useCallback(async (manual = false) => {
      if (!orderId || isRequestingQrRef.current || hasPaidRef.current) return;
      const reportNotYetPaid = () => {
        if (manual && isActiveRef.current && !hasPaidRef.current) {
          toast.add({
            type: "info",
            description: "No payment received yet. If you just paid, give it a moment — this page updates on its own.",
          });
        }
      };
      if (isPollingRef.current) {
        // A background check is already in flight; answer the button with its result.
        if (!manual) return;
        const order = await pollingRequestRef.current?.catch(() => null);
        if (order) reportNotYetPaid();
        return;
      }
      isPollingRef.current = true;
      try {
        const request = confirmPayment(orderId).unwrap();
        pollingRequestRef.current = request;
        const order = await request;
        if (!handleOrder(order)) {
          setVerificationError(null);
          reportNotYetPaid();
        }
      } catch {
        // Staff may have confirmed or cancelled the order while a bank lookup failed.
        try {
          if (handleOrder(await getOrder(orderId, false).unwrap())) return;
        } catch {
          // Keep retrying the same transfer when the connection returns.
        }
        if (!isActiveRef.current || hasPaidRef.current) return;
        const message = "We couldn't verify your payment yet. We'll keep checking automatically.";
        setVerificationError(message);
        if (manual) toast.add({ type: "warning", description: message });
      } finally {
        isPollingRef.current = false;
        pollingRequestRef.current = null;
      }
  }, [orderId, confirmPayment, getOrder, handleOrder]);

  // Keep checking after QR expiry: a transfer sent just before the deadline may arrive later.
  // Returning from a banking app or reconnecting also triggers an immediate check.
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

  // The browser gives no error when an app link goes nowhere, so watch for the page losing
  // focus instead: if it never does, tell the customer rather than leaving the tap silent.
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

  // A phone can't scan its own screen. The Bakong app has an official link that opens this
  // exact payment (and returns here after); the poll above picks up the payment either way.
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

  // ABA and ACLEDA can't be handed a KHQR by link, so: save the QR first, then open the app
  // (a second tap, since opening an app needs a fresh tap after the share sheet on iOS).
  const openBankApp = useCallback((bank: BankAppId) => {
    const app = BANK_APPS[bank];
    const { url, storePage } = bankAppLaunch(app);
    if (storePage) {
      window.open(url, "_blank", "noopener");
      return;
    }
    launchApp(url, app.name, storeUrl(app));
  }, [launchApp]);

  // On Android the QR goes straight to Downloads and the bank app opens in the same tap. iOS
  // needs the share sheet ("Save Image" puts it in Photos, where the bank app looks), and an app
  // can only be opened from a fresh tap after that — so there the steps card asks for one.
  const saveQrFor = useCallback(async (bank: BankAppId | null) => {
    if (!currentQr || !orderId) return;
    const android = /Android/i.test(navigator.userAgent);
    setSavingFor(bank ?? "other");
    try {
      const saved = await saveQrImage(currentQr, `590st-cafe-khqr-${orderId.slice(0, 8)}.png`, android);
      if (!saved) return;
      setSavedFor(bank ? { bank, qr: currentQr } : null);
      if (bank && android) {
        // A beat for the download to register before the page hands off to the app.
        window.setTimeout(() => openBankApp(bank), 400);
      }
      if (!bank) {
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
  }, [currentQr, orderId, openBankApp]);

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
                  onSaveAgain={() => { void saveQrFor(savedForBank); }}
                  isSaving={savingFor === savedForBank}
                  onBack={() => setSavedFor(null)}
                />
              ) : (
                <>
                  <p className="m-0 text-xs font-bold text-gray-800">Paying on this phone? Choose your bank</p>
                  {savedQrIsStale ? (
                    <p role="status" className="m-0 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                      The QR changed since you saved it. Save this one before paying.
                    </p>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(BANK_APPS) as BankAppId[]).map((bank) => {
                      const app = BANK_APPS[bank];
                      const isSaving = savingFor === bank;
                      return (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => { void saveQrFor(bank); }}
                          disabled={savingFor !== null || !currentQr}
                          aria-label={`Pay with ${app.name}`}
                          className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-2 py-3 transition hover:border-gray-300 hover:bg-gray-50 active:scale-98 disabled:opacity-60 cursor-pointer"
                        >
                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-[10px] font-black tracking-wide"
                            style={{ backgroundColor: app.color, color: app.ink }}
                            aria-hidden="true"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : app.shortName}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{app.shortName}</span>
                          <span className="text-[10px] font-medium text-gray-500">
                            {isSaving ? "Saving QR..." : "Save QR & open"}
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
                    {isOpeningBakong ? "Opening Bakong..." : "Use the Bakong app instead (amount filled in)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { void saveQrFor(null); }}
                    disabled={savingFor !== null || !currentQr}
                    className="inline-flex w-full items-center justify-center gap-1.5 border-none bg-transparent py-1 text-[11px] font-semibold text-gray-500 underline disabled:opacity-60 cursor-pointer"
                  >
                    {savingFor === "other" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    Another bank? Save the QR and scan it from your gallery
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

          <p className="mt-3 mb-0 text-[11px] text-gray-400">
            {effectivePhase === "waiting"
              ? "Waiting for your payment — this page updates on its own."
              : effectivePhase === "expired"
                ? "Already paid? We're still checking your transfer."
                : " "}
          </p>
          {verificationError ? (
            <p role="status" className="mt-3 text-xs text-amber-700">{verificationError}</p>
          ) : null}
          {effectivePhase === "waiting" || effectivePhase === "expired" ? (
            <button type="button" onClick={() => { void checkPayment(true); }} disabled={isChecking} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
              {isChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {isChecking ? "Checking payment..." : "I've paid — check payment"}
            </button>
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

/**
 * After the QR is saved for ABA or ACLEDA: what to do next, in order, with the one button that
 * matters (open the app) in the bank's own colour.
 */
function BankSteps({
  app,
  onOpen,
  onSaveAgain,
  isSaving,
  onBack,
}: {
  app: BankApp;
  onOpen: () => void;
  onSaveAgain: () => void;
  isSaving: boolean;
  onBack: () => void;
}) {
  const steps = [
    { title: "QR saved", detail: "It's in your photos or downloads.", done: true },
    { title: `Open ${app.name}`, detail: "Use the button below.", done: false },
    { title: "Scan from your gallery", detail: `In the app, ${app.galleryHint}, then pick the saved QR and pay.`, done: false },
    { title: "Come back here", detail: "This page confirms the payment on its own.", done: false },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5" role="status" aria-live="polite">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-black tracking-wide"
          style={{ backgroundColor: app.color, color: app.ink }}
          aria-hidden="true"
        >
          {app.shortName}
        </span>
        <p className="m-0 text-sm font-extrabold text-gray-900">Pay with {app.name}</p>
      </div>

      <ol className="m-0 mb-3.5 flex list-none flex-col gap-2.5 p-0">
        {steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-2.5">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                step.done ? "bg-green-600 text-white" : "border border-gray-300 bg-white text-gray-600"
              }`}
              aria-hidden="true"
            >
              {step.done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
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
        Open {app.name}
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
          onClick={onSaveAgain}
          disabled={isSaving}
          className="inline-flex items-center gap-1 border-none bg-transparent p-1 text-[11px] font-semibold text-gray-500 underline disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          Save QR again
        </button>
      </div>
    </div>
  );
}

export default PaymentpageView;
