import type { CustomerProductResponse, ProductSizeOptionResponse, UUID } from "./types";

/**
 * The storefront's view model for a product.
 *
 * It keeps the field names the components already use (`title`, `image`, `category`) so the
 * UI did not have to be rewritten around the API's naming — but every value comes from
 * `/api/customer/products`. Nothing here is invented; the fields the API does not provide
 * simply are not on this type.
 */
export interface StoreProduct {
  id: UUID;
  title: string;
  description: string;
  image: string | null;
  /** What the customer pays before size add-ons — already discounted. */
  price: number;
  /** The pre-discount price, present only while a discount is running. */
  originalPrice?: number;
  discountType?: "percentage" | "fixed";
  discountAmount?: number;
  discountActive: boolean;
  discountEndsAt?: string;
  category: string;
  categoryId: UUID;
  sku: string;
  unit: string;
  sizeOptions: ProductSizeOptionResponse[];
}

/** Shown when a product has no uploaded image; the API returns null rather than a default. */
export const PRODUCT_IMAGE_FALLBACK = "/images/product-placeholder.svg";

export function toStoreProduct(product: CustomerProductResponse): StoreProduct {
  return {
    id: product.id,
    title: product.name,
    description: product.description ?? "",
    image: product.imageUrl,
    price: Number(product.finalPrice),
    originalPrice: product.discountActive ? Number(product.price) : undefined,
    discountType:
      product.discountType === "PERCENTAGE"
        ? "percentage"
        : product.discountType === "FIXED"
        ? "fixed"
        : undefined,
    discountAmount:
      product.discountValue != null ? Number(product.discountValue) : undefined,
    discountActive: product.discountActive,
    discountEndsAt: product.discountEndAt ?? undefined,
    category: product.categoryName,
    categoryId: product.categoryId,
    sku: product.sku,
    unit: product.unit,
    sizeOptions: product.sizeOptions.filter((option) => option.status === "ACTIVE"),
  };
}

export function resolveProductImage(image?: string | null): string {
  return image && image.trim().length > 0 ? image : PRODUCT_IMAGE_FALLBACK;
}

/** Percentage saved, for the "20% Off" badges — derived, never stored. */
export function discountPercent(product: StoreProduct): number | null {
  if (!product.discountActive || !product.originalPrice) return null;
  if (product.originalPrice <= 0) return null;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}
