"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useDineIn } from "@/lib/dineIn";

// Reminds a customer ordering at the shop that their order is dine-in, on every page of the visit.
export function DineInPill() {
  const { active, tableNumber } = useDineIn();
  const pathname = usePathname();
  const { t } = useLanguage();
  if (!active || pathname?.startsWith("/table") || pathname?.startsWith("/payment") || pathname === "/dine-in" || pathname === "/checkout") {
    return null;
  }

  const label = tableNumber ? `${t("Table")} ${tableNumber}` : t("Dine-in");
  const content = (
    <>
      <Armchair aria-hidden />
      {label}
    </>
  );

  return tableNumber ? (
    <Link href={`/table/${encodeURIComponent(tableNumber)}`} className="dinein_pill" aria-label={`${t("Dine-in")} · ${label}`}>
      {content}
    </Link>
  ) : (
    <span className="dinein_pill" role="status">
      {content}
    </span>
  );
}
