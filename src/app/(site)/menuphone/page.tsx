import { Suspense } from "react";
import { PageLoader } from "@/components/ui/states";
import MenupageView from "@/features/menuphonepage";

export default function MenuPhonePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading menu..." />}>
      <MenupageView />
    </Suspense>
  );
}
