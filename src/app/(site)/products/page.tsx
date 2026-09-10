import { Suspense } from "react";
import ProductpageView from "@/features/productpage";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-sans text-gray-500">Loading product detail...</div>}>
      <ProductpageView />
    </Suspense>
  );
}
