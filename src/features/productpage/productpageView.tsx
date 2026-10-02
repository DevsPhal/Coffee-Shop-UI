"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { toast } from "@/components/ui/toast";
import { useGetProductQuery } from "@/store/api/catalogApi";
import { getDrinkCustomization, resolveProductImage, toStoreProduct } from "@/store/api/productAdapter";
import {
  ICE_OPTIONS,
  MILK_OPTIONS,
  SUGAR_OPTIONS,
  variantOptions,
} from "@/store/api/optionMapping";
import type { IceLevel, MilkType, SugarLevel } from "@/store/api/types";
import { Clock, PackageX } from "lucide-react";
import { EmptyState, ErrorState, ProductDetailSkeleton } from "@/components/ui/states";
import { calculatePromoTimeLeft, formatDiscountBadge } from "@/lib/promoValidation";
import { ExtrasSelector } from "@/components/ui/ExtrasSelector";
import { OptionDropdown } from "@/components/ui/OptionDropdown";
import type { CartExtra } from "@/store/useCartStore";
import { useCatalogLiveUpdates } from "@/hooks/useCatalogLiveUpdates";
import "@/app/globals.scss";
import { useIsMobile } from "@/hooks/useIsMobile";

export interface ProductpageViewProps {
  id?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ProductpageView({
  id: propId,
  onAddToCart,
  onBuyNow,
}: ProductpageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const requireLogin = useRequireLogin();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const menuBaseUrl = isMobile ? "/menuphone" : "/menu";
  const productId = propId || searchParams.get("id") || "";

  const {
    data: apiProduct,
    isLoading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct,
  } = useGetProductQuery(productId, { skip: !productId });

  useCatalogLiveUpdates(() => {
    if (productId) refetchProduct();
  });

  const product = apiProduct ? toStoreProduct(apiProduct) : null;

  const displayTitle = product?.title ?? "";
  const displayOriginalPrice = product?.originalPrice;
  const displayDiscountType = product?.discountType;
  const displayDiscountAmount = product?.discountAmount;
  const displayPromoEndDate = product?.discountEndsAt;
  const displayDescription = product?.description ?? "";
  const displayCategory = product?.category ?? "";
  const displayImage = resolveProductImage(product?.image);

  const variants = product?.variants ?? [];
  const drinkOptions = product
    ? getDrinkCustomization(product)
    : { ice: false, sugar: false, milk: false };
  const hasCustomization = drinkOptions.ice || drinkOptions.sugar || drinkOptions.milk;

  const [chosenVariantId, setSelectedVariantId] = React.useState<string | null>(null);
  const [selectedIce, setSelectedIce] = React.useState<IceLevel>("NORMAL");
  const [selectedSugar, setSelectedSugar] = React.useState<SugarLevel>("NORMAL");
  const [selectedMilk, setSelectedMilk] = React.useState<MilkType>("NORMAL");
  const [selectedExtras, setSelectedExtras] = React.useState<CartExtra[]>([]);

  const selectedVariantId = variants.some((v) => v.id === chosenVariantId)
    ? chosenVariantId
    : variants[0]?.id ?? null;

  const [extrasFor, setExtrasFor] = React.useState(product?.id);
  if (extrasFor !== product?.id) {
    setExtrasFor(product?.id);
    setSelectedExtras([]);
  }

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const basePrice = product?.price ?? 0;
  const displayPrice = selectedVariant ? Number(selectedVariant.finalPrice) : basePrice;

  const discountInfo = formatDiscountBadge(
    basePrice,
    displayOriginalPrice,
    displayDiscountType,
    displayDiscountAmount
  );

  const promoResult = calculatePromoTimeLeft(displayPromoEndDate, undefined);

  const isPromotion = Boolean(product?.discountActive);
  const showCountdown = isPromotion && promoResult.isValid;

  const addCurrentSelection = () => {
    if (!product) return false;
    addItem({
      productId: product.id,
      title: product.title,
      image: product.image,
      unitPrice: displayPrice,
      originalUnitPrice: displayOriginalPrice,
      quantity: 1,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      ...(drinkOptions.ice ? { iceLevel: selectedIce } : {}),
      ...(drinkOptions.sugar ? { sugarLevel: selectedSugar } : {}),
      ...(drinkOptions.milk ? { milkType: selectedMilk } : {}),
      selectedExtras,
    });
    return true;
  };

  const handleAddToCart = () => {
    if (!requireLogin()) return;
    if (onAddToCart) {
      onAddToCart();
      return;
    }
    if (!addCurrentSelection()) return;
    toast.add({ type: "success", description: `${displayTitle} added to your cart.` });
  };

  const handleBuyNowClick = () => {
    if (!requireLogin()) return;
    if (onBuyNow) {
      onBuyNow();
    } else if (!addCurrentSelection()) {
      return;
    }
    router.push("/checkout");
  };

  if (isLoadingProduct) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    const isNotFound =
      !productError ||
      (typeof productError === "object" && "status" in productError && productError.status === 404);
    return (
      <div className="product_detail_container font-sans py-12">
        {isNotFound ? (
          <EmptyState
            icon={PackageX}
            title="Product not available"
            message="This product is no longer available."
            action={{ label: "Back to the menu", href: menuBaseUrl }}
          />
        ) : (
          <ErrorState
            title="We couldn't load this product"
            error={productError}
            onRetry={() => void refetchProduct()}
            secondaryAction={{ label: "Back to the menu", href: menuBaseUrl }}
          />
        )}
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

          <p className="product_description">{t(displayDescription)}</p>

          {(variants.length > 1 || hasCustomization) && (
            <div className="my-4 space-y-3">
              <div className="max-w-xs">
                {variants.length > 1 && selectedVariantId && (
                  <OptionDropdown
                    label="Size"
                    value={selectedVariantId}
                    options={variantOptions(variants)}
                    onChange={setSelectedVariantId}
                  />
                )}
                {drinkOptions.ice && (
                  <OptionDropdown
                    label="Ice Level"
                    value={selectedIce}
                    options={ICE_OPTIONS}
                    onChange={setSelectedIce}
                  />
                )}
                {drinkOptions.sugar && (
                  <OptionDropdown
                    label="Sugar Level"
                    value={selectedSugar}
                    options={SUGAR_OPTIONS}
                    onChange={setSelectedSugar}
                  />
                )}
                {drinkOptions.milk && (
                  <OptionDropdown
                    label="Milk"
                    value={selectedMilk}
                    options={MILK_OPTIONS}
                    onChange={setSelectedMilk}
                  />
                )}
              </div>

              {product && (
                <ExtrasSelector
                  extras={product.extras}
                  selected={selectedExtras}
                  onChange={setSelectedExtras}
                />
              )}
            </div>
          )}

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
