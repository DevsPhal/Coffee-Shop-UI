"use client";

import { useRealtimeTopic } from "./useRealtimeTopic";
import type { OrderUpdateMessage } from "@/store/api/types";

export function useOrderLiveUpdates(onMessage: (message: OrderUpdateMessage) => void) {
  useRealtimeTopic<OrderUpdateMessage>("/user/queue/orders", onMessage);
}
