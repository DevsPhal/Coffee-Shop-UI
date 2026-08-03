"use client";

import React from "react";
import { Card } from "@/components/cards/card";
import { PRODUCTS } from "@/data/products";
import "@/app/globals.scss";

export interface SpecialTodaySectionProps {
  title?: string;
  subtitle?: string;
}

// Special discount prices mapping for Special Today section ONLY
const SPECIAL_TODAY_DISCOUNTS: Record<string, { price: number; originalPrice: number }> = {
  "1": { price: 1.50, originalPrice: 2.00 }, // ESPRESSO
  "2": { price: 1.75, originalPrice: 2.25 }, // Ice Amacano
  "3": { price: 2.00, originalPrice: 2.50 }, // Ice Latte
};

export function SpecialTodaySection({
  title = "Special Today",
  subtitle = "Handcrafted daily specials picked fresh for you",
}: SpecialTodaySectionProps) {
  // Only slice the first 3 cards (ESPRESSO, Ice Amacano, Ice Latte)
  const specialProducts = PRODUCTS.slice(0, 3);

  return (
    <section className="homepage_crafted_section font-sans">
      {/* Section Header */}
      <div className="homepage_section_header">
        <h2 className="homepage_section_title">
          {title}
        </h2>
        <p className="homepage_section_subtitle">
          {subtitle}
        </p>
      </div>

      {/* 3 Cards Grid with Special Discounts */}
      <div className="homepage_cards_grid">
        {specialProducts.map((item) => {
          const discountInfo = SPECIAL_TODAY_DISCOUNTS[item.id];
          const displayPrice = discountInfo ? discountInfo.price : item.price;
          const displayOriginalPrice = discountInfo ? discountInfo.originalPrice : undefined;

          return (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              price={displayPrice}
              originalPrice={displayOriginalPrice}
              image={item.image}
            />
          );
        })}
      </div>
    </section>
  );
}

export default SpecialTodaySection;
