"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/toast";
import { ChevronDown } from "lucide-react";
import "@/app/globals.scss";

export function PaymentpageView() {
  const router = useRouter();
  const { subtotal } = useCart();
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "KHR">("USD");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem("checkout_delivery");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.fee === "number") {
          setDeliveryFee(parsed.fee);
        }
      }
      const storedCurr = localStorage.getItem("payment_currency");
      if (storedCurr === "KHR" || storedCurr === "USD") {
        setCurrency(storedCurr);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("payment_currency", currency);
    } catch {}
  }, [currency]);

  const displayAmount = subtotal + deliveryFee;
  const khrAmount = Math.round(displayAmount * 4000).toLocaleString();

  const [secondsLeft, setSecondsLeft] = useState(177);

  useEffect(() => {
    if (secondsLeft <= 0) {
      toast.add({
        type: "warning",
        description: "Payment time expired. Returning to checkout.",
      });
      router.push("/checkout");
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, router]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 sm:py-6 font-sans min-h-[70vh] flex flex-col justify-center">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3 w-full">
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 m-0">Scan QR</h1>
          <button
            onClick={() => router.push("/checkoutdone")}
            type="button"
            className="px-3 py-1.5 bg-[#900C3F] hover:bg-[#700931] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border-none"
          >
            <span>Test Screen</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3.5 py-2 shadow-2xs mb-3 w-full">
          <span className="text-xs font-bold text-[#005f88]">ABA KHQR</span>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
            <svg
              className="w-3 h-3 text-[#00a4e4] animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-[11px] font-bold text-gray-700" suppressHydrationWarning>{formattedTime}</span>
          </div>
        </div>

        {/* Balanced Card with Comfortable Spacing */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto bg-white rounded-3xl border border-gray-100 shadow-md p-4 sm:p-6 flex flex-col items-center justify-center text-center">
          {/* Merchant Logo Header */}
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="flex items-center gap-1 text-lg sm:text-xl font-black tracking-tight">
              <span className="text-[#005f88]">ABA&apos;</span>
              <span className="text-[#00a4e4]">PAY</span>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-0.5 mb-0">590st Cafe</p>
          </div>

          {/* KHQR Image Template Card with Inner QR Code */}
          <div
            onClick={() => window.location.href = "/checkoutdone"}
            className="cursor-pointer transition-transform hover:scale-102 active:scale-98 flex justify-center items-center my-2"
            title="Click to complete payment"
          >
            <div className="relative w-[210px] sm:w-[240px] aspect-[3/4]">
              <Image
                src="/images/cafekhqr.png"
                alt="590st Cafe KHQR Card"
                fill
                unoptimized
                className="object-contain drop-shadow-2xs"
                priority
              />
              {/* Inner QR Code Matrix */}
              <div className="absolute inset-x-0 top-[26%] bottom-[8%] flex items-center justify-center p-3 z-10 pointer-events-none">
                <Image
                  src="/images/khqrcode.jpg"
                  alt="KHQR Scan Code"
                  width={170}
                  height={170}
                  className="w-[84%] h-auto object-contain rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Price Amount 16pt with Dropdown Menu on Click */}
          <div className="relative mt-2 inline-block">
            <button
              type="button"
              onClick={() => setIsCurrencyDropdownOpen((prev) => !prev)}
              className="font-extrabold text-[#005f88] tracking-tight m-0 text-center flex items-center justify-center gap-1 cursor-pointer bg-transparent border-none p-0 outline-none hover:opacity-85 transition-opacity"
              style={{ fontSize: "16pt" }}
              title="Click to select currency (USD / KHR)"
              suppressHydrationWarning
            >
              <span>
                {currency === "USD"
                  ? `$${isMounted ? displayAmount.toFixed(2) : "0.00"}`
                  : `${isMounted ? khrAmount : "0"} ៛`}
              </span>
              <ChevronDown
                className="w-4 h-4 text-[#005f88] shrink-0 transition-transform duration-200"
                style={{ transform: isCurrencyDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {/* Dropdown Menu Popup */}
            {isCurrencyDropdownOpen && (
              <>
                {/* Overlay backdrop to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCurrencyDropdownOpen(false)}
                />

                {/* Floating Dropdown Card */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("USD");
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer ${
                      currency === "USD"
                        ? "bg-pink-50 text-[#005f88]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>USD ($)</span>
                    <span className="font-extrabold">${isMounted ? displayAmount.toFixed(2) : "0.00"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("KHR");
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer ${
                      currency === "KHR"
                        ? "bg-pink-50 text-[#005f88]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>KHR (៛)</span>
                    <span className="font-extrabold">{isMounted ? khrAmount : "0"} ៛</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 w-full">
        <div className="bg-[#005f88] text-white px-2 py-0.5 rounded text-[9px] font-black tracking-wider shrink-0 flex items-center gap-1">
          <span>ABA BANK</span>
          <span className="w-1 h-1 rounded-full bg-[#00a4e4]" />
        </div>
        <p className="m-0 leading-tight flex-1 truncate">
          Advanced Bank of Asia Ltd. Phnom Penh, Cambodia
        </p>
      </div>
    </div>
  );
}

export default PaymentpageView;