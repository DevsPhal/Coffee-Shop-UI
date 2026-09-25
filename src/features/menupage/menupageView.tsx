"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/cards/card";
import { ALL_CATEGORIES, iconFor } from "@/components/ui/CategoryDropdown";
import { SortDropdown, type SortOption } from "@/components/ui/SortDropdown";
import { toStoreProduct } from "@/store/api/productAdapter";
import { useCatalog, useCategories } from "@/store/api/useCatalog";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Search, Filter, LayoutGrid, SearchX } from "lucide-react";
import {
  CategoryPillsSkeleton,
  EmptyState,
  ErrorState,
  LoadingRegion,
  ProductCardSkeletons,
  Skeleton,
} from "@/components/ui/states";
import "@/app/globals.scss";

/** Client-side pseudo-category: everything currently discounted. */
const FEATURED = "Featured";

const SORT_OPTIONS: SortOption[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
];

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

  const { categories, isLoading: isLoadingCategories } = useCategories();

  // "Featured" is a client-side view over the whole catalogue (everything discounted), not a
  // category the API knows about — so it must not be sent as a categoryId.
  const isFeatured = selectedCategory === FEATURED;
  const { products, isLoading, error, refetch } = useCatalog(
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
    // `selectedCategory` holds the category's id once a specific one is picked (that's what
    // gets compared against `category.id` for the sidebar highlight below and sent as the
    // catalogue filter above) — the id itself is never something to show a customer, so this
    // looks its name up rather than rendering the raw UUID.
    const matched = categories.find((category) => category.id === selectedCategory);
    return matched ? t(matched.name) : t("Menu");
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
            {isLoading ? (
              <Skeleton className="h-4 w-14" />
            ) : error ? null : (
              <span className="text-xs text-gray-600 ">
                {sortedProducts.length} {t(sortedProducts.length === 1 ? "Item" : "Items")}
              </span>
            )}
          </div>

          {/* Right Toolbar Controls: Search Bar & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input Bar */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center rounded-full bg-white border border-gray-200 focus-within:border-[#A1255B] focus-within:ring-1 focus-within:ring-[#A1255B] p-1 pl-3.5 shadow-2xs transition-all flex-1 sm:flex-none sm:w-64"
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
                  className="rounded-full text-gray-400 hover:text-gray-700 text-xs font-bold bg-gray-100 hover:bg-gray-200 w-4 h-4 flex items-center justify-center cursor-pointer shrink-0 mr-1 transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-[#A1255B] hover:bg-[#881d52] text-white shadow-2xs transition-all flex items-center justify-center shrink-0 cursor-pointer border-none active:scale-95 ml-1"
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
              <SortDropdown value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
            </div>
          </div>
        </div>

        {/* Category Filter Row — a horizontal, wrapping row of pills (same component style
            already used on the phone menu page) rather than a sidebar, so the product grid
            below gets the full page width. */}
        <div className="flex items-center gap-1.5 mb-3">
          <Filter className="w-3.5 h-3.5 text-[#A1255B]" />
          <span className="text-xs font-black tracking-wider text-[#A1255B] uppercase">
            {t("CATEGORIES")}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
          {isLoadingCategories ? (
            <CategoryPillsSkeleton count={7} />
          ) : (
          <>
          <button
            type="button"
            onClick={() => setSelectedCategory(FEATURED)}
            className={`category_btn ${selectedCategory === FEATURED ? "active" : ""}`}
          >
            <span>{t("Featured Products")}</span>
            <span className="category_badge">{products.filter((p) => p.discountActive).length}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory(ALL_CATEGORIES)}
            className={`category_btn ${selectedCategory === ALL_CATEGORIES ? "active" : ""}`}
          >
            <LayoutGrid className="category_btn_icon h-4.5 w-4.5" />
            <span>{t("All Products")}</span>
            <span className="category_badge">{categories.reduce((sum, c) => sum + c.count, 0)}</span>
          </button>

          {/* Categories, flat — the API has no parent/child relationship between them. */}
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            const Icon = iconFor(category.name);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`category_btn ${isSelected ? "active" : ""}`}
              >
                <Icon className="category_btn_icon h-4.5 w-4.5" />
                <span>{t(category.name)}</span>
                <span className="category_badge">{category.count}</span>
              </button>
            );
          })}
          </>
          )}
        </div>

        {/* Product Card Grid — 4 per row on desktop, now that categories no longer take up a
            sidebar column. */}
        {isLoading ? (
          <LoadingRegion
            label="Loading menu..."
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <ProductCardSkeletons count={8} />
          </LoadingRegion>
        ) : error ? (
          <ErrorState
            title="We couldn't load the menu"
            error={error}
            onRetry={() => void refetch()}
            className="my-8"
          />
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={searchQuery.trim() ? "No matching items" : "Nothing here yet"}
            message={
              searchQuery.trim()
                ? "Try a different search word or category."
                : "No items found in this category."
            }
            action={
              searchQuery.trim()
                ? { label: "Clear search", onClick: () => setSearchQuery("") }
                : { label: "View all products", onClick: () => setSelectedCategory(ALL_CATEGORIES) }
            }
            className="my-8"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MenupageView;
