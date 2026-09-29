"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ICE_OPTIONS,
  MILK_OPTIONS,
  SUGAR_OPTIONS,
  variantOptions,
} from "@/store/api/optionMapping";
import { getDrinkCustomization, resolveProductImage } from "@/store/api/productAdapter";
import { useCatalog } from "@/store/api/useCatalog";
import { toTitleCase } from "@/lib/utils";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { OptionDropdown } from "@/components/ui/OptionDropdown";
import type { CartItem } from "@/store/useCartStore";
import "@/app/globals.scss";

/** Extras add a flat amount per unit, on top of whatever the variant itself prices at. */
function extrasUnitTotal(item: Pick<CartItem, "selectedExtras">): number {
  return (item.selectedExtras ?? []).reduce((sum, extra) => sum + extra.price, 0);
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
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto">
          <p className="text-gray-500 font-medium mb-6 text-sm">
            {t("Your shopping cart is empty.")}
          </p>
          <button
            type="button"
            onClick={handleContinueShopping}
            className="inline-block rounded-full bg-[#A1255B] hover:bg-[#881d52] text-white font-bold py-3 px-8 text-xs transition-colors cursor-pointer border-none shadow-md shadow-[#A1255B]/20"
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
                          {/* Same dropdown as the customize modal, in its compact size. */}
                          {variants.length > 1 && (
                            <OptionDropdown
                              variant="compact"
                              label="Size"
                              value={
                                item.variantId && variants.some((v) => v.id === item.variantId)
                                  ? item.variantId
                                  : variants[0].id
                              }
                              options={variantOptions(variants)}
                              onChange={(variantId) => {
                                const variant = variants.find((v) => v.id === variantId);
                                if (!variant) return;
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
                            <OptionDropdown
                              variant="compact"
                              label="Ice"
                              value={item.iceLevel ?? "NORMAL"}
                              options={ICE_OPTIONS}
                              onChange={(level) => updateIceLevel(item.lineId, level)}
                            />
                          )}
                          {drinkOptions.sugar && (
                            <OptionDropdown
                              variant="compact"
                              label="Sugar"
                              value={item.sugarLevel ?? "NORMAL"}
                              options={SUGAR_OPTIONS}
                              onChange={(level) => updateSugarLevel(item.lineId, level)}
                            />
                          )}
                          {drinkOptions.milk && (
                            <OptionDropdown
                              variant="compact"
                              label="Milk"
                              value={item.milkType ?? "NORMAL"}
                              options={MILK_OPTIONS}
                              onChange={(kind) => updateMilkType(item.lineId, kind)}
                            />
                          )}
                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              {item.selectedExtras.map((extra) => (
                                <span
                                  key={extra.extraId}
                                  className="rounded-full text-[10px] font-semibold text-[#A1255B] bg-pink-50 border border-pink-200 px-1.5 py-0.5"
                                >
                                  + {t(extra.name)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="order_page_item_price hidden sm:block font-bold text-gray-900"
                      suppressHydrationWarning
                    >
                      ${(item.unitPrice + extrasUnitTotal(item)).toFixed(2)}
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
                      ${((item.unitPrice + extrasUnitTotal(item)) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="order_page_summary_card">
            {(() => {
              // Pre-discount total; each line carries its own original unit price. Extras are
              // never discounted, so the same amount applies whether or not a discount is live.
              const fullSubtotal = items.reduce((acc, item) => {
                const original = item.originalUnitPrice ?? item.unitPrice;
                return acc + (Math.max(original, item.unitPrice) + extrasUnitTotal(item)) * item.quantity;
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