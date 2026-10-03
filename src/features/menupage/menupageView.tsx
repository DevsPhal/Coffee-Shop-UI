"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/cards/card";
import { ALL_CATEGORIES, CategoryDropdown } from "@/components/ui/CategoryDropdown";
import { SortDropdown, type SortOption } from "@/components/ui/SortDropdown";
import { toStoreProduct } from "@/store/api/productAdapter";
import { useCatalog, useCategories } from "@/store/api/useCatalog";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { Search, SearchX } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingRegion,
  ProductCardSkeletons,
  Skeleton,
} from "@/components/ui/states";
import { toast } from "@/components/ui/toast";
import "@/app/globals.scss";
import { usePersistentState } from "@/hooks/usePersistentState";
import { isCategoryId, useCategoryQuery } from "@/lib/categoryParam";

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

  const [selectedCategory, setSelectedCategory] = usePersistentState<string>("menu:selectedCategory", ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = usePersistentState<string>("menu:searchQuery", "");
  const [sortBy, setSortBy] = usePersistentState<string>("menu:sortBy", "newest");

  const { categories } = useCategories();
  useCategoryQuery({ queryCategory, selectedCategory, setSelectedCategory, categories, specialValues: [FEATURED] });

  const isFeatured = selectedCategory === FEATURED;
  const { products, isLoading, error, refetch } = useCatalog(
    isCategoryId(selectedCategory) ? selectedCategory : undefined
  );

  // Already showing everything and it's still empty: switching category would do nothing, so say why.
  const showAllOrNotify = () => {
    if (selectedCategory === ALL_CATEGORIES) {
      void refetch();
      toast.add({ type: "info", description: "The menu is empty right now — please check back soon." });
      return;
    }
    setSelectedCategory(ALL_CATEGORIES);
  };

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

  const sortedProducts = [...rawFilteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.title.localeCompare(b.title);
    return 0;
  });

  const getPageTitle = () => {
    if (selectedCategory === ALL_CATEGORIES) return t("All Products");
    if (selectedCategory === FEATURED) return t("Featured Products");
    const matched = categories.find((category) => category.id === selectedCategory);
    return matched ? t(matched.name) : t("Menu");
  };

  return (
    <div className="menu_page_wrapper font-sans min-h-screen pb-16 bg-[#F9FAFC]">
      <div className="menu_page_container max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        
        <div className="menu_page_header text-center my-4 sm:my-6">
          <h1 className="menu_page_title text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("Our Full Menu")}
          </h1>
          <p className="menu_page_subtitle text-xs sm:text-base text-gray-500 max-w-xl mx-auto mt-2 font-medium">
            {t("Handcrafted beverages & bites, made to order just for you.")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#A1255B] tracking-tight whitespace-nowrap">
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

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                {t("Category:")}
              </span>
              <CategoryDropdown
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                leadingEntries={[
                  {
                    id: FEATURED,
                    name: "Featured Products",
                    count: products.filter((p) => p.discountActive).length,
                  },
                ]}
              />
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center rounded-full bg-white border border-gray-200 focus-within:border-[#A1255B] focus-within:ring-1 focus-within:ring-[#A1255B] p-1 pl-3.5 shadow-2xs transition-all flex-1 min-w-[12rem] lg:flex-none lg:w-64"
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

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                {t("Sort by:")}
              </span>
              <SortDropdown value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingRegion
            label="Loading menu..."
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
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
                : { label: "View all products", onClick: showAllOrNotify }
            }
            className="my-8"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
