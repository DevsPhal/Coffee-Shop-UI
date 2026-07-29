"use client";

import React, { useState } from "react";
import { Card } from "@/components/cards/card";
import { PRODUCTS } from "@/data/products";
import "@/app/globals.scss";

export function MenupageView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...Array.from(new Set(PRODUCTS.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((item) => item.category === selectedCategory);

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

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-8 px-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === "All"
                ? PRODUCTS.length
                : PRODUCTS.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`category_btn ${isSelected ? "active" : ""}`}
              >
                <span>{cat}</span>
                <span className="category_badge">
                  {count}
                </span>
              </button>
            );
          })}
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
            No items found in this category.
          </div>
        )}

      </div>
    </div>
  );
}

export default MenupageView;
