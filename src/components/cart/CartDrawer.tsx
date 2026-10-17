"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  ICE_CHOICES,
  ICE_LABELS,
  MILK_CHOICES,
  MILK_LABELS,
  SUGAR_CHOICES,
  SUGAR_LABELS,
  VARIANT_LABELS,
} from "@/store/api/optionMapping";
import { getDrinkCustomization, resolveProductImage } from "@/store/api/productAdapter";
import { toTitleCase } from "@/lib/utils";
import { useCatalog } from "@/store/api/useCatalog";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useDropdown } from "@/hooks/useDropdown";
import type { VariantName } from "@/store/api/types";
import type { CartItem } from "@/store/useCartStore";
import { ChevronDown, Check } from "lucide-react";
import "@/app/globals.scss";

function extrasUnitTotal(item: Pick<CartItem, "selectedExtras">): number {
  return (item.selectedExtras ?? []).reduce((sum, extra) => sum + extra.price, 0);
}

/**
 * Dropdown for an API enum (size, ice, sugar, milk). The value and options are the raw enum
 * values the API expects; `labels` only changes how each value is shown. Enum labels are not
 * translated, so what the customer picks always maps 1:1 to what the API receives.
 */
function EnumDropdown<T extends string>({
  value,
  options,
  labels,
  onChange,
  prefix,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
  /** UI label shown before the value, e.g. "Ice" — translated once here. */
  prefix?: string;
}) {
  const { t } = useLanguage();
  const { isOpen, rootRef, toggle, close } = useDropdown();

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center justify-between gap-1 px-2.5 py-0.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 text-[#A1255B] font-bold text-[11px] shadow-2xs transition-all cursor-pointer select-none whitespace-nowrap"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{prefix ? `${t(prefix)}: ${labels[value]}` : labels[value]}</span>
        <ChevronDown className="dropdown_chevron w-3 h-3 text-[#A1255B]" aria-hidden />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[125px] max-w-[170px] bg-white border border-gray-100 rounded-2xl shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
          {options.map((option) => {
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  close();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border-none text-left select-none ${
                  isSelected
                    ? "bg-[#A1255B] text-white shadow-2xs"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span className="truncate">{labels[option]}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    updateVariant,
    updateIceLevel,
    updateSugarLevel,
    updateMilkType,
    subtotal,
  } = useCart();

  const { products } = useCatalog();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="cart_drawer_wrapper">
      <div
        className="cart_drawer_backdrop"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="cart_drawer_panel_container" onClick={closeCart}>
        <div className="cart_drawer_panel" onClick={(e) => e.stopPropagation()}>
          <div className="cart_drawer_header">
            <h2 className="cart_drawer_title">{t("Shopping Cart")}</h2>
            <button
              type="button"
              onClick={closeCart}
              className="cart_drawer_close_btn"
              aria-label="Close cart"
              title="Close cart"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="cart_drawer_body">
            {items.length === 0 ? (
              <div className="cart_drawer_empty">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cart_drawer_empty_icon"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <p className="cart_drawer_empty_text">{t("Your cart is empty")}</p>
              </div>
            ) : (
              <div className="cart_drawer_items_list">
                {items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  const variants = product?.variants ?? [];
                  const drinkOptions = product
                    ? getDrinkCustomization(product)
                    : { ice: false, sugar: false, milk: false };

                  return (
                    <div key={item.lineId} className="cart_item">
                      <div className="cart_item_thumbnail">
                        <Image
                          src={resolveProductImage(item.image)}
                          alt={toTitleCase(item.title)}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      <div className="cart_item_details">
                        <h3 className="cart_item_title">{toTitleCase(item.title)}</h3>

                        <div className="flex flex-wrap items-center gap-1.5 my-1.5">
                          {variants.length > 1 && (
                            <div className="flex items-center gap-1">
                              <EnumDropdown<VariantName>
                                prefix="Size"
                                value={(item.variantName as VariantName) ?? variants[0].name}
                                options={variants.map((v) => v.name)}
                                labels={VARIANT_LABELS}
                                onChange={(name) => {
                                  const variant = variants.find((v) => v.name === name);
                                  if (!variant || !product) return;
                                  updateVariant(
                                    item.lineId,
                                    variant.id,
                                    variant.name,
                                    Number(variant.finalPrice)
                                  );
                                }}
                              />
                            </div>
                          )}

                          {drinkOptions.ice && (
                            <EnumDropdown
                              prefix="Ice"
                              value={item.iceLevel ?? "NORMAL"}
                              options={ICE_CHOICES}
                              labels={ICE_LABELS}
                              onChange={(level) => updateIceLevel(item.lineId, level)}
                            />
                          )}

                          {drinkOptions.sugar && (
                            <EnumDropdown
                              prefix="Sugar"
                              value={item.sugarLevel ?? "NORMAL"}
                              options={SUGAR_CHOICES}
                              labels={SUGAR_LABELS}
                              onChange={(level) => updateSugarLevel(item.lineId, level)}
                            />
                          )}

                          {drinkOptions.milk && (
                            <EnumDropdown
                              prefix="Milk"
                              value={item.milkType ?? "NORMAL"}
                              options={MILK_CHOICES}
                              labels={MILK_LABELS}
                              onChange={(kind) => updateMilkType(item.lineId, kind)}
                            />
                          )}

                          {item.selectedExtras && item.selectedExtras.length > 0 && item.selectedExtras.map((extra) => (
                            <span
                              key={extra.extraId}
                              className="rounded-full text-[10px] font-semibold text-[#A1255B] bg-pink-50 border border-pink-200 px-1.5 py-0.5"
                            >
                              + {extra.name}
                            </span>
                          ))}
                        </div>

                        <div className="cart_quantity_pill">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.lineId, -1)}
                            className="cart_quantity_btn"
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="cart_quantity_value">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.lineId, 1)}
                            className="cart_quantity_btn"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <p
                          className="cart_item-price font-extrabold text-[#A1255B]"
                          suppressHydrationWarning
                        >
                          ${((item.unitPrice + extrasUnitTotal(item)) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="cart_drawer_footer">
            {(() => {
              const fullSubtotal = items.reduce((acc, item) => {
                const original = item.originalUnitPrice ?? item.unitPrice;
                return acc + (Math.max(original, item.unitPrice) + extrasUnitTotal(item)) * item.quantity;
              }, 0);

              const totalDiscount = Math.max(0, fullSubtotal - subtotal);
              const hasDiscount = totalDiscount > 0;

              return (
                <>
                  <div className="cart_drawer_subtotal-row">
                    <span className="cart_drawer_subtotal-label">{t("Subtotal:")}</span>
                    <span className="cart_drawer_subtotal-value" suppressHydrationWarning>
                      ${(hasDiscount ? fullSubtotal : subtotal).toFixed(2)}
                    </span>
                  </div>

                  {hasDiscount && (
                    <div className="cart_drawer_subtotal-row mt-1">
                      <span className="cart_drawer_subtotal-label">{t("Discount:")}</span>
                      <span className="cart_drawer_subtotal-value font-bold text-[#A1255B]" suppressHydrationWarning>
                        -${totalDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              );
            })()}

            <Link
              href="/cart"
              onClick={closeCart}
              className="cart_drawer_btn_view"
            >
              {t("View Cart")}
            </Link>

            <Link
              href="/order"
              onClick={closeCart}
              className="cart_drawer_btn_checkout"
            >
              {t("Checkout")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;