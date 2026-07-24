"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { getProductByIdOrTitle, PRODUCTS } from "@/data/products";
import "@/app/globals.scss";

export interface ProductpageViewProps {
  id?: string;
  title?: string;
  price?: number;
  description?: string;
  image?: string | null;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ProductpageView({
  id: propId,
  title: propTitle,
  price: propPrice,
  description: propDescription,
  image: propImage,
  onAddToCart,
  onBuyNow,
}: ProductpageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  // Read search params as fallback if props aren't provided
  const queryId = searchParams.get("id") || undefined;
  const queryTitle = searchParams.get("title") || undefined;
  const queryPrice = searchParams.get("price")
    ? parseFloat(searchParams.get("price")!)
    : undefined;
  const queryImage = searchParams.get("image") || undefined;
  const queryDescription = searchParams.get("description") || undefined;

  const effectiveId = propId || queryId;
  const effectiveTitle = propTitle || queryTitle;

  // Look up product from product list or fallback to default
  const matchedProduct =
    getProductByIdOrTitle(effectiveId, effectiveTitle) || PRODUCTS[0];

  const displayTitle = propTitle || queryTitle || matchedProduct.title;
  const displayPrice = propPrice ?? queryPrice ?? matchedProduct.price;
  const displayDescription =
    propDescription || queryDescription || matchedProduct.description;
  const displayImage =
    propImage !== undefined
      ? propImage
      : queryImage || matchedProduct.image || null;
  const displayId = effectiveId || matchedProduct.id;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    } else {
      addItem({
        id: displayId,
        title: displayTitle,
        price: displayPrice,
        image: displayImage || undefined,
      });
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow();
    } else {
      addItem(
        {
          id: displayId,
          title: displayTitle,
          price: displayPrice,
          image: displayImage || undefined,
        },
        false
      );
    }
    router.push("/order");
  };

  return (
    <div className="product_detail_container font-sans">
      {/* Header & Breadcrumb Section */}
      <div className="product_detail_header">
        <h1 className="product_detail_title text-gray-900 font-bold">Product Detail</h1>

        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href="/menu" className="breadcrumb_link">
            Products
          </Link>
          <span className="breadcrumb_separator">»</span>
          <span className="breadcrumb_current">Product Detail</span>
        </nav>
      </div>

      {/* Main 2-Column Product Detail Layout */}
      <div className="product_detail_grid">
        {/* Left Column: Image Box */}
        <div className="product_image_container">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={displayTitle}
              fill
              className="object-cover rounded-3xl"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-3xl text-gray-400 font-semibold text-xl">
              {displayTitle}
            </div>
          )}
        </div>

        {/* Right Column: Product Information */}
        <div className="product_info_box">
          {/* Product Title */}
          <h2 className="product_name">{displayTitle}</h2>

          {/* Product Price */}
          <div className="text-2xl font-bold text-gray-900 mb-3">
            ${displayPrice.toFixed(2)}
          </div>

          {/* Product Description */}
          <p className="product_description">{displayDescription}</p>

          {/* Action Buttons Row */}
          <div className="product_actions_row">
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
      </div>
    </div>
  );
}

export default ProductpageView;
