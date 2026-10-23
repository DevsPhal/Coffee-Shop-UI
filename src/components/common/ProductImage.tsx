"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { PRODUCT_IMAGE_FALLBACK, resolveProductImage } from "@/store/api/productAdapter";

/**
 * A product photo, framed the same way on every screen (cards, detail page, cart, checkout...).
 * `className` sizes and shapes the frame; the photo inside is always shown whole — scaled to fit,
 * centred, never cropped or stretched — whatever its shape (tall cans, wide packs, square cups).
 * A missing or broken photo falls back to the placeholder.
 */
export function ProductImage({
  src,
  alt,
  className,
  loading,
  children,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  /** Overlays such as discount badges. */
  children?: ReactNode;
}) {
  // Remember which URL failed rather than a flag, so a newly uploaded photo gets a fresh chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolved = resolveProductImage(src);
  const image = resolved === failedSrc ? PRODUCT_IMAGE_FALLBACK : resolved;

  return (
    <div className={cn("product_media", className)}>
      <Image
        src={image}
        alt={alt}
        fill
        unoptimized
        loading={loading}
        className="product_media_img"
        onError={() => {
          if (image !== PRODUCT_IMAGE_FALLBACK) setFailedSrc(image);
        }}
      />
      {children}
    </div>
  );
}
