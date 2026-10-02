import type { OrderResponse } from "@/store/api/types";

export const SHOP_TIME_ZONE = "Asia/Phnom_Penh";

const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/;
const FINISHED_STATUSES: OrderResponse["status"][] = ["COMPLETED", "DELIVERED", "CANCELLED"];

export function parseShopDateTime(value: string): Date {
  return new Date(HAS_OFFSET.test(value) ? value : `${value}+07:00`);
}

export function formatShopClock(date: Date): string {
  return date.toLocaleTimeString("en-US", { timeZone: SHOP_TIME_ZONE, hour: "numeric", minute: "2-digit" });
}

export type OrderEstimate =
  | { state: "none" }
  | { state: "finished" }
  | { state: "counting"; minutesLeft: number; clock: string }
  | { state: "due"; clock: string };

export function getOrderEstimate(
  order: Pick<OrderResponse, "status" | "estimatedReadyAt">,
  now: number
): OrderEstimate {
  if (FINISHED_STATUSES.includes(order.status)) return { state: "finished" };
  if (!order.estimatedReadyAt) return { state: "none" };
  const readyAt = parseShopDateTime(order.estimatedReadyAt);
  if (Number.isNaN(readyAt.getTime())) return { state: "none" };
  const clock = formatShopClock(readyAt);
  const minutesLeft = Math.ceil((readyAt.getTime() - now) / 60_000);
  return minutesLeft > 0 ? { state: "counting", minutesLeft, clock } : { state: "due", clock };
}
