import { Suspense } from "react";
import ProductpageView from "@/features/productpage";

// The view reads ?id= itself and fetches the product, so this route stays a thin shell.
export default function ProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-sans text-gray-500">Loading product detail...</div>}>
      <ProductpageView />
    </Suspense>
  );
}
