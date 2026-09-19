"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Check,
  X,
  LayoutGrid,
  Coffee,
  Package,
  Cookie,
  Beer,
  CupSoda,
  Snowflake,
  Flame,
  Droplet,
  IceCreamCone,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useCategories, type CatalogCategory } from "@/store/api/useCatalog";
import "@/app/globals.scss";

/**
 * Icon per category name. Purely presentational — the API has no icon field — and every
 * unknown name falls back, so a category the café adds later still renders.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  category: LayoutGrid,
  beverage: Coffee,
  "fresh drink": Package,
  snack: Cookie,
  beer: Beer,
  "soft drink": CupSoda,
  "ice coffee": Snowflake,
  "iced coffee": Snowflake,
  "hot coffee": Flame,
  "iced tea": Package,
  "hot tea": Flame,
  passion: Package,
  "pure water": Droplet,
  "pour water": Droplet,
  "energy drink": CupSoda,
  noddle: Cookie,
  noodle: Cookie,
  eggs: Cookie,
  iced: Snowflake,
  hot: Flame,
  coffee: Coffee,
  frappe: IceCreamCone,
  signature: Star,
  water: Droplet,
  material: Package,
  tea: Package,
  pastries: Cookie,
};

export const iconFor = (name: string): LucideIcon =>
  CATEGORY_ICONS[name.toLowerCase()] || Coffee;

/** "All" is a client-side pseudo-category, not something the API returns. */
export const ALL_CATEGORIES = "All";

export interface CategoryDropdownProps {
  /** Selected category id, or ALL_CATEGORIES. */
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

/**
 * Category picker driven by the live catalogue.
 *
 * The API models categories as a flat list — there is no parent/child relationship on a
 * category — so this is a single-level list rather than the accordion it used to be, and the
 * counts are real product counts rather than a hardcoded table.
 */
export function CategoryDropdown({
  selectedCategory,
  onSelectCategory,
  className = "",
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [touchActiveCat, setTouchActiveCat] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const { categories, isLoading } = useCategories();

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  const entries: CatalogCategory[] = [
    { id: ALL_CATEGORIES, name: ALL_CATEGORIES, count: totalCount },
    ...categories,
  ];

  const current =
    entries.find((entry) => entry.id === selectedCategory) ?? entries[0];

  const renderCurrentIcon = () => {
    const Icon = iconFor(current?.name ?? ALL_CATEGORIES);
    return <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#A1255B]" />;
  };

  const renderCategoryItem = (entry: CatalogCategory) => {
    const isSelected = selectedCategory === entry.id;
    const Icon = iconFor(entry.name);

    return (
      <button
        key={entry.id}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => {
          onSelectCategory(entry.id);
          setIsOpen(false);
        }}
        className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs sm:text-sm font-bold text-gray-900 hover:bg-gray-100 transition-all cursor-pointer border-none text-left select-none ${
          isSelected ? "bg-[#A1255B] !text-white shadow-2xs" : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-[#A1255B]"}`} />
          <span className="truncate">{t(entry.name)}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
              isSelected
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {entry.count}
          </span>
          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-0.5" />}
        </div>
      </button>
    );
  };

  const renderMobileCategoryItem = (entry: CatalogCategory) => {
    const isSelected = selectedCategory === entry.id;
    const Icon = iconFor(entry.name);

    return (
      <button
        key={entry.id}
        type="button"
        onTouchStart={() => setTouchActiveCat(entry.id)}
        onTouchEnd={() => setTouchActiveCat(null)}
        onTouchCancel={() => setTouchActiveCat(null)}
        onClick={() => {
          onSelectCategory(entry.id);
          setIsOpen(false);
        }}
        className={`category_drawer_item font-extrabold ${
          isSelected ? "selected" : ""
        } ${touchActiveCat === entry.id ? "touch_active" : ""}`}
      >
        <div className="category_drawer_item_left flex items-center gap-2">
          <Icon className="category_drawer_item_icon h-5 w-5 text-[#A1255B]" />
          <span className="category_drawer_item_name">{t(entry.name)}</span>
        </div>

        <div className="category_drawer_item_right flex items-center gap-2">
          <span className="category_drawer_item_badge">{entry.count}</span>
          {isSelected && <Check className="category_drawer_item_check" />}
        </div>
      </button>
    );
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 border border-gray-200 bg-white hover:border-[#A1255B] text-gray-900 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer select-none"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {renderCurrentIcon()}
        <span>{t(current?.name ?? ALL_CATEGORIES)}</span>
        <span className="text-gray-700 text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 shrink-0">
          {isLoading ? "…" : current?.count ?? 0}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#A1255B]" : ""
          }`}
        />
      </button>

      {isOpen && !isMobile && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-2xl shadow-xl p-2 max-h-96 overflow-y-auto space-y-1 transition-all duration-150 animate-in fade-in slide-in-from-top-2"
        >
          {isLoading ? (
            <p className="px-3 py-4 text-xs text-gray-400">{t("Loading categories…")}</p>
          ) : (
            entries.map(renderCategoryItem)
          )}
        </div>
      )}

      {isOpen &&
        isMobile &&
        mounted &&
        createPortal(
          <div className="cart_drawer_wrapper">
            <div
              className="cart_drawer_backdrop"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div
              className="cart_drawer_panel_container"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="category_drawer_panel"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="category_drawer_header">
                  <h2 className="category_drawer_title">{t("CATEGORIES")}</h2>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="cart_drawer_close_btn"
                    aria-label="Close categories"
                  >
                    <X className="w-5 h-5 text-gray-500 hover:text-gray-900" />
                  </button>
                </div>

                <div className="category_drawer_body space-y-2">
                  {isLoading ? (
                    <p className="px-3 py-4 text-xs text-gray-400">
                      {t("Loading categories…")}
                    </p>
                  ) : (
                    entries.map(renderMobileCategoryItem)
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default CategoryDropdown;
