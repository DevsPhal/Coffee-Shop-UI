"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/toast";
import { getProductByIdOrTitle, PRODUCTS, getResolvedProductImage } from "@/data/products";
import { Clock } from "lucide-react";
import { calculatePromoTimeLeft } from "@/lib/promoValidation";
import "@/app/globals.scss";

export interface ProductpageViewProps {
  id?: string;
  title?: string;
  price?: number;
  originalPrice?: number;
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

  const displayPromoEndDate = propPromoEndDate || queryPromoEndDate || matchedProduct.promoEndDate;
  const displayPromoDaysLeft = propPromoDaysLeft || queryPromoDaysLeft || matchedProduct.promoDaysLeft;

  const discountPercent =
    displayOriginalPrice && displayOriginalPrice > displayPrice
      ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
      : 0;

  const promoResult = calculatePromoTimeLeft(displayPromoEndDate, displayPromoDaysLeft);
  const isPromotion =
    (discountPercent > 0 || (displayOriginalPrice !== undefined && displayOriginalPrice > displayPrice)) &&
    promoResult.isValid;

  const displayDescription =
    propDescription || queryDescription || matchedProduct.description;
  const displayCategory =
    propCategory || queryCategory || matchedProduct.category || "Coffee";
  const displayImage = getResolvedProductImage(
    displayId,
    propImage !== undefined ? propImage : queryImage || matchedProduct.image
  );

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
        image: displayImage || undefined,
      });
    }
  };

  const handleBuyNow = () => {
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
          image: displayImage || undefined,
        },
        false
      );
    }
    router.push("/order");
  };

  return (
    <div className="product_detail_container font-sans" suppressHydrationWarning>
      <div className="product_detail_header block mb-6" style={{ display: "block" }}>
        <h1 className="product_detail_title">Product Detail</h1>

        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href={menuBaseUrl} className="breadcrumb_link">
            Products
          </Link>
          <span className="breadcrumb_separator">»</span>
          <Link
            href={`${menuBaseUrl}?category=${encodeURIComponent(displayCategory)}`}
            className="breadcrumb_link"
          >
            {displayCategory}
          </Link>
          <span className="breadcrumb_separator">»</span>
          <span className="breadcrumb_current">{displayTitle}</span>
        </nav>
      </div>
      <div className="product_detail_grid">
        <div className="product_image_container" suppressHydrationWarning>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={displayTitle}
              fill
              unoptimized
              className="object-cover"
              loading="eager"
            />
          ) : (
            <div className="product_image_placeholder">
              {displayTitle}
            </div>
          )}
          {discountPercent > 0 && (
            <span className="product_discount_badge">
              -{discountPercent}% OFF
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
              <h2 className="product_name">{displayTitle}</h2>

              {/* Clickable Category Badge */}
              <div className="category_badge_wrapper">
                <Link href={`${menuBaseUrl}?category=${encodeURIComponent(displayCategory)}`}>
                  <span className="category_badge">
                    {displayCategory}
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
                ${displayPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Product Description */}
          <p className="product_description">{displayDescription}</p>

          {/* Action Buttons Row */}
          <div className="product_actions_row">
            <Button
              type="button"
              onClick={handleAddToCart}
              className="button_add_cart cursor-pointer"
            >
              Add to Cart
            </Button>

            <Button
              type="button"
              onClick={handleBuyNow}
              className="button_buy_now cursor-pointer"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductpageView;
