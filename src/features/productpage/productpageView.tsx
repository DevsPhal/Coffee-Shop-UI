"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { toast } from "@/components/ui/toast";
import { useGetProductQuery } from "@/store/api/catalogApi";
import { resolveProductImage, toStoreProduct } from "@/store/api/productAdapter";
import {
  ICE_CHOICES,
  ICE_LABELS,
  MILK_CHOICES,
  MILK_LABELS,
  SUGAR_CHOICES,
  SUGAR_LABELS,
} from "@/store/api/optionMapping";
import type { IceLevel, MilkType, SugarLevel } from "@/store/api/types";
import { Clock, ChevronDown, Check } from "lucide-react";
import { calculatePromoTimeLeft, formatDiscountBadge } from "@/lib/promoValidation";
import "@/app/globals.scss";

function CustomProductPageOptionDropdown({
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
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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
    <div>
      <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
        {t(label)}
      </span>
      <div ref={ref} className="relative max-w-xs text-left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-pink-50/60 hover:bg-pink-100/60 border border-pink-200 text-[#A1255B] font-bold text-xs rounded-xl py-2 px-3 transition-all cursor-pointer select-none"
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

export interface ProductpageViewProps {
  /** Product UUID. Falls back to the `id` query param when not passed directly. */
  id?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

/**
 * Product detail, fetched by id from `/api/customer/products/{id}`.
 *
 * Everything shown — price, discount, description, size options — comes from that response
 * rather than from query-string parameters, so a shared or bookmarked link always reflects
 * the product's current state instead of whatever it cost when the link was made.
 */
export function ProductpageView({
  id: propId,
  onAddToCart,
  onBuyNow,
}: ProductpageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuBaseUrl = isMobile ? "/menuphone" : "/menu";
  const productId = propId || searchParams.get("id") || "";

  const {
    data: apiProduct,
    isLoading: isLoadingProduct,
    error: productError,
  } = useGetProductQuery(productId, { skip: !productId });

  const product = apiProduct ? toStoreProduct(apiProduct) : null;

  const displayId = product?.id ?? productId;
  const displayTitle = product?.title ?? "";
  const displayOriginalPrice = product?.originalPrice;
  const displayDiscountType = product?.discountType;
  const displayDiscountAmount = product?.discountAmount;
  const displayPromoEndDate = product?.discountEndsAt;
  const displayDescription = product?.description ?? "";
  const displayCategory = product?.category ?? "";
  const displayImage = resolveProductImage(product?.image);

  const sizeOptions = product?.sizeOptions ?? [];

  const [selectedSizeId, setSelectedSizeId] = React.useState<string | null>(null);
  const [selectedIce, setSelectedIce] = React.useState<IceLevel>("HUNDRED");
  const [selectedSugar, setSelectedSugar] = React.useState<SugarLevel>("HUNDRED");
  const [selectedMilk, setSelectedMilk] = React.useState<MilkType>("WHOLE_MILK");

  // Default to the first size once the product arrives.
  React.useEffect(() => {
    if (sizeOptions.length > 0 && !sizeOptions.some((o) => o.id === selectedSizeId)) {
      setSelectedSizeId(sizeOptions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, sizeOptions.length]);

  const selectedSize = sizeOptions.find((o) => o.id === selectedSizeId) ?? null;
  const basePrice = product?.price ?? 0;
  const displayPrice = basePrice + Number(selectedSize?.priceDelta ?? 0);

  const discountInfo = formatDiscountBadge(
    basePrice,
    displayOriginalPrice,
    displayDiscountType,
    displayDiscountAmount
  );

  const promoResult = calculatePromoTimeLeft(displayPromoEndDate, undefined);

  // An open-ended discount (no end date) is still a discount — only the countdown needs one.
  const isPromotion = Boolean(product?.discountActive);
  const showCountdown = isPromotion && promoResult.isValid;

  // Adding to the basket no longer needs an account — the catalogue is public and the cart is
  // local until checkout, which is where the API requires a signed-in customer.
  const addCurrentSelection = () => {
    if (!product) return false;
    addItem({
      productId: product.id,
      title: product.title,
      image: product.image,
      unitPrice: displayPrice,
      originalUnitPrice: displayOriginalPrice,
      quantity: 1,
      sizeOptionId: selectedSize?.id ?? null,
      sizeName: selectedSize?.name ?? null,
      iceLevel: selectedIce,
      sugarLevel: selectedSugar,
      milkType: selectedMilk,
    });
    return true;
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
      return;
    }
    if (!addCurrentSelection()) return;
    toast.add({ type: "success", description: `${displayTitle} added to your cart.` });
  };

  const handleBuyNowClick = () => {
    if (onBuyNow) {
      onBuyNow();
    } else if (!addCurrentSelection()) {
      return;
    }
    router.push("/checkout");
  };

  if (isLoadingProduct) {
    return (
      <div className="product_detail_container font-sans">
        <div className="py-24 text-center text-sm text-gray-500">
          {t("Loading product…")}
        </div>
      </div>
    );
  }

  // A missing id or a 404 both land here — a link to a product that has since been removed
  // should say so rather than silently rendering the first item in the menu.
  if (!product) {
    return (
      <div className="product_detail_container font-sans">
        <div className="py-24 text-center">
          <p className="text-sm text-gray-600">
            {productError
              ? t("We could not load this product.")
              : t("This product is no longer available.")}
          </p>
          <Link href={menuBaseUrl} className="mt-4 inline-block underline text-[#A1255B]">
            {t("Back to the menu")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product_detail_container font-sans" suppressHydrationWarning>
      <div className="product_detail_header block mb-6" style={{ display: "block" }}>
        <h1 className="product_detail_title">{t("Product Detail")}</h1>

        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href={menuBaseUrl} className="breadcrumb_link">
            {t("Products")}
          </Link>
          <span className="breadcrumb_separator">»</span>
          <Link
            href={`${menuBaseUrl}?category=${encodeURIComponent(displayCategory)}`}
            className="breadcrumb_link"
          >
            {t(displayCategory)}
          </Link>
          <span className="breadcrumb_separator">»</span>
          <span className="breadcrumb_current">{t(displayTitle)}</span>
        </nav>
      </div>
      <div className="product_detail_grid">
        <div className="product_image_container" suppressHydrationWarning>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={t(displayTitle)}
              fill
              unoptimized
              className="object-cover"
              loading="eager"
            />
          ) : (
            <div className="product_image_placeholder">
              {t(displayTitle)}
            </div>
          )}
          {discountInfo.hasDiscount && discountInfo.badgeText && isPromotion && (
            <span className="product_discount_badge">
              {discountInfo.badgeText}
            </span>
          )}
          {showCountdown && (
            <div
              className={`promo_clock_badge promo_clock_detail_badge promo_clock_${promoResult.status}`}
              title={`Promotion ends in ${promoResult.displayText}`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="promo_clock_text">{promoResult.displayText}</span>
            </div>
          )}
        </div>
        <div className="product_info_box" suppressHydrationWarning>
          <div className="product_info_header">
            <div>
              <h2 className="product_name">{t(displayTitle)}</h2>

              {/* Clickable Category Badge */}
              <div className="category_badge_wrapper">
                <Link href={`${menuBaseUrl}?category=${encodeURIComponent(displayCategory)}`}>
                  <span className="category_badge">
                    {t(displayCategory)}
                  </span>
                </Link>
              </div>
            </div>
            <div className="price_wrapper">
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="original_price">
                  ${displayOriginalPrice.toFixed(2)}
                </span>
              )}
              <span className="current_price">${displayPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Product Description */}
          <p className="product_description">{t(displayDescription)}</p>

          {/* Customization Options Stack */}
          <div className="my-4 space-y-3">
            {/* Size Selector — the product's own options, each with its real price add-on. */}
            {sizeOptions.length > 0 && (
              <div>
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t("Size:")}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {sizeOptions.map((option) => {
                    const isSel = selectedSizeId === option.id;
                    const optionPrice = basePrice + Number(option.priceDelta);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedSizeId(option.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          isSel
                            ? "bg-[#A1255B] border-[#A1255B] text-white shadow-2xs scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                        }`}
                      >
                        {option.name} (${optionPrice.toFixed(2)})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <CustomProductPageOptionDropdown
              label="Ice Level:"
              value={ICE_LABELS[selectedIce]}
              options={ICE_CHOICES.map((c) => ICE_LABELS[c])}
              onChange={(label) => {
                const level = ICE_CHOICES.find((c) => ICE_LABELS[c] === label);
                if (level) setSelectedIce(level);
              }}
            />

            <CustomProductPageOptionDropdown
              label="Sugar Level:"
              value={SUGAR_LABELS[selectedSugar]}
              options={SUGAR_CHOICES.map((c) => SUGAR_LABELS[c])}
              onChange={(label) => {
                const level = SUGAR_CHOICES.find((c) => SUGAR_LABELS[c] === label);
                if (level) setSelectedSugar(level);
              }}
            />

            <CustomProductPageOptionDropdown
              label="Milk Type:"
              value={MILK_LABELS[selectedMilk]}
              options={MILK_CHOICES.map((c) => MILK_LABELS[c])}
              onChange={(label) => {
                const kind = MILK_CHOICES.find((c) => MILK_LABELS[c] === label);
                if (kind) setSelectedMilk(kind);
              }}
            />
          </div>

          {/* Action Buttons Row */}
          <div className="product_actions_row">
            <Button
              type="button"
              onClick={handleAddToCart}
              className="button_add_cart cursor-pointer"
            >
              {t("Add to Cart")}
            </Button>

            <Button
              type="button"
              onClick={handleBuyNowClick}
              className="button_buy_now cursor-pointer"
            >
              {t("Buy Now")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductpageView;
