"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { resolveProductImage } from "@/store/api/productAdapter";
import { useLanguage } from "@/components/ui/translatetokhmer";
import type { ProductExtraResponse } from "@/store/api/types";
import type { CartExtra } from "@/store/useCartStore";

export interface ExtrasSelectorProps {
  /** Only the extras this specific product offers — the API's own product/extra relationship,
   *  not a global add-on list the customer picks from independently of what they're ordering. */
  extras: ProductExtraResponse[];
  selected: CartExtra[];
  onChange: (selected: CartExtra[]) => void;
}

/**
 * Shared by every place a product gets customized before going into the cart, so "which extras
 * a product offers" and "how they're shown" can't drift apart between them the way the ice/
 * sugar/milk dropdowns did across this codebase. Renders nothing when the product has none.
 */
export function ExtrasSelector({ extras, selected, onChange }: ExtrasSelectorProps) {
  const { t } = useLanguage();

  if (extras.length === 0) return null;

  const isSelected = (extraId: string) => selected.some((item) => item.extraId === extraId);

  const toggle = (extra: ProductExtraResponse) => {
    if (isSelected(extra.extraId)) {
      onChange(selected.filter((item) => item.extraId !== extra.extraId));
    } else {
      onChange([...selected, { extraId: extra.extraId, name: extra.name, price: Number(extra.price) }]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-[11px] text-gray-700 uppercase tracking-wider mb-1.5">
        {t("Extras")}
      </label>
      <div className="space-y-1.5">
        {extras.map((extra) => {
          const outOfStock = extra.quantityOnHand != null && Number(extra.quantityOnHand) <= 0;
          const active = isSelected(extra.extraId);
          return (
            <button
              key={extra.id}
              type="button"
              disabled={outOfStock}
              onClick={() => toggle(extra)}
              className={`w-full flex items-center gap-3 rounded-xl border p-2 text-left transition-all cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "border-[#A1255B] bg-pink-50/60 ring-1 ring-[#A1255B]"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                <Image
                  src={resolveProductImage(extra.imageUrl)}
                  alt={extra.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">{t(extra.name)}</p>
                <p className="text-[11px] text-[#A1255B] font-semibold">
                  +${Number(extra.price).toFixed(2)}
                </p>
                {outOfStock && (
                  <p className="text-[10px] text-gray-400">{t("Out of stock")}</p>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  active
                    ? "border-[#A1255B] bg-[#A1255B] text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {active && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ExtrasSelector;
