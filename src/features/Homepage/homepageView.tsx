"use client";

import React from "react";
import HeroCarousel from "./components/HeroCarousel";
import SpecialTodaySection, {
  HOMEPAGE_SECTION_LIMIT,
} from "@/components/sections/SpecialTodaySection";
import ReadyToOrderSection from "@/components/ui/ReadyToOrderSection";
import { Card } from "@/components/cards/card";
import { toStoreProduct } from "@/store/api/productAdapter";
import { useCatalog } from "@/store/api/useCatalog";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

export function HomepageView() {
  const { t } = useLanguage();
  const { products, isLoading } = useCatalog();

  // The two homepage grids partition the catalogue rather than overlap: anything on an active
  // discount is shown by SpecialTodaySection, so this one carries the rest. Without the split a
  // discounted product appeared twice, once at full price and once marked down.
  const craftedProducts = products
    .filter((product) => !product.discountActive)
    .slice(0, HOMEPAGE_SECTION_LIMIT)
    .map(toStoreProduct);

  return (
    <div className="homepage_wrapper font-sans">
      <HeroCarousel />

      <SpecialTodaySection
        title="Special Today"
        subtitle="Handcrafted daily specials picked fresh for you"
      />
      {/* Nothing left at full price is a normal state — every item is on promotion — so the
          section stands down rather than showing an empty grid under its heading. */}
      {(isLoading || craftedProducts.length > 0) && (
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
            {isLoading
              ? Array.from({ length: HOMEPAGE_SECTION_LIMIT }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-2xl bg-gray-100"
                    aria-hidden
                  />
                ))
              : craftedProducts.map((product) => (
                  <Card key={product.id} product={product} />
                ))}
          </div>
        </section>
      )}
      <ReadyToOrderSection />
    </div>
  );
}

export default HomepageView;
