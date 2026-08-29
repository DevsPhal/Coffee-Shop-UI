"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/cards/card";
import { CategoryDropdown } from "@/components/ui";
import { PRODUCTS, filterProductsByCategory, getCategoryItemCount } from "@/data/products";
import { Search } from "lucide-react";
import "@/app/globals.scss";

export function DrinkpageView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProducts = filterProductsByCategory(selectedCategory, searchQuery);

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

        {/* Category Dropdown & Search Form Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-xl mx-auto my-6 px-2 w-full">
          {/* Left: Category Dropdown Pill */}
          <div className="shrink-0">
            <CategoryDropdown
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              getCategoryCount={getCategoryItemCount}
            />
          </div>

          {/* Right: Search Input Form Pill */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center flex-1 min-w-0 bg-white border border-gray-200 focus-within:border-[#A1255B] focus-within:ring-1 focus-within:ring-[#A1255B] rounded-full p-1 pl-3.5 shadow-2xs transition-all"
          >
            <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none border-none p-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold bg-gray-100 hover:bg-gray-200 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer shrink-0 mr-1 transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="w-8 h-8 bg-[#A1255B] hover:bg-[#881d52] text-white rounded-full shadow-2xs transition-all flex items-center justify-center shrink-0 cursor-pointer border-none active:scale-95 ml-1"
              title="Search"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </form>
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
