import { Suspense } from "react";
import ProductpageView from "@/features/productpage";

interface ProductPageProps {
  searchParams: Promise<{
    id?: string;
    title?: string;
    price?: string;
    originalPrice?: string;
    discountType?: "percentage" | "fixed";
    discountAmount?: string;
    image?: string;
    description?: string;
    category?: string;
  }>;
}

export default async function ProductPage({ searchParams }: ProductPageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="p-8 text-center font-sans text-gray-500">Loading product detail...</div>}>
      <ProductpageView
        id={params.id}
        title={params.title}
        price={params.price ? parseFloat(params.price) : undefined}
        originalPrice={params.originalPrice ? parseFloat(params.originalPrice) : undefined}
        discountType={params.discountType}
        discountAmount={params.discountAmount ? parseFloat(params.discountAmount) : undefined}
        image={params.image ?? null}
        description={params.description}
        category={params.category}
      />
    </Suspense>
  );
}
