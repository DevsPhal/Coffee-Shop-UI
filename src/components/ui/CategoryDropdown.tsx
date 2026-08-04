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
    <div ref={dropdownRef} className={`category-dropdown-container ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-trigger"
        aria-expanded={isOpen}
      >
        <div className="trigger-left-content">
          {currentIcon && (
            <Image
              src={currentIcon}
              alt=""
              width={20}
              height={20}
              className="trigger-icon"
            />
          )}
          <span>{selectedCategory}</span>
          <span className="category-badge">
            {currentCount}
          </span>
        </div>
        <ChevronDown
          className={`chevron-icon ${isOpen ? "chevron-icon-active" : ""}`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            Select Category
          </div>
          <div className="dropdown-scroll-area">
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
                  className={`dropdown-item ${
                    isSelected
                      ? "dropdown-item-selected"
                      : "dropdown-item-unselected"
                  }`}
                >
                  <div className="item-left-content">
                    {iconSrc ? (
                      <Image
                        src={iconSrc}
                        alt=""
                        width={18}
                        height={18}
                        className={
                          isSelected ? "item-icon-selected" : "item-icon-unselected"
                        }
                      />
                    ) : (
                      <span className="item-icon-placeholder" />
                    )}
                    <span>{cat}</span>
                  </div>

                  <div className="item-right-content">
                    <span
                      className={
                        isSelected
                          ? "count-badge-selected"
                          : "count-badge-unselected"
                      }
                    >
                      {count}
                    </span>
                    {isSelected && <Check className="check-icon" />}
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
