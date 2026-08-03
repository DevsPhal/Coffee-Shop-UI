"use client";

import React, { useState } from "react";
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

export function DrinkpageView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const drinkProducts = PRODUCTS.filter(
    (p) => p.category === "Coffee" || p.category === "Fresh Juices" || p.category === "Signature" || !p.category
  );

  const categories = [
    "All",
    ...Array.from(new Set(drinkProducts.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? drinkProducts
      : drinkProducts.filter((item) => item.category === selectedCategory);

  const getCategoryCount = (cat: string) =>
    cat === "All"
      ? drinkProducts.length
      : drinkProducts.filter((p) => p.category === cat).length;

  return (
    <div className="menu_page_wrapper font-sans">
      <div className="menu_page_container">
        {/* Header Section */}
        <div className="menu_page_header">
          <h1 className="menu_page_title">
            Our Drinks Today
          </h1>
          <p className="menu_page_subtitle">
            Handcrafted beverages & bites, made to order just for you.
          </p>
        </div>

        {/* Full Screen Desktop Category Filter Pills */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-8 px-2">
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
        <div className="sm:hidden flex justify-center my-6 px-2">
          <CategoryDropdown
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            getCategoryCount={getCategoryCount}
          />
        </div>

        {/* Menu Cards Grid */}
        <div className="menu_page_grid">
          {filteredProducts.map((item) => (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            No drinks found in this category.
          </div>
        )}
      </div>
    </div>
  );
}

export default DrinkpageView;
