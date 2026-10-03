import { useEffect } from "react";
import { ALL_CATEGORIES } from "@/components/ui/CategoryDropdown";

type CategoryRef = { id: string; name: string };

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
