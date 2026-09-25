import { Suspense } from "react";
import { PageLoader } from "@/components/ui/states";
import CheckoutdonepageView from "@/features/checkoutdonepage";

export default function CheckoutDonePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading your order..." />}>
      <CheckoutdonepageView />
    </Suspense>
  );
}
