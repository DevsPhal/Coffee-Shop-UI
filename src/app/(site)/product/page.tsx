import { Suspense } from "react";
import ProductpageView from "@/features/productpage";

interface ProductPageProps {
  searchParams: Promise<{ id?: string; title?: string; price?: string; image?: string; description?: string }>;
}

export default async function ProductPage({ searchParams }: ProductPageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading product detail...</div>}>
      <ProductpageView
        id={params.id}
        title={params.title}
        price={params.price ? parseFloat(params.price) : undefined}
        image={params.image ?? null}
        description={params.description}
      />
    </Suspense>
  );
}
