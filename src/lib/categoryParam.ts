import { useEffect, useMemo } from "react";
import { ALL_CATEGORIES } from "@/components/ui/CategoryDropdown";
import { useCatalog, type CatalogCategory } from "@/store/api/useCatalog";

type CategoryRef = { id: string; name: string };

/** The menu's "Featured Products" choice: every product whose discount is running now (the admin's "On Discount"). */
export const FEATURED_CATEGORY = "Featured";

/** A menu page opened on Featured Products: /menu on desktop, /menuphone on phones. */
export const featuredMenuHref = (page: "/menu" | "/menuphone") => `${page}?category=${FEATURED_CATEGORY}`;

/**
 * Featured Products for a menu page, counted over the whole menu (not only the chosen category). It is offered only
 * while a discount runs; a saved or linked "Featured" shows the whole menu once none does, and comes back with the
 * next discount.
 */
export function useFeaturedChoice(savedCategory: string) {
  const { products, isLoading } = useCatalog();
  const count = useMemo(() => products.filter((product) => product.discountActive).length, [products]);
  const wantsFeatured = savedCategory === FEATURED_CATEGORY;
  const unavailable = wantsFeatured && !isLoading && count === 0;
  const leadingEntries: CatalogCategory[] =
    count > 0 || (wantsFeatured && isLoading) ? [{ id: FEATURED_CATEGORY, name: "Featured Products", count }] : [];
  return {
    selectedCategory: unavailable ? ALL_CATEGORIES : savedCategory,
    isFeatured: wantsFeatured && !unavailable,
    leadingEntries,
  };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const normalize = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, " ");

/** True when the value can be sent to the API as a categoryId. */
export function isCategoryId(value: string) {
  return UUID_PATTERN.test(value);
}

/** Accepts a category id or a category name (any case, dashes or spaces) and returns the id. */
export function resolveCategoryParam(raw: string, categories: CategoryRef[]): string | null {
  const byId = categories.find((category) => category.id === raw);
  if (byId) return byId.id;
  const key = normalize(raw);
  return categories.find((category) => normalize(category.name) === key)?.id ?? null;
}

/**
 * Opens the menu on the category named in `?category=` (id or name), and repairs a selection
 * that no longer matches any category (e.g. a deleted one, or a name saved by an old link).
 */
export function useCategoryQuery({
  queryCategory,
  selectedCategory,
  setSelectedCategory,
  categories,
  specialValues = [],
}: {
  queryCategory: string | null;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: CategoryRef[];
  specialValues?: string[];
}) {
  const special = [ALL_CATEGORIES, ...specialValues];

  useEffect(() => {
    if (!queryCategory) return;
    if (special.includes(queryCategory)) {
      setSelectedCategory(queryCategory);
      return;
    }
    if (categories.length === 0) {
      if (isCategoryId(queryCategory)) setSelectedCategory(queryCategory);
      return;
    }
    setSelectedCategory(resolveCategoryParam(queryCategory, categories) ?? ALL_CATEGORIES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryCategory, categories, setSelectedCategory]);

  useEffect(() => {
    if (special.includes(selectedCategory) || categories.length === 0) return;
    if (!categories.some((category) => category.id === selectedCategory)) {
      setSelectedCategory(resolveCategoryParam(selectedCategory, categories) ?? ALL_CATEGORIES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, categories, setSelectedCategory]);
}
