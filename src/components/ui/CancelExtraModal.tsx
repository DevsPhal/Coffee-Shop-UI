"use client";

import React from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Trash2 } from "lucide-react";

export interface CancelExtraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
  onConfirmRemove: () => void;
}

export function CancelExtraModal({
  open,
  onOpenChange,
  productTitle,
  onConfirmRemove,
}: CancelExtraModalProps) {
  const { t } = useLanguage();

  const handleRemove = () => {
    onConfirmRemove();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className="max-w-xs p-5 rounded-3xl border border-gray-100 shadow-2xl bg-white text-center"
        showCloseButton={false}
      >
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-extrabold text-gray-900 mb-1">
          {t("Cancel Extra Item?")}
        </h3>

        <p className="text-xs text-gray-500 font-medium mb-5 px-2">
          {t("Do you want to remove")} <span className="font-bold text-gray-800">{t(productTitle)}</span> {t("from your cart?")}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-3 rounded-full text-xs transition-colors cursor-pointer border-none"
          >
            {t("Keep Item")}
          </button>

          <button
            type="button"
            onClick={handleRemove}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-3 rounded-full text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer border-none"
          >
            {t("Remove")}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
}

export default CancelExtraModal;
