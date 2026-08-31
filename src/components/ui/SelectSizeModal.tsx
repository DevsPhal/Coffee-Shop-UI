"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Modal, ModalContent } from "@/components/ui/modal";
import { getItemCustomizationConfig } from "@/data/products";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { calculateSizePrice } from "@/store/useCartStore";
import { Coffee, ShoppingBag, X, ChevronDown, Check } from "lucide-react";

function CustomModalOptionDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
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
          <span>{t(value)}</span>
          <ChevronDown
            className={`w-4 h-4 text-[#A1255B] shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 space-y-1 animate-in fade-in duration-150">
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none text-left select-none ${
                    isSelected
                      ? "bg-[#A1255B] text-white"
                      : "hover:bg-pink-50 text-gray-800"
                  }`}
                >
                  <span>{t(opt)}</span>
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
  product: {
    id: string;
    title: string;
    price: number;
    image?: string | null;
    category?: string;
  } | null;
  initialSize?: string;
  initialIce?: string;
  initialSugar?: string;
  initialMilk?: string;
  actionType?: "checkout" | "cart";
  onConfirm: (size: string, iceLevel?: string, sugarLevel?: string, milkType?: string) => void;
}

const ICE_OPTIONS = ["Normal", "Less", "No Ice"];
const SUGAR_OPTIONS = ["Normal", "Less"];
const MILK_OPTIONS = ["Normal", "Less Milk", "No Milk"];

export function SelectSizeModal({
  open,
  onOpenChange,
  product,
  initialSize,
  initialIce,
  initialSugar,
  initialMilk,
  actionType = "checkout",
  onConfirm,
}: SelectSizeModalProps) {
  const { t } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedIce, setSelectedIce] = useState<string>("Normal");
  const [selectedSugar, setSelectedSugar] = useState<string>("Normal");
  const [selectedMilk, setSelectedMilk] = useState<string>("Normal");

  React.useEffect(() => {
    if (product) {
      const cfg = getItemCustomizationConfig(product.title, product.category);
      if (initialSize) {
        setSelectedSize(initialSize);
      } else if (cfg.hasSize && cfg.sizeOptions.length > 0) {
        setSelectedSize(cfg.sizeOptions[0]);
      } else {
        setSelectedSize("");
      }
      setSelectedIce(initialIce || (cfg.hasIce ? "Normal" : ""));
      setSelectedSugar(initialSugar || (cfg.hasSugar ? "Normal" : ""));
      setSelectedMilk(initialMilk || (cfg.hasMilk ? "Normal" : ""));
    }
  }, [product, open, initialSize, initialIce, initialSugar, initialMilk]);

  if (!product) return null;

  const handleConfirm = () => {
    onConfirm(selectedSize, selectedIce, selectedSugar, selectedMilk);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-sm p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xl bg-white max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              {t("Customize Your Order")}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Brief */}
        <div className="box_product flex items-center gap-3 p-3 mb-4">
          <div className="box_product relative w-12 h-12 overflow-hidden shrink-0">
            {product.image ? (
              <Image
                src={product.image}
                alt={t(product.title)}
                fill
                unoptimized
                className="object-cover img"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                {product.title[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 truncate">
              {t(product.title)}
            </h4>
            <p className="text-xs font-extrabold text-[#A1255B] mt-0.5">
              ${calculateSizePrice(product.price, selectedSize).toFixed(2)}
            </p>
          </div>
        </div>

        {(() => {
          const config = getItemCustomizationConfig(product.title, product.category);
          const hasAnyOption = config.hasSize || config.hasIce || config.hasSugar || config.hasMilk;

          return (
            <>
              {/* Size Selection */}
              {config.hasSize && (
                <div className="mb-4">
                  <label className="block text-[11px] text-gray-700 uppercase tracking-wider mb-2">
                    {t(
                      config.sizeOptions.includes("Can")
                        ? "Packaging Option:"
                        : config.sizeOptions.includes("1")
                        ? "Portion Size:"
                        : config.sizeOptions[0]?.includes("ml")
                        ? "Bottle Size:"
                        : "Drink Size:"
                    )}
                  </label>
                  <div className={`grid gap-2 ${config.sizeOptions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {config.sizeOptions.map((sz) => {
                      const isSel = selectedSize === sz;
                      const szPrice = calculateSizePrice(product.price, sz);
                      const subText =
                        sz === "Can"
                          ? "Can ($0.75)"
                          : sz === "Bottle"
                          ? "Bottle ($1.25)"
                          : sz === "Carton"
                          ? "Carton ($28.00)"
                          : sz === "S"
                          ? "Small"
                          : sz === "M"
                          ? "Medium"
                          : sz === "L"
                          ? "Large"
                          : sz === "1"
                          ? "Single Portion"
                          : sz === "Double"
                          ? "Double Portion"
                          : `${sz} Bottle`;

                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`flex flex-col items-center py-1 justify-center transition-all cursor-pointer border ${
                            isSel
                              ? "bg-[#A1255B] border-[#A1255B] text-white shadow-sm scale-[1.02]"
                              : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <span className="text-xs font-extrabold">{t(sz)}</span>
                          <span className={`text-[10px] font-medium mt-0.5 ${isSel ? "text-pink-100" : "text-gray-400"}`}>
                            {t(subText)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ice Level Dropdown */}
              {config.hasIce && (
                <CustomModalOptionDropdown
                  label="Ice Level"
                  value={selectedIce}
                  options={ICE_OPTIONS}
                  onChange={setSelectedIce}
                />
              )}

              {/* Sugar Level Dropdown */}
              {config.hasSugar && (
                <CustomModalOptionDropdown
                  label="Sugar Level"
                  value={selectedSugar}
                  options={SUGAR_OPTIONS}
                  onChange={setSelectedSugar}
                />
              )}

              {/* Milk Type Dropdown */}
              {config.hasMilk && (
                <CustomModalOptionDropdown
                  label="Milk Type"
                  value={selectedMilk}
                  options={MILK_OPTIONS}
                  onChange={setSelectedMilk}
                />
              )}

              {!hasAnyOption && (
                <div className="text-center py-4 mb-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold">
                    {t("Standard Item — Ready to checkout!")}
                  </p>
                </div>
              )}
            </>
          );
        })()}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-[#A1255B] hover:bg-[#881d52] text-white py-3 px-4 text-sm shadow-md shadow-[#A1255B]/20 transition-all cursor-pointer border-none flex items-center justify-center gap-2 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{actionType === "cart" ? t("Add to Cart") : t("Proceed to Checkout")}</span>
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
