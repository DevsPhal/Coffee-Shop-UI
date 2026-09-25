import { Suspense } from "react";
import { PageLoader } from "@/components/ui/states";

import PaymentpageView from "@/features/paymentpage";

/**
 * The view reads `?orderId=` with useSearchParams, which Next requires to sit behind a Suspense
 * boundary — without one the whole route is forced out of static rendering and the build warns.
 */
export default function PaymentPage() {
  return (
    <Suspense fallback={<PageLoader label="Preparing your payment..." />}>
      <PaymentpageView />
    </Suspense>
  );
}
