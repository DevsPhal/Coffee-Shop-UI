"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { QrCode, Banknote, CreditCard, X, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";

export interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grandTotal: number;
  onConfirm: (paymentMethod: "QR Scan" | "Cash") => void;
}

export function PaymentMethodModal({
  open,
  onOpenChange,
  grandTotal,
  onConfirm,
}: PaymentMethodModalProps) {
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<"QR Scan" | "Cash">("QR Scan");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirmClick = () => {
    if (isSubmitting) return;

    if (selectedMethod === "Cash") {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onConfirm("Cash");
        onOpenChange(false);
      }, 30000); // 30 seconds delay
    } else {
      onConfirm("QR Scan");
      onOpenChange(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <ModalContent className="max-w-sm p-6 rounded-3xl border border-gray-100 shadow-2xl bg-white" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-50 text-[#A1255B] flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              {t("Select Payment Method")}
            </h3>
          </div>
          {!isSubmitting && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Total Price Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 mb-5">
          <span className="text-xs font-semibold text-gray-600">{t("Total:")}</span>
          <span className="text-base font-black text-[#A1255B]" suppressHydrationWarning>
            ${grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Payment Options Stack */}
        <div className="space-y-3 mb-6">
          {/* QR Code Option */}
          <div
            onClick={() => !isSubmitting && setSelectedMethod("QR Scan")}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
              selectedMethod === "QR Scan"
                ? "border-[#A1255B] bg-pink-50/40 shadow-sm ring-1 ring-[#A1255B]"
                : "border-gray-200 hover:border-gray-300 bg-white"
            } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedMethod === "QR Scan"
                    ? "bg-[#A1255B] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                  {t("ABA Pay / KHQR")}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {t("Scan & pay via Bakong / Mobile Banking")}
                </p>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                selectedMethod === "QR Scan"
                  ? "border-[#A1255B] bg-[#A1255B] text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {selectedMethod === "QR Scan" && <Check className="w-3 h-3" />}
            </div>
          </div>

          {/* Cash Option */}
          <div
            onClick={() => !isSubmitting && setSelectedMethod("Cash")}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
              selectedMethod === "Cash"
                ? "border-[#A1255B] bg-pink-50/40 shadow-sm ring-1 ring-[#A1255B]"
                : "border-gray-200 hover:border-gray-300 bg-white"
            } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedMethod === "Cash"
                    ? "bg-[#A1255B] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                  {t("Cash on Delivery")}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {t("Pay cash upon pickup or delivery")}
                </p>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                selectedMethod === "Cash"
                  ? "border-[#A1255B] bg-[#A1255B] text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {selectedMethod === "Cash" && <Check className="w-3 h-3" />}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isSubmitting}
            className={`w-full bg-[#A1255B] hover:bg-[#881d52] text-white font-bold py-3 px-4 rounded-full text-sm shadow-md shadow-[#A1255B]/20 transition-all cursor-pointer border-none flex items-center justify-center gap-2 active:scale-98 ${
              isSubmitting ? "opacity-90 cursor-wait" : ""
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span>{t("Processing...")}</span>
              </div>
            ) : (
              <span>{t("Confirm Order")}</span>
            )}
          </button>

          {!isSubmitting && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full bg-transparent hover:bg-gray-100 text-gray-500 font-semibold py-2 px-4 rounded-full text-xs transition-colors cursor-pointer border-none"
            >
              {t("Cancel")}
            </button>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}

export default PaymentMethodModal;
