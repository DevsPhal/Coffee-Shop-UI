"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Modal, ModalContent } from "@/components/ui/modal";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Coffee, ShoppingBag, X, ChevronDown, Check } from "lucide-react";

import {
  ICE_CHOICES,
  ICE_LABELS,
  MILK_CHOICES,
  MILK_LABELS,
  SUGAR_CHOICES,
  SUGAR_LABELS,
} from "@/store/api/optionMapping";
import { resolveProductImage, type StoreProduct } from "@/store/api/productAdapter";
import type { IceLevel, MilkType, SugarLevel, UUID } from "@/store/api/types";

/** A confirmed configuration, shaped so the caller can hand it straight to the cart. */
export interface SizeSelection {
  sizeOptionId: UUID | null;
  sizeName: string | null;
  unitPrice: number;
  iceLevel?: IceLevel;
  sugarLevel?: SugarLevel;
  milkType?: MilkType;
}

function CustomModalOptionDropdown<T extends string>({
  label,
  value,
  choices,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  choices: readonly T[];
  labels: Record<T, string>;
  onChange: (val: T) => void;
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="mb-4">
      <label className="block text-[11px] text-gray-700 uppercase tracking-wider mb-1.5">
        {t(label)}
      </label>
      <div ref={ref} className="relative w-full text-left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-pink-50/60 hover:bg-pink-100/60 border border-pink-200 text-[#A1255B] font-medium text-xs py-2.5 px-3.5 transition-all cursor-pointer select-none"
        >
          <span>{t(labels[value])}</span>
          <ChevronDown
            className={`w-4 h-4 text-[#A1255B] shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 space-y-1 animate-in fade-in duration-150">
            {choices.map((choice) => {
              const isSelected = value === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => {
                    onChange(choice);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none text-left select-none ${
                    isSelected
                      ? "bg-[#A1255B] text-white"
                      : "hover:bg-pink-50 text-gray-800"
                  }`}
                >
                  <span>{t(labels[choice])}</span>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export interface SelectSizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: StoreProduct | null;
  initialSizeOptionId?: UUID | null;
  initialIce?: IceLevel;
  initialSugar?: SugarLevel;
  initialMilk?: MilkType;
  actionType?: "checkout" | "cart";
  onConfirm: (selection: SizeSelection) => void;
}

/**
 * Product customization.
 *
 * Sizes come from the product's own `sizeOptions` — real rows with real price add-ons, so
 * there is no table of hardcoded packaging prices any more. Ice, sugar and milk are the API's
 * enum values; every one of them is optional on the cart request, so a product with no size
 * options still gets the drink controls and the customer can simply leave them at default.
 */
export function SelectSizeModal({
  open,
  onOpenChange,
  product,
  initialSizeOptionId,
  initialIce,
  initialSugar,
  initialMilk,
  actionType = "checkout",
  onConfirm,
}: SelectSizeModalProps) {
  const { t } = useLanguage();

  const sizeOptions = product?.sizeOptions ?? [];
  const hasSizes = sizeOptions.length > 0;

  const [sizeOptionId, setSizeOptionId] = useState<UUID | null>(null);
  const [iceLevel, setIceLevel] = useState<IceLevel>("HUNDRED");
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>("HUNDRED");
  const [milkType, setMilkType] = useState<MilkType>("WHOLE_MILK");

  React.useEffect(() => {
    if (!product) return;
    setSizeOptionId(
      initialSizeOptionId ?? (sizeOptions.length > 0 ? sizeOptions[0].id : null)
    );
    setIceLevel(initialIce ?? "HUNDRED");
    setSugarLevel(initialSugar ?? "HUNDRED");
    setMilkType(initialMilk ?? "WHOLE_MILK");
    // Re-seed only when the modal opens on a different product.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, open]);

  if (!product) return null;

  const selectedSize = sizeOptions.find((option) => option.id === sizeOptionId);
  const unitPrice = product.price + Number(selectedSize?.priceDelta ?? 0);

  const handleConfirm = () => {
    onConfirm({
      sizeOptionId,
      sizeName: selectedSize?.name ?? null,
      unitPrice,
      iceLevel,
      sugarLevel,
      milkType,
    });
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#A1255B]" />
            <h3 className="text-base font-bold text-gray-900">{t("Customize")}</h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="box_product flex items-center gap-3 p-3 mb-4">
          <div className="box_product relative w-12 h-12 overflow-hidden shrink-0">
            <Image
              src={resolveProductImage(product.image)}
              alt={t(product.title)}
              fill
              unoptimized
              className="object-cover img"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 truncate">
              {t(product.title)}
            </h4>
            <p className="text-xs font-extrabold text-[#A1255B] mt-0.5">
              ${unitPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {hasSizes && (
          <div className="mb-4">
            <label className="block text-[11px] text-gray-700 uppercase tracking-wider mb-2">
              {t("Size")}:
            </label>
            <div
              className={`grid gap-2 ${
                sizeOptions.length === 2 ? "grid-cols-2" : "grid-cols-3"
              }`}
            >
              {sizeOptions.map((option) => {
                const isSelected = sizeOptionId === option.id;
                const optionPrice = product.price + Number(option.priceDelta);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSizeOptionId(option.id)}
                    className={`flex flex-col items-center py-1 justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#A1255B] border-[#A1255B] text-white shadow-sm scale-[1.02]"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className="text-sm font-bold">{option.name}</span>
                    <span className="text-[10px] opacity-80">
                      ${optionPrice.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <CustomModalOptionDropdown
          label="Ice Level"
          value={iceLevel}
          choices={ICE_CHOICES}
          labels={ICE_LABELS}
          onChange={setIceLevel}
        />
        <CustomModalOptionDropdown
          label="Sugar Level"
          value={sugarLevel}
          choices={SUGAR_CHOICES}
          labels={SUGAR_LABELS}
          onChange={setSugarLevel}
        />
        <CustomModalOptionDropdown
          label="Milk"
          value={milkType}
          choices={MILK_CHOICES}
          labels={MILK_LABELS}
          onChange={setMilkType}
        />

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-[#A1255B] hover:bg-[#881d52] text-white py-3 px-4 text-sm shadow-md shadow-[#A1255B]/20 transition-all cursor-pointer border-none flex items-center justify-center gap-2 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {actionType === "cart" ? t("Add to Cart") : t("Proceed to Checkout")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full bg-transparent hover:bg-gray-100 text-gray-500 font-semibold py-2 px-4 rounded-full text-xs transition-colors cursor-pointer border-none"
          >
            {t("Cancel")}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
}

export default SelectSizeModal;
