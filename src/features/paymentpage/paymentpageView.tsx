"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import "@/app/globals.scss";

export function PaymentpageView() {
  const { subtotal } = useCart();
  const displayAmount = subtotal > 0 ? subtotal : 6.2;

  const [secondsLeft, setSecondsLeft] = useState(177);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="payment_page_container">
      <div>
        <h1 className="payment_page_title">Scan QR</h1>

        <div className="payment_page_status_bar">
          <span className="payment_page_brand_label">ABA KHQR</span>

          <div className="payment_page_timer_badge">
            <svg
              className="payment_page_spinner"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="payment_page_spinner_track"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="payment_page_spinner_head"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="payment_page_timer_text">{formattedTime}</span>
          </div>
        </div>

        <div className="payment_page_card">
          <div className="payment_page_merchant_info">
            <div className="payment_page_logo_text">
              <span className="payment_page_logo_blue">ABA&apos;</span>
              <span className="payment_page_logo_cyan">PAY</span>
            </div>
            <p className="payment_page_merchant_name">590st Cafe</p>
            <p className="payment_page_amount">${displayAmount.toFixed(2)}</p>
          </div>

          <div className="payment_page_qr_container">
            <div className="payment_page_qr_wrapper">
              <Image
                src="/images/KHQR.svg"
                alt="ABA KHQR Code"
                width={256}
                height={330}
                className="payment_page_qr_img"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="payment_page_footer">
        <div className="payment_page_bank_tag">
          <span>ABA BANK</span>
          <span className="payment_page_bank_dot" />
        </div>
        <div className="payment_page_footer_text">
          <p>Advanced Bank of Asia Ltd. 148, Preah Sihanouk Blvd, Phnom Penh, 12321, Cambodia</p>
          <a
            href="https://www.ababank.com"
            target="_blank"
            rel="noopener noreferrer"
            className="payment_page_footer_link"
          >
            www.ababank.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default PaymentpageView;