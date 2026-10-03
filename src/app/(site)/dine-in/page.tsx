"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/states";
import { startDineIn } from "@/lib/dineIn";

// Target of the shop-wide menu QR: switch on dine-in, then open the menu for this screen size.
export default function DineInPage() {
  const router = useRouter();

  useEffect(() => {
    startDineIn();
    router.replace(window.innerWidth < 768 ? "/menuphone" : "/menu");
  }, [router]);

  return <PageLoader label="Opening the menu..." />;
}
