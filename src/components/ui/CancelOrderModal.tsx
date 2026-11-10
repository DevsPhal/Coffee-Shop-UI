"use client";

import React, { useState } from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Ban, Check, Clock3, Loader2, MessageSquare, Undo2, X, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";

const NOTE_LIMIT = 200;

interface ReasonOption {
  label: string;
  icon: LucideIcon;
  other?: boolean;
}

const REASONS: ReasonOption[] = [
  { label: "I changed my mind", icon: Undo2 },
  { label: "I ordered by mistake", icon: Ban },
  { label: "It's taking too long", icon: Clock3 },
  { label: "Something else", icon: MessageSquare, other: true },
];

export interface CancelOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The order is already being made: the customer is told the shop is notified straight away. */
  beingMade: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
}

// Asks why the customer is cancelling, in the same style as the call-staff picker. "Something else" needs a note.
export function CancelOrderModal({ open, onOpenChange, beingMade, onConfirm }: CancelOrderModalProps) {
  const { t } = useLanguage();
  const [choice, setChoice] = useState<ReasonOption | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const noteRequired = choice?.other === true;
  const canSubmit = choice !== null && (!noteRequired || note.trim().length > 0) && !isSubmitting;

  const close = (next: boolean) => {
    if (isSubmitting) return;
    onOpenChange(next);
    if (!next) {
      setChoice(null);
      setNote("");
    }
  };

  const handleConfirm = async () => {
    if (!canSubmit || !choice) return;
    const extra = note.trim();
    // The reason is stored as the customer wrote it, in English for the preset part so staff read it the same way.
    const reason = choice.other ? extra : extra ? `${choice.label}: ${extra}` : choice.label;
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setChoice(null);
      setNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent className="max-w-sm p-6 rounded-3xl border border-gray-100 shadow-2xl bg-white max-h-[calc(100dvh-32px)] overflow-y-auto" showCloseButton={false}>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">{t("Cancel this order?")}</h3>
          </div>
          {!isSubmitting && (
            <button
              type="button"
              onClick={() => close(false)}
              aria-label={t("Close")}
              className="touch_target w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          {beingMade
            ? t("Your order is already being made. If you cancel, the shop is told straight away.")
            : t("Tell us why, so we can do better next time.")}
        </p>

        <div role="radiogroup" aria-label={t("Reason")} className="space-y-2 mb-4">
          {REASONS.map((option) => {
            const selected = choice?.label === option.label;
            const Icon = option.icon;
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isSubmitting}
                onClick={() => setChoice(option)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer select-none ${
                  selected ? "border-red-500 bg-red-50/50 shadow-sm ring-1 ring-red-500" : "border-gray-200 hover:border-gray-300 bg-white"
                } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">{t(option.label)}</h4>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? "border-red-500 bg-red-500 text-white" : "border-gray-300 bg-white"}`}>
                  {selected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {choice && (
          <div className="mb-5">
            <label htmlFor="cancel-order-note" className="block text-xs font-semibold text-gray-700 mb-1.5">
              {noteRequired ? t("Tell us the reason") : t("Add a note (optional)")}
            </label>
            <textarea
              id="cancel-order-note"
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, NOTE_LIMIT))}
              disabled={isSubmitting}
              rows={2}
              maxLength={NOTE_LIMIT}
              className="w-full rounded-2xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none p-3 text-base text-gray-900 resize-none"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 text-sm transition-colors cursor-pointer border-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{t("Cancelling...")}</span>
              </>
            ) : (
              <span>{t("Cancel order")}</span>
            )}
          </button>
          {!isSubmitting && (
            <button
              type="button"
              onClick={() => close(false)}
              className="w-full bg-transparent hover:bg-gray-100 text-gray-600 font-semibold py-2 px-4 rounded-full text-sm transition-colors cursor-pointer border-none"
            >
              {t("Keep my order")}
            </button>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
