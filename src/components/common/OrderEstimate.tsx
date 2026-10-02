"use client";

import { Timer } from "lucide-react";

import { useLanguage } from "@/components/ui/translatetokhmer";
import { useNow } from "@/hooks/useNow";
import { getOrderEstimate } from "@/lib/estimate";
import type { OrderResponse } from "@/store/api/types";

type EstimateOrder = Pick<OrderResponse, "status" | "estimatedReadyAt">;

const REFRESH_MS = 30_000;

export function useEstimateLabel(order: EstimateOrder | null | undefined): string {
  const { t } = useLanguage();
  const now = useNow(REFRESH_MS);
  if (!order || order.status === "CANCELLED") return "—";
  const estimate = getOrderEstimate(order, now);
  switch (estimate.state) {
    case "finished":
      return t("Done");
    case "none":
      return t("The shop will confirm the time shortly");
    case "due":
      return t("Any moment now");
    case "counting":
      return `~${estimate.minutesLeft} ${t("mins")} (${t("ready by")} ${estimate.clock})`;
  }
}

export function OrderEstimateBadge({ order }: { order: EstimateOrder }) {
  const { t } = useLanguage();
  const now = useNow(REFRESH_MS);
  const estimate = getOrderEstimate(order, now);
  if (estimate.state !== "counting" && estimate.state !== "due") return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-[#A1255B]/20 bg-[#A1255B]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#A1255B]"
      title={`${t("ready by")} ${estimate.clock}`}
      suppressHydrationWarning
    >
      <Timer className="h-3 w-3" aria-hidden="true" />
      {estimate.state === "counting" ? `~${estimate.minutesLeft} ${t("mins")}` : t("Any moment now")}
    </span>
  );
}
