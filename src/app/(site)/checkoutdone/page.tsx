import { Suspense } from "react";
import CheckoutdonepageView from "@/features/checkoutdonepage";

export default function CheckoutDonePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-sans text-gray-500">Loading order confirmation...</div>}>
      <CheckoutdonepageView />
    </Suspense>
  );
}
