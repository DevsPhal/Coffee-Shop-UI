"use client";

import React from "react";
import HeroCarousel from "./components/HeroCarousel";
import SpecialTodaySection from "@/components/sections/SpecialTodaySection";
import ReadyToOrderSection from "@/components/ui/ReadyToOrderSection";
import { Card } from "@/components/cards/card";
import { PRODUCTS } from "@/data/products";
import "@/app/globals.scss";

export function HomepageView() {
  return (
    <div className="homepage_wrapper font-sans">
      {/* Hero 3D Coverflow Carousel */}
      <HeroCarousel />

      {/* Special Today Section (3 Featured Cards Only) */}
      <SpecialTodaySection
        title="Special Today"
        subtitle="Handcrafted daily specials picked fresh for you"
      />

      {/* Crafted with Passion Section (All Products Grid) */}
      <section className="homepage_crafted_section">
        {/* Section Header */}
        <div className="homepage_section_header">
          <h2 className="homepage_section_title">
            Crafted with Passion
          </h2>
          <p className="homepage_section_subtitle">
            Every item is made to order - no shortcuts, no compromises
          </p>
        </div>

        {/* Cards Grid */}
        <div className="homepage_cards_grid">
          {PRODUCTS.map((item) => (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              originalPrice={item.originalPrice}
              promoDaysLeft={item.promoDaysLeft}
              image={item.image}
            />
          ))}
        </div>
      </section>

      {/* Ready to Order? Section */}
      <ReadyToOrderSection />
    </div>
  );
}

export default HomepageView;
