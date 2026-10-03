"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CategoryDropdown } from "@/components/ui";
import { ALL_CATEGORIES } from "@/components/ui/CategoryDropdown";
import { resolveProductImage, toStoreProduct, type StoreProduct } from "@/store/api/productAdapter";
import { useCatalog, useCategories } from "@/store/api/useCatalog";
import { isCategoryId, useCategoryQuery } from "@/lib/categoryParam";
import type { SizeSelection } from "@/components/ui/SelectSizeModal";
import { useCart } from "@/context/CartContext";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Search, Clock, SearchX } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingRegion,
  PhoneCardSkeleton,
} from "@/components/ui/states";
import { calculatePromoTimeLeft, formatDiscountBadge } from "@/lib/promoValidation";
import SelectSizeModal from "@/components/ui/SelectSizeModal";
import { toast } from "@/components/ui/toast";
import "@/app/globals.scss";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useMounted } from "@/hooks/useMounted";

export interface PhoneCardProps {
  product: StoreProduct;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenInfo?: (product: StoreProduct) => void;
}

export function PhoneCard({
  product,
  isSelected = false,
  onSelect,
  onOpenInfo,
}: PhoneCardProps) {
  const { addItem } = useCart();
  const requireLogin = useRequireLogin();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  const imgSrc = resolveProductImage(product.image);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireLogin()) return;
    setIsSizeModalOpen(true);
  };

  const handleConfirmSizeModal = (selection: SizeSelection) => {
    addItem(
      {
        productId: product.id,
        title: product.title,
        image: product.image,
        unitPrice: selection.unitPrice,
        originalUnitPrice: product.originalPrice,
        quantity: 1,
        variantId: selection.variantId,
        variantName: selection.variantName,
        iceLevel: selection.iceLevel,
        sugarLevel: selection.sugarLevel,
        milkType: selection.milkType,
        selectedExtras: selection.selectedExtras,
      },
      false
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const discountInfo = formatDiscountBadge(
    product.price,
    product.originalPrice,
    product.discountType,
    product.discountAmount
  );

  const promoResult = calculatePromoTimeLeft(product.discountEndsAt, undefined);

  const isPromotion = product.discountActive;
  const showCountdown = isPromotion && promoResult.isValid;

  const displayPromoTime = promoResult.displayText;
  const promoStatus = promoResult.status;

  return (
    <>
      <div
        onClick={onSelect}
        className={`phone-card cursor-pointer ${isSelected ? "selected" : "default"}`}
        suppressHydrationWarning
      >
        <div className="image-container relative shrink-0">
          <Image
            src={imgSrc}
            alt={t(product.title)}
            fill
            unoptimized
            sizes="(max-width: 640px) 80px, 88px"
            className="card-thumb"
          />
          {discountInfo.hasDiscount && discountInfo.badgeText && isPromotion && (
            <span className="discount_badge discount_badge_phone">
              {discountInfo.badgeText}
            </span>
          )}
          {showCountdown && (
            <div
              className={`promo_clock_badge promo_clock_badge_phone promo_clock_${promoStatus}`}
              title={`Promotion ends in ${displayPromoTime}`}
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span className="promo_clock_text">{displayPromoTime}</span>
            </div>
          )}
        </div>

        <div className="card-info flex-1 min-w-0 overflow-hidden">
          <div className="title-row flex items-start gap-1.5 min-w-0">
            <h3 className="item-title line-clamp-2 break-words min-w-0 flex-1" title={t(product.title)}>
              {t(product.title)}
            </h3>
            <button
              type="button"
              title="Product Details"
              aria-label={`${t("Product Details")}: ${t(product.title)}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenInfo) onOpenInfo(product);
              }}
              className="info-btn shrink-0"
            >
              i
            </button>
          </div>

          <div className="price-label flex items-center gap-1.5">
            {t("Price")}
            {isPromotion && (
              <span className="bg-[#A1255B] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
                PROMO
              </span>
            )}
          </div>

          <div className="price-value flex items-center gap-1.5 flex-wrap">
            {product.originalPrice && product.originalPrice > product.price && isPromotion && (
              <span className="line-through text-xs text-gray-400 font-medium">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-[#f0383e] font-extrabold">
              $ {product.price.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`add-btn shrink-0 ${added ? "added" : "default"}`}
        >
          {added ? t("ADDED ✓") : t("+ ADD")}
        </button>
      </div>

      <SelectSizeModal
        open={isSizeModalOpen}
        onOpenChange={setIsSizeModalOpen}
        product={product}
        actionType="cart"
        onConfirm={handleConfirmSizeModal}
      />
    </>
  );
}

export function MenupageView() {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category");
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = usePersistentState<string>("menu-phone:selectedCategory", ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = usePersistentState<string>("menu-phone:searchQuery", "");
  const [selectedId, setSelectedId] = useState<string>("1");
  const [activeModalProduct, setActiveModalProduct] = useState<StoreProduct | null>(null);
  const mounted = useMounted();

  const { products, isLoading, error, refetch } = useCatalog(
    isCategoryId(selectedCategory) ? selectedCategory : undefined
  );

  // Already showing everything and it's still empty: switching category would do nothing, so say why.
  const showAllOrNotify = () => {
    if (selectedCategory === ALL_CATEGORIES) {
      void refetch();
      toast.add({ type: "info", description: "The menu is empty right now — please check back soon." });
      return;
    }
    setSelectedCategory(ALL_CATEGORIES);
  };

  const { categories } = useCategories();
  useCategoryQuery({ queryCategory, selectedCategory, setSelectedCategory, categories });

  useEffect(() => {
    if (activeModalProduct) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [activeModalProduct]);

  const filteredProducts = products
    .filter((product) => {
      const term = searchQuery.trim().toLowerCase();
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.categoryName.toLowerCase().includes(term)
      );
    })
    .map(toStoreProduct);

  return (
    <div className="menu-view-container relative w-full max-w-full overflow-x-hidden box-border">
      <div className="menu-view-wrapper w-full max-w-full overflow-x-hidden box-border">
        
        <div className="menu-header w-full max-w-full overflow-hidden">
          <h1 className="menu-title">
            {t("Our Full Menu")}
          </h1>
          <p className="menu-subtitle">
            {t("Handcrafted beverages & bites, made to order just for you.")}
          </p>
        </div>

        <div className="category_desktop_row flex-col sm:flex-row items-center justify-between gap-4 my-6 px-2">
          <CategoryDropdown
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center min-w-[240px] bg-white border border-gray-200 focus-within:border-[#A1255B] rounded-full p-1 shadow-2xs transition-all"
          >
            <div className="flex items-center flex-1 min-w-0 pl-3 pr-1">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Search product...")}
                className="w-full bg-transparent text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none border-none p-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-700 text-[10px] font-bold bg-gray-100 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer shrink-0 ml-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#A1255B] hover:bg-[#881d52] text-white text-xs font-bold rounded-full shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border-none"
            >
              <Search className="w-3 h-3 text-white" />
              <span>{t("Search")}</span>
            </button>
          </form>
        </div>

        <div className="category_mobile_row items-center justify-between gap-2 my-4 px-2 w-full">
          <div className="shrink-0">
            <CategoryDropdown
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center flex-1 min-w-0 rounded-full bg-white border border-gray-200 focus-within:border-[#A1255B] p-1 shadow-2xs transition-all"
          >
            <div className="flex items-center flex-1 min-w-0 pl-2.5 pr-1">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Search...")}
                className="w-full bg-transparent text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none border-none p-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-full text-gray-400 hover:text-gray-700 text-[10px] font-bold bg-gray-100 w-3.5 h-3.5 flex items-center justify-center cursor-pointer shrink-0 ml-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="p-1.5 rounded-full bg-[#A1255B] hover:bg-[#881d52] text-white shadow-2xs transition-all flex items-center justify-center shrink-0 cursor-pointer border-none"
              title="Search"
            >
              <Search className="w-3.5 h-3.5 text-white" />
            </button>
          </form>
        </div>

        {isLoading ? (
          <LoadingRegion label="Loading menu..." className="cards-container pb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PhoneCardSkeleton key={i} />
            ))}
          </LoadingRegion>
        ) : error ? (
          <ErrorState
            title="We couldn't load the menu"
            error={error}
            onRetry={() => void refetch()}
            className="my-6"
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={searchQuery.trim() ? "No matching items" : "Nothing here yet"}
            message={
              searchQuery.trim()
                ? "Try a different search word or category."
                : "No products available in this category."
            }
            action={
              searchQuery.trim()
                ? { label: "Clear search", onClick: () => setSearchQuery("") }
                : { label: "View all products", onClick: showAllOrNotify }
            }
            className="my-6"
          />
        ) : (
          <div className="cards-container pb-6">
            {filteredProducts.map((item) => (
              <PhoneCard
                key={item.id}
                product={item}
                isSelected={selectedId === item.id}
                onSelect={() => setSelectedId(item.id)}
                onOpenInfo={(prod) => setActiveModalProduct(prod)}
              />
            ))}
          </div>
        )}

      </div>

      {activeModalProduct && mounted && (() => {
        const modalDiscountInfo = formatDiscountBadge(
          activeModalProduct.price,
          activeModalProduct.originalPrice,
          activeModalProduct.discountType,
          activeModalProduct.discountAmount
        );

        const modalPromoResult = calculatePromoTimeLeft(
          activeModalProduct.discountEndsAt,
          undefined
        );

        const isModalPromotion =
          modalDiscountInfo.hasDiscount || (activeModalProduct.originalPrice !== undefined && activeModalProduct.originalPrice > activeModalProduct.price);
        const showModalCountdown = isModalPromotion && modalPromoResult.isValid;

        return createPortal(
          <div
            className="modal-backdrop"
            onClick={() => setActiveModalProduct(null)}
          >
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveModalProduct(null)}
                className="modal-close-btn"
              >
                ✕
              </button>

              <div className="modal-img-container relative">
                <Image
                  src={resolveProductImage(activeModalProduct.image)}
                  alt={activeModalProduct.title}
                  fill
                  unoptimized
                  className="modal-img"
                />
                {modalDiscountInfo.hasDiscount && modalDiscountInfo.badgeText && isModalPromotion && (
                  <span className="discount_badge">
                    {modalDiscountInfo.badgeText}
                  </span>
                )}
                {showModalCountdown && (
                  <div
                    className={`promo_clock_badge promo_clock_badge_phone promo_clock_${modalPromoResult.status}`}
                    title={`Promotion ends in ${modalPromoResult.displayText}`}
                  >
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="promo_clock_text">{modalPromoResult.displayText}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="modal-header-row items-baseline min-w-0 w-full overflow-hidden">
                  <h3 className="modal-item-title truncate min-w-0 flex-1" title={t(activeModalProduct.title)}>
                    {t(activeModalProduct.title)}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeModalProduct.originalPrice && activeModalProduct.originalPrice > activeModalProduct.price && isModalPromotion && (
                      <span className="line-through text-xs text-gray-400 font-semibold">
                        ${activeModalProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="modal-item-price text-[#f0383e] font-extrabold text-base sm:text-lg">
                      $ {activeModalProduct.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="modal-item-desc">
                  {t(activeModalProduct.description)}
                </p>
              </div>

              <div className="modal-action-wrapper space-y-2 pt-2">
                <Link
                  href={`/product?id=${activeModalProduct.id}`}
                  className="modal-view-btn"
                >
                  {t("VIEW FULL DETAILS")}
                </Link>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}

export default MenupageView;
