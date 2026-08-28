import { Suspense } from "react";
import ProductpageView from "@/features/productpage";

export default function ProductsPage() {
  // ProductpageView reads useSearchParams, which Next requires to sit inside a
  // Suspense boundary or the route cannot be prerendered.
  return (
    <Suspense fallback={null}>
      <ProductpageView />
    </Suspense>
  );
}
