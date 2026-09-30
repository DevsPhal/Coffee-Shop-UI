"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Modal, ModalContent } from "@/components/ui/modal";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Coffee, ShoppingBag, X, Snowflake, Candy, Milk, CupSoda } from "lucide-react";

import {
  ICE_OPTIONS,
  MILK_OPTIONS,
  SUGAR_OPTIONS,
  variantOptions,
} from "@/store/api/optionMapping";
import { getDrinkCustomization, resolveProductImage, type StoreProduct } from "@/store/api/productAdapter";
import type { IceLevel, MilkType, SugarLevel, UUID } from "@/store/api/types";
import { ExtrasSelector } from "@/components/ui/ExtrasSelector";
import { OptionDropdown } from "@/components/ui/OptionDropdown";
import type { CartExtra } from "@/store/useCartStore";

/** A confirmed configuration, shaped so the caller can hand it straight to the cart. */
export interface SizeSelection {
  variantId: UUID | null;
  variantName: string | null;
  unitPrice: number;
  iceLevel?: IceLevel;
  sugarLevel?: SugarLevel;
  milkType?: MilkType;
  selectedExtras: CartExtra[];
}

export interface SelectSizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: StoreProduct | null;
  initialVariantId?: UUID | null;
  initialIce?: IceLevel;
  initialSugar?: SugarLevel;
  initialMilk?: MilkType;
  actionType?: "checkout" | "cart";
  onConfirm: (selection: SizeSelection) => void;
}

/**
 * Product customization.
 *
 * Sizes come from the product's own `variants` — each one prices itself outright now rather
 * than adding a delta on top of a product-level price. Ice, sugar and milk are the API's enum
 * values; every one of them is optional on the cart request, so a product with a single variant
 * still gets the drink controls and the customer can simply leave them at default.
 */
export function SelectSizeModal({
  open,
  onOpenChange,
  product,
  initialVariantId,
  initialIce,
  initialSugar,
  initialMilk,
  actionType = "checkout",
  onConfirm,
}: SelectSizeModalProps) {
  const { t } = useLanguage();

  const variants = product?.variants ?? [];
  const hasSizes = variants.length > 1;
  // A canned/bottled drink or a snack isn't made to order, so it gets no ice/sugar/milk step;
  // a fresh drink only gets the ones that actually apply to it.
  const drinkOptions = product
    ? getDrinkCustomization(product)
    : { ice: false, sugar: false, milk: false };

  const [variantId, setVariantId] = useState<UUID | null>(null);
  const [iceLevel, setIceLevel] = useState<IceLevel>("NORMAL");
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>("NORMAL");
  const [milkType, setMilkType] = useState<MilkType>("NORMAL");
  const [selectedExtras, setSelectedExtras] = useState<CartExtra[]>([]);

  // Re-seed the choices each time the sheet opens (or opens on a different product). Done during
  // render rather than in an effect, so the first frame already shows the right defaults.
  const seedKey = product ? `${product.id}|${open}` : null;
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (product && seedKey !== seededFor) {
    setSeededFor(seedKey);
    setVariantId(initialVariantId ?? (variants.length > 0 ? variants[0].id : null));
    setIceLevel(initialIce ?? "NORMAL");
    setSugarLevel(initialSugar ?? "NORMAL");
    setMilkType(initialMilk ?? "NORMAL");
    setSelectedExtras([]);
  }

  if (!product) return null;

  const selectedVariant = variants.find((variant) => variant.id === variantId);
  const unitPrice = Number(selectedVariant?.finalPrice ?? product.price);
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);

  const handleConfirm = () => {
    onConfirm({
      variantId,
      variantName: selectedVariant?.name ?? null,
      unitPrice,
      ...(drinkOptions.ice ? { iceLevel } : {}),
      ...(drinkOptions.sugar ? { sugarLevel } : {}),
      ...(drinkOptions.milk ? { milkType } : {}),
      selectedExtras,
    });
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-sm p-5" showCloseButton={false}>
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

        <div className="box_product flex items-center gap-3 p-3 mb-4 rounded-2xl bg-gray-50">
          <div className="box_product relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
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
              ${(unitPrice + extrasTotal).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Every single-choice option is the same dropdown as the product page and the cart. */}
        {hasSizes && variantId && (
          <OptionDropdown
            label="Size"
            icon={<CupSoda className="w-3.5 h-3.5 text-[#A1255B]" />}
            value={variantId}
            options={variantOptions(variants)}
            onChange={setVariantId}
          />
        )}
        {drinkOptions.ice && (
          <OptionDropdown
            label="Ice Level"
            icon={<Snowflake className="w-3.5 h-3.5 text-[#A1255B]" />}
            value={iceLevel}
            options={ICE_OPTIONS}
            onChange={setIceLevel}
          />
        )}
        {drinkOptions.sugar && (
          <OptionDropdown
            label="Sugar Level"
            icon={<Candy className="w-3.5 h-3.5 text-[#A1255B]" />}
            value={sugarLevel}
            options={SUGAR_OPTIONS}
            onChange={setSugarLevel}
          />
        )}
        {drinkOptions.milk && (
          <OptionDropdown
            label="Milk"
            icon={<Milk className="w-3.5 h-3.5 text-[#A1255B]" />}
            value={milkType}
            options={MILK_OPTIONS}
            onChange={setMilkType}
          />
        )}

        <ExtrasSelector
          extras={product.extras}
          selected={selectedExtras}
          onChange={setSelectedExtras}
        />

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-full bg-[#A1255B] hover:bg-[#881d52] text-white py-3 px-4 text-sm shadow-md shadow-[#A1255B]/20 transition-all cursor-pointer border-none flex items-center justify-center gap-2 active:scale-98"
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
