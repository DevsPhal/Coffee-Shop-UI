"use client";

import React from "react";
import { Card } from "@/components/cards/card";
import { PRODUCTS } from "@/data/products";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

export interface SpecialTodaySectionProps {
  title?: string;
  subtitle?: string;
}

export function SpecialTodaySection({
  title = "Special Today",
  subtitle = "Handcrafted daily specials picked fresh for you",
}: SpecialTodaySectionProps) {
  const { t } = useLanguage();
  // Display the 3 special promotion items directly from PRODUCTS in products.ts
  const specialProducts = PRODUCTS.filter((item) => ["11", "12", "13"].includes(item.id));

  return (
    <section className="homepage_crafted_section font-sans">
      {/* Section Header */}
      <div className="homepage_section_header">
        <h2 className="homepage_section_title">
          {t(title)}
        </h2>
        <p className="homepage_section_subtitle">
          {t(subtitle)}
        </p>
      </div>

      {/* 3 Cards Grid with Prices & Discounts Directly From products.ts */}
      <div className="homepage_cards_grid">
        {specialProducts.map((item) => (
          <Card
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price}
            originalPrice={item.originalPrice}
            discountType={item.discountType}
            discountAmount={item.discountAmount}
            promoEndDate={item.promoEndDate}
            promoDaysLeft={item.promoDaysLeft}
            category={item.category}
            image={item.image}
          />
        ))}
      </div>
    </section>
  );
}

export default SpecialTodaySection;
