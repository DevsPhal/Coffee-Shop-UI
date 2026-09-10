"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";
import { toast } from "@/components/ui/toast";
import { Modal, ModalContent } from "@/components/ui/modal";
import {
  Check,
  Receipt,
  CheckCircle2,
  Bell,
  Coffee,
  ConciergeBell,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { isAuthenticated } from "@/lib/authStorage";
import { useGetCurrentUserQuery } from "@/store/api/authApi";
import { useGetMyOrderQuery, useRequestOrderAssistanceMutation } from "@/store/api/orderApi";
import { apiErrorMessage } from "@/store/api/baseApi";
import { ICE_LABELS, MILK_LABELS, SUGAR_LABELS } from "@/store/api/optionMapping";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

const subscribeToStorage = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
const readStoredCheckout = () => {
  try { return localStorage.getItem("checkout_delivery"); } catch { return null; }
};

export function CheckoutdonepageView() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("id") || searchParams.get("orderId") || "";

  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated(),
  });

  const isMounted = useMounted();
  const storedCheckout = useSyncExternalStore(subscribeToStorage, readStoredCheckout, () => null);
  const stored = useMemo(() => {
    try { return JSON.parse(storedCheckout ?? "null") as {
      orderId?: string; customerName?: string; location?: string; estimatedTime?: string; paymentType?: string;
    } | null; } catch { return null; }
  }, [storedCheckout]);
  const targetId = urlOrderId || stored?.orderId || "";
  // Legacy orders can use details saved for this exact order, never for another order.
  const delivery = stored?.orderId === targetId ? stored : null;
  const [callStaffModal, setCallStaffModal] = useState(false);
  const [notifiedOrderId, setNotifiedOrderId] = useState<string | null>(null);
  const staffCalled = notifiedOrderId === targetId;
  const [requestAssistance, { isLoading: isCallingStaff }] = useRequestOrderAssistanceMutation();

  // The real order, straight from /api/customer/orders/{id}.
  //
  // Polled, because the whole point of this screen is watching it change: every step of the
  // tracker below is a barista pressing a button on the queue board, and this request is the
  // only way the customer's phone hears about it. (No skipPollingIfUnfocused — that needs
  // RTK's setupListeners, which this app does not install.)
  const { currentData: order, error: orderError, refetch } = useGetMyOrderQuery(targetId, {
    skip: !targetId,
    refetchOnMountOrArgChange: true,
    pollingInterval: 10000,
  });

  const displayItems = order?.items ?? [];
  const calculatedSubtotal = displayItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const displayDeliveryFee = Number(order?.deliveryFee ?? 0);
  const grandTotal = Number(order?.totalAmount ?? 0);
  const selectedCurrency = order?.bakongCurrency === "KHR" && order.bakongAmount != null ? "KHR" : "USD";
  const formatMoney = (amount: number) => selectedCurrency === "KHR" && grandTotal > 0
    ? `${Math.round(amount * Number(order?.bakongAmount) / grandTotal).toLocaleString()} ៛`
    : `$ ${amount.toFixed(2)}`;
  const displayCustomerName =
    order?.contactName || order?.customerName || delivery?.customerName || currentUser?.fullName || "Customer";
  const displayLocation = order?.deliveryAddress || (order?.fulfillmentMethod === "PICKUP" ? "Pickup at store" : delivery?.location) || "Pickup at store";
  const displayEstimatedTime = delivery?.estimatedTime || (order?.fulfillmentMethod === "DELIVERY" ? "10–15 mins (estimate)" : "5 mins (estimate)");


  /**
   * Where the order sits on the three-step tracker, derived straight from its status rather
   * than mirrored into state — so when the poll above brings back a new status, the tracker
   * moves on its own with nothing left to keep in sync.
   *
   *   PENDING / PAID -> 1  placed, waiting on the counter
   *   PREPARING      -> 2  a barista has picked it up
   *   COMPLETED      -> 3  made, ready to collect
   *
   * CANCELLED sits outside the three steps entirely and takes over the banner instead.
   */
  const currentStep =
    order?.status === "COMPLETED" || order?.status === "DELIVERED"
      ? 3
      : order?.status === "PREPARING" || order?.status === "OUT_FOR_DELIVERY"
        ? 2
        : 1;
  const isCancelled = order?.status === "CANCELLED";
  const isUnpaid = order?.status === "PENDING";

  // Held at step 1 until mounted so the first client paint matches the server's, where the
  // order has not been fetched yet.
  const effectiveStep = isMounted ? currentStep : 1;

  const bannerTitle = isCancelled
    ? "Order Cancelled"
    : isUnpaid
      ? "Payment Pending"
      : effectiveStep >= 3
        ? "Order Ready!"
        : effectiveStep === 2
          ? "Being Prepared"
          : "Order Confirmed!";

  const bannerSubtitle = isCancelled
    ? "This order was cancelled and you have not been charged."
    : isUnpaid
      ? order?.paymentMethod === "CASH" ? "Please pay at the counter. We will update your order once payment is collected." : "We have your order — it starts as soon as payment goes through."
      : effectiveStep >= 3
        ? "Your order is ready! Enjoy your freshly prepared drinks."
        : effectiveStep === 2
          ? "A barista is making your order right now."
          : "Thank you for ordering with 590st CAFE. You are in the queue.";

  // The tracker's three stops. Step 3 is worded for whichever way the order reaches the
  // customer, and doneLabel is what a step reads once it has actually happened.
  const steps: { step: number; label: string; doneLabel?: string }[] = [
    { step: 1, label: "Confirmed" },
    { step: 2, label: "Preparing" },
    displayDeliveryFee > 0
      ? { step: 3, label: "Delivering", doneLabel: "Delivered" }
      : { step: 3, label: "Ready", doneLabel: "Ready!" },
  ];

  /**
   * Each circle is in one of three states. Step 1 is the only one that can still be "current":
   * an unpaid order has been placed but not confirmed. The moment payment lands step 1 is
   * simply done, and the live edge of the tracker moves to whatever the barista is doing —
   * which is why a paid, unstarted order shows a tick on "Confirmed" and nothing pulsing.
   */
  const stepState = (step: number): "done" | "current" | "todo" => {
    if (isCancelled) return "todo";
    if (step === 1) return isUnpaid ? "current" : "done";
    if (step === 2) {
      return effectiveStep >= 3 ? "done" : effectiveStep === 2 ? "current" : "todo";
    }
    return effectiveStep >= 3 ? "done" : "todo";
  };

  const handleCallStaff = async () => {
    if (isCallingStaff || !targetId || staffCalled) return;
    try {
      await requestAssistance(targetId).unwrap();
      setNotifiedOrderId(targetId);
      setCallStaffModal(true);
    } catch (error) {
      toast.add({ type: "error", description: apiErrorMessage(error as never, "Could not notify staff. Please try again.") });
    }
  };

  const handleBackToMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      router.push("/menuphone");
    } else {
      router.push("/menu");
    }
  };

  if (!isMounted || (targetId && !order && !orderError)) {
    return <p role="status" className="p-10 text-center">{t("Loading your order...")}</p>;
  }
  if (!targetId || (!order && orderError)) {
    return <div role="alert" className="space-y-4 p-10 text-center">
      <p>{targetId ? apiErrorMessage(orderError as never, "Could not load this order.") : "Choose an order to track."}</p>
      {targetId && <button type="button" onClick={() => { void refetch(); }} className="mr-4 underline">{t("Try again")}</button>}
      <Link href="/orderhistory" className="underline">{t("View my orders")}</Link>
    </div>;
  }

  return (
    <div className="checkout_done_page">
      {orderError && <p role="alert" className="p-3 text-center text-amber-700">Could not refresh order progress. Retrying automatically.</p>}
      {isUnpaid && order?.paymentMethod !== "CASH" && <div className="p-4 text-center">
        <Link href={`/payment?orderId=${encodeURIComponent(targetId)}`} className="inline-block rounded-xl bg-[#A1255B] px-5 py-3 font-bold text-white">Continue to payment</Link>
      </div>}
      {/* 1. TOP BANNER SECTION WITH RESORT POOL BACKGROUND */}
      <div className="banner_section">
        <div
          className="banner_bg"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url('/images/590st cafe.jpg')`,
          }}
        />

        <div className="banner_content">
          <div
            className={`banner_icon_badge ${isCancelled ? "" : "animate-bounce"}`}
            suppressHydrationWarning
          >
            {isCancelled ? (
              <XCircle className="w-10 h-10" />
            ) : effectiveStep === 2 ? (
              <Coffee className="w-10 h-10" />
            ) : (
              <CheckCircle2 className="w-10 h-10" />
            )}
          </div>
          <h1 className="banner_title" suppressHydrationWarning>
            {t(bannerTitle)}
          </h1>
          <p className="banner_subtitle" suppressHydrationWarning>
            {t(bannerSubtitle)}
          </p>
        </div>
      </div>

      {/* 2. ORDER STATUS ANIMATED TIMELINE */}
      <div className="progress_status_container">
        <div className="progress_status_card">
          <h2 className="progress_status_header">
            <Receipt className="w-5 h-5 text-[#A1255B]" />
            {t("Order Progress Status")}
          </h2>

          {/* Timeline Stepper */}
          <div className="stepper_container">
            {/* Background Base Line */}
            <div className="stepper_bg_line" />
            
            {/* Animated Flow Line — reaches step 1 while the order is only queued, half way
                once a barista starts it, all the way when it is ready. */}
            <div
              className={`stepper_flow_line ${
                effectiveStep >= 3
                  ? "stepper_flow_line_full"
                  : effectiveStep === 2
                    ? "stepper_flow_line_half"
                    : "stepper_flow_line_start"
              }`}
              suppressHydrationWarning
            />

            {steps.map(({ step, label, doneLabel }) => {
              const state = stepState(step);
              const isDone = state === "done";
              return (
                <div key={step} className="stepper_step">
                  <div
                    className={`stepper_circle ${
                      isDone
                        ? step === 3
                          ? "stepper_circle_done scale-110"
                          : "stepper_circle_active"
                        : state === "current"
                          ? "stepper_circle_active stepper_circle_pulse animate-pulse"
                          : "stepper_circle_inactive"
                    }`}
                    suppressHydrationWarning
                  >
                    {isDone ? <Check className="w-5 h-5" /> : step}
                  </div>
                  <span
                    className={`stepper_label ${
                      isDone && step === 3
                        ? "stepper_label_done"
                        : isDone || state === "current"
                          ? "stepper_label_active"
                          : "stepper_label_inactive"
                    }`}
                    suppressHydrationWarning
                  >
                    {t(isDone && doneLabel ? doneLabel : label)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. ORDER DETAILS SUMMARY CARD */}
      <div className="main_content">
        <div className="card_box">
          <h2 className="card_title">{t("Order details")}</h2>
          <p className="card_subtitle">{t("See complete details for your order")}</p>

          {/* Metadata Key-Value Rows */}
          <div className="meta_row_group">
            <div className="meta_row">
              <span className="label_muted">{t("Customer:")}</span>
              <span className="value_brand" suppressHydrationWarning>
                {displayCustomerName}
              </span>
            </div>

            <div className="meta_row">
              <span className="label_muted">{t("Payment type:")}</span>
              <span className="value_dark">{t(order?.paymentMethod === "BAKONG" ? "Bakong QR" : order?.paymentMethod === "CASH" ? "Cash" : "Not selected")}</span>
            </div>

            <div className="meta_row">
              <span className="label_muted">{t("Location:")}</span>
              <span className="value_brand" suppressHydrationWarning>
                {displayLocation}
              </span>
            </div>

            <div className="meta_row">
              <span className="label_muted">{t("Estimated time:")}</span>
              <span className="value_brand" suppressHydrationWarning>
                {displayEstimatedTime}
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="divider" />

          {/* Order Items List */}
          <div className="meta_row_group divide-y divide-gray-100/60">
            {displayItems.map((item) => {
              const customDetails: string[] = [];
              if (item.iceLevel) customDetails.push(`Ice: ${ICE_LABELS[item.iceLevel]}`);
              if (item.sugarLevel)
                customDetails.push(`Sugar: ${SUGAR_LABELS[item.sugarLevel]}`);
              if (item.milkType) customDetails.push(`Milk: ${MILK_LABELS[item.milkType]}`);

              const sizeLabel = item.sizeOptionName;

              return (
                <div key={item.id} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span
                      className="value_dark font-semibold text-xs sm:text-sm truncate min-w-0 flex-1"
                      title={`${item.quantity}x ${item.productName}${
                        sizeLabel ? ` (Size: ${sizeLabel})` : ""
                      }`}
                    >
                      {item.quantity}x {t(item.productName)}{" "}
                      {sizeLabel ? `(${t("Size")}: ${sizeLabel})` : ""}
                    </span>
                    <span className="value_brand font-bold text-xs sm:text-sm shrink-0 whitespace-nowrap pl-1" suppressHydrationWarning>
                      {formatMoney(Number(item.subtotal))}
                    </span>
                  </div>

                  {customDetails.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {customDetails.map((detail, dIdx) => (
                        <span
                          key={dIdx}
                          className="inline-block text-[10px] font-semibold text-pink-700 bg-pink-50 border border-pink-100 px-1.5 py-0.5"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <hr className="divider_sm" />

          {/* Subtotal & Discount */}
          {(() => {
            // The order records what was actually charged, so the pre-discount total is not
            // recoverable from it. Showing the charged total keeps the figures honest.
            const fullSubtotal = displayItems.reduce(
              (acc, item) => acc + Number(item.subtotal),
              0
            );

            const totalDiscount = Math.max(0, fullSubtotal - calculatedSubtotal);
            const hasDiscount = totalDiscount > 0;

            return (
              <>
                <div className="meta_row">
                  <span className="label_muted">{t("Subtotal:")}</span>
                  <span className="value_brand" suppressHydrationWarning>
                    {formatMoney(hasDiscount ? fullSubtotal : calculatedSubtotal)}
                  </span>
                </div>

                {hasDiscount && (
                  <div className="meta_row">
                    <span className="label_muted">{t("Discount:")}</span>
                    <span className="value_brand font-bold text-[#A1255B]" suppressHydrationWarning>
                      -{formatMoney(totalDiscount)}
                    </span>
                  </div>
                )}
              </>
            );
          })()}

          {/* Delivery Fee */}
          {displayDeliveryFee > 0 && (
            <div className="meta_row">
              <span className="label_muted">{t("Delivery Method")}:</span>
              <span className="value_brand" suppressHydrationWarning>
                {formatMoney(displayDeliveryFee)}
              </span>
            </div>
          )}

          {/* Grand Total */}
          <div className="meta_row">
            <span className="label_muted font-bold text-gray-900">{t("Grand total:")}</span>
            <span className="value_grand_total" suppressHydrationWarning>
              {formatMoney(grandTotal)}
            </span>
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="desktop_actions">
          <button
            type="button"
            onClick={handleCallStaff}
            disabled={isCallingStaff || staffCalled}
            className="btn_desktop_staff"
          >
            <Bell className="w-5 h-5 mr-2 shrink-0" />
            <span>{t(staffCalled ? "Staff Notified" : "Call Staff")}</span>
          </button>
          <Link href="/menu" onClick={handleBackToMenu} className="btn_desktop_menu">
            <UtensilsCrossed className="w-5 h-5 mr-2 shrink-0" />
            <span>{t("Back to Menu")}</span>
          </Link>
        </div>
      </div>

      {/* Fixed Mobile Bottom Bar Portalled to Body */}
      {isMounted && createPortal(
        <div className="mobile_bottom_bar">
          <button
            type="button"
            onClick={handleCallStaff}
            disabled={isCallingStaff || staffCalled}
            className="btn_mobile_staff"
          >
            <ConciergeBell className="w-5 h-5 shrink-0" />
            <span>{t(staffCalled ? "Staff Notified" : "Call Staff")}</span>
          </button>
          <Link href="/menuphone" onClick={handleBackToMenu} className="btn_mobile_menu">
            <UtensilsCrossed className="w-5 h-5 shrink-0" />
            <span>{t("Back to Menu")}</span>
          </Link>
        </div>,
        document.body
      )}

      {/* Call Staff Modal */}
      <Modal open={callStaffModal} onOpenChange={setCallStaffModal}>
        <ModalContent className="modal_card" showCloseButton={false}>
          <div className="modal_icon_badge">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="modal_title">{t("Staff Notified")}</h3>
          <p className="modal_description">
            {t("A staff member has been requested and will assist you shortly.")}
          </p>
          <button
            type="button"
            onClick={() => setCallStaffModal(false)}
            className="btn_modal_close"
          >
            {t("Got it")}
          </button>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default CheckoutdonepageView;
