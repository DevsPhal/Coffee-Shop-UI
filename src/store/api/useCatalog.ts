import { useMemo } from "react";

import { toTitleCase } from "@/lib/utils";
import { useListCategoriesQuery, useListProductsQuery } from "./catalogApi";
import type { CustomerProductResponse, UUID } from "./types";

/**
 * The page size is deliberately large: this is a single café's menu, not a marketplace, and
 * the storefront filters and groups client-side.
 */
const CATALOG_PAGE_SIZE = 300;

export interface CatalogCategory {
  id: UUID;
  name: string;
  count: number;
}

export function useCatalog(categoryId?: UUID) {
  const { data, isLoading, isFetching, error, refetch } = useListProductsQuery({
    page: 1,
    size: CATALOG_PAGE_SIZE,
    ...(categoryId ? { categoryId } : {}),
  });

  // Only ACTIVE products are sellable; the API returns status so the storefront can hide the
  // rest rather than showing something that would fail at checkout.
  const products = useMemo(
    () => (data?.content ?? []).filter((p) => p.status === "ACTIVE"),
    [data]
  );

  return {
    products,
    total: data?.totalElements ?? 0,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

/**
 * Categories from GET /api/customer/categories, each with how many ACTIVE products it holds.
 * The count still comes from the product list — the categories endpoint doesn't carry one —
 * so a category with zero products today still shows up here, unlike the old approach that
 * derived categories purely from whatever products happened to reference them.
 */
export function useCategories() {
  const {
    data: categoryList,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useListCategoriesQuery();
  const { data: productPage, isLoading: isLoadingProducts } = useListProductsQuery({
    page: 1,
    size: CATALOG_PAGE_SIZE,
  });

  const categories = useMemo<CatalogCategory[]>(() => {
    const counts = new Map<UUID, number>();
    for (const product of productPage?.content ?? []) {
      if (product.status !== "ACTIVE") continue;
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    }
    return (categoryList ?? [])
      .map((category) => ({
        id: category.id,
        name: toTitleCase(category.name),
        count: counts.get(category.id) ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryList, productPage]);

  return {
    categories,
    isLoading: isLoadingCategories || isLoadingProducts,
    error: categoriesError,
  };
}

/**
 * The price a customer actually pays for one variant, already discounted. Each variant prices
 * itself now (no product-level price to add a delta to) — falls back to the first active
 * variant when no id is given or matched, so callers never have to special-case "no size
 * chosen yet".
 */
export function priceWithVariant(
  product: CustomerProductResponse,
  variantId?: UUID | null
): number {
  const variants = product.variants ?? [];
  const chosen =
    (variantId ? variants.find((variant) => variant.id === variantId) : undefined) ??
    variants.find((variant) => variant.status === "ACTIVE");
  return Number(chosen?.finalPrice ?? 0);
}
