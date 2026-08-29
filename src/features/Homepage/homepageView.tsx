"use client";

import React from "react";
import HeroCarousel from "./components/HeroCarousel";
import SpecialTodaySection from "@/components/sections/SpecialTodaySection";
import ReadyToOrderSection from "@/components/ui/ReadyToOrderSection";
import { Card } from "@/components/cards/card";
import { PRODUCTS } from "@/data/products";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

export function HomepageView() {
  const { t } = useLanguage();

  return (
    <div className="homepage_wrapper font-sans">
      <HeroCarousel />

      <SpecialTodaySection
        title="Special Today"
        subtitle="Handcrafted daily specials picked fresh for you"
      />
      <section className="homepage_crafted_section">
        <div className="homepage_section_header">
          <h2 className="homepage_section_title">
            {t("Crafted with Passion")}
          </h2>
          <p className="homepage_section_subtitle">
            {t("Every item is made to order - no shortcuts, no compromises")}
          </p>
        </div>
        <div className="homepage_cards_grid">
          {PRODUCTS.slice(0, 6).map((item) => (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              originalPrice={item.originalPrice}
              discountType={item.discountType}
              discountAmount={item.discountAmount}
              promoDaysLeft={item.promoDaysLeft}
              image={item.image}
            />
          ))}
        </div>
      </section>
      <ReadyToOrderSection />
    </div>
  );
}

export default HomepageView;
