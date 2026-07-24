"use client";

import React from "react";
import HeroCarousel from "./components/HeroCarousel";
import ReadyToOrderSection from "@/components/ui/ReadyToOrderSection";
import { Card } from "@/components/cards/card";
import { PRODUCTS } from "@/data/products";
import "@/app/globals.scss";

export function HomepageView() {
  return (
    <div className="homepage_wrapper">
      {/* Hero / Banner View */}
      <HeroCarousel />

      {/* Crafted with Passion Section */}
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
