"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useDineInTable } from "@/lib/dineIn";

// Reminds a seated customer which table their order goes to, on every page of the visit.
export function DineInPill() {
  const table = useDineInTable();
  const pathname = usePathname();
  const { t } = useLanguage();
  if (!table || pathname?.startsWith("/table") || pathname?.startsWith("/payment")) return null;

  return (
    <Link href={`/table/${encodeURIComponent(table)}`} className="dinein_pill" aria-label={`${t("Dine-in")} · ${t("Table")} ${table}`}>
      <Armchair aria-hidden />
      {t("Table")} {table}
    </Link>
  );
}
