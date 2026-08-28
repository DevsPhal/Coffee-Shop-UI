import { Suspense } from "react";
import DesktopMenuView from "@/features/menupage";
import PhoneMenuView from "@/features/menuphonepage";

/**
 * One canonical /menu URL serving both layouts, picked by CSS.
 *
 * This used to be two routes chosen from `window.innerWidth`, which only ran on
 * in-app clicks: opening /menu directly on a phone (shared link, bookmark,
 * search result) served the desktop layout, and resizing never corrected it.
 */
export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-sans text-gray-500">
          Loading menu...
        </div>
      }
    >
      <div className="hidden md:block">
        <DesktopMenuView />
      </div>
      <div className="md:hidden">
        <PhoneMenuView />
      </div>
    </Suspense>
  );
}
