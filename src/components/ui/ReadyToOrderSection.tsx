"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "@/app/globals.scss";

export interface ReadyToOrderSectionProps {
  title?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnHref?: string;
  secondaryBtnText?: string;
  secondaryBtnHref?: string;
  className?: string;
}

export function ReadyToOrderSection({
  title = "Ready to Order?",
  description = "Browse our full menu, customise your drink, and pick it up at the counter or have it brought to your table.",
  primaryBtnText = "Start Your Order",
  primaryBtnHref = "/menu",
  secondaryBtnText = "Learn More",
  secondaryBtnHref = "/about",
  className = "",
}: ReadyToOrderSectionProps) {
  return (
    <section className={`ready_to_order_section ${className}`}>
      {/* Heading */}
      <h2 className="ready_to_order_title">
        {title}
      </h2>

      {/* Subtitle / Description */}
      <p className="ready_to_order_desc">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="ready_to_order_actions">
        {/* Primary Button */}
        <Link href={primaryBtnHref}>
          <Button className="button_pill_primary">
            {primaryBtnText}
          </Button>
        </Link>

        {/* Secondary Button */}
        <Link href={secondaryBtnHref}>
          <Button className="button_pill_secondary">
            {secondaryBtnText}
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default ReadyToOrderSection;
