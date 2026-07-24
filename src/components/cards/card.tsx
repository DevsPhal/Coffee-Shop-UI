"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import "@/app/globals.scss";

export interface CardProps {
  id?: string;
  title: string;
  price?: number;
  image?: string | null;
  href?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function Card({
  id,
  title,
  price = 2.0,
  image,
  href,
  onAddToCart,
  onBuyNow,
}: CardProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const targetHref =
    href ||
    `/product?id=${encodeURIComponent(id || title)}&title=${encodeURIComponent(
      title
    )}&price=${price}${image ? `&image=${encodeURIComponent(image)}` : ""}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart();
    } else {
      addItem(
        {
          id: id || title,
          title,
          price,
          image: image || undefined,
        },
        false
      );
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBuyNow) {
      onBuyNow();
    } else {
      addItem(
        {
          id: id || title,
          title,
          price,
          image: image || undefined,
        },
        false
      );
    }
    router.push("/order");
  };

  return (
    <div className="card_item">
      {/* Clickable Image & Title Wrapper linking to Product Page */}
      <Link href={targetHref} className="block cursor-pointer group">
        {/* Image Placeholder Box */}
        <div className="card_image_box group-hover:opacity-90 transition-opacity">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="card_image"
            />
          ) : null}
        </div>

        {/* Drink Title & Price */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="card_title group-hover:underline mb-0">
            {title}
          </h3>
          <span className="text-lg font-bold text-gray-900 shrink-0">
            ${price.toFixed(2)}
          </span>
        </div>
      </Link>

      {/* Action Buttons Row */}
      <div className="card_actions">
        <Button
          type="button"
          onClick={handleAddToCart}
          className="button_add_cart cursor-pointer"
        >
          Add to Cart
        </Button>

        <Button
          type="button"
          onClick={handleBuyNow}
          className="button_buy_now cursor-pointer flex-1"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}

export default Card;