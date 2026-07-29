"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import "@/app/globals.scss";

const DEFAULT_IMAGES: Record<string, string> = {
  "1": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80",
  "2": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80",
  "3": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80",
};

const GENERIC_COFFEE_IMG =
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80";

export interface CardProps {
  id?: string;
  title: string;
  price?: number;
  image?: string | null;
  href?: string;
  variant?: "default" | "phone";
  isSelected?: boolean;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  onOpenInfo?: () => void;
}

export function Card({
  id,
  title,
  price = 2.0,
  image,
  href,
  variant = "default",
  isSelected = false,
  onAddToCart,
  onBuyNow,
  onOpenInfo,
}: CardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const imgSrc =
    image || (id && DEFAULT_IMAGES[id]) || GENERIC_COFFEE_IMG;

  const targetHref =
    href ||
    `/product?id=${encodeURIComponent(id || title)}&title=${encodeURIComponent(
      title
    )}&price=${price}${imgSrc ? `&image=${encodeURIComponent(imgSrc)}` : ""}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    } else {
      addItem(
        {
          id: id || title,
          title,
          price,
          image: imgSrc,
        },
        false
      );
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
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
          image: imgSrc,
        },
        false
      );
    }
    router.push("/order");
  };

  // Phone screen horizontal card design (matching picture)
  if (variant === "phone") {
    return (
      <div
        className={`relative flex items-center justify-between p-3 sm:p-3.5 rounded-[22px] bg-white transition-all duration-200 cursor-pointer ${
          isSelected
            ? "border-[1.5px] border-[#931B42] shadow-md shadow-[#931B42]/10"
            : "border border-[#F3E8EC] hover:border-[#931B42]/40 shadow-sm"
        }`}
      >
        {/* Left Image */}
        <Link href={targetHref} className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 bg-gray-100 block">
          <Image
            src={imgSrc}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 640px) 80px, 88px"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Middle Details */}
        <div className="flex-1 min-w-0 px-3 sm:px-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={targetHref}
              className="text-[#931B42] font-bold text-base sm:text-[17px] leading-snug tracking-tight truncate hover:underline"
            >
              {title}
            </Link>
            <button
              type="button"
              title="Info"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenInfo) onOpenInfo();
              }}
              className="w-4 h-4 rounded-full border border-[#931B42] text-[#931B42] flex items-center justify-center text-[10px] font-semibold hover:bg-[#931B42] hover:text-white transition-colors shrink-0"
            >
              i
            </button>
          </div>

          <div className="text-xs font-normal text-gray-400 mt-1 mb-0.5">
            Price
          </div>

          <div className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            $ {price.toFixed(2)}
          </div>
        </div>

        {/* Right Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider text-white shadow-md transition-all duration-200 shrink-0 ${
            added
              ? "bg-emerald-600 shadow-emerald-600/30 scale-95"
              : "bg-[#931B42] hover:bg-[#7b1435] shadow-[#931B42]/30 hover:shadow-lg active:scale-95"
          }`}
        >
          {added ? "ADDED ✓" : "+ ADD"}
        </button>
      </div>
    );
  }

  // Default Grid Card
  return (
    <div className="card_item">
      <Link href={targetHref} className="block cursor-pointer group">
        <div className="card_image_box group-hover:opacity-90 transition-opacity">
          <Image
            src={imgSrc}
            alt={title}
            fill
            unoptimized
            className="card_image object-cover"
          />
        </div>

        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="card_title group-hover:underline mb-0">
            {title}
          </h3>
          <span className="text-lg font-bold text-gray-900 shrink-0">
            ${price.toFixed(2)}
          </span>
        </div>
      </Link>

      <div className="card_actions">
        <Button
          type="button"
          onClick={handleAddToCart}
          className="button_add_cart cursor-pointer"
        >
          {added ? "Added ✓" : "Add to Cart"}
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