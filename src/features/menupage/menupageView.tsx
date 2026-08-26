"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/cards/card";
import { CategoryDropdown } from "@/components/ui";
import { PRODUCTS } from "@/data/products";
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

export function MenupageView() {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category");

  const categories = [
    "All",
    ...Array.from(new Set(PRODUCTS.map((p) => p.category).filter(Boolean))),
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    if (queryCategory && categories.includes(queryCategory)) {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((item) => item.category === selectedCategory);

  const getCategoryCount = (cat: string) =>
    cat === "All"
      ? PRODUCTS.length
      : PRODUCTS.filter((p) => p.category === cat).length;

  return (
    <div className="menu_page_wrapper font-sans">
      <div className="menu_page_container">
        
        {/* Header Section */}
        <div className="menu_page_header">
          <h1 className="menu_page_title">
            Our Full Menu
          </h1>
          <p className="menu_page_subtitle">
            Handcrafted beverages & bites, made to order just for you.
          </p>
        </div>

        {/* Full Screen Desktop Category Filter Pills */}
        <div className="category_desktop_row flex-wrap items-center justify-center gap-2 sm:gap-3 my-8 px-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = getCategoryCount(cat);
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
        <div className="category_mobile_row justify-center my-6 px-2">
          <CategoryDropdown
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            getCategoryCount={getCategoryCount}
          />
        </div>

        {/* Menu Cards Grid */}
        <div className="homepage_cards_grid">
          {filteredProducts.map((item) => (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              originalPrice={item.originalPrice}
              promoEndDate={item.promoEndDate}
              promoDaysLeft={item.promoDaysLeft}
              category={item.category}
              image={item.image}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            No items found in this category.
          </div>
        )}

      </div>
    </div>
  );
}

export default MenupageView;
