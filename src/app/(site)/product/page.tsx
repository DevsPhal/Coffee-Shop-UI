import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/ui/states";
import ProductpageView from "@/features/productpage";

export default function ProductPage() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductpageView />
    </Suspense>
  );
}
