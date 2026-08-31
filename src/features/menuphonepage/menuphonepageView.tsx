"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CategoryDropdown } from "@/components/ui";
import { PRODUCTS, Product, getResolvedProductImage, filterProductsByCategory, getCategoryItemCount, getItemCustomizationConfig } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { ShoppingBag, ChevronRight, ShoppingCart, Plus, Check, Search, Clock } from "lucide-react";
import { calculatePromoTimeLeft, formatDiscountBadge } from "@/lib/promoValidation";
import SelectSizeModal from "@/components/ui/SelectSizeModal";
import "@/app/globals.scss";

const CATEGORY_ICONS: Record<string, string> = {
  all: "/icons/category.svg",
  category: "/icons/category.svg",
  beverage: "/icons/coffee.svg",
  "fresh drink": "/icons/material.svg",
  snack: "/icons/snack.svg",
  beer: "/icons/beer.svg",
  "soft drink": "/icons/soft_drink.svg",
  "ice coffee": "/icons/iced.svg",
  "iced coffee": "/icons/iced.svg",
  "hot coffee": "/icons/hot.svg",
  "iced tea": "/icons/material.svg",
  "hot tea": "/icons/hot.svg",
  passion: "/icons/material.svg",
  "pure water": "/icons/water.svg",
  "pour water": "/icons/water.svg",
  "energy drink": "/icons/soft_drink.svg",
  noddle: "/icons/snack.svg",
  noodle: "/icons/snack.svg",
  eggs: "/icons/snack.svg",
  iced: "/icons/iced.svg",
  hot: "/icons/hot.svg",
  coffee: "/icons/coffee.svg",
  frappe: "/icons/frappe.svg",
  signature: "/icons/signature.svg",
  water: "/icons/water.svg",
  material: "/icons/material.svg",
};

export interface PhoneCardProps {
  product: Product;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenInfo?: (product: Product) => void;
}

export function PhoneCard({
  product,
  isSelected = false,
  onSelect,
  onOpenInfo,
}: PhoneCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  const imgSrc = getResolvedProductImage(product.id, product.image);
  const customizationConfig = getItemCustomizationConfig(product.title, product.category);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If item has size or drink customization options, open modal popup
    if (
      customizationConfig.hasSize ||
      customizationConfig.hasIce ||
      customizationConfig.hasSugar ||
      customizationConfig.hasMilk
    ) {
      setIsSizeModalOpen(true);
      return;
    }

    // Otherwise (e.g. Topping / Fried Egg), directly add to cart
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: imgSrc,
      },
      false
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleConfirmSizeModal = (
    chosenSize: string,
    chosenIce?: string,
    chosenSugar?: string,
    chosenMilk?: string
  ) => {
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        size: chosenSize,
        iceLevel: chosenIce,
        sugarLevel: chosenSugar,
        milkType: chosenMilk,
        image: imgSrc,
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

  const promoResult = calculatePromoTimeLeft(product.promoEndDate, product.promoDaysLeft);
  const isPromotion =
    (discountInfo.hasDiscount ||
      (product.originalPrice !== undefined && product.originalPrice > product.price) ||
      Boolean(product.promoDaysLeft) ||
      Boolean(product.promoEndDate)) &&
    promoResult.isValid;

  const displayPromoTime = promoResult.displayText;
  const promoStatus = promoResult.status;

  return (
    <>
      <div
        onClick={onSelect}
        className={`phone-card ${isSelected ? "selected" : "default"}`}
        suppressHydrationWarning
      >
        {/* Left: Drink Image Container */}
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
          {isPromotion && (
            <div
              className={`promo_clock_badge promo_clock_badge_phone promo_clock_${promoStatus}`}
              title={`Promotion ends in ${displayPromoTime}`}
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span className="promo_clock_text">{displayPromoTime}</span>
            </div>
          )}
        </div>

        {/* Middle: Drink Info (Title, Discount Tag, Info Icon, Price) */}
        <div className="card-info flex-1 min-w-0 overflow-hidden">
          {/* Title + PROMO Badge + Info Icon */}
          <div className="title-row inline-flex items-center gap-1.5 min-w-0 max-w-full overflow-hidden flex-wrap">
            <h3 className="item-title truncate min-w-0 flex-initial">
              {t(product.title)}
            </h3>
            {isPromotion && (
              <span className="bg-[#A1255B] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
                PROMO
              </span>
            )}
            <button
              type="button"
              title="Product Details"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenInfo) onOpenInfo(product);
              }}
              className="info-btn shrink-0"
            >
              i
            </button>
          </div>

          {/* Price Label */}
          <div className="price-label">
            {t("Price")}
          </div>

          {/* Price Value with Original Price Strikethrough */}
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

        {/* Right: + ADD Button */}
        <button
          type="button"
          onClick={handleAdd}
          className={`add-btn shrink-0 ${added ? "added" : "default"}`}
        >
          {added ? t("ADDED ✓") : t("+ ADD")}
        </button>
      </div>

      {/* Select Size / Customization Modal Popup */}
      <SelectSizeModal
        open={isSizeModalOpen}
        onOpenChange={setIsSizeModalOpen}
        product={{
          id: product.id,
          title: product.title,
          price: product.price,
          category: product.category,
          image: imgSrc,
        }}
        actionType="cart"
        onConfirm={handleConfirmSizeModal}
      />
    </>
  );
}

