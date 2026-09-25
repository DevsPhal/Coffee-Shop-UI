import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/ui/states";
import ProductpageView from "@/features/productpage";

// The view reads ?id= itself and fetches the product, so this route stays a thin shell.
export default function ProductPage() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductpageView />
    </Suspense>
  );
}
