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
import { getProductByIdOrTitle, PRODUCTS, getResolvedProductImage, getItemCustomizationConfig } from "@/data/products";
import { calculateSizePrice } from "@/store/useCartStore";
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
  id?: string;
  title?: string;
  price?: number;
  originalPrice?: number;
  discountType?: "percentage" | "fixed";
  discountAmount?: number;
  promoEndDate?: string | Date;
  promoDaysLeft?: string;
  description?: string;
  category?: string;
  image?: string | null;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ProductpageView({
  id: propId,
  title: propTitle,
  price: propPrice,
  originalPrice: propOriginalPrice,
  discountType: propDiscountType,
  discountAmount: propDiscountAmount,
  promoEndDate: propPromoEndDate,
  promoDaysLeft: propPromoDaysLeft,
  description: propDescription,
  category: propCategory,
  image: propImage,
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
  const queryId = searchParams.get("id") || undefined;
  const queryTitle = searchParams.get("title") || undefined;
  const queryPrice = searchParams.get("price")
    ? parseFloat(searchParams.get("price")!)
    : undefined;
  const queryOriginalPrice = searchParams.get("originalPrice")
    ? parseFloat(searchParams.get("originalPrice")!)
    : undefined;
  const queryDiscountType = (searchParams.get("discountType") as "percentage" | "fixed") || undefined;
  const queryDiscountAmount = searchParams.get("discountAmount")
    ? parseFloat(searchParams.get("discountAmount")!)
    : undefined;
  const queryPromoEndDate = searchParams.get("promoEndDate") || undefined;
  const queryPromoDaysLeft = searchParams.get("promoDaysLeft") || undefined;
  const queryImage = searchParams.get("image") || undefined;
  const queryDescription = searchParams.get("description") || undefined;
  const queryCategory = searchParams.get("category") || undefined;

  const effectiveId = propId || queryId;
  const effectiveTitle = propTitle || queryTitle;
  const matchedProduct =
    getProductByIdOrTitle(effectiveId, effectiveTitle) || PRODUCTS[0];

  const displayId = effectiveId || matchedProduct.id;
  const displayTitle = propTitle || queryTitle || matchedProduct.title;
  const displayPrice = propPrice ?? queryPrice ?? matchedProduct.price;
  const displayOriginalPrice =
    propOriginalPrice ?? queryOriginalPrice ?? matchedProduct.originalPrice;

  const displayDiscountType = propDiscountType || queryDiscountType || matchedProduct.discountType;
  const displayDiscountAmount = propDiscountAmount ?? queryDiscountAmount ?? matchedProduct.discountAmount;

  const displayPromoEndDate = propPromoEndDate || queryPromoEndDate || matchedProduct.promoEndDate;
  const displayPromoDaysLeft = propPromoDaysLeft || queryPromoDaysLeft || matchedProduct.promoDaysLeft;

  const discountInfo = formatDiscountBadge(
    displayPrice,
    displayOriginalPrice,
    displayDiscountType,
    displayDiscountAmount
  );

  const promoResult = calculatePromoTimeLeft(displayPromoEndDate, displayPromoDaysLeft);
  const isPromotion =
    (discountInfo.hasDiscount || (displayOriginalPrice !== undefined && displayOriginalPrice > displayPrice)) &&
    promoResult.isValid;

  const displayDescription =
    propDescription || queryDescription || matchedProduct.description;
  const displayCategory =
    propCategory || queryCategory || matchedProduct.category || "Coffee";
  const displayImage = getResolvedProductImage(
    displayId,
    propImage !== undefined ? propImage : queryImage || matchedProduct.image
  );

  const customizationConfig = getItemCustomizationConfig(displayTitle, displayCategory);
  const defaultInitialSize = customizationConfig.hasSize ? (customizationConfig.sizeOptions[0] || "M") : "M";

  const [selectedSize, setSelectedSize] = React.useState<string>(defaultInitialSize);
  const [selectedIce, setSelectedIce] = React.useState<string>("Normal");
  const [selectedSugar, setSelectedSugar] = React.useState<string>("Normal");
  const [selectedMilk, setSelectedMilk] = React.useState<string>("Normal");

  React.useEffect(() => {
    if (customizationConfig.hasSize && customizationConfig.sizeOptions.length > 0) {
      if (!customizationConfig.sizeOptions.includes(selectedSize)) {
        setSelectedSize(customizationConfig.sizeOptions[0]);
      }
    }
  }, [displayTitle, displayCategory]);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.add({
        type: "warning",
        description: "Please log in to your account first.",
      });
      router.push("/login");
      return;
    }
    if (onAddToCart) {
      onAddToCart();
    } else {
      addItem({
        id: displayId,
        title: displayTitle,
        price: displayPrice,
        size: selectedSize,
        iceLevel: customizationConfig.hasIce ? selectedIce : undefined,
        sugarLevel: customizationConfig.hasSugar ? selectedSugar : undefined,
        milkType: customizationConfig.hasMilk ? selectedMilk : undefined,
        image: displayImage || undefined,
      });
    }
  };

  const handleBuyNowClick = () => {
    if (!isLoggedIn) {
      toast.add({
        type: "warning",
        description: "Please log in to your account first.",
      });
      router.push("/login");
      return;
    }
    if (onBuyNow) {
      onBuyNow();
    } else {
      addItem(
        {
          id: displayId,
          title: displayTitle,
          price: displayPrice,
          size: selectedSize,
          iceLevel: customizationConfig.hasIce ? selectedIce : undefined,
          sugarLevel: customizationConfig.hasSugar ? selectedSugar : undefined,
          milkType: customizationConfig.hasMilk ? selectedMilk : undefined,
          image: displayImage || undefined,
        },
        false
      );
    }
    router.push("/checkout");
  };

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
          {isPromotion && (
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
              <span className="current_price">
                ${calculateSizePrice(displayPrice, selectedSize).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Product Description */}
          <p className="product_description">{t(displayDescription)}</p>

          {/* Customization Options Stack */}
          <div className="my-4 space-y-3">
            {/* Size Selector */}
            {customizationConfig.hasSize && (
              <div>
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t(
                    customizationConfig.sizeOptions.includes("Can")
                      ? "Packaging Option:"
                      : customizationConfig.sizeOptions.includes("1")
                      ? "Portion Size:"
                      : customizationConfig.sizeOptions[0]?.includes("ml")
                      ? "Bottle Size:"
                      : "Drink Size:"
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {customizationConfig.sizeOptions.map((sz) => {
                    const isSel = selectedSize === sz;
                    const labelText =
                      sz === "Can"
                        ? "Can ($0.75)"
                        : sz === "Bottle"
                        ? "Bottle ($1.25)"
                        : sz === "Carton"
                        ? "Carton ($28.00)"
                        : sz === "S"
                        ? "S (Small)"
                        : sz === "M"
                        ? "M (Medium)"
                        : sz === "L"
                        ? "L (Large)"
                        : sz === "1"
                        ? "Single (1)"
                        : sz === "Double"
                        ? "Double"
                        : sz;

                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          isSel
                            ? "bg-[#A1255B] border-[#A1255B] text-white shadow-2xs scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                        }`}
                      >
                        {t(labelText)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ice Level Dropdown */}
            {customizationConfig.hasIce && (
              <CustomProductPageOptionDropdown
                label="Ice Level:"
                value={selectedIce}
                options={["Normal", "Less", "No Ice"]}
                onChange={setSelectedIce}
              />
            )}

            {/* Sugar Level Dropdown */}
            {customizationConfig.hasSugar && (
              <CustomProductPageOptionDropdown
                label="Sugar Level:"
                value={selectedSugar}
                options={["Normal", "Less"]}
                onChange={setSelectedSugar}
              />
            )}

            {/* Milk Type Dropdown */}
            {customizationConfig.hasMilk && (
              <CustomProductPageOptionDropdown
                label="Milk Type:"
                value={selectedMilk}
                options={["Normal", "Less Milk", "No Milk"]}
                onChange={setSelectedMilk}
              />
            )}
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
