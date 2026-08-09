"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/toast";
import { Modal, ModalContent } from "@/components/ui/modal";
import {
  Check,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import "@/app/globals.scss";

export function CheckoutdonepageView() {
  const router = useRouter();
  const { items, subtotal } = useCart();

  const [callStaffModal, setCallStaffModal] = useState(false);
  const [staffCalled, setStaffCalled] = useState(false);
  const hasToastedRef = useRef(false);

  useEffect(() => {
    if (hasToastedRef.current) return;
    hasToastedRef.current = true;
    toast.add({
      type: "success",
      description: "Checkout complete! Order #1 is confirmed and being prepared.",
    });
  }, []);
  

  // Compute total or use fallback to match exact design image
  const displayItems =
    items && items.length > 0
      ? items
      : [
          {
            id: "1",
            title: "Fresh coconut",
            price: 2.5,
            quantity: 2,
          },
        ];

  const calculatedSubtotal =
    items && items.length > 0
      ? subtotal
      : displayItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const grandTotal = calculatedSubtotal > 0 ? calculatedSubtotal + 0.25 : 5.25;

  const handleCallStaff = () => {
    setStaffCalled(true);
    setCallStaffModal(true);
  };

  return (
    <div className="checkout_done_page">
      {/* 1. TOP BANNER SECTION WITH RESORT POOL BACKGROUND */}
      <div className="banner_section">
        {/* Pool Background Image */}
        <div
          className="banner_bg"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url('/images/590st cafe.jpg')`,
          }}
        />

        {/* Visual pool gradient overlay */}
        <div className="banner_overlay" />

        {/* Banner Content Container */}
        <div className="banner_content">
          {/* Confirmed Order Alert Card (Top Floating Badge) */}
          <div className="order_alert_card">
            <div className="alert_check_icon">
              <Check className="w-4.5 h-4.5 text-white stroke-[3]" />
            </div>
            <p className="alert_text">
              Order #1 is confirmed and being prepared.
            </p>
          </div>

          {/* Big Order Number */}
          <div className="order_number_wrapper">
            <h1 className="order_number_title">
              # 1
            </h1>
          </div>
        </div>
      </div>

      {/* 2. DO NOT CLOSE THIS TAB WARNING BANNER */}
      <div className="warning_banner">
        <span className="warning_text_alert">
          DO NOT CLOSE THIS TAB
        </span>{" "}
        <span className="warning_text_sub">
          until you receive your order
        </span>
      </div>

      {/* MAIN CONTENT AREA CONTAINER */}
      <div className="main_content">
        {/* 3. ORDER UPDATES SECTION */}
        <div className="card_box">
          <div className="card_header">
            <div>
              <h2 className="card_title">
                Order updates
              </h2>
              <p className="card_subtitle">
                What is happening with your order
              </p>
            </div>

            {/* Receipt Icon with Notification Badge */}
            <div className="receipt_wrapper">
              <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" />
              <span className="receipt_badge">
                1
              </span>
            </div>
          </div>

          {/* STEPPER TIMELINE */}
          <div className="timeline_list">
            {/* Step 1: Pending */}
            <div className="timeline_item">
              <div className="timeline_icon_pending">
                <Check className="w-4 h-4 text-[#f97316] stroke-[3]" />
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="text_pending">
                  Order pending acceptance
                </h3>
              </div>
            </div>

            {/* Vertical Connecting Line 1 */}
            <div className="timeline_line" />

            {/* Step 2: Accepted & Preparing (ACTIVE STEP) */}
            <div className="timeline_item">
              <div className="timeline_icon_active">
                2
              </div>
              <div className="flex-1">
                <h3 className="text_active">
                  Accepted, preparing order
                </h3>
                <p className="card_subtitle">
                  We will let you know when order is ready.
                </p>
              </div>
            </div>

            {/* Vertical Connecting Line 2 */}
            <div className="timeline_line" />

            {/* Step 3: Served */}
            <div className="timeline_item">
              <div className="timeline_icon_done">
                🥳
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="text_done">
                  Order being Served
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ORDER DETAILS SECTION */}
        <div className="card_box">
          <h2 className="card_title">
            Order details
          </h2>
          <p className="card_subtitle">
            See complete details for your order
          </p>

          {/* Metadata Key-Value Rows */}
          <div className="meta_row_group">
            <div className="meta_row">
              <span className="label_muted">Customer:</span>
              <span className="value_brand">Ream</span>
            </div>

            <div className="meta_row">
              <span className="label_muted">Grand total:</span>
              <span className="value_brand_lg">
                $ {grandTotal.toFixed(2)}
              </span>
            </div>

            <div className="meta_row">
              <span className="label_muted">Payment type:</span>
              <span className="value_dark">QR Scan</span>
            </div>

            <div className="meta_row">
              <span className="label_muted">Location:</span>
              <span className="value_brand">G01</span>
            </div>

            <div className="meta_row">
              <span className="label_muted">Estimated time:</span>
              <span className="value_brand">5 mins</span>
            </div>
          </div>

          {/* Divider */}
          <hr className="divider" />

          {/* Order Items List */}
          <div className="meta_row_group">
            {displayItems.map((item, idx) => (
              <div key={item.id || idx} className="meta_row">
                <span className="value_dark">
                  {item.quantity}x {item.title}
                </span>
                <span className="value_brand">
                  $ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <hr className="divider_sm" />

          {/* Subtotal */}
          <div className="meta_row">
            <span className="label_muted">Subtotal:</span>
            <span className="value_brand">
              $ {calculatedSubtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 5. IN-PAGE ACTION BUTTONS FOR DESKTOP / TABLET */}
        <div className="desktop_actions">
          <button
            onClick={handleCallStaff}
            type="button"
            className="btn_desktop_staff"
          >
            <Image
              src="/icons/bell.svg"
              alt="Bell"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span>CALL STAFF</span>
          </button>

          <Link
            href="/menu"
            className="btn_desktop_menu"
          >
            <Image
              src="/icons/food.svg"
              alt="Food"
              width={20}
              height={20}
              className="w-5 h-5 brightness-0 invert"
            />
            <span>BACK TO MENU</span>
          </Link>
        </div>
      </div>

      {/* 6. FIXED BOTTOM ACTION BAR FOR PHONE SCREENS */}
      <div className="mobile_bottom_bar">
        <button
          onClick={handleCallStaff}
          type="button"
          className="btn_mobile_staff"
        >
          <Image
            src="/icons/bell.svg"
            alt="Bell"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span>CALL STAFF</span>
        </button>

        <Link
          href="/menuphone"
          className="btn_mobile_menu"
        >
          <Image
            src="/icons/food.svg"
            alt="Food"
            width={20}
            height={20}
            className="w-5 h-5 brightness-0 invert"
          />
          <span>BACK TO MENU</span>
        </Link>
      </div>

      {/* CALL STAFF CONFIRMATION MODAL */}
      <Modal open={callStaffModal} onOpenChange={setCallStaffModal}>
        <ModalContent className="max-w-sm p-6 text-center rounded-2xl" showCloseButton={false}>
          <div className="modal_icon_badge">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="modal_title">Staff Notified!</h3>
          <p className="modal_description">
            A staff member will arrive at table <span className="value_brand">G01</span> shortly.
          </p>
          <button
            onClick={() => setCallStaffModal(false)}
            className="btn_modal_close"
          >
            OK, Got it
          </button>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default CheckoutdonepageView;
