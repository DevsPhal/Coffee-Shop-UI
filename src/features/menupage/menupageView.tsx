"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/cards/card";
import { ALL_CATEGORIES } from "@/components/ui/CategoryDropdown";
import { toStoreProduct } from "@/store/api/productAdapter";
import { useCatalog, useCategories } from "@/store/api/useCatalog";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Search, ChevronDown, ChevronRight, Filter } from "lucide-react";
import "@/app/globals.scss";

/** Client-side pseudo-category: everything currently discounted. */
const FEATURED = "Featured";

export function MenupageView() {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category");
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

  const { categories } = useCategories();

  // "Featured" is a client-side view over the whole catalogue (everything discounted), not a
  // category the API knows about — so it must not be sent as a categoryId.
  const isFeatured = selectedCategory === FEATURED;
  const { products, isLoading, error } = useCatalog(
    selectedCategory === ALL_CATEGORIES || isFeatured ? undefined : selectedCategory
  );

  const rawFilteredProducts = products
    .filter((product) => (isFeatured ? product.discountActive : true))
    .filter((product) => {
      const term = searchQuery.trim().toLowerCase();
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.categoryName.toLowerCase().includes(term)
      );
    })
    .map(toStoreProduct);

  // Apply sorting
  const sortedProducts = [...rawFilteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.title.localeCompare(b.title);
    return 0; // newest/default
  });

  const getPageTitle = () => {
    if (selectedCategory === ALL_CATEGORIES) return t("All Products");
    if (selectedCategory === FEATURED) return t("Featured Products");
    return t(selectedCategory);
  };

  return (
    <div className="menu_page_wrapper font-sans min-h-screen pb-16 bg-[#F9FAFC]">
      <div className="menu_page_container max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        
        {/* Centered Menu Page Header */}
        <div className="menu_page_header text-center my-4 sm:my-6">
          <h1 className="menu_page_title text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("Our Full Menu")}
          </h1>
          <p className="menu_page_subtitle text-xs sm:text-base text-gray-500 max-w-xl mx-auto mt-2 font-medium">
            {t("Handcrafted beverages & bites, made to order just for you.")}
          </p>
        </div>

        {/* Category Title & Search / Sort Control Toolbar Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#A1255B] tracking-tight">
              {getPageTitle()}
            </h2>
            <span className="text-xs text-gray-600 ">
              {sortedProducts.length} {t(sortedProducts.length === 1 ? "Item" : "Items")}
            </span>
          </div>

          {/* Right Toolbar Controls: Search Bar & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input Bar */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center bg-white border border-gray-200 focus-within:border-[#A1255B] focus-within:ring-1 focus-within:ring-[#A1255B] p-1 pl-3.5 shadow-2xs transition-all flex-1 sm:flex-none sm:w-64"
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
                  className="text-gray-400 hover:text-gray-700 text-xs font-bold bg-gray-100 hover:bg-gray-200 w-4 h-4 flex items-center justify-center cursor-pointer shrink-0 mr-1 transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="w-8 h-8 bg-[#A1255B] hover:bg-[#881d52] text-white shadow-2xs transition-all flex items-center justify-center shrink-0 cursor-pointer border-none active:scale-95 ml-1"
                title="Search"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </form>

            {/* Sort By Dropdown Control */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                {t("Sort by:")}
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 px-3 py-1.5 pr-8 text-xs sm:text-sm font-semibold text-gray-800 hover:border-[#A1255B] focus:outline-none focus:ring-1 focus:ring-[#A1255B] cursor-pointer transition-all"
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
                    onClick={() => setSelectedCategory(FEATURED)}
                    className={`btn_menu transition-all cursor-pointer w-full flex justify-between py-2 px-2 border-none text-left ${
                      selectedCategory === FEATURED
                        ? "bg-[#A1255B]  text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="truncate">{t("Featured Products")}</span>
                    </div>
                    <span
                      className={`txt_no ${
                        selectedCategory === FEATURED
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {products.filter((p) => p.discountActive).length}
                    </span>
                  </button>
                </li>

                {/* All Products Button (Highlighted maroon pill when active) */}
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(ALL_CATEGORIES)}
                    className={`btn_menu py-2 px-2 flex justify-between align-center w-full transition-all cursor-pointer border-none text-left ${
                      selectedCategory === ALL_CATEGORIES
                        ? "bg-[#A1255B] text-white shadow-2xs font-bold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {/* test */}
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <Image
                        src="/icons/category.svg"
                        alt=""
                        width={16}
                        height={16}
                        className={`w-4 h-4 object-contain shrink-0 ${
                          selectedCategory === ALL_CATEGORIES ? "brightness-0 invert" : ""
                        }`}
                      />
                      <span className="truncate">{t("All Products")}</span>
                    </div>
                    <span
                      className={`txt_no ${
                        selectedCategory === ALL_CATEGORIES
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {categories.reduce((sum, c) => sum + c.count, 0)}
                    </span>
                  </button>
                </li>

                {/* Expandable Accordion Main Categories */}
                {/* Categories, flat — the API has no parent/child relationship between them. */}
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`btn_menu py-2 px-2 flex justify-between align-center w-full transition-all cursor-pointer border-none text-left ${
                          isSelected
                            ? "bg-[#A1255B] text-white shadow-2xs font-bold"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <span className="truncate">{t(category.name)}</span>
                        </div>
                        <span className={`txt_no ${isSelected ? "text-white" : "text-gray-600"}`}>
                          {category.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Right Column: Main Content Area (Product Grid & Category Headers) */}
          <main className="md:col-span-3 space-y-6">
            
            {/* Product Card Grid (3 Columns on Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <Card key={product.id} product={product} />
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
