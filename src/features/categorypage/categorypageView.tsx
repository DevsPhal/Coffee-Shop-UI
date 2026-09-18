"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { CATEGORY_ICONS } from "@/components/ui/CategoryDropdown";
import { resolveProductImage } from "@/store/api/productAdapter";
import { useCatalog, useCategories } from "@/store/api/useCatalog";
import { Search, ChevronRight, Layers, ArrowUpRight, Filter } from "lucide-react";
import "@/app/globals.scss";

/**
 * Category browser.
 *
 * The API models categories as a flat list — a category has no parent and no subcategories —
 * so this is one level of real categories rather than the curated two-level taxonomy it used
 * to render. Each card's product count and preview images come from the live catalogue, so a
 * category the café adds in the admin appears here with no code change.
 */
export function CategorypageView() {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuBaseUrl = isMobile ? "/menuphone" : "/menu";

  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { products } = useCatalog();

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  /** A few product thumbnails per category, as a preview of what is inside. */
  const previewsFor = (categoryId: string) =>
    products.filter((product) => product.categoryId === categoryId).slice(0, 3);

  return (
    <div className="menu_page_wrapper font-sans min-h-screen pb-32 sm:pb-24 bg-[#F8FAFC]">
      <div className="menu_page_container max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-8 space-y-6 sm:space-y-10">
        <div className="title_category_page text-center my-3 sm:my-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("Our Categories")}
          </h1>
          <p className="text-xs sm:text-base text-gray-500 max-w-xl mx-auto mt-1 sm:mt-2 px-2">
            {t("Handcrafted beverages & bites, thoughtfully organized by category.")}
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            {t("Categories")}
          </span>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center bg-white border border-gray-200 focus-within:border-[#A1255B] p-1 pl-3.5 shadow-2xs transition-all flex-1 sm:flex-none sm:w-72"
          >
            <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search a category...")}
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none border-none p-0"
            />
          </form>
        </div>

        {/* Category Grid */}
        {isLoadingCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-gray-100"
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((category) => {
              const previews = previewsFor(category.id);
              const icon = CATEGORY_ICONS[category.name.toLowerCase()];

              return (
                <Link
                  key={category.id}
                  href={`${menuBaseUrl}?category=${encodeURIComponent(category.id)}`}
                  className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#A1255B]/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[#f0383e] shrink-0">
                        {icon ? (
                          <Image
                            src={icon}
                            alt=""
                            width={20}
                            height={20}
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <Layers className="w-5 h-5" />
                        )}
                      </span>
                      <h2 className="truncate text-base font-extrabold text-gray-900">
                        {t(category.name)}
                      </h2>
                    </div>
                    <ArrowUpRight className="w-4 h-4 shrink-0 text-gray-300 transition-colors group-hover:text-[#A1255B]" />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {category.count} {t(category.count === 1 ? "item" : "items")}
                  </p>

                  {previews.length > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      {previews.map((product) => (
                        <span
                          key={product.id}
                          className="relative h-14 w-14 overflow-hidden rounded-xl bg-gray-100"
                        >
                          <Image
                            src={resolveProductImage(product.imageUrl)}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#A1255B]">
                    {t("Browse category")}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoadingCategories && filteredCategories.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm font-medium text-gray-500">
            {t("No categories match your search.")}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategorypageView;
