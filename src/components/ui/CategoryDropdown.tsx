"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronDown, Check, X } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Control body scroll lock when category drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const currentIcon = CATEGORY_ICONS[selectedCategory.toLowerCase()] || "/icons/coffee.svg";
  const currentCount = getCategoryCount(selectedCategory);

  return (
    <div ref={dropdownRef} className={`category-dropdown-container relative flex flex-col items-center w-full ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-trigger inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-white text-gray-900 font-bold text-xs shadow-2xs hover:bg-gray-50 transition-all cursor-pointer w-auto"
        aria-expanded={isOpen}
      >
        <div className="trigger-left-content flex items-center gap-1.5">
          {currentIcon && (
            <Image
              src={currentIcon}
              alt=""
              width={16}
              height={16}
              className="trigger-icon w-4 h-4 object-contain"
            />
          )}
          <span className="font-extrabold text-xs">{selectedCategory}</span>
          <span className="category-badge bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {currentCount}
          </span>
        </div>
        <ChevronDown
          className={`chevron-icon w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#A1255B]" : ""}`}
        />
      </button>

      {/* Category Side Drawer Popup (styled EXACTLY like Shopping Cart Drawer) */}
      {isOpen && mounted && createPortal(
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
              className="cart_drawer_panel"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="cart_drawer_header">
                <h2 className="cart_drawer_title">Select Category</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="cart_drawer_close_btn"
                  aria-label="Close categories"
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-900" />
                </button>
              </div>

              {/* Category Items List */}
              <div className="cart_drawer_body space-y-2.5 py-4">
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
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer border-none text-left ${
                        isSelected
                          ? "bg-[#A1255B] text-white shadow-md scale-[1.01]"
                          : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {iconSrc ? (
                          <Image
                            src={iconSrc}
                            alt=""
                            width={22}
                            height={22}
                            className={`w-5.5 h-5.5 object-contain ${
                              isSelected ? "brightness-0 invert" : "opacity-85"
                            }`}
                          />
                        ) : (
                          <span className="w-5.5 h-5.5" />
                        )}
                        <span className="font-extrabold text-sm">{cat}</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-black ${
                            isSelected
                              ? "bg-white/25 text-white"
                              : "bg-white text-gray-600 border border-gray-200"
                          }`}
                        >
                          {count}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
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
