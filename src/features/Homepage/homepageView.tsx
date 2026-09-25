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
import { ErrorState, LoadingRegion, ProductCardSkeletons } from "@/components/ui/states";
import "@/app/globals.scss";

export function HomepageView() {
  const { t } = useLanguage();
  const { products, isLoading, error, refetch } = useCatalog();

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
      {(isLoading || error || craftedProducts.length > 0) && (
        <section className="homepage_crafted_section">
          <div className="homepage_section_header">
            <h2 className="homepage_section_title">
              {t("Crafted with Passion")}
            </h2>
            <p className="homepage_section_subtitle">
              {t("Every item is made to order - no shortcuts, no compromises")}
            </p>
          </div>
          {isLoading ? (
            <LoadingRegion label="Loading products..." className="homepage_cards_grid">
              <ProductCardSkeletons count={HOMEPAGE_SECTION_LIMIT} />
            </LoadingRegion>
          ) : error ? (
            // One error for the whole catalogue: Special Today reads the same request and
            // stands down on failure, so the page shows this once rather than twice.
            <ErrorState
              title="We couldn't load our menu"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : (
            <div className="homepage_cards_grid">
              {craftedProducts.map((product) => (
                <Card key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}
      <ReadyToOrderSection />
    </div>
  );
}

export default HomepageView;
