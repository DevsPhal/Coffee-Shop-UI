"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/cards/card";
import {
  PRODUCTS,
  MAIN_CATEGORIES,
  filterProductsByCategory,
  getCategoryItemCount,
  Product,
} from "@/data/products";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Search, ChevronDown, ChevronRight, Filter } from "lucide-react";
import "@/app/globals.scss";

export function MenupageView() {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category");
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [expandedMains, setExpandedMains] = useState<Record<string, boolean>>({
    beverage: true,
    soft_drink: true,
    snack: true,
  });

  useEffect(() => {
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

  const toggleExpand = (mainId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMains((prev) => ({
      ...prev,
      [mainId]: !prev[mainId],
    }));
  };

  const rawFilteredProducts = filterProductsByCategory(selectedCategory, searchQuery);

  // Apply sorting
  const sortedProducts = [...rawFilteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.title.localeCompare(b.title);
    return 0; // newest/default
  });

  const getPageTitle = () => {
    if (selectedCategory === "All" || selectedCategory === "all") return t("All Products");
    if (selectedCategory === "Featured") return t("Featured Products");
    return t(selectedCategory);
  };

  return (
    <div className="menu_page_wrapper font-sans min-h-screen pb-16 bg-[#F9FAFC]">
      <div className="menu_page_container max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        
        {/* Centered Menu Page Header (Matching Image) */}
        <div className="menu_page_header text-center my-4 sm:my-6">
          <h1 className="menu_page_title text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("Our Full Menu")}
          </h1>
          <p className="menu_page_subtitle text-xs sm:text-base text-gray-500 max-w-xl mx-auto mt-2">
            {t("Handcrafted beverages & bites, made to order just for you.")}
          </p>
        </div>

        {/* Category Title & Sort By Control Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#A1255B] tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          {/* Sort By Dropdown Control */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs sm:text-sm font-semibold text-gray-600">
              {t("Sort by:")}
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-xs sm:text-sm font-semibold text-gray-800 hover:border-[#A1255B] focus:outline-none focus:ring-1 focus:ring-[#A1255B] cursor-pointer transition-all"
              >
                <option value="newest">{t("Newest")}</option>
                <option value="price-asc">{t("Price: Low to High")}</option>
                <option value="price-desc">{t("Price: High to Low")}</option>
                <option value="name-asc">{t("Name: A-Z")}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout (Sidebar + Main Content Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Left Column: Sidebar Category Navigation Panel (Brand Colors) */}
          <aside className="md:col-span-1 space-y-4">
            <div className="menu_filter">
              <h2 className="text-xs font-black tracking-wider text-[#A1255B] uppercase mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>{t("CATEGORIES")}</span>
                <Filter className="w-3.5 h-3.5 text-[#A1255B]" />
              </h2>

              <ul className="space-y-1.5">
                {/* Featured Products */}
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("Featured")}
                    className={`btn_menu transition-all cursor-pointer border-none text-left ${
                      selectedCategory === "Featured"
                        ? "bg-[#A1255B] text-white shadow-2xs font-bold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span>{t("Featured Products")}</span>
                    <span
                      className={`txt_no ${
                        selectedCategory === "Featured"
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {getCategoryItemCount("Featured")}
                    </span>
                  </button>
                </li>

                {/* All Products Button (Highlighted maroon pill when active) */}
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className={`btn_menu transition-all cursor-pointer border-none text-left ${
                      selectedCategory === "All" || selectedCategory === "all"
                        ? "bg-[#A1255B] text-white shadow-2xs font-bold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span>{t("All Products")}</span>
                    <span
                      className={`txt_no ${
                        selectedCategory === "All" || selectedCategory === "all"
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {getCategoryItemCount("All")}
                    </span>
                  </button>
                </li>

                {/* Expandable Accordion Main Categories */}
                {MAIN_CATEGORIES.map((main) => {
                  const isMainSelected = selectedCategory.toLowerCase() === main.name.toLowerCase();
                  const isExpanded = Boolean(expandedMains[main.id]);
                  const mainCount = getCategoryItemCount(main.name);

                  return (
                    <li key={main.id} className="pt-1.5 border-t border-gray-100 first:border-none first:pt-0">
                      {/* Main Category Row */}
                      <div
                        onClick={() => {
                          setSelectedCategory(main.name);
                          setExpandedMains((prev) => ({ ...prev, [main.id]: !prev[main.id] }));
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                          isMainSelected
                            ? "bg-[#A1255B] text-white shadow-2xs"
                            : "hover:bg-gray-100 text-gray-800"
                        }`}
                      >
                        <span className="truncate">{t(main.name)}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(main.id, e)}
                            className={`p-1 rounded-full cursor-pointer border-none flex items-center justify-center ${
                              isMainSelected ? "text-white" : "text-gray-400 hover:text-gray-700"
                            }`}
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Accordion Subcategories List (Indented under Main Category) */}
                      {isExpanded && (
                        <ul className="space-y-1 mt-1 pl-4">
                          {/* All Subcategory Item */}
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedCategory(main.name)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none text-left ${
                                isMainSelected
                                  ? "text-[#A1255B] font-bold"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                              }`}
                            >
                              <span>{t("All")} {t(main.name)}</span>
                              <span className="text-[10px] text-gray-400">({mainCount})</span>
                            </button>
                          </li>

                          {/* Subcategory List Items */}
                          {main.subCategories.map((sub) => {
                            const isSubSelected = selectedCategory.toLowerCase() === sub.name.toLowerCase();
                            const subCount = getCategoryItemCount(sub.name);

                            return (
                              <li key={sub.id}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCategory(sub.name)}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none text-left ${
                                    isSubSelected
                                      ? "text-[#A1255B] font-bold bg-pink-50/70"
                                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="truncate">{t(sub.name)}</span>
                                  <span className="text-[10px] text-gray-400">({subCount})</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Right Column: Main Content Area (Product Grid & Category Headers) */}
          <main className="md:col-span-3 space-y-6">
            
            {/* Search Input Bar Pill */}
            <div className="max-w-md ml-auto">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center bg-white border border-gray-200 focus-within:border-[#A1255B] focus-within:ring-1 focus-within:ring-[#A1255B] rounded-full p-1 pl-3.5 shadow-2xs transition-all"
              >
                <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("Search product...")}
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



            {/* Product Card Grid (3 Columns on Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((item) => (
                <Card
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  discountType={item.discountType}
                  discountAmount={item.discountAmount}
                  promoEndDate={item.promoEndDate}
                  promoDaysLeft={item.promoDaysLeft}
                  category={item.category}
                  image={item.image}
                />
              ))}
            </div>

            {/* Empty State */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium">
                {t("No items found in this category.")}
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
}

export default MenupageView;
