import { useMemo } from "react";

import { useListProductsQuery } from "./catalogApi";
import type { CustomerProductResponse, UUID } from "./types";

/**
 * The API exposes no customer-facing categories endpoint — `/api/admin/categories` is
 * admin-only — but every product carries `categoryId`/`categoryName`, so the storefront's
 * category list is derived from the catalogue itself. One request feeds both.
 *
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

/** Distinct categories across the whole catalogue, with how many products each holds. */
export function useCategories() {
  const { data, isLoading, error } = useListProductsQuery({
    page: 1,
    size: CATALOG_PAGE_SIZE,
  });

  const categories = useMemo<CatalogCategory[]>(() => {
    const byId = new Map<UUID, CatalogCategory>();
    for (const product of data?.content ?? []) {
      if (product.status !== "ACTIVE") continue;
      const existing = byId.get(product.categoryId);
      if (existing) {
        existing.count += 1;
      } else {
        byId.set(product.categoryId, {
          id: product.categoryId,
          name: product.categoryName,
          count: 1,
        });
      }
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  return { categories, isLoading, error };
}

/** Price a customer actually pays, including an active discount and any size add-on. */
export function priceWithSize(
  product: CustomerProductResponse,
  sizeOptionId?: UUID | null
): number {
  const size = product.sizeOptions.find((option) => option.id === sizeOptionId);
  return Number(product.finalPrice) + Number(size?.priceDelta ?? 0);
}
