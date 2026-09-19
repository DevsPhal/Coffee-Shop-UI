"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useCatalog } from "@/store/api/useCatalog";
import { toTitleCase } from "@/lib/utils";
import type { VariantName } from "@/store/api/types";
import { ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

function CustomSizeDropdown({
  value,
  options = ["M", "L"],
  onChange,
}: {
  value: string;
  options?: string[];
  onChange: (newSize: any) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
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

  const labels: Record<string, string> = {
    S: "S (Small)",
    M: "M (Medium)",
    L: "L (Large)",
    "1": "Single (1)",
    Double: "Double",
    "1000ml": "1000ml",
    "1500ml": "1500ml",
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1 px-2 sm:px-3 py-1 rounded-full border border-pink-200 bg-pink-50/80 hover:bg-pink-100/80 text-[#A1255B] font-bold text-[11px] sm:text-xs shadow-2xs transition-all cursor-pointer select-none whitespace-nowrap"
        aria-expanded={isOpen}
      >
        <span className="hidden sm:inline">{labels[value] || value}</span>
        <span className="inline sm:hidden">{value}</span>
        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#A1255B] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+4px)] z-50 min-w-[125px] bg-white border border-gray-100 rounded-2xl shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
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
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none text-left select-none ${
                  isSelected
                    ? "bg-[#A1255B] text-white shadow-2xs"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span>{labels[sizeOption] || sizeOption}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomIceDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
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

  const options = ICE_CHOICES.map((c) => ICE_LABELS[c]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1 px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-pink-50/50 text-gray-700 hover:text-[#A1255B] font-semibold text-[10px] transition-all cursor-pointer select-none whitespace-nowrap"
      >
        <span>Ice: {value || "Normal"}</span>
        <ChevronDown className={`w-2.5 h-2.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[110px] bg-white border border-gray-100 rounded-xl shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
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
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border-none text-left select-none ${
                  isSelected ? "bg-[#A1255B] text-white" : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomSugarDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
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

  const options = SUGAR_CHOICES.map((c) => SUGAR_LABELS[c]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1 px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-pink-50/50 text-gray-700 hover:text-[#A1255B] font-semibold text-[10px] transition-all cursor-pointer select-none whitespace-nowrap"
      >
        <span>Sugar: {value || "Normal"}</span>
        <ChevronDown className={`w-2.5 h-2.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[90px] bg-white border border-gray-100 rounded-xl shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
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
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border-none text-left select-none ${
                  isSelected ? "bg-[#A1255B] text-white" : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomMilkDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
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

  const options = MILK_CHOICES.map((c) => MILK_LABELS[c]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1 px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-pink-50/50 text-gray-700 hover:text-[#A1255B] font-semibold text-[10px] transition-all cursor-pointer select-none whitespace-nowrap"
      >
        <span>Milk: {value || "Normal"}</span>
        <ChevronDown className={`w-2.5 h-2.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[135px] bg-white border border-gray-100 rounded-xl shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
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
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border-none text-left select-none ${
                  isSelected ? "bg-[#A1255B] text-white" : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function OrderpageView() {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    items,
    updateQuantity,
    updateVariant,
    updateIceLevel,
    updateSugarLevel,
    updateMilkType,
    subtotal,
  } = useCart();

  // Cached by RTK Query — shares the catalogue request the rest of the app already made.
  const { products } = useCatalog();

  const handleContinueShopping = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      router.push("/menuphone");
    } else {
      router.push("/menu");
    }
  };

  return (
    <div className="order_page_container">
      {/* Table Title */}
      <h1 className="order_page_title">{t("Shopping Cart")}</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 shadow-sm max-w-md mx-auto">
          <p className="text-gray-500 font-medium mb-6 text-sm">
            {t("Your shopping cart is empty.")}
          </p>
          <button
            type="button"
            onClick={handleContinueShopping}
            className="inline-block bg-[#A1255B] hover:bg-[#881d52] text-white font-bold py-3 px-8 text-xs transition-colors cursor-pointer border-none shadow-md shadow-[#A1255B]/20"
          >
            {t("Explore Menu & Add Drinks")}
          </button>
        </div>
      ) : (
        <div className="order_page_grid">
          <div className="order_page_cart_section">
            <div className="order_page_table_header">
              <div className="order_page_table_header_product">{t("Product")}</div>
              <div className="order_page_table_header_price hidden sm:block">{t("Price")}</div>
              <div className="order_page_table_header_quantity">{t("Quantity")}</div>
              <div className="order_page_table_header_total">{t("Total")}</div>
            </div>
            <div className="order_page_items_list">
              {items.map((item) => {
                // Sizes and their price deltas belong to the product, so look it up in the
                // already-cached catalogue rather than storing them on the cart line.
                const product = products.find((p) => p.id === item.productId);
                const variants = product?.variants ?? [];
                const drinkOptions = product
                  ? getDrinkCustomization(product)
                  : { ice: false, sugar: false, milk: false };

                return (
                  <div key={item.lineId} className="order_page_item_row">
                    <div className="order_page_item_product">
                      <div className="order_page_item_image_wrapper">
                        <Image
                          src={resolveProductImage(item.image)}
                          alt={toTitleCase(item.title)}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="order_page_item_details">
                        <h3 className="order_page_item_title">{t(toTitleCase(item.title))}</h3>
                        <div className="flex flex-col items-start gap-1 mt-1 w-full max-w-full">
                          {variants.length > 1 && (
                            <CustomSizeDropdown
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
                          )}
                          {drinkOptions.ice && (
                            <CustomIceDropdown
                              value={ICE_LABELS[item.iceLevel ?? "NORMAL"]}
                              onChange={(label) => {
                                const level = ICE_CHOICES.find(
                                  (c) => ICE_LABELS[c] === label
                                );
                                if (level) updateIceLevel(item.lineId, level);
                              }}
                            />
                          )}
                          {drinkOptions.sugar && (
                            <CustomSugarDropdown
                              value={SUGAR_LABELS[item.sugarLevel ?? "NORMAL"]}
                              onChange={(label) => {
                                const level = SUGAR_CHOICES.find(
                                  (c) => SUGAR_LABELS[c] === label
                                );
                                if (level) updateSugarLevel(item.lineId, level);
                              }}
                            />
                          )}
                          {drinkOptions.milk && (
                            <CustomMilkDropdown
                              value={MILK_LABELS[item.milkType ?? "NORMAL"]}
                              onChange={(label) => {
                                const kind = MILK_CHOICES.find(
                                  (c) => MILK_LABELS[c] === label
                                );
                                if (kind) updateMilkType(item.lineId, kind);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="order_page_item_price hidden sm:block font-bold text-gray-900"
                      suppressHydrationWarning
                    >
                      ${item.unitPrice.toFixed(2)}
                    </div>
                    <div className="order_page_item_quantity">
                      <div className="order_page_quantity_pill">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.lineId, -1)}
                          className="order_page_quantity_btn"
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>
                        <span className="order_page_quantity_val">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.lineId, 1)}
                          className="order_page_quantity_btn"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div
                      className="order_page_item_total font-extrabold text-[#A1255B]"
                      suppressHydrationWarning
                    >
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="order_page_summary_card">
            {(() => {
              // Pre-discount total; each line carries its own original unit price.
              const fullSubtotal = items.reduce((acc, item) => {
                const original = item.originalUnitPrice ?? item.unitPrice;
                return acc + Math.max(original, item.unitPrice) * item.quantity;
              }, 0);

              const totalDiscount = Math.max(0, fullSubtotal - subtotal);
              const hasDiscount = totalDiscount > 0;

              return (
                <div className="order_page_summary_subtotal">
                  <div className="order_page_summary_row">
                    <span className="order_page_summary_label">
                      {t("Subtotal:")}
                    </span>
                    <span className="order_page_summary_value" suppressHydrationWarning>
                      ${(hasDiscount ? fullSubtotal : subtotal).toFixed(2)}
                    </span>
                  </div>

                  {hasDiscount && (
                    <div className="order_page_summary_row mt-2">
                      <span className="order_page_summary_label">
                        {t("Discount:")}
                      </span>
                      <span className="order_page_summary_value text-[#A1255B] font-bold" suppressHydrationWarning>
                        -${totalDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
            <div>
              <div className="order_page_summary_row">
                <span className="order_page_summary_label">
                  {t("Total:")}
                </span>
                <span className="order_page_summary_value">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="order_page_summary_note">
                {t("(Delivery Fee Not Included)")}
              </p>
            </div>
            <div className="order_page_summary_actions">
              <Link
                href="#"
                onClick={handleContinueShopping}
                className="order_page_btn_continue"
              >
                {t("Continue Shopping")}
              </Link>
              <Link
                href="/checkout"
                className="order_page_btn_checkout"
              >
                {t("Proceed to Checkout")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderpageView;