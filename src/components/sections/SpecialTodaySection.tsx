"use client";

import React from "react";
import { Card } from "@/components/cards/card";
import { PRODUCTS } from "@/data/products";
import "@/app/globals.scss";

export interface SpecialTodaySectionProps {
  title?: string;
  subtitle?: string;
}

// Helper to generate dynamic ISO date string X days in the future
const getFuturePromoDate = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
};

// Special discount prices mapping for Special Today section ONLY
// When a promotion ends (0 days left), it auto-resets to a new 15-day promotion cycle
const SPECIAL_TODAY_DISCOUNTS: Record<
  string,
  { price: number; originalPrice: number; promoEndDate?: string; promoDaysLeft?: string }
> = {
  "11": { price: 2.25, originalPrice: 3.00, promoEndDate: getFuturePromoDate(15), promoDaysLeft: "15 days left" }, // -25% OFF
  "12": { price: 1.95, originalPrice: 2.50, promoEndDate: getFuturePromoDate(7), promoDaysLeft: "7 days left" },   // -22% OFF
  "13": { price: 1.60, originalPrice: 2.00, promoEndDate: getFuturePromoDate(2), promoDaysLeft: "2 days left" },   // -20% OFF
};

export function SpecialTodaySection({
  title = "Special Today",
  subtitle = "Handcrafted daily specials picked fresh for you",
}: SpecialTodaySectionProps) {
  // Display the 3 special promotion items (Blue soda, Hot Chocolate, Sting)
  const specialProducts = PRODUCTS.filter((item) => ["11", "12", "13"].includes(item.id));

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
          const promoEndDate = discountInfo?.promoEndDate || item.promoEndDate;
          const promoDaysLeft = discountInfo?.promoDaysLeft || item.promoDaysLeft;

          return (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              price={displayPrice}
              originalPrice={displayOriginalPrice}
              promoEndDate={promoEndDate}
              promoDaysLeft={promoDaysLeft}
              image={item.image}
            />
          );
        })}
      </div>
    </section>
  );
}

export default SpecialTodaySection;
