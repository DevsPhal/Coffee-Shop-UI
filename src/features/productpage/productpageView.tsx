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
  originalPrice?: number;
  description?: string;
  category?: string;
  image?: string | null;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ProductpageView({
  id: propId,
  title: propTitle,
  price: propPrice,
  originalPrice: propOriginalPrice,
  description: propDescription,
  category: propCategory,
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
  const queryOriginalPrice = searchParams.get("originalPrice")
    ? parseFloat(searchParams.get("originalPrice")!)
    : undefined;
  const queryImage = searchParams.get("image") || undefined;
  const queryDescription = searchParams.get("description") || undefined;
  const queryCategory = searchParams.get("category") || undefined;

  const effectiveId = propId || queryId;
  const effectiveTitle = propTitle || queryTitle;

  // Look up product from product list or fallback to default
  const matchedProduct =
    getProductByIdOrTitle(effectiveId, effectiveTitle) || PRODUCTS[0];

  const displayTitle = propTitle || queryTitle || matchedProduct.title;
  const displayPrice = propPrice ?? queryPrice ?? matchedProduct.price;
  const displayOriginalPrice =
    propOriginalPrice ?? queryOriginalPrice ?? matchedProduct.originalPrice;

  const discountPercent =
    displayOriginalPrice && displayOriginalPrice > displayPrice
      ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
      : 0;

  const displayDescription =
    propDescription || queryDescription || matchedProduct.description;
  const displayCategory =
    propCategory || queryCategory || matchedProduct.category || "Coffee";
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
        <h1 className="product_detail_title">Product Detail</h1>

        {/* Clickable Breadcrumbs: Products » Category » Product Title */}
        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href="/menu" className="breadcrumb_link">
            Products
          </Link>
          <span className="breadcrumb_separator">»</span>
          <Link
            href={`/menu?category=${encodeURIComponent(displayCategory)}`}
            className="breadcrumb_link"
          >
            {displayCategory}
          </Link>
          <span className="breadcrumb_separator">»</span>
          <span className="breadcrumb_current">{displayTitle}</span>
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
              className="object-cover"
              priority
            />
          ) : (
            <div className="product_image_placeholder">
              {displayTitle}
            </div>
          )}

          {/* Discount Badge on Product Image */}
          {discountPercent > 0 && (
            <span className="product_discount_badge">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Right Column: Product Information Box Card */}
        <div className="product_info_box">
          {/* Header Row: Title & Right-Aligned Price */}
          <div className="product_info_header">
            <div>
              <h2 className="product_name">{displayTitle}</h2>
              
              {/* Clickable Category Badge */}
              <div className="category_badge_wrapper">
                <Link href={`/menu?category=${encodeURIComponent(displayCategory)}`}>
                  <span className="category_badge">
                    {displayCategory}
                  </span>
                </Link>
              </div>
            </div>

            {/* Product Price & Strikethrough Original Price */}
            <div className="price_wrapper">
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="original_price">
                  ${displayOriginalPrice.toFixed(2)}
                </span>
              )}
              <span className="current_price">
                ${displayPrice.toFixed(2)}
              </span>
            </div>
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
              className="button_buy_now cursor-pointer"
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
