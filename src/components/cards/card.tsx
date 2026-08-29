"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Clock } from "lucide-react";
import { calculatePromoTimeLeft, formatDiscountBadge } from "@/lib/promoValidation";
import { getResolvedProductImage, getItemCustomizationConfig } from "@/data/products";
import SelectSizeModal from "@/components/ui/SelectSizeModal";
import "@/app/globals.scss";

export interface CardProps {
  id?: string;
  title: string;
  price?: number;
  originalPrice?: number;
  discountType?: "percentage" | "fixed";
  discountAmount?: number;
  promoEndDate?: string | Date;
  promoDaysLeft?: string;
  category?: string;
  image?: string | null;
  href?: string;
  variant?: "default" | "phone";
  isSelected?: boolean;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  onOpenInfo?: () => void;
}

export function Card({
  id,
  title,
  price = 2.0,
  originalPrice,
  discountType,
  discountAmount,
  promoEndDate,
  promoDaysLeft,
  category,
  image,
  href,
  variant = "default",
  isSelected = false,
  onAddToCart,
  onBuyNow,
  onOpenInfo,
}: CardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<"checkout" | "cart">("cart");

  const imgSrc = getResolvedProductImage(id, image);

  // Format discount badge text (e.g. "-25% OFF" or "-$0.50 OFF")
  const discountInfo = formatDiscountBadge(price, originalPrice, discountType, discountAmount);

  // Zod Date Validation & Remaining Days calculation
  const promoResult = calculatePromoTimeLeft(promoEndDate, promoDaysLeft);
  const isPromotion =
    (discountInfo.hasDiscount || (originalPrice !== undefined && originalPrice > price)) &&
    promoResult.isValid;

  const displayPromoTime = promoResult.displayText;
  const promoStatus = promoResult.status;

  const targetHref =
    href ||
    `/product?id=${encodeURIComponent(id || title)}&title=${encodeURIComponent(
      title
    )}&price=${price}${originalPrice ? `&originalPrice=${originalPrice}` : ""}${discountType ? `&discountType=${discountType}` : ""}${discountAmount !== undefined ? `&discountAmount=${discountAmount}` : ""}${promoEndDate ? `&promoEndDate=${encodeURIComponent(String(promoEndDate))}` : ""}${promoDaysLeft ? `&promoDaysLeft=${encodeURIComponent(promoDaysLeft)}` : ""}${category ? `&category=${encodeURIComponent(category)}` : ""}${imgSrc ? `&image=${encodeURIComponent(imgSrc)}` : ""}`;

  const handleOpenAddModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalActionType("cart");
    setIsSizeModalOpen(true);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalActionType("checkout");
    setIsSizeModalOpen(true);
  };

  const handleConfirmSizeModal = (
    chosenSize: string,
    chosenIce?: string,
    chosenSugar?: string,
    chosenMilk?: string
  ) => {
    if (modalActionType === "cart") {
      if (onAddToCart) {
        onAddToCart();
      } else {
        addItem(
          {
            id: id || title,
            title,
            price,
            size: chosenSize,
            iceLevel: chosenIce,
            sugarLevel: chosenSugar,
            milkType: chosenMilk,
            image: imgSrc,
          },
          false
        );
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } else {
      if (onBuyNow) {
        onBuyNow();
      } else {
        addItem(
          {
            id: id || title,
            title,
            price,
            size: chosenSize,
            iceLevel: chosenIce,
            sugarLevel: chosenSugar,
            milkType: chosenMilk,
            image: imgSrc,
          },
          false
        );
      }
      router.push("/checkout");
    }
  };

  // Phone screen horizontal card design
  if (variant === "phone") {
    return (
      <>
        <div
          suppressHydrationWarning
          className={`relative flex items-center justify-between p-3 sm:p-3.5 rounded-[22px] bg-white transition-all duration-200 cursor-pointer w-full min-w-0 overflow-hidden phone-card ${
            isSelected
              ? "border-[1.5px] border-[#931B42] shadow-md shadow-[#931B42]/10 selected"
              : "border border-[#F3E8EC] hover:border-[#931B42]/40 shadow-sm default"
          }`}
        >
          {/* Left Image */}
          <Link href={targetHref} className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 bg-gray-100 block image-container">
            <Image
              src={imgSrc}
              alt={t(title)}
              fill
              unoptimized
              sizes="(max-width: 640px) 80px, 88px"
              className="object-cover transition-transform duration-300 hover:scale-105 card-thumb"
            />
            {discountInfo.hasDiscount && discountInfo.badgeText && isPromotion && (
              <span className="discount_badge discount_badge_phone">
                {discountInfo.badgeText}
              </span>
            )}
            {isPromotion && (
              <div
                className={`promo_clock_badge promo_clock_badge_phone promo_clock_${promoStatus}`}
                title={`Promotion ends in ${displayPromoTime}`}
                suppressHydrationWarning
              >
                <Clock className="w-3 h-3 shrink-0" />
                <span className="promo_clock_text" suppressHydrationWarning>{displayPromoTime}</span>
              </div>
            )}
          </Link>

          {/* Middle Details */}
          <div className="flex-1 min-w-0 px-3 sm:px-4 overflow-hidden card-info">
            <div className="flex items-center gap-1.5 min-w-0 w-full flex-wrap title-row">
              <Link
                href={targetHref}
                className="text-[#111827] font-bold text-base sm:text-[17px] leading-snug tracking-tight truncate min-w-0 flex-initial hover:underline item-title"
                title={t(title)}
              >
                {t(title)}
              </Link>
              {isPromotion && (
                <span className="bg-[#A1255B] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
                  PROMO
                </span>
              )}
              <button
                type="button"
                title="Info"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenInfo) onOpenInfo();
                }}
                className="w-4 h-4 rounded-full border border-[#931B42] text-[#931B42] flex items-center justify-center text-[10px] font-semibold hover:bg-[#931B42] hover:text-white transition-colors shrink-0 info-btn"
              >
                i
              </button>
            </div>

            <div className="text-xs font-normal text-gray-400 mt-1 mb-0.5 price-label">
              {t("Price")}
            </div>

            <div className="price_container shrink-0 flex items-center gap-1.5 flex-wrap">
              {originalPrice && originalPrice > price && isPromotion && (
                <span className="price_original">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="price_current price-value">
                ${price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Right "+ ADD" Button Opens Customization Modal Popup */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider text-white shadow-md transition-all duration-200 shrink-0 add-btn ${
              added
                ? "bg-emerald-600 shadow-emerald-600/30 scale-95 added"
                : "bg-[#931B42] hover:bg-[#7b1435] shadow-[#931B42]/30 hover:shadow-lg active:scale-95 default"
            }`}
          >
            {added ? t("Added ✓") : t("+ ADD")}
          </button>
        </div>

        {/* Customization Modal Popup for Phone Card */}
        <SelectSizeModal
          open={isSizeModalOpen}
          onOpenChange={setIsSizeModalOpen}
          product={{
            id: id || title,
            title,
            price,
            category,
            image: imgSrc,
          }}
          actionType={modalActionType}
          onConfirm={handleConfirmSizeModal}
        />
      </>
    );
  }

  // Default Grid Card
  return (
    <div className="card_item relative w-full min-w-0 max-w-full overflow-hidden" suppressHydrationWarning>
      <Link href={targetHref} className="block cursor-pointer group w-full min-w-0">
        <div className="card_image_box group-hover:opacity-90 transition-opacity relative w-full overflow-hidden">
          <Image
            src={imgSrc}
            alt={t(title)}
            fill
            unoptimized
            className="card_image object-cover"
          />

          {/* Discount Badge ONLY shown if discount is present and valid promotion */}
          {discountInfo.hasDiscount && discountInfo.badgeText && isPromotion && (
            <span className="discount_badge">
              {discountInfo.badgeText}
            </span>
          )}

          {/* Clock Icon ONLY on Promotion - Top Right */}
          {isPromotion && (
            <div
              className={`promo_clock_badge promo_clock_${promoStatus}`}
              title={`Promotion ends in ${displayPromoTime}`}
              suppressHydrationWarning
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="promo_clock_text" suppressHydrationWarning>{displayPromoTime}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mb-4 w-full min-w-0">
          <h3 className="card_title group-hover:underline mb-0 truncate min-w-0 flex-1" title={t(title)}>
            {t(title)}
          </h3>

          {/* Discount Price & Strikethrough Original Price using globals.scss classes */}
          <div className="price_container shrink-0">
            {originalPrice && originalPrice > price && isPromotion && (
              <span className="price_original">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="price_current">
              ${price.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>

      <div className="card_actions flex items-center gap-2 w-full min-w-0">
        <Button
          type="button"
          onClick={handleOpenAddModal}
          className="button_add_cart flex-1 shrink min-w-0 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold truncate cursor-pointer justify-center text-center"
        >
          {added ? t("Added ✓") : t("Add to Cart")}
        </Button>

        <Button
          type="button"
          onClick={handleBuyNow}
          className="button_buy_now flex-1 shrink min-w-0 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold truncate cursor-pointer justify-center text-center"
        >
          {t("Buy Now")}
        </Button>
      </div>

      {/* Select Size Modal Popup */}
      <SelectSizeModal
        open={isSizeModalOpen}
        onOpenChange={setIsSizeModalOpen}
        product={{
          id: id || title,
          title,
          price,
          category,
          image: imgSrc,
        }}
        actionType={modalActionType}
        onConfirm={handleConfirmSizeModal}
      />
    </div>
  );
}

export default Card;