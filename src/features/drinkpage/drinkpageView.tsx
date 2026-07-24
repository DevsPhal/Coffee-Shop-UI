"use client";

import React from "react";
import { Card } from "@/components/cards/card";
import { PRODUCTS } from "@/data/products";
import "@/app/globals.scss";

export function DrinkpageView() {
  return (
    <div className="menu_page_wrapper font-sans">
      <div className="menu_page_container">
        {/* Header Section */}
        <div className="menu_page_header">
          <h1 className="menu_page_title">
            Our Drink Today
          </h1>
          <p className="menu_page_subtitle">
            Handcrafted beverages & bites, made to order just for you.
          </p>
        </div>

        {/* Menu Cards Grid */}
        <div className="menu_page_grid">
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
      </div>
    </div>
  );
}

export default DrinkpageView;