export function MenupageView() {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category");
  const { openCart, addItem, subtotal, totalCount } = useCart();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("1");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayCategories = [
    "All",
    "Fresh Drink",
    "Iced Coffee",
    "Hot Coffee",
    "Iced Tea",
    "Hot Tea",
    "Beverage",
    "Beer",
    "Soft Drink",
    "Pure Water",
    "Snack",
    "Noddle",
    "Topping",
  ];

  useEffect(() => {
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

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

  const filteredProducts = filterProductsByCategory(selectedCategory, searchQuery);

  return (
    <div className="menu-view-container relative w-full max-w-full overflow-x-hidden box-border">
      <div className="menu-view-wrapper w-full max-w-full overflow-x-hidden box-border">
        
        {/* Header Section */}
        <div className="menu-header w-full max-w-full overflow-hidden">
          <h1 className="menu-title">
            {t("Our Full Menu")}
          </h1>
          <p className="menu-subtitle">
            {t("Sleek horizontal coffee cards customized for mobile phone screens.")}
          </p>
        </div>

        {/* Desktop Category Filter & Search Row */}
        <div className="category_desktop_row flex-col sm:flex-row items-center justify-between gap-4 my-6 px-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {displayCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = getCategoryItemCount(cat);
              const iconSrc = CATEGORY_ICONS[cat.toLowerCase()];

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`category_btn ${isSelected ? "active" : ""}`}
                >
                  {iconSrc && (
                    <Image
                      src={iconSrc}
                      alt=""
                      width={18}
                      height={18}
                      className="category_btn_icon"
                    />
                  )}
                  <span>{t(cat)}</span>
                  <span className="category_badge">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop Search Input Form */}
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

        {/* Mobile Filter & Search Bar Row */}
        <div className="category_mobile_row items-center justify-between gap-2 my-4 px-2 w-full">
          {/* Category Dropdown Pill (Left - Thin & Slim) */}
          <div className="shrink-0">
            <CategoryDropdown
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              getCategoryCount={getCategoryItemCount}
            />
          </div>

          {/* Product Search Form Input with Search Button (Right) */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center flex-1 min-w-0 bg-white border border-gray-200 focus-within:border-[#A1255B] p-1 shadow-2xs transition-all"
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
                  className="text-gray-400 hover:text-gray-700 text-[10px] font-bold bg-gray-100 w-3.5 h-3.5 flex items-center justify-center cursor-pointer shrink-0 ml-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="p-1.5 bg-[#A1255B] hover:bg-[#881d52] text-white shadow-2xs transition-all flex items-center justify-center shrink-0 cursor-pointer border-none"
              title="Search"
            >
              <Search className="w-3.5 h-3.5 text-white" />
            </button>
          </form>
        </div>

        {/* Phone Sized Cards Container */}
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

          {filteredProducts.length === 0 && (
            <div className="no-products">
              {t("No products available in this category.")}
            </div>
          )}
        </div>

      </div>

      {/* Product Detail Modal (Rendered on document.body via Portal) */}
      {activeModalProduct && mounted && (() => {
        const modalDiscountInfo = formatDiscountBadge(
          activeModalProduct.price,
          activeModalProduct.originalPrice,
          activeModalProduct.discountType,
          activeModalProduct.discountAmount
        );

        const modalPromoResult = calculatePromoTimeLeft(
          activeModalProduct.promoEndDate,
          activeModalProduct.promoDaysLeft
        );

        const isModalPromotion =
          (modalDiscountInfo.hasDiscount || (activeModalProduct.originalPrice !== undefined && activeModalProduct.originalPrice > activeModalProduct.price)) &&
          modalPromoResult.isValid;

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
                  src={getResolvedProductImage(activeModalProduct.id, activeModalProduct.image)}
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
                {isModalPromotion && (
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
                  href={`/product?id=${activeModalProduct.id}&title=${encodeURIComponent(
                    activeModalProduct.title
                  )}&price=${activeModalProduct.price}${activeModalProduct.originalPrice ? `&originalPrice=${activeModalProduct.originalPrice}` : ""}${activeModalProduct.discountType ? `&discountType=${activeModalProduct.discountType}` : ""}${activeModalProduct.discountAmount !== undefined ? `&discountAmount=${activeModalProduct.discountAmount}` : ""}${activeModalProduct.promoEndDate ? `&promoEndDate=${encodeURIComponent(activeModalProduct.promoEndDate)}` : ""}${activeModalProduct.promoDaysLeft ? `&promoDaysLeft=${encodeURIComponent(activeModalProduct.promoDaysLeft)}` : ""}&category=${encodeURIComponent(activeModalProduct.category)}&image=${encodeURIComponent(getResolvedProductImage(activeModalProduct.id, activeModalProduct.image))}`}
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
