"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronDown, ChevronRight, Check, X, Layers } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { MAIN_CATEGORIES, MainCategoryConfig, getCategoryItemCount } from "@/data/products";
import "@/app/globals.scss";

export const CATEGORY_ICONS: Record<string, string> = {
  all: "/icons/category.svg",
  category: "/icons/category.svg",
  beverage: "/icons/coffee.svg",
  "fresh drink": "/icons/material.svg",
  snack: "/icons/snack.svg",
  beer: "/icons/beer.svg",
  "soft drink": "/icons/soft_drink.svg",
  "ice coffee": "/icons/iced.svg",
  "iced coffee": "/icons/iced.svg",
  "hot coffee": "/icons/hot.svg",
  "iced tea": "/icons/material.svg",
  "hot tea": "/icons/hot.svg",
  passion: "/icons/material.svg",
  "pure water": "/icons/water.svg",
  "pour water": "/icons/water.svg",
  "energy drink": "/icons/soft_drink.svg",
  noddle: "/icons/snack.svg",
  noodle: "/icons/snack.svg",
  eggs: "/icons/snack.svg",
  iced: "/icons/iced.svg",
  hot: "/icons/hot.svg",
  coffee: "/icons/coffee.svg",
  frappe: "/icons/frappe.svg",
  signature: "/icons/signature.svg",
  water: "/icons/water.svg",
  material: "/icons/material.svg",
};

export interface CategoryDropdownProps {
  categories?: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  getCategoryCount?: (category: string) => number;
  className?: string;
}

