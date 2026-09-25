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
  ReceiptText,
  CheckCircle2,
  Bell,
  Coffee,
  Bike,
  ConciergeBell,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { isAuthenticated } from "@/lib/authStorage";
import { useGetCurrentUserQuery } from "@/store/api/authApi";
import {
  useGetMyOrderQuery,
  useCallStaffMutation,
  usePayCashOnPickupMutation,
} from "@/store/api/orderApi";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useOrderLiveUpdates } from "@/hooks/useOrderLiveUpdates";
import { useStaffCallUpdates } from "@/hooks/useStaffCallUpdates";
import { ICE_LABELS, MILK_LABELS, SUGAR_LABELS, VARIANT_LABELS } from "@/store/api/optionMapping";
import { toTitleCase } from "@/lib/utils";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { PaymentMethodModal } from "@/components/ui/PaymentMethodModal";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/states";
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
  // The API rate-limits calls itself (once per cooldown window) and tells the caller exactly
  // when the button can work again — tracked as a plain "is it cooling down" flag rather than a
  // one-shot "already called this session" one, so it correctly re-enables once the cooldown
  // actually elapses. Only ever set from an event handler or a setTimeout callback, never
  // computed from Date.now() during render — render has to stay pure.
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [staffAnswered, setStaffAnswered] = useState(false);
  const [callStaff, { isLoading: isCallingStaff }] = useCallStaffMutation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payCashOnPickup] = usePayCashOnPickupMutation();

  // The real order, straight from /api/customer/orders/{id}.
  //
  // The whole point of this screen is watching the order change: every step of the tracker
  // below is a barista pressing a button on the queue board. The API now pushes those changes
  // over STOMP (see useOrderLiveUpdates below), so polling is a slow fallback rather than the
  // only path — kept at a longer interval in case the socket never connects (e.g. the API's
  // CORS allowlist not yet covering this origin) or drops without reconnecting.
  const { currentData: order, error: orderError, refetch } = useGetMyOrderQuery(targetId, {
    skip: !targetId,
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });

  // Re-fetch the moment the API pushes a change for this exact order, rather than waiting for
  // the fallback poll — a full refetch (not the pushed payload itself) so the tracker always
  // reflects the same validated shape the REST endpoint returns.
  useOrderLiveUpdates((message) => {
    if (message.order.id === targetId) {
      refetch();
    }
  });

  // Told the moment a call is actually answered — the button itself only knows it asked. This
  // doesn't touch isCoolingDown: the API's own cooldown keeps running regardless of whether the
  // call was answered, so re-enabling the button early here would just earn a 429 on a retry.
  useStaffCallUpdates((message) => {
    if (message.orderId === targetId && message.type === "ANSWERED") {
      setStaffAnswered(true);
      toast.add({
        type: "success",
        description: message.answeredByName
          ? `${message.answeredByName} is on the way to help.`
          : "Staff is on the way to help.",
      });
    }
  });

  const displayItems = order?.items ?? [];
  const calculatedSubtotal = displayItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const isDelivery = order?.fulfillmentMethod === "DELIVERY";
  // The API now defaults deliveryFee to 0 rather than null once an order exists, so that can no
  // longer tell "not set yet" apart from "genuinely free" — awaitingDeliveryFee is the real flag.
  const isDeliveryFeePending = isDelivery && order?.awaitingDeliveryFee === true;
  const displayDeliveryFee = Number(order?.deliveryFee ?? 0);
  // A delivery order lands here with no payment method chosen — that step waits until the fee
  // is set, so Cash/Bakong is only offered once the total actually includes it. Pickup has no
  // fee to wait for, so it can offer payment as soon as the order exists.
  const needsPaymentChoice = order?.status === "PENDING" && !order.paymentMethod && !isDeliveryFeePending;
  const grandTotal = Number(order?.totalAmount ?? 0);
  const selectedCurrency = order?.bakongCurrency === "KHR" && order.bakongAmount != null ? "KHR" : "USD";
  const formatMoney = (amount: number) => selectedCurrency === "KHR" && grandTotal > 0
    ? `${Math.round(amount * Number(order?.bakongAmount) / grandTotal).toLocaleString()} ៛`
    : `$ ${amount.toFixed(2)}`;
  const displayCustomerName =
    order?.contactName || order?.customerName || delivery?.customerName || currentUser?.fullName || "Customer";
  const displayLocation = order?.deliveryAddress || (order?.fulfillmentMethod === "PICKUP" ? "Pickup at Store" : delivery?.location) || "Pickup at Store";
  const displayEstimatedTime = delivery?.estimatedTime || (order?.fulfillmentMethod === "DELIVERY" ? "10–15 mins (estimate)" : "5 mins (estimate)");


  /**
   * Where the order sits on the three-step tracker, derived straight from the API's real
   * status rather than mirrored into state — so when the poll (or the live push) brings back a
   * new status, the tracker moves on its own with nothing left to keep in sync.
   *
   * The API's actual lifecycle (OrderStatus.java): PENDING -> PAID -> PREPARING ->
   * OUT_FOR_DELIVERY (delivery only) -> COMPLETED (pickup) or DELIVERED (delivery). A delivery
   * order genuinely has four stops, not three — OUT_FOR_DELIVERY means the drink has already
   * left the shop and a courier is on the way, which is a materially different thing to tell
   * the customer than "a barista is making it." Collapsing the two into one "Preparing" step
   * (as this used to) meant a customer whose order was already out for delivery still saw
   * "a barista is making your order right now."
   *
   *   PENDING / PAID     -> 1  placed, waiting on the counter
   *   PREPARING          -> 2  a barista has picked it up
   *   OUT_FOR_DELIVERY   -> 3  handed to a courier, on its way (delivery only)
   *   COMPLETED/DELIVERED-> 4  made (pickup) or arrived (delivery)
   *
   * Pickup never passes through 3 — it has no courier leg, so it jumps straight from 2 to 4,
   * and the tracker's own step 3 ("Ready") goes straight from "todo" to "done" for it, same as
   * before this change.
   *
   * CANCELLED sits outside the steps entirely and takes over the banner instead.
   */
  const currentStep =
    order?.status === "COMPLETED" || order?.status === "DELIVERED"
      ? 4
      : order?.status === "OUT_FOR_DELIVERY"
        ? 3
        : order?.status === "PREPARING"
          ? 2
          : 1;
  const isCancelled = order?.status === "CANCELLED";
  const isUnpaid = order?.status === "PENDING";

  // Held at step 1 until mounted so the first client paint matches the server's, where the
  // order has not been fetched yet.
  const effectiveStep = isMounted ? currentStep : 1;
  const isOutForDelivery = isDelivery && effectiveStep === 3;

  const bannerTitle = isCancelled
    ? "Order Cancelled"
    : isUnpaid
      ? isDeliveryFeePending
        ? "Confirming Delivery Fee"
        : needsPaymentChoice
          ? "Choose Payment Method"
          : "Payment Pending"
      : effectiveStep >= 4
        ? isDelivery ? "Order Delivered!" : "Order Ready!"
        : isOutForDelivery
          ? "Out for Delivery"
          : effectiveStep === 2
            ? "Being Prepared"
            : "Order Confirmed!";

  const bannerSubtitle = isCancelled
    ? "This order was cancelled and you have not been charged."
    : isUnpaid
      ? isDeliveryFeePending
        ? "We've sent your order to the shop — waiting for them to confirm your delivery fee."
        : order?.paymentMethod === "CASH"
          ? "Please pay at the counter. We will update your order once payment is collected."
          : order?.paymentMethod === "BAKONG"
            ? "We have your order — it starts as soon as payment goes through."
            : "Your delivery fee is confirmed — choose how you'd like to pay to continue."
      : effectiveStep >= 4
        ? isDelivery
          ? "Your order has arrived. Enjoy!"
          : "Your order is ready! Enjoy your freshly prepared drinks."
        : isOutForDelivery
          ? "Your order is on its way! A courier is heading to your location."
          : effectiveStep === 2
            ? "A barista is making your order right now."
            : "Thank you for ordering with 590st CAFE. You are in the queue.";

  // The tracker's stops. Step 3 is worded for whichever way the order reaches the customer —
  // "Delivering"/"Delivered" only actually turns current/done for a delivery order, since
  // pickup has no courier leg and moves straight from "Preparing" to "Ready" — and doneLabel is
  // what a step reads once it has actually happened.
  const steps: { step: number; label: string; doneLabel?: string }[] = [
    { step: 1, label: "Confirmed" },
    { step: 2, label: "Preparing" },
    isDelivery
      ? { step: 3, label: "Delivering", doneLabel: "Delivered" }
      : { step: 3, label: "Ready", doneLabel: "Ready!" },
  ];

  /**
   * Each circle is in one of three states. Step 1 is the only one that can still be "current"
   * on its own: an unpaid order has been placed but not confirmed. The moment payment lands
   * step 1 is simply done, and the live edge of the tracker moves to whatever's actually
   * happening next — which is why a paid, unstarted order shows a tick on "Confirmed" and
   * nothing pulsing, and why step 3 now genuinely pulses while a courier has it (effectiveStep
   * === 3) rather than jumping straight from "todo" to "done".
   */
  const stepState = (step: number): "done" | "current" | "todo" => {
    if (isCancelled) return "todo";
    if (step === 1) return isUnpaid ? "current" : "done";
    if (step === 2) {
      return effectiveStep > 2 ? "done" : effectiveStep === 2 ? "current" : "todo";
    }
    return effectiveStep > 3 ? "done" : effectiveStep === 3 ? "current" : "todo";
  };

  const handleCallStaff = async () => {
    if (isCallingStaff || !targetId || isCoolingDown) return;
    try {
      const result = await callStaff(targetId).unwrap();
      setStaffAnswered(false);
      setCallStaffModal(true);

      // Date.now()/setTimeout here are fine — this runs inside an event handler, not render.
      const waitMs = result.nextCallAllowedAt
        ? new Date(result.nextCallAllowedAt).getTime() - Date.now()
        : 0;
      if (waitMs > 0) {
        setIsCoolingDown(true);
        setTimeout(() => setIsCoolingDown(false), waitMs);
      }
    } catch (error) {
      // A 429 here means the API's own cooldown is still running (e.g. from before this page
      // loaded) — its message already says how long is left, so just surface it rather than
      // guessing a duration to re-disable the button for.
      toast.add({ type: "error", description: apiErrorMessage(error as never, "Could not notify staff. Please try again.") });
    }
  };

  const callStaffLabel = staffAnswered
    ? "Staff is Coming"
    : isCoolingDown
      ? "Staff Notified"
      : "Call Staff";

  /**
   * A delivery order lands here with no payment method chosen yet — that choice waited on the
   * shop setting the fee, so the customer never pays (or generates a Bakong QR) against a total
   * that's missing it. Cash confirms right here; Bakong hands off to /payment, which generates
   * the QR against the order's now fee-inclusive total.
   */
  const handleChoosePayment = async (chosenMethod: "QR Scan" | "Cash") => {
    if (!targetId) return;
    if (chosenMethod === "Cash") {
      try {
        await payCashOnPickup(targetId).unwrap();
        refetch();
      } catch (error) {
        toast.add({
          type: "error",
          description: apiErrorMessage(error as never, "Could not confirm cash payment. Please try again."),
        });
      }
      return;
    }
    router.push(`/payment?orderId=${encodeURIComponent(targetId)}`);
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
    return <PageLoader label="Loading your order..." />;
  }
  if (!targetId) {
    return (
      <div className="px-4 py-16">
        <EmptyState
          icon={ReceiptText}
          title="No order selected"
          message="Choose an order to track."
          action={{ label: "View my orders", href: "/orderhistory" }}
        />
      </div>
    );
  }
  if (!order && orderError) {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title="We couldn't load this order"
          error={orderError}
          onRetry={() => void refetch()}
          secondaryAction={{ label: "View my orders", href: "/orderhistory" }}
        />
      </div>
    );
  }

  return (
    <div className="checkout_done_page">
      {orderError && (
        <div className="p-3 text-center">
          <span role="alert" className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
            {t("Could not refresh order progress. Retrying automatically.")}
          </span>
        </div>
      )}
      {isDeliveryFeePending && (
        <div className="p-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm font-semibold text-amber-700">
            {t("Waiting for the shop to confirm your delivery fee — this page updates on its own.")}
          </span>
        </div>
      )}
      {needsPaymentChoice && (
        <div className="p-4 text-center">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-block rounded-xl bg-[#A1255B] hover:bg-[#881d52] px-5 py-3 font-bold text-white cursor-pointer border-none transition-colors"
          >
            {t("Choose Payment Method")}
          </button>
        </div>
      )}
      {/* Bakong was already chosen (generating the QR stamps this on the order) but the
          transfer never completed — e.g. the customer left /payment before scanning. Without
          this, there'd be no way back to that QR once needsPaymentChoice above stops applying. */}
      {isUnpaid && order?.paymentMethod === "BAKONG" && (
        <div className="p-4 text-center">
          <Link
            href={`/payment?orderId=${encodeURIComponent(targetId)}`}
            className="inline-block rounded-xl bg-[#A1255B] hover:bg-[#881d52] px-5 py-3 font-bold text-white transition-colors"
          >
            {t("Continue to payment")}
          </Link>
        </div>
      )}
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
            ) : isOutForDelivery ? (
              <Bike className="w-10 h-10" />
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
                once a barista starts it, all the way (but still pink, not yet "done" green)
                once it's out for delivery, and green once it has actually arrived/is ready. */}
            <div
              className={`stepper_flow_line ${
                effectiveStep >= 4
                  ? "stepper_flow_line_full"
                  : effectiveStep === 3
                    ? "stepper_flow_line_almost"
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
              (item.extras ?? []).forEach((extra) => customDetails.push(`+ ${extra.name}`));

              const sizeLabel = item.variantName ? VARIANT_LABELS[item.variantName] : null;

              return (
                <div key={item.id} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span
                      className="value_dark font-semibold text-xs sm:text-sm truncate min-w-0 flex-1"
                      title={`${item.quantity}x ${toTitleCase(item.productName)}${
                        sizeLabel ? ` (Size: ${sizeLabel})` : ""
                      }`}
                    >
                      {item.quantity}x {t(toTitleCase(item.productName))}{" "}
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
                          className="inline-block rounded-full text-[10px] font-semibold text-pink-700 bg-pink-50 border border-pink-100 px-1.5 py-0.5"
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
          {isDelivery && (
            <div className="meta_row">
              <span className="label_muted">{t("Delivery Fee")}:</span>
              {isDeliveryFeePending ? (
                <span className="value_brand text-amber-600" suppressHydrationWarning>
                  {t("Pending shop confirmation")}
                </span>
              ) : (
                <span className="value_brand" suppressHydrationWarning>
                  {formatMoney(displayDeliveryFee)}
                </span>
              )}
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
            disabled={isCallingStaff || isCoolingDown}
            className="btn_desktop_staff"
          >
            <Bell className="w-5 h-5 mr-2 shrink-0" />
            <span>{t(callStaffLabel)}</span>
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
            disabled={isCallingStaff || isCoolingDown}
            className="btn_mobile_staff"
          >
            <ConciergeBell className="w-5 h-5 shrink-0" />
            <span>{t(callStaffLabel)}</span>
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

      {/* Payment Method Modal — only reachable once needsPaymentChoice is true (see above),
          so the total it shows and charges against already includes the delivery fee. */}
      <PaymentMethodModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        grandTotal={grandTotal}
        onConfirm={handleChoosePayment}
      />
    </div>
  );
}

export default CheckoutdonepageView;
