import { toTitleCase } from "@/lib/utils";
import type { CategoryGroup, CustomerProductResponse, ProductExtraResponse, ProductVariantResponse, SellUnit, UUID } from "./types";

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
  /**
   * The default variant's already-discounted price — what a product card shows before the
   * customer has chosen a size. There is no product-level price anymore: every product prices
   * itself entirely through `variants`, so this is `variants[0].finalPrice`, not a stored field.
   */
  price: number;
  /** The pre-discount price of that same default variant, present only while a discount runs. */
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

/** Shown when a product has no uploaded image; the API returns null rather than a default. */
export const PRODUCT_IMAGE_FALLBACK = "/images/product-placeholder.svg";

export function toStoreProduct(product: CustomerProductResponse): StoreProduct {
  // Sorted so "the default variant" is a stable, deliberate choice (lowest sortOrder) rather
  // than whatever order the API happened to return — sortOrder can be null, so unset ones sink
  // to the end instead of throwing the comparator off.
  const activeVariants = (product.variants ?? [])
    .filter((variant) => variant.status === "ACTIVE")
    .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
  const defaultVariant = activeVariants[0];
  const price = Number(defaultVariant?.finalPrice ?? 0);
  const originalPrice = Number(defaultVariant?.price ?? 0);

  return {
    id: product.id,
    // Staff type names into the admin however they like ("cambodia (can)", "hot green tea") —
    // title-cased here, once, so every card/detail/cart/order view downstream reads like a
    // real menu rather than needing to remember to format it at each display site.
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

/** "Hot Green Tea", not "Hot" appearing anywhere with a word boundary, so it doesn't misfire on
 *  something like "Chocolate" (no match anyway) or a hypothetical "Hothouse ..." name. */
const HOT_KEYWORD = /\bhot\b/;
/** Drinks a customer would actually expect a milk option on. Plain tea (green tea, orange tea,
 *  lemon tea) is deliberately left out — it only gets milk back if its own name says "milk"
 *  (milk tea), which this same regex already catches. */
const MILK_KEYWORDS = /\b(milk|coffee|latte|cappuccino|mocha|matcha|chocolate|cocoa|smoothie)\b/;
/** A name that is itself a milk drink — always offers milk, whatever else the name says
 *  ("Americano Latte" is still a latte). */
const MILK_DRINK_NAME = /\b(milk|latte|cappuccino|mocha|macchiato|flat white|frappe|frappuccino|matcha|chocolate|cocoa|smoothie)\b/;
/** Drinks served black/clear. Checked against the product's own name only, so an "Ice Americano"
 *  filed under the "Iced Coffee" category no longer picks up milk from the word "coffee". */
const NO_MILK_NAME = /\b(americano|espresso|black|cold brew|ristretto|lungo|soda|juice|lemonade|sparkling|tonic|mojito)\b/;

/**
 * Which of Ice/Sugar/Milk make sense for this product. `BEVERAGE` (a can of beer or soft drink)
 * and `SNACK` are sold as-is, not made to order, so they get none of the three.
 *
 * Within `FRESH_DRINK` the API has no per-product "is this hot" or "does this take milk" field
 * — every drink is just `FRESH_DRINK` — so this reads the product/category name the way a
 * customer would: a name containing "hot" drops the ice option (a hot drink has no ice level to
 * pick), and only coffee/milk-style drinks default to offering milk (a plain "Orange Tea" does
 * not, unless its own name says "milk"). Sugar always applies to a made-to-order drink.
 *
 * Takes a loose shape rather than a full `StoreProduct` so it works equally on a raw
 * `CustomerProductResponse` (e.g. the catalogue cache `useCatalog` hands back) without forcing
 * every caller through `toStoreProduct` first — hence both `title`/`category` (the storefront's
 * names) and `name`/`categoryName` (the API's) being accepted.
 */
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
  // The product's own name wins over its category: a black coffee in a "Coffee" category gets
  // no milk step, and only falls back to the category when the name says nothing either way.
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

/** Percentage saved, for the "20% Off" badges — derived, never stored. */
export function discountPercent(product: StoreProduct): number | null {
  if (!product.discountActive || !product.originalPrice) return null;
  if (product.originalPrice <= 0) return null;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}
