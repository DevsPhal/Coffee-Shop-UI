"use client";

import React from "react";
import { Card } from "@/components/cards/card";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { toStoreProduct } from "@/store/api/productAdapter";
import { useCatalog } from "@/store/api/useCatalog";
import "@/app/globals.scss";

/** Kept in step with the "Crafted with Passion" grid, which the homepage renders at the same size. */
export const HOMEPAGE_SECTION_LIMIT = 6;

export interface SpecialTodaySectionProps {
  title?: string;
  subtitle?: string;
}

/**
 * Today's specials — the products the admin has an active discount on. This used to be a
 * hardcoded list of three product ids; now it is whatever the API reports as discounted, so
 * running a promotion in the admin surfaces it here with no code change.
 */
export function SpecialTodaySection({
  title = "Special Today",
  subtitle = "Handcrafted daily specials picked fresh for you",
}: SpecialTodaySectionProps) {
  const { t } = useLanguage();
  const { products, isLoading } = useCatalog();

  // The homepage splits the catalogue in two: everything on discount belongs here, everything
  // else to "Crafted with Passion". The cap matches that section's so a shop running several
  // promotions at once does not lose products off the bottom of either one.
  const specials = products
    .filter((product) => product.discountActive)
    .slice(0, HOMEPAGE_SECTION_LIMIT)
    .map(toStoreProduct);

  // Nothing on promotion is a normal state, not an error — the section just stands down.
  if (!isLoading && specials.length === 0) return null;

  return (
    <section className="homepage_crafted_section font-sans">
      <div className="homepage_section_header">
        <h2 className="homepage_section_title">{t(title)}</h2>
        <p className="homepage_section_subtitle">{t(subtitle)}</p>
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
          : specials.map((product) => <Card key={product.id} product={product} />)}
      </div>
    </section>
  );
}

export default SpecialTodaySection;
