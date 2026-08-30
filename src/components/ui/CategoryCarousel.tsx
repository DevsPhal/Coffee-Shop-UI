"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryCard, CategoryCardProps } from "./CategoryCard";
import { useLanguage } from "@/components/ui/translatetokhmer";

export interface CategoryCarouselProps {
  items: CategoryCardProps[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CategoryCarousel({
  items,
  title,
  subtitle,
  className = "",
}: CategoryCarouselProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(100);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const currentScroll = el.scrollLeft;
    const progress = (currentScroll / maxScroll) * 100;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
    setCanScrollLeft(currentScroll > 5);
    setCanScrollRight(currentScroll < maxScroll - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, items]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={`w-full py-4 sm:py-6 ${className}`}>
      {/* Optional Header */}
      {title && (
        <div className="mb-4 sm:mb-6 flex items-end justify-between px-1">
          <div>
            <h2 className="font-serif text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t(title)}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {t(subtitle)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Horizontally Scrollable Cards Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {items.map((item, idx) => (
          <div key={item.id || idx} className="snap-start shrink-0">
            <CategoryCard {...item} />
          </div>
        ))}
      </div>

      {/* Bottom Progress Bar & Navigation Controls */}
      <div className="flex items-center gap-4 mt-5 sm:mt-8 px-1">
        {/* Progress Line Bar */}
        <div className="relative flex-1 h-[2px] bg-gray-200/80 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-gray-900 transition-all duration-200 rounded-full"
            style={{
              width: "25%",
              left: `${(scrollProgress * 0.75)}%`,
            }}
          />
        </div>

        {/* Navigation Arrow Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-1.5 rounded-full transition-all border-none bg-transparent cursor-pointer ${
              canScrollLeft
                ? "text-gray-900 hover:bg-gray-100 active:scale-95"
                : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-1.5 rounded-full transition-all border-none bg-transparent cursor-pointer ${
              canScrollRight
                ? "text-gray-900 hover:bg-gray-100 active:scale-95"
                : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryCarousel;
