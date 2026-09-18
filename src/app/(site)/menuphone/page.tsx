import { Suspense } from "react";
import MenupageView from "@/features/menuphonepage";

export default function MenuPhonePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-sans text-gray-500">Loading menu...</div>}>
      <MenupageView />
    </Suspense>
  );
}
