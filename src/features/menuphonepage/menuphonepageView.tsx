"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { CategoryDropdown } from "@/components/ui";
import { PRODUCTS, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
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

// High-resolution image fallbacks matching the exact design in the picture
const DEFAULT_IMAGES: Record<string, string> = {
  "1": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80", // Espresso top view with crema
  "2": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80", // Ice Americano / Iced coffee with milk swirl
  "3": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80", // Ice Latte in tall glass
  "4": "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80", // 590 Coffee
};

const GENERIC_COFFEE_IMG =
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80";

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

  const imgSrc =
    product.image || DEFAULT_IMAGES[product.id] || GENERIC_COFFEE_IMG;

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

  return (
   <div
      onClick={onSelect}
      className={`phone-card ${isSelected ? "selected" : "default"}`}
    >
      {/* Left: Drink Image Container */}
      <div className="image-container">
        <Image
          src={imgSrc}
          alt={product.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 80px, 88px"
          className="card-thumb"
        />
      </div>

      {/* Middle: Drink Info (Title, Info Icon, Price) */}
      <div className="card-info">
        {/* Title + Info Icon */}
        <div className="title-row">
          <h3 className="item-title">
            {product.title}
          </h3>
          <button
            type="button"
            title="Product Details"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenInfo) onOpenInfo(product);
            }}
            className="info-btn"
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
        className={`add-btn ${added ? "added" : "default"}`}
      >
        {added ? "ADDED ✓" : "+ ADD"}
      </button>
    </div>
  );
}

export function MenupageView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
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

  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((item) => item.category === selectedCategory);

  return (
   <div className="menu-view-container">
      <div className="menu-view-wrapper">
        
        {/* Header Section */}
        <div className="menu-header">
          <h1 className="menu-title">
            Our Full Menu
          </h1>
          <p className="menu-subtitle">
            Sleek horizontal coffee cards customized for mobile phone screens.
          </p>
        </div>

        {/* Desktop Category Filter Pills */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-6 px-2">
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

        {/* Mobile Category Dropdown Selector */}
        <div className="sm:hidden flex justify-center my-6 px-2">
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

        {/* Phone Sized Cards Container */}
        <div className="cards-container">
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
                src={
                  activeModalProduct.image ||
                  DEFAULT_IMAGES[activeModalProduct.id] ||
                  GENERIC_COFFEE_IMG
                }
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

            <div className="modal-action-wrapper">
              <Link
                href={`/product?id=${activeModalProduct.id}&title=${encodeURIComponent(
                  activeModalProduct.title
                )}`}
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
