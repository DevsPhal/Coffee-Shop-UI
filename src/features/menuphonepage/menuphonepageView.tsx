"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { CategoryDropdown } from "@/components/ui";
import { PRODUCTS, Product, getResolvedProductImage } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ChevronRight, ShoppingCart, Plus, Check, Search, Clock } from "lucide-react";
import { calculatePromoTimeLeft } from "@/lib/promoValidation";
import "@/app/globals.scss";

const CATEGORY_ICONS: Record<string, string> = {
  iced: "/icons/iced.svg",
  hot: "/icons/hot.svg",
  coffee: "/icons/coffee.svg",
  frappe: "/icons/frappe.svg",
  signature: "/icons/signature.svg",
  snack: "/icons/snack.svg",
  "soft drink": "/icons/soft_drink.svg",
  beer: "/icons/beer.svg",
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
  const [added, setAdded] = useState(false);

  const imgSrc = getResolvedProductImage(product.id, product.image);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const promoResult = calculatePromoTimeLeft(product.promoEndDate, product.promoDaysLeft);
  const isPromotion =
    ((product.originalPrice !== undefined && product.originalPrice > product.price) ||
      Boolean(product.promoDaysLeft) ||
      Boolean(product.promoEndDate)) &&
    promoResult.isValid;

  const displayPromoTime = promoResult.displayText;
  const promoStatus = promoResult.status;

  return (
    <div
      onClick={onSelect}
      className={`phone-card ${isSelected ? "selected" : "default"}`}
    >
      {/* Left: Drink Image Container */}
      <div className="image-container relative shrink-0">
        <Image
          src={imgSrc}
          alt={product.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 80px, 88px"
          className="card-thumb"
        />
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

      {/* Middle: Drink Info (Title, Info Icon, Price) */}
      <div className="card-info flex-1 min-w-0 overflow-hidden">
        {/* Title + Info Icon */}
        <div className="title-row inline-flex items-center gap-1.5 min-w-0 max-w-full overflow-hidden">
          <h3 className="item-title truncate min-w-0 flex-initial">
            {product.title}
          </h3>
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
          Price
        </div>

        {/* Price Value */}
        <div className="price-value">
          $ {product.price.toFixed(2)}
        </div>
      </div>

      {/* Right: + ADD Button */}
      <button
        type="button"
        onClick={handleAdd}
        className={`add-btn shrink-0 ${added ? "added" : "default"}`}
      >
        {added ? "ADDED ✓" : "+ ADD"}
      </button>
    </div>
  );
}

export function MenupageView() {
  const { openCart, addItem, subtotal, totalCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("1");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const categories = [
    "All",
    ...Array.from(new Set(PRODUCTS.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts = PRODUCTS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="menu-view-container relative w-full max-w-full overflow-x-hidden box-border">
      <div className="menu-view-wrapper w-full max-w-full overflow-x-hidden box-border">
        
        {/* Header Section */}
        <div className="menu-header w-full max-w-full overflow-hidden">
          <h1 className="menu-title">
            Our Full Menu
          </h1>
          <p className="menu-subtitle">
            Sleek horizontal coffee cards customized for mobile phone screens.
          </p>
        </div>

        {/* Desktop Category Filter & Search Row */}
        <div className="hidden sm:flex flex-col sm:flex-row items-center justify-between gap-4 my-6 px-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === "All"
                  ? PRODUCTS.length
                  : PRODUCTS.filter((p) => p.category === cat).length;
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
                  <span>{cat}</span>
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
                placeholder="Search product..."
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
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Mobile Filter & Search Bar Row */}
        <div className="sm:hidden flex items-center justify-between gap-2 my-4 px-2 w-full">
          {/* Category Dropdown Pill (Left - Thin & Slim) */}
          <div className="shrink-0">
            <CategoryDropdown
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              getCategoryCount={(cat) =>
                cat === "All"
                  ? PRODUCTS.length
                  : PRODUCTS.filter((p) => p.category === cat).length
              }
            />
          </div>

          {/* Product Search Form Input with Search Button (Right) */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center flex-1 min-w-0 bg-white border border-gray-200 focus-within:border-[#A1255B] rounded-full p-1 shadow-2xs transition-all"
          >
            <div className="flex items-center flex-1 min-w-0 pl-2.5 pr-1">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none border-none p-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-700 text-[10px] font-bold bg-gray-100 w-3.5 h-3.5 rounded-full flex items-center justify-center cursor-pointer shrink-0 ml-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="p-1.5 bg-[#A1255B] hover:bg-[#881d52] text-white rounded-full shadow-2xs transition-all flex items-center justify-center shrink-0 cursor-pointer border-none"
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
              No products available in this category.
            </div>
          )}
        </div>

      </div>

      {/* Product Detail Modal (Rendered on document.body via Portal) */}
      {activeModalProduct && mounted && createPortal(
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

            <div className="modal-img-container">
              <Image
                src={getResolvedProductImage(activeModalProduct.id, activeModalProduct.image)}
                alt={activeModalProduct.title}
                fill
                unoptimized
                className="modal-img"
              />
            </div>

            <div>
              <div className="modal-header-row">
                <h3 className="modal-item-title">
                  {activeModalProduct.title}
                </h3>
                <span className="modal-item-price">
                  $ {activeModalProduct.price.toFixed(2)}
                </span>
              </div>
              <p className="modal-item-desc">
                {activeModalProduct.description}
              </p>
            </div>

            <div className="modal-action-wrapper space-y-2 pt-2">
              <Link
                href={`/product?id=${activeModalProduct.id}&title=${encodeURIComponent(
                  activeModalProduct.title
                )}&price=${activeModalProduct.price}${activeModalProduct.originalPrice ? `&originalPrice=${activeModalProduct.originalPrice}` : ""}${activeModalProduct.promoEndDate ? `&promoEndDate=${encodeURIComponent(activeModalProduct.promoEndDate)}` : ""}${activeModalProduct.promoDaysLeft ? `&promoDaysLeft=${encodeURIComponent(activeModalProduct.promoDaysLeft)}` : ""}&category=${encodeURIComponent(activeModalProduct.category)}&image=${encodeURIComponent(getResolvedProductImage(activeModalProduct.id, activeModalProduct.image))}`}
                className="modal-view-btn"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default MenupageView;