export function CategoryDropdown({
  selectedCategory,
  onSelectCategory,
  getCategoryCount = getCategoryItemCount,
  className = "",
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [touchActiveCat, setTouchActiveCat] = useState<string | null>(null);
  const [expandedMains, setExpandedMains] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lock body scroll ONLY on mobile when side drawer is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMobile]);

  // Auto-expand main category section if selectedCategory belongs to it
  useEffect(() => {
    if (!isOpen) return;
    const autoExpanded: Record<string, boolean> = {};
    MAIN_CATEGORIES.forEach((main) => {
      const isMainMatch = selectedCategory.toLowerCase() === main.name.toLowerCase();
      const isSubMatch = main.subCategories.some(
        (s) => s.name.toLowerCase() === selectedCategory.toLowerCase()
      );
      if (isMainMatch || isSubMatch) {
        autoExpanded[main.id] = true;
      }
    });
    setExpandedMains((prev) => ({ ...autoExpanded, ...prev }));
  }, [isOpen, selectedCategory]);

  const toggleExpand = (mainId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMains((prev) => ({
      ...prev,
      [mainId]: !prev[mainId],
    }));
  };

  const currentIcon = CATEGORY_ICONS[selectedCategory.toLowerCase()] || "/icons/coffee.svg";
  const currentCount = getCategoryCount(selectedCategory);

  const renderCategoryItem = (catName: string, isSub: boolean = false) => {
    const isSelected = selectedCategory === catName;
    const iconSrc = CATEGORY_ICONS[catName.toLowerCase()] || "/icons/coffee.svg";
    const count = getCategoryCount(catName);

    return (
      <button
        key={catName}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => {
          onSelectCategory(catName);
          setIsOpen(false);
        }}
        className={`w-full flex items-center justify-between py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border-none text-left select-none ${
          isSub ? "pl-7 pr-3 text-gray-700 hover:bg-pink-50/60" : "px-3 font-bold text-gray-900 hover:bg-gray-100"
        } ${
          isSelected
            ? "bg-[#A1255B] !text-white shadow-2xs"
            : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {isSub ? (
            <span className={`text-xs ${isSelected ? "text-white" : "text-[#A1255B]"}`}>↳</span>
          ) : null}
          {iconSrc && (
            <Image
              src={iconSrc}
              alt=""
              width={18}
              height={18}
              className={`w-4 h-4 object-contain shrink-0 ${
                isSelected ? "brightness-0 invert" : ""
              }`}
            />
          )}
          <span className="truncate">{t(catName)}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
              isSelected
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {count}
          </span>
          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-0.5" />}
        </div>
      </button>
    );
  };

  const renderMainCategoryAccordion = (main: MainCategoryConfig) => {
    const isSelected = selectedCategory.toLowerCase() === main.name.toLowerCase();
    const isExpanded = Boolean(expandedMains[main.id]);
    const iconSrc = CATEGORY_ICONS[main.name.toLowerCase()] || "/icons/coffee.svg";
    const count = getCategoryCount(main.name);

    return (
      <div key={main.id} className="pt-1.5 border-t border-gray-100 first:border-none first:pt-0">
        {/* Main Category Header Button */}
        <div
          onClick={() => {
            onSelectCategory(main.name);
            setExpandedMains((prev) => ({ ...prev, [main.id]: !prev[main.id] }));
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
            isSelected
              ? "bg-[#A1255B] text-white shadow-2xs"
              : "hover:bg-gray-100 text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            {iconSrc && (
              <Image
                src={iconSrc}
                alt=""
                width={18}
                height={18}
                className={`w-4 h-4 object-contain shrink-0 ${
                  isSelected ? "brightness-0 invert" : ""
                }`}
              />
            )}
            <span className="truncate">{t(main.name)}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {count}
            </span>
            <button
              type="button"
              onClick={(e) => toggleExpand(main.id, e)}
              className={`p-1 rounded-full transition-transform duration-200 cursor-pointer border-none flex items-center justify-center ${
                isSelected ? "text-white hover:bg-white/20" : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"
              }`}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Accordion Subcategories List */}
        {isExpanded && (
          <div className="space-y-0.5 mt-0.5 pl-1 transition-all duration-200 animate-in fade-in slide-in-from-top-1">
            {main.subCategories.map((sub) => renderCategoryItem(sub.name, true))}
          </div>
        )}
      </div>
    );
  };

  const renderMobileCategoryItem = (catName: string, isSub: boolean = false) => {
    const isSelected = selectedCategory === catName;
    const iconSrc = CATEGORY_ICONS[catName.toLowerCase()] || "/icons/coffee.svg";
    const count = getCategoryCount(catName);

    return (
      <button
        key={catName}
        type="button"
        onTouchStart={() => setTouchActiveCat(catName)}
        onTouchEnd={() => setTouchActiveCat(null)}
        onTouchCancel={() => setTouchActiveCat(null)}
        onClick={() => {
          onSelectCategory(catName);
          setIsOpen(false);
        }}
        className={`category_drawer_item ${isSelected ? "selected" : ""} ${
          touchActiveCat === catName ? "touch_active" : ""
        } ${isSub ? "!pl-8 text-sm" : "font-extrabold"}`}
      >
        <div className="category_drawer_item_left flex items-center gap-2">
          {isSub && <span className="text-xs text-[#A1255B]">↳</span>}
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt=""
              width={20}
              height={20}
              className="category_drawer_item_icon object-contain"
            />
          ) : (
            <span className="w-5 h-5" />
          )}
          <span className="category_drawer_item_name">{t(catName)}</span>
        </div>

        <div className="category_drawer_item_right flex items-center gap-2">
          <span className="category_drawer_item_badge">
            {count}
          </span>
          {isSelected && <Check className="category_drawer_item_check" />}
        </div>
      </button>
    );
  };

  const renderMobileMainCategoryAccordion = (main: MainCategoryConfig) => {
    const isSelected = selectedCategory.toLowerCase() === main.name.toLowerCase();
    const isExpanded = Boolean(expandedMains[main.id]);
    const iconSrc = CATEGORY_ICONS[main.name.toLowerCase()] || "/icons/coffee.svg";
    const count = getCategoryCount(main.name);

    return (
      <div key={main.id} className="pt-2 border-t border-gray-100 space-y-1">
        <div
          onTouchStart={() => setTouchActiveCat(main.name)}
          onTouchEnd={() => setTouchActiveCat(null)}
          onTouchCancel={() => setTouchActiveCat(null)}
          onClick={() => {
            onSelectCategory(main.name);
            setExpandedMains((prev) => ({ ...prev, [main.id]: !prev[main.id] }));
          }}
          className={`category_drawer_item font-extrabold ${
            isSelected ? "selected" : ""
          } ${touchActiveCat === main.name ? "touch_active" : ""}`}
        >
          <div className="category_drawer_item_left flex items-center gap-2">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt=""
                width={20}
                height={20}
                className="category_drawer_item_icon object-contain"
              />
            ) : (
              <span className="w-5 h-5" />
            )}
            <span className="category_drawer_item_name">{t(main.name)}</span>
          </div>

          <div className="category_drawer_item_right flex items-center gap-2">
            <span className="category_drawer_item_badge">{count}</span>
            <button
              type="button"
              onClick={(e) => toggleExpand(main.id, e)}
              className="p-1 rounded-full cursor-pointer border-none flex items-center justify-center"
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Subcategories (Shown when expanded) */}
        {isExpanded && (
          <div className="space-y-1 pl-2 animate-in fade-in duration-150">
            {main.subCategories.map((sub) => renderMobileCategoryItem(sub.name, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 border border-gray-200 bg-white hover:border-[#A1255B] text-gray-900 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer select-none"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {currentIcon && (
          <Image
            src={currentIcon}
            alt=""
            width={16}
            height={16}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0"
          />
        )}
        <span>{t(selectedCategory)}</span>
        <span className="text-gray-700 text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 shrink-0">
          {currentCount}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#A1255B]" : ""
          }`}
        />
      </button>

      {/* Desktop Floating Dropdown Popover */}
      {isOpen && !isMobile && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-2xl shadow-xl p-2 max-h-96 overflow-y-auto space-y-1 transition-all duration-150 animate-in fade-in slide-in-from-top-2"
        >
          {/* All Categories Option */}
          {renderCategoryItem("All")}

          {/* Accordion Main Categories & Subcategories */}
          {MAIN_CATEGORIES.map((main) => renderMainCategoryAccordion(main))}
        </div>
      )}

      {/* Phone Screen Side Drawer Panel */}
      {isOpen && isMobile && mounted && createPortal(
        <div className="cart_drawer_wrapper">
          {/* Backdrop overlay */}
          <div
            className="cart_drawer_backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel Container */}
          <div className="cart_drawer_panel_container" onClick={() => setIsOpen(false)}>
            <div
              className="category_drawer_panel"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
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

              {/* Category Items List with Accordion Sections */}
              <div className="category_drawer_body space-y-2">
                {/* All Option */}
                {renderMobileCategoryItem("All")}

                {/* Main & Sub Categories Accordion */}
                {MAIN_CATEGORIES.map((main) => renderMobileMainCategoryAccordion(main))}
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
