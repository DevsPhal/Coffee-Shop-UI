import { Suspense } from "react";
import { PageLoader } from "@/components/ui/states";
import MenupageView from "@/features/menupage";

export default function MenuPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading menu..." />}>
      <MenupageView />
    </Suspense>
  );
}
