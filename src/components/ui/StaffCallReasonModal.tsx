"use client";

import React, { useState } from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import {
  Bike,
  Check,
  ConciergeBell,
  CreditCard,
  Hourglass,
  Loader2,
  MessageSquare,
  PackageX,
  PencilLine,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import type { StaffCallReason } from "@/store/api/types";

const NOTE_LIMIT = 200;

interface ReasonOption {
  value: StaffCallReason;
  label: string;
  hint: string;
  icon: LucideIcon;
  deliveryOnly?: boolean;
}

const REASONS: ReasonOption[] = [
  { value: "PAYMENT_HELP", label: "Help with payment", hint: "Cash, KHQR or receipt questions", icon: CreditCard },
  { value: "CHANGE_ORDER", label: "Change my order", hint: "Add, remove or adjust an item", icon: PencilLine },
  { value: "ORDER_DELAY", label: "Order is taking too long", hint: "Check on my order progress", icon: Hourglass },
  { value: "WRONG_OR_MISSING_ITEM", label: "Wrong or missing item", hint: "Something isn't right with my order", icon: PackageX },
  { value: "NAPKINS_UTENSILS", label: "Napkins, straws or cutlery", hint: "Extra napkins, straws, lids or spoons", icon: UtensilsCrossed },
  { value: "DELIVERY_HELP", label: "Delivery help", hint: "Address, directions or rider questions", icon: Bike, deliveryOnly: true },
  { value: "OTHER", label: "Something else", hint: "Tell us what you need", icon: MessageSquare },
];

export interface StaffCallReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDelivery: boolean;
  onConfirm: (reason: StaffCallReason, note: string) => void | Promise<void>;
}

export function StaffCallReasonModal({ open, onOpenChange, isDelivery, onConfirm }: StaffCallReasonModalProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState<StaffCallReason | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = REASONS.filter((option) => !option.deliveryOnly || isDelivery);
  const noteRequired = reason === "OTHER";
  const canSubmit = reason !== null && (!noteRequired || note.trim().length > 0) && !isSubmitting;

  const close = (next: boolean) => {
    if (isSubmitting) return;
    onOpenChange(next);
    if (!next) {
      setReason(null);
      setNote("");
    }
  };

  const handleConfirm = async () => {
    if (!canSubmit || !reason) return;
    setIsSubmitting(true);
    try {
      await onConfirm(reason, note.trim());
      setReason(null);
      setNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent className="max-w-sm p-6 rounded-3xl border border-gray-100 shadow-2xl bg-white max-h-[calc(100vh-32px)] overflow-y-auto" showCloseButton={false}>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#f0383e] flex items-center justify-center font-bold">
              <ConciergeBell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              {t("How can we help?")}
            </h3>
          </div>
          {!isSubmitting && (
            <button
              type="button"
              onClick={() => close(false)}
              aria-label={t("Close")}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          {t("Choose a reason so our staff can come prepared.")}
        </p>

        <div role="radiogroup" className="space-y-2 mb-4">
          {options.map(({ value, label, hint, icon: Icon }) => {
            const selected = reason === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isSubmitting}
                onClick={() => setReason(value)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer select-none ${
                  selected
                    ? "border-[#A1255B] bg-pink-50/40 shadow-sm ring-1 ring-[#A1255B]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selected ? "bg-[#A1255B] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{t(label)}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{t(hint)}</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    selected ? "border-[#A1255B] bg-[#A1255B] text-white" : "border-gray-300 bg-white"
                  }`}
                >
                  {selected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {reason && (
          <div className="mb-5">
            <label htmlFor="staff-call-note" className="block text-xs font-semibold text-gray-700 mb-1.5">
              {noteRequired ? t("What do you need?") : t("Add a note (optional)")}
            </label>
            <textarea
              id="staff-call-note"
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, NOTE_LIMIT))}
              disabled={isSubmitting}
              rows={2}
              maxLength={NOTE_LIMIT}
              placeholder={t("e.g. Less ice in my latte, please")}
              className="w-full rounded-2xl border border-gray-200 focus:border-[#A1255B] focus:ring-1 focus:ring-[#A1255B] outline-none p-3 text-sm text-gray-900 resize-none"
            />
            <p className="text-[11px] text-gray-400 text-right mt-1">
              {note.length}/{NOTE_LIMIT}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={`w-full rounded-full bg-[#A1255B] hover:bg-[#881d52] text-white py-3 px-4 text-sm shadow-md shadow-[#A1255B]/20 transition-all cursor-pointer border-none flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubmitting ? "cursor-wait" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span>{t("Calling staff...")}</span>
              </>
            ) : (
              <span>{t("Call Staff")}</span>
            )}
          </button>
          {!isSubmitting && (
            <button
              type="button"
              onClick={() => close(false)}
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

export default StaffCallReasonModal;
