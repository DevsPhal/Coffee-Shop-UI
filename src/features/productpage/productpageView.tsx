"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
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

export interface ProductpageViewProps {
  /** Product UUID. Falls back to the `id` query param when not passed directly. */
  id?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

/**
 * Product detail, fetched by id from `/api/products/{id}`.
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
  const requireLogin = useRequireLogin();
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
    refetch: refetchProduct,
  } = useGetProductQuery(productId, { skip: !productId });

  // An extra's push carries the extra's own id, not which products offer it, so a change to an
  // extra this product happens to offer can't be targeted by id the way a direct product/
  // category change can (see RealtimeCatalogSync) — refetch this one page's own product
  // unconditionally instead, since it's cheap and this is the one place that actually needs to
  // know an extra it's showing just changed.
  useCatalogLiveUpdates(() => {
    if (productId) refetchProduct();
  });

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

  const variants = product?.variants ?? [];
  // Beer, soft drinks, snacks — anything sold as-is rather than made to order — get no ice/
  // sugar/milk controls; a fresh drink gets whichever of the three actually apply to it (a hot
  // drink has no ice option, a plain tea has no milk option).
  const drinkOptions = product
    ? getDrinkCustomization(product)
    : { ice: false, sugar: false, milk: false };
  const hasCustomization = drinkOptions.ice || drinkOptions.sugar || drinkOptions.milk;

  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(null);
  const [selectedIce, setSelectedIce] = React.useState<IceLevel>("NORMAL");
  const [selectedSugar, setSelectedSugar] = React.useState<SugarLevel>("NORMAL");
  const [selectedMilk, setSelectedMilk] = React.useState<MilkType>("NORMAL");
  const [selectedExtras, setSelectedExtras] = React.useState<CartExtra[]>([]);

  // Default to the first variant once the product arrives.
  React.useEffect(() => {
    if (variants.length > 0 && !variants.some((v) => v.id === selectedVariantId)) {
      setSelectedVariantId(variants[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, variants.length]);

  // A different product offers different extras — carrying a selection across would attach an
  // add-on that product never listed.
  React.useEffect(() => {
    setSelectedExtras([]);
  }, [product?.id]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  // Each variant prices itself outright now — no product-level price to add a delta to — but
  // `product.price` (the default variant's price) still covers the instant before the effect
  // above has picked a variant.
  const basePrice = product?.price ?? 0;
  const displayPrice = selectedVariant ? Number(selectedVariant.finalPrice) : basePrice;

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

  // Guests can view the product, but adding to the basket needs a customer login.
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

  // A missing id or a 404 both land here — a link to a product that has since been removed
  // should say so rather than silently rendering the first item in the menu. A 404 is "gone",
  // anything else (network, server) is a failure worth retrying.
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

          {/* Customization Options Stack — skipped entirely for a single-size, non-drink
              product (a can of beer, a snack) rather than leaving an empty gap where a size
              picker and three drink controls would otherwise sit. */}
          {(variants.length > 1 || hasCustomization) && (
            <div className="my-4 space-y-3">
              {/* Size Selector — each variant prices itself outright, so there's nothing to
                  show when there's only the one default variant every product has. */}
              {/* The same dropdown as the customize modal and the cart. A size only shows when
                  there's a real choice; ice/sugar/milk only for drinks they apply to — a hot
                  drink has no ice level, a plain tea has no milk option. */}
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
