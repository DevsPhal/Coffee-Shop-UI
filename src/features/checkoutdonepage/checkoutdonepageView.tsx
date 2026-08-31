"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrderStore } from "@/store/useOrderStore";
import { toast } from "@/components/ui/toast";
import { Modal, ModalContent } from "@/components/ui/modal";
import {
  Check,
  Receipt,
  CheckCircle2,
  Bell,
  ConciergeBell,
  UtensilsCrossed,
} from "lucide-react";
import { getItemCustomizationConfig, getProductByIdOrTitle } from "@/data/products";
import { calculateSizePrice } from "@/store/useCartStore";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

export function CheckoutdonepageView() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("id") || searchParams.get("orderId");

  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder, getOrderById, ordersHistory } = useOrderStore();

  const [isMounted, setIsMounted] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string>("");
  const [callStaffModal, setCallStaffModal] = useState(false);
  const [staffCalled, setStaffCalled] = useState(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [deliveryInfo, setDeliveryInfo] = useState<{ method: string; fee: number }>({
    method: "pickup",
    fee: 0,
  });
  const hasToastedRef = useRef(false);
  const orderCreatedRef = useRef(false);

  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "KHR">("USD");

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedCurr = localStorage.getItem("payment_currency");
      if (storedCurr === "KHR" || storedCurr === "USD") {
        setSelectedCurrency(storedCurr);
      }
    } catch {}
  }, []);

  const formatMoney = (amount: number) => {
    if (selectedCurrency === "KHR") {
      return `${Math.round(amount * 4000).toLocaleString()} ៛`;
    }
    return `$ ${amount.toFixed(2)}`;
  };

  // Read stored order info
  useEffect(() => {
    let storedDelivery = {
      method: "pickup",
      fee: 0,
      customerName: customerName || user?.name || "Guest",
      location: "G01",
      estimatedTime: "5 mins",
      paymentType: "QR Scan",
    };

    try {
      const stored = localStorage.getItem("checkout_delivery");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (typeof parsed.fee === "number") {
          setDeliveryInfo({ method: parsed.method || "pickup", fee: parsed.fee });
        }
        storedDelivery = {
          method: parsed.method || "pickup",
          fee: typeof parsed.fee === "number" ? parsed.fee : 0,
          customerName: parsed.customerName || customerName || user?.name || "Guest",
          location: parsed.location || (parsed.fee > 0 ? "House 30A, St 590, Toul Kork" : "G01"),
          estimatedTime: parsed.estimatedTime || (parsed.fee > 0 ? "10 - 15 mins" : "5 mins"),
          paymentType: parsed.paymentType || "QR Scan",
        };
      }
    } catch {}

    if (!urlOrderId && !orderCreatedRef.current && items && items.length > 0) {
      orderCreatedRef.current = true;
      const fee = storedDelivery.fee;
      const isDelivery = fee > 0 || storedDelivery.method === "grab" || storedDelivery.method === "delivery";
      const sub = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const total = sub + fee;

      const createdOrder = addOrder({
        userId: user?.userId || undefined,
        customerName: storedDelivery.customerName,
        paymentType: storedDelivery.paymentType,
        deliveryMethod: isDelivery ? "delivery" : "pickup",
        location: storedDelivery.location,
        estimatedTime: storedDelivery.estimatedTime,
        items: items.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          size: i.size || "M",
          iceLevel: i.iceLevel,
          sugarLevel: i.sugarLevel,
          milkType: i.milkType,
          image: i.image,
        })),
        subtotal: sub,
        deliveryFee: fee,
        grandTotal: total,
        status: "Preparing",
      });

      if (createdOrder) {
        setActiveOrderId(createdOrder.id);
        try {
          localStorage.setItem("active_order_id", createdOrder.id);
        } catch {}
      }

      clearCart();
    }
  }, [urlOrderId, items, user, addOrder, clearCart]);

  useEffect(() => {
    if (hasToastedRef.current) return;
    hasToastedRef.current = true;
    toast.add({
      type: "success",
      description: "Checkout complete! Order is confirmed and being prepared.",
    });
  }, []);

  // Look up target order
  const storedActiveId = isMounted && typeof window !== "undefined" ? localStorage.getItem("active_order_id") || "" : "";
  const targetId = urlOrderId || activeOrderId || storedActiveId;
  const selectedOrder = isMounted && targetId
    ? getOrderById(targetId) || ordersHistory.find((o) => o.id === targetId)
    : (isMounted ? ordersHistory[0] : undefined);

  // Compute totals & display properties from target order
  const displayItems = isMounted && selectedOrder?.items && selectedOrder.items.length > 0
    ? selectedOrder.items
    : [
        { id: "1", title: "Amacano", price: 2.25, quantity: 1, size: "M", image: "" },
      ];

  const calculatedSubtotal = isMounted && selectedOrder ? selectedOrder.subtotal : displayItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const displayDeliveryFee = isMounted && selectedOrder ? selectedOrder.deliveryFee : deliveryInfo.fee;
  const grandTotal = isMounted && selectedOrder ? selectedOrder.grandTotal : calculatedSubtotal + displayDeliveryFee;
  const displayCustomerName = isMounted ? (selectedOrder ? selectedOrder.customerName : customerName || user?.name || "Ream") : "Ream";
  const displayLocation = isMounted ? (selectedOrder ? selectedOrder.location : (deliveryInfo.fee === 0 ? "G01" : "House 30A, St 590, Toul Kork")) : "G01";
  const displayEstimatedTime = isMounted ? (selectedOrder ? selectedOrder.estimatedTime : (displayDeliveryFee > 0 ? "10 - 15 mins" : "5 mins")) : "5 mins";

  const [currentStep, setCurrentStep] = useState<number>(2);

  const effectiveStep = isMounted ? currentStep : 2;

  // Auto advance step 2 (Preparing) to step 3 (Ready / Completed) after 5 minutes
  useEffect(() => {
    if (selectedOrder?.status === "Completed") {
      setCurrentStep(3);
      return;
    }

    // 5 minutes timer (5 * 60 * 1000 = 300,000 ms) before marking order as Ready!
    const timer = setTimeout(() => {
      setCurrentStep(3);
      toast.add({
        type: "success",
        description: "Order is Ready! Please enjoy your fresh coffee.",
      });

      if (selectedOrder) {
        useOrderStore.setState((state) => ({
          ordersHistory: state.ordersHistory.map((o) =>
            o.id === selectedOrder.id ? { ...o, status: "Completed" } : o
          ),
        }));
      }
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [selectedOrder]);

  const handleCallStaff = () => {
    setStaffCalled(true);
    setCallStaffModal(true);
  };

  const handleBackToMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      router.push("/menuphone");
    } else {
      router.push("/menu");
    }
  };

  return (
    <div className="checkout_done_page">
      {/* 1. TOP BANNER SECTION WITH RESORT POOL BACKGROUND */}
      <div className="banner_section">
        <div
          className="banner_bg"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url('/images/590st cafe.jpg')`,
          }}
        />

        <div className="banner_content">
          <div className="banner_icon_badge animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="banner_title" suppressHydrationWarning>
            {t(effectiveStep >= 3 ? "Order Ready!" : "Order Confirmed!")}
          </h1>
          <p className="banner_subtitle" suppressHydrationWarning>
            {t(
              effectiveStep >= 3
                ? "Your order is ready! Enjoy your freshly prepared drinks."
                : "Thank you for ordering with 590st CAFE. Your order is being freshly prepared!"
            )}
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
            
            {/* Animated Flow Line */}
            <div
              className={`stepper_flow_line ${
                effectiveStep >= 3 ? "stepper_flow_line_full" : "stepper_flow_line_half"
              }`}
            />

            {/* Step 1: Confirmed */}
            <div className="stepper_step">
              <div className="stepper_circle stepper_circle_active">
                <Check className="w-5 h-5" />
              </div>
              <span className="stepper_label stepper_label_active">{t("Confirmed")}</span>
            </div>

            {/* Step 2: Preparing */}
            <div className="stepper_step">
              <div
                className={`stepper_circle ${
                  effectiveStep >= 3
                    ? "stepper_circle_active"
                    : "stepper_circle_active stepper_circle_pulse animate-pulse"
                }`}
                suppressHydrationWarning
              >
                {effectiveStep >= 3 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <span className={`stepper_label ${effectiveStep >= 3 ? "stepper_label_active" : "stepper_label_active"}`} suppressHydrationWarning>
                {t("Preparing")}
              </span>
            </div>

            {/* Step 3: Ready / Delivered */}
            <div className="stepper_step">
              <div
                className={`stepper_circle ${
                  effectiveStep >= 3
                    ? "stepper_circle_done scale-110"
                    : "stepper_circle_inactive"
                }`}
                suppressHydrationWarning
              >
                {effectiveStep >= 3 ? <Check className="w-5 h-5" /> : "3"}
              </div>
              <span
                className={`stepper_label ${
                  effectiveStep >= 3 ? "stepper_label_done" : "stepper_label_inactive"
                }`}
                suppressHydrationWarning
              >
                {t(displayDeliveryFee > 0 ? (effectiveStep >= 3 ? "Delivered" : "Delivering") : (effectiveStep >= 3 ? "Ready!" : "Ready"))}
              </span>
            </div>
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
              <span className="value_dark">{t(selectedOrder?.paymentType || (isMounted ? (JSON.parse(localStorage.getItem("checkout_delivery") || "{}").paymentType || "QR Scan") : "QR Scan"))}</span>
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
            {displayItems.map((item, idx) => {
              const config = getItemCustomizationConfig(item.title);
              const customDetails: string[] = [];
              if (config.hasIce && item.iceLevel) customDetails.push(`Ice: ${item.iceLevel}`);
              if (config.hasSugar && item.sugarLevel) customDetails.push(`Sugar: ${item.sugarLevel}`);
              if (config.hasMilk && item.milkType) customDetails.push(`Milk: ${item.milkType}`);

              return (
                <div key={item.id || idx} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span
                      className="value_dark font-semibold text-xs sm:text-sm truncate min-w-0 flex-1"
                      title={`${item.quantity}x ${item.title} ${item.size ? `(Size: ${item.size})` : ""}`}
                    >
                      {item.quantity}x {t(item.title)} {item.size ? `(${t("Size")}: ${item.size})` : ""}
                    </span>
                    <span className="value_brand font-bold text-xs sm:text-sm shrink-0 whitespace-nowrap pl-1" suppressHydrationWarning>
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>

                  {customDetails.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {customDetails.map((detail, dIdx) => (
                        <span
                          key={dIdx}
                          className="inline-block text-[10px] font-semibold text-pink-700 bg-pink-50 border border-pink-100 rounded-md px-1.5 py-0.5"
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
            const fullSubtotal = displayItems.reduce((acc, item) => {
              const prod = getProductByIdOrTitle(item.id, item.title);
              const origPrice = (item as any).originalPrice ?? prod?.originalPrice;
              const itemOrigPrice = (origPrice && origPrice > item.price) ? calculateSizePrice(origPrice, item.size) : item.price;
              return acc + itemOrigPrice * item.quantity;
            }, 0);

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
                      {selectedCurrency === "KHR" ? `-${Math.round(totalDiscount * 4000).toLocaleString()} ៛` : `-$ ${totalDiscount.toFixed(2)}`}
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
