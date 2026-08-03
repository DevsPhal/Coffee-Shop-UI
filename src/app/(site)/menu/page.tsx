import { Suspense } from "react";
import MenupageView from "@/features/menupage";

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-sans text-gray-500">Loading menu...</div>}>
      <MenupageView />
    </Suspense>
  );
}
