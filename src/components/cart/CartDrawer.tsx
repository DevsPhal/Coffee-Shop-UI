"use client";

import React, { useEffect, useState, useRef } from "react";
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
import type { VariantName } from "@/store/api/types";
import type { CartItem } from "@/store/useCartStore";
import { ChevronDown, Check } from "lucide-react";
import "@/app/globals.scss";

/** Extras add a flat amount per unit, on top of whatever the variant itself prices at. */
function extrasUnitTotal(item: Pick<CartItem, "selectedExtras">): number {
  return (item.selectedExtras ?? []).reduce((sum, extra) => sum + extra.price, 0);
}

function CustomDrawerSizeDropdown({
  value,
  options = ["M", "L"],
  onChange,
}: {
  value: string;
  options?: string[];
  onChange: (newSize: any) => void;
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const labels: Record<string, string> = {
    S: "S (Small)",
    M: "M (Medium)",
    L: "L (Large)",
    "1": "Single Portion",
    Double: "Double Portion",
    "1000ml": "1000ml",
    "1500ml": "1500ml",
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1 px-2.5 py-0.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 text-[#A1255B] font-bold text-xs shadow-2xs transition-all cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#A1255B] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[115px] bg-white border border-gray-100 rounded-2xl shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
          {options.map((sizeOption) => {
            const isSelected = value === sizeOption;
            return (
              <button
                key={sizeOption}
                type="button"
                onClick={() => {
                  onChange(sizeOption);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none text-left select-none ${
                  isSelected
                    ? "bg-[#A1255B] text-white shadow-2xs"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span>{t(labels[sizeOption] || sizeOption)}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomDrawerOptionDropdown({
  value,
  options,
  onChange,
  labelPrefix,
  placeholder = "Select",
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  labelPrefix?: string;
  placeholder?: string;
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const displayLabel = labelPrefix ? `${t(labelPrefix)}: ${t(value || placeholder)}` : t(value || placeholder);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1 px-2.5 py-0.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 text-[#A1255B] font-bold text-[11px] shadow-2xs transition-all cursor-pointer select-none whitespace-nowrap"
        aria-expanded={isOpen}
      >
        <span>{displayLabel}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#A1255B] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[125px] max-w-[170px] bg-white border border-gray-100 rounded-2xl shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border-none text-left select-none ${
                  isSelected
                    ? "bg-[#A1255B] text-white shadow-2xs"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span className="truncate">{t(opt)}</span>
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

  // Shared with the rest of the storefront through RTK Query's cache — this does not fire a
  // second request. It supplies the size options a cart line can be switched between.
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
      {/* Backdrop overlay - clicking closes the cart and returns to page */}
      <div
        className="cart_drawer_backdrop"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel Container - clicking padding closes cart */}
      <div className="cart_drawer_panel_container" onClick={closeCart}>
        {/* Drawer Panel - prevent clicks inside from closing */}
        <div className="cart_drawer_panel" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
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

          {/* Cart Item List */}
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
                  // The catalogue is already cached by RTK Query, so this lookup costs no
                  // extra request — and it is where the real size options and their price
                  // deltas come from.
                  const product = products.find((p) => p.id === item.productId);
                  const variants = product?.variants ?? [];
                  const drinkOptions = product
                    ? getDrinkCustomization(product)
                    : { ice: false, sugar: false, milk: false };

                  return (
                    <div key={item.lineId} className="cart_item">
                      {/* Thumbnail */}
                      <div className="cart_item_thumbnail">
                        <Image
                          src={resolveProductImage(item.image)}
                          alt={t(toTitleCase(item.title))}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="cart_item_details">
                        <h3 className="cart_item_title">{t(toTitleCase(item.title))}</h3>

                        <div className="flex flex-wrap items-center gap-1.5 my-1.5">
                          {variants.length > 1 && (
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-semibold text-gray-500">
                                {t("Size:")}
                              </span>
                              <CustomDrawerSizeDropdown
                                value={t(
                                  VARIANT_LABELS[
                                    (item.variantName as VariantName) ?? variants[0].name
                                  ]
                                )}
                                options={variants.map((v) => t(VARIANT_LABELS[v.name]))}
                                onChange={(label) => {
                                  const variant = variants.find(
                                    (v) => t(VARIANT_LABELS[v.name]) === label
                                  );
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
                            <CustomDrawerOptionDropdown
                              labelPrefix={t("Ice")}
                              value={ICE_LABELS[item.iceLevel ?? "NORMAL"]}
                              options={ICE_CHOICES.map((c) => ICE_LABELS[c])}
                              onChange={(label) => {
                                const level = ICE_CHOICES.find((c) => ICE_LABELS[c] === label);
                                if (level) updateIceLevel(item.lineId, level);
                              }}
                            />
                          )}

                          {drinkOptions.sugar && (
                            <CustomDrawerOptionDropdown
                              labelPrefix={t("Sugar")}
                              value={SUGAR_LABELS[item.sugarLevel ?? "NORMAL"]}
                              options={SUGAR_CHOICES.map((c) => SUGAR_LABELS[c])}
                              onChange={(label) => {
                                const level = SUGAR_CHOICES.find(
                                  (c) => SUGAR_LABELS[c] === label
                                );
                                if (level) updateSugarLevel(item.lineId, level);
                              }}
                            />
                          )}

                          {drinkOptions.milk && (
                            <CustomDrawerOptionDropdown
                              labelPrefix={t("Milk")}
                              value={MILK_LABELS[item.milkType ?? "NORMAL"]}
                              options={MILK_CHOICES.map((c) => MILK_LABELS[c])}
                              onChange={(label) => {
                                const kind = MILK_CHOICES.find(
                                  (c) => MILK_LABELS[c] === label
                                );
                                if (kind) updateMilkType(item.lineId, kind);
                              }}
                            />
                          )}

                          {item.selectedExtras && item.selectedExtras.length > 0 && item.selectedExtras.map((extra) => (
                            <span
                              key={extra.extraId}
                              className="rounded-full text-[10px] font-semibold text-[#A1255B] bg-pink-50 border border-pink-200 px-1.5 py-0.5"
                            >
                              + {t(extra.name)}
                            </span>
                          ))}
                        </div>

                        {/* Quantity Pill */}
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

          {/* Footer */}
          <div className="cart_drawer_footer">
            {(() => {
              // Pre-discount total, so the drawer can show what the customer saved. The
              // line already carries its own original unit price from the API. Extras are
              // never discounted, so the same amount applies either way.
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