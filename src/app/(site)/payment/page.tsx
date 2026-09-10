import { Suspense } from "react";

import PaymentpageView from "@/features/paymentpage";

/**
 * The view reads `?orderId=` with useSearchParams, which Next requires to sit behind a Suspense
 * boundary — without one the whole route is forced out of static rendering and the build warns.
 */
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto px-4 py-10 text-center text-sm text-gray-400">
          Preparing your payment...
        </div>
      }
    >
      <PaymentpageView />
    </Suspense>
  );
}
