"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";
import "@/app/globals.scss";

export const CATEGORY_ICONS: Record<string, string> = {
  all: "/icons/coffee.svg",
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

export interface CategoryDropdownProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  getCategoryCount: (category: string) => number;
  className?: string;
}

export function CategoryDropdown({
  categories,
  selectedCategory,
  onSelectCategory,
  getCategoryCount,
  className = "",
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentIcon = CATEGORY_ICONS[selectedCategory.toLowerCase()] || "/icons/coffee.svg";
  const currentCount = getCategoryCount(selectedCategory);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-3 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm sm:text-base shadow-sm transition-all duration-200 cursor-pointer min-w-[220px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          {currentIcon && (
            <Image
              src={currentIcon}
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 object-contain opacity-80"
            />
          )}
          <span>{selectedCategory}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">
            {currentCount}
          </span>
        </div>
        <ChevronDown
          className={`w-4.5 h-4.5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#a1255b]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 sm:w-72 rounded-2xl bg-white border border-gray-100 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
            Select Category
          </div>
          <div className="max-h-72 overflow-y-auto px-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const iconSrc = CATEGORY_ICONS[cat.toLowerCase()];
              const count = getCategoryCount(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer my-0.5 ${
                    isSelected
                      ? "bg-[#a1255b] text-white font-semibold shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {iconSrc ? (
                      <Image
                        src={iconSrc}
                        alt=""
                        width={18}
                        height={18}
                        className={`w-4.5 h-4.5 object-contain ${
                          isSelected ? "brightness-0 invert" : "opacity-75"
                        }`}
                      />
                    ) : (
                      <span className="w-4.5 h-4.5" />
                    )}
                    <span>{cat}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryDropdown;
