import { useMemo } from "react";

import { toTitleCase } from "@/lib/utils";
import { useListCategoriesQuery, useListProductsQuery } from "./catalogApi";
import type { CustomerProductResponse, UUID } from "./types";

const CATALOG_PAGE_SIZE = 300;

export interface CatalogCategory {
  id: UUID;
  name: string;
  count: number;
}

export function useCatalog(categoryId?: UUID) {
  const { data, currentData, isLoading, isFetching, error, refetch } = useListProductsQuery({
    page: 1,
    size: CATALOG_PAGE_SIZE,
    ...(categoryId ? { categoryId } : {}),
  });

  const products = useMemo(
    () => (data?.content ?? []).filter((p) => p.status === "ACTIVE"),
    [data]
  );

  return {
    products,
    total: data?.totalElements ?? 0,
    isLoading: isLoading || (isFetching && currentData === undefined),
    isFetching,
    error,
    refetch,
  };
}

export function useCategories() {
  const {
    data: categoryList,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useListCategoriesQuery();
  const {
    data: productPage,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useListProductsQuery({
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
    error: categoriesError ?? productsError,
    refetch: () => {
      void refetchCategories();
      void refetchProducts();
    },
  };
}

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
