"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getItemCustomizationConfig, getProductByIdOrTitle } from "@/data/products";
import { calculateSizePrice } from "@/store/useCartStore";
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

  const options = ["Normal", "Less", "No Ice"];

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

  const options = ["Normal", "Less"];

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

  const options = ["Normal", "Less Milk", "No Milk"];

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
    updateSize,
    updateIceLevel,
    updateSugarLevel,
    updateMilkType,
    subtotal,
  } = useCart();

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
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto">
          <p className="text-gray-500 font-medium mb-6 text-sm">
            {t("Your shopping cart is empty.")}
          </p>
          <button
            type="button"
            onClick={handleContinueShopping}
            className="inline-block bg-[#A1255B] hover:bg-[#881d52] text-white font-bold py-3 px-8 rounded-full text-xs transition-colors cursor-pointer border-none shadow-md shadow-[#A1255B]/20"
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
              <div className="order_page_table_header_size">{t("Size")}</div>
              <div className="order_page_table_header_total">{t("Total")}</div>
            </div>
            <div className="order_page_items_list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="order_page_item_row"
                >
                  <div className="order_page_item_product">
                    <div className="order_page_item_image_wrapper">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="order_page_item_details">
                      <h3 className="order_page_item_title">
                        {t(item.title)}
                      </h3>
                      {(() => {
                        const config = getItemCustomizationConfig(item.title);
                        if (!config.hasIce && !config.hasSugar && !config.hasMilk) return null;
                        return (
                          <div className="flex flex-col items-start gap-1 mt-1 w-full max-w-full">
                            {config.hasIce && (
                              <CustomIceDropdown
                                value={item.iceLevel || "Normal"}
                                onChange={(val) => updateIceLevel(item.id, val)}
                              />
                            )}
                            {config.hasSugar && (
                              <CustomSugarDropdown
                                value={item.sugarLevel || "100%"}
                                onChange={(val) => updateSugarLevel(item.id, val)}
                              />
                            )}
                            {config.hasMilk && (
                              <CustomMilkDropdown
                                value={item.milkType || "Fresh"}
                                onChange={(val) => updateMilkType(item.id, val)}
                              />
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="order_page_item_price hidden sm:block font-bold text-gray-900" suppressHydrationWarning>
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="order_page_item_quantity">
                    <div className="order_page_quantity_pill">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="order_page_quantity_btn"
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <span className="order_page_quantity_val">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="order_page_quantity_btn"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="order_page_item_size">
                    {(() => {
                      const config = getItemCustomizationConfig(item.title);
                      if (!config.hasSize) return <span className="text-gray-400 text-xs font-semibold">—</span>;
                      return (
                        <CustomSizeDropdown
                          value={(item.size as "S" | "M" | "L") || "M"}
                          options={config.sizeOptions}
                          onChange={(newSize) => updateSize(item.id, newSize)}
                        />
                      );
                    })()}
                  </div>
                  <div className="order_page_item_total font-extrabold text-[#A1255B]" suppressHydrationWarning>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order_page_summary_card">
            {(() => {
              const fullSubtotal = items.reduce((acc, item) => {
                const prod = getProductByIdOrTitle(item.id, item.title);
                const origPrice = item.originalPrice ?? prod?.originalPrice;
                const itemOrigPrice = (origPrice && origPrice > item.price) ? calculateSizePrice(origPrice, item.size) : item.price;
                return acc + itemOrigPrice * item.quantity;
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