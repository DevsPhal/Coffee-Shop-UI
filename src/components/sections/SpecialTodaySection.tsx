"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/cards/card";
import { featuredMenuHref } from "@/lib/categoryParam";
import { LoadingRegion, ProductCardSkeletons } from "@/components/ui/states";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { toStoreProduct } from "@/store/api/productAdapter";
import { useCatalog } from "@/store/api/useCatalog";
import "@/app/globals.scss";

export const HOMEPAGE_SECTION_LIMIT = 6;

export interface SpecialTodaySectionProps {
  title?: string;
  subtitle?: string;
}

export function SpecialTodaySection({
  title = "Special Today",
  subtitle = "Handcrafted daily specials picked fresh for you",
}: SpecialTodaySectionProps) {
  const { t } = useLanguage();
  const { products, isLoading, error } = useCatalog();

  const specials = products
    .filter((product) => product.discountActive)
    .slice(0, HOMEPAGE_SECTION_LIMIT)
    .map(toStoreProduct);

  if (!isLoading && specials.length === 0) return null;
  if (error && !isLoading) return null;

  return (
    <section className="homepage_crafted_section font-sans">
      <div className="homepage_section_header">
        <h2 className="homepage_section_title">{t(title)}</h2>
        <p className="homepage_section_subtitle">{t(subtitle)}</p>
        {/* Every discounted product, in the menu's Featured Products list. Phones get the phone menu. */}
        <div className="mt-4 flex justify-center">
          <Link href={featuredMenuHref("/menu")} className="ui_button_quiet nav_desktop_only">
            {t("See all")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href={featuredMenuHref("/menuphone")} className="ui_button_quiet nav_phone_only">
            {t("See all")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <LoadingRegion label="Loading specials..." className="homepage_cards_grid">
          <ProductCardSkeletons count={HOMEPAGE_SECTION_LIMIT} />
        </LoadingRegion>
      ) : (
        <div className="homepage_cards_grid">
          {specials.map((product) => (
            <Card key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default SpecialTodaySection;
