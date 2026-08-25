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
  const [touchActiveCat, setTouchActiveCat] = useState<string | null>(null);
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
    <div ref={dropdownRef} className={`category_dropdown_container ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="category_dropdown_trigger"
        aria-expanded={isOpen}
      >
        <div className="category_dropdown_trigger_content">
          {currentIcon && (
            <Image
              src={currentIcon}
              alt=""
              width={16}
              height={16}
              className="category_dropdown_trigger_icon"
            />
          )}
          <span className="category_dropdown_trigger_text">{selectedCategory}</span>
          <span className="category_dropdown_trigger_badge">
            {currentCount}
          </span>
        </div>
        <ChevronDown
          className={`category_dropdown_trigger_chevron ${isOpen ? "active" : ""}`}
        />
      </button>

      {/* Category Side Drawer Popup */}
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
              className="category_drawer_panel"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="category_drawer_header">
                <h2 className="category_drawer_title">CATEGORIES</h2>
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
              <div className="category_drawer_body">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const iconSrc = CATEGORY_ICONS[cat.toLowerCase()];
                  const count = getCategoryCount(cat);

                  return (
                    <button
                      key={cat}
                      type="button"
                      onTouchStart={() => setTouchActiveCat(cat)}
                      onTouchEnd={() => setTouchActiveCat(null)}
                      onTouchCancel={() => setTouchActiveCat(null)}
                      onClick={() => {
                        onSelectCategory(cat);
                        setIsOpen(false);
                      }}
                      className={`category_drawer_item ${isSelected ? "selected" : ""} ${touchActiveCat === cat ? "touch_active" : ""}`}
                    >
                      <div className="category_drawer_item_left">
                        {iconSrc ? (
                          <Image
                            src={iconSrc}
                            alt=""
                            width={22}
                            height={22}
                            className="category_drawer_item_icon"
                          />
                        ) : (
                          <span className="w-5.5 h-5.5" />
                        )}
                        <span className="category_drawer_item_name">{cat}</span>
                      </div>

                      <div className="category_drawer_item_right">
                        <span className="category_drawer_item_badge">
                          {count}
                        </span>
                        {isSelected && <Check className="category_drawer_item_check" />}
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
