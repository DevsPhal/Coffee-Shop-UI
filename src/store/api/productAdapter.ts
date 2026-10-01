import { toTitleCase } from "@/lib/utils";
import type { CategoryGroup, CustomerProductResponse, ProductExtraResponse, ProductVariantResponse, SellUnit, UUID } from "./types";

export interface StoreProduct {
  id: UUID;
  title: string;
  description: string;
  image: string | null;
  price: number;
  originalPrice?: number;
  discountType?: "percentage" | "fixed";
  discountAmount?: number;
  discountActive: boolean;
  discountEndsAt?: string;
  category: string;
  categoryId: UUID;
  categoryGroup: CategoryGroup;
  sku: string;
  sellUnit: SellUnit;
  variants: ProductVariantResponse[];
  extras: ProductExtraResponse[];
}

export const PRODUCT_IMAGE_FALLBACK = "/images/product-placeholder.svg";

export function toStoreProduct(product: CustomerProductResponse): StoreProduct {
  const activeVariants = (product.variants ?? [])
    .filter((variant) => variant.status === "ACTIVE")
    .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
  const defaultVariant = activeVariants[0];
  const price = Number(defaultVariant?.finalPrice ?? 0);
  const originalPrice = Number(defaultVariant?.price ?? 0);

  return {
    id: product.id,
    title: toTitleCase(product.name),
    description: product.description ?? "",
    image: product.imageUrl,
    price,
    originalPrice: product.discountActive && originalPrice > price ? originalPrice : undefined,
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
    category: toTitleCase(product.categoryName),
    categoryId: product.categoryId,
    categoryGroup: product.categoryGroup,
    sku: product.sku,
    sellUnit: product.sellUnit,
    variants: activeVariants,
    extras: (product.extras ?? []).filter((extra) => extra.status === "ACTIVE"),
  };
}

export interface DrinkCustomizationFlags {
  ice: boolean;
  sugar: boolean;
  milk: boolean;
}

const HOT_KEYWORD = /\bhot\b/;
const MILK_KEYWORDS = /\b(milk|coffee|latte|cappuccino|mocha|matcha|chocolate|cocoa|smoothie)\b/;
const MILK_DRINK_NAME = /\b(milk|latte|cappuccino|mocha|macchiato|flat white|frappe|frappuccino|matcha|chocolate|cocoa|smoothie)\b/;
const NO_MILK_NAME = /\b(americano|espresso|black|cold brew|ristretto|lungo|soda|juice|lemonade|sparkling|tonic|mojito)\b/;

export function getDrinkCustomization(product: {
  categoryGroup: CategoryGroup;
  title?: string;
  category?: string;
  name?: string;
  categoryName?: string;
}): DrinkCustomizationFlags {
  if (product.categoryGroup !== "FRESH_DRINK") {
    return { ice: false, sugar: false, milk: false };
  }
  const name = (product.title ?? product.name ?? "").toLowerCase();
  const text = `${name} ${product.category ?? product.categoryName ?? ""}`.toLowerCase();
  const milk = MILK_DRINK_NAME.test(name)
    ? true
    : NO_MILK_NAME.test(name)
      ? false
      : MILK_KEYWORDS.test(text);
  return {
    ice: !HOT_KEYWORD.test(text),
    sugar: true,
    milk,
  };
}

export function resolveProductImage(image?: string | null): string {
  return image && image.trim().length > 0 ? image : PRODUCT_IMAGE_FALLBACK;
}

export function discountPercent(product: StoreProduct): number | null {
  if (!product.discountActive || !product.originalPrice) return null;
  if (product.originalPrice <= 0) return null;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}
