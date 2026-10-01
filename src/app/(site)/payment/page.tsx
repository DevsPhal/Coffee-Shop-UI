import { Suspense } from "react";
import { PageLoader } from "@/components/ui/states";

import PaymentpageView from "@/features/paymentpage";

export default function PaymentPage() {
  return (
    <Suspense fallback={<PageLoader label="Preparing your payment..." />}>
      <PaymentpageView />
    </Suspense>
  );
}
