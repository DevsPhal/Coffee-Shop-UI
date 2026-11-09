"use client";

import React, { useState } from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Coffee, ShoppingBag, X, Snowflake, Candy, Milk, CupSoda } from "lucide-react";

import {
  ICE_OPTIONS,
  MILK_OPTIONS,
  SUGAR_OPTIONS,
  variantOptions,
} from "@/store/api/optionMapping";
import { getDrinkCustomization, type StoreProduct } from "@/store/api/productAdapter";
import { ProductImage } from "@/components/common/ProductImage";
import type { IceLevel, MilkType, SugarLevel, UUID } from "@/store/api/types";
import { ExtrasSelector } from "@/components/ui/ExtrasSelector";
import { OptionDropdown } from "@/components/ui/OptionDropdown";
import type { CartExtra } from "@/store/useCartStore";

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
  const drinkOptions = product
    ? getDrinkCustomization(product)
    : { ice: false, sugar: false, milk: false };

  const [variantId, setVariantId] = useState<UUID | null>(null);
  const [iceLevel, setIceLevel] = useState<IceLevel>("NORMAL");
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>("NORMAL");
  const [milkType, setMilkType] = useState<MilkType>("NORMAL");
  const [selectedExtras, setSelectedExtras] = useState<CartExtra[]>([]);

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
            <Coffee className="w-5 h-5 text-brand" />
            <h3 className="text-base font-bold text-gray-900">{t("Customize")}</h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="touch_target w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="box_product flex items-center gap-3 p-3 mb-4 rounded-2xl bg-gray-50">
          <ProductImage
            src={product.image}
            alt={product.title}
            className="box_product w-12 h-12 rounded-xl shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 truncate">
              {product.title}
            </h4>
            <p className="text-xs font-extrabold text-brand mt-0.5">
              ${(unitPrice + extrasTotal).toFixed(2)}
            </p>
          </div>
        </div>

        {hasSizes && variantId && (
          <OptionDropdown
            label="Size"
            icon={<CupSoda className="w-3.5 h-3.5 text-brand" />}
            value={variantId}
            options={variantOptions(variants)}
            onChange={setVariantId}
          />
        )}
        {drinkOptions.ice && (
          <OptionDropdown
            label="Ice Level"
            icon={<Snowflake className="w-3.5 h-3.5 text-brand" />}
            value={iceLevel}
            options={ICE_OPTIONS}
            onChange={setIceLevel}
          />
        )}
        {drinkOptions.sugar && (
          <OptionDropdown
            label="Sugar Level"
            icon={<Candy className="w-3.5 h-3.5 text-brand" />}
            value={sugarLevel}
            options={SUGAR_OPTIONS}
            onChange={setSugarLevel}
          />
        )}
        {drinkOptions.milk && (
          <OptionDropdown
            label="Milk"
            icon={<Milk className="w-3.5 h-3.5 text-brand" />}
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
            className="ui_button_brand w-full"
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
