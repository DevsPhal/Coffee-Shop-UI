"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { CheckCircle2, ChevronDown, Loader2, RefreshCw } from "lucide-react";

import { toast } from "@/components/ui/toast";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useConfirmBakongPaymentMutation,
  useGenerateBakongQrMutation,
  useLazyGetMyOrderQuery,
} from "@/store/api/orderApi";
import type { Currency, OrderResponse } from "@/store/api/types";
import "@/app/globals.scss";

/** How often to ask the API whether the transfer has landed. */
const POLL_MS = 4000;

type Phase = "loading" | "waiting" | "paid" | "expired" | "error";

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

  const [generateQr, { data: qr, isLoading: isGenerating }] = useGenerateBakongQrMutation();
  const [confirmPayment, { isLoading: isChecking }] = useConfirmBakongPaymentMutation();
  const [getOrder] = useLazyGetMyOrderQuery();

  // Guards the poll so a slow request cannot overlap the next tick.
  const isPollingRef = useRef(false);
  const pollingRequestRef = useRef<Promise<OrderResponse> | null>(null);
  const isRequestingQrRef = useRef(false);
  const hasPaidRef = useRef(false);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = true;
    return () => { isActiveRef.current = false; };
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
        if (existingOrder.bakongMd5Hash) {
          const checkedOrder = await confirmPayment(orderId).unwrap();
          if (handleOrder(checkedOrder)) return;
        }
        const issued = await generateQr({ id: orderId, currency: chosen }).unwrap();
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
      } catch (err) {
        if (!isActiveRef.current || hasPaidRef.current) return;
        setFailure(
          apiErrorMessage(
            err as Parameters<typeof apiErrorMessage>[0],
            "Could not generate the payment QR."
          )
        );
      } finally {
        isRequestingQrRef.current = false;
      }
    },
    [orderId, generateQr, getOrder, confirmPayment, handleOrder]
  );

  useEffect(() => {
    if (!orderId) return;
    const timer = setTimeout(() => { void requestQr(currency); }, 0);
    return () => clearTimeout(timer);
  }, [orderId, currency, requestQr]);

  // The QR is tagged with the currency it was issued for, so a stale code is never shown while
  // a switch to the other currency is still in flight.
  const currentQr = qrImage && qrImage.currency === currency ? qrImage.dataUrl : null;

  const effectivePhase: Phase = !orderId
    ? "error"
    : settled === "paid"
      ? "paid"
      : failure
        ? "error"
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

  const checkPayment = useCallback(async () => {
      if (!orderId || isPollingRef.current || isRequestingQrRef.current || hasPaidRef.current) return;
      isPollingRef.current = true;
      try {
        const request = confirmPayment(orderId).unwrap();
        pollingRequestRef.current = request;
        const order = await request;
        if (!handleOrder(order)) setVerificationError(null);
      } catch {
        // Staff may have confirmed or cancelled the order while a bank lookup failed.
        try {
          if (handleOrder(await getOrder(orderId, false).unwrap())) return;
        } catch {
          // Keep retrying the same transfer when the connection returns.
        }
        if (!isActiveRef.current || hasPaidRef.current) return;
        setVerificationError("We couldn't verify your payment yet. We'll keep checking automatically.");
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
            <button type="button" onClick={() => { void checkPayment(); }} disabled={isChecking} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
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

export default PaymentpageView;
