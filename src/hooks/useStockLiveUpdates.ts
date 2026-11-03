"use client";

import { useRealtimeTopic } from "./useRealtimeTopic";
import type { ResourceChangeMessage } from "@/store/api/types";

export function useStockLiveUpdates(onMessage: (message: ResourceChangeMessage) => void) {
  useRealtimeTopic<ResourceChangeMessage>("/topic/stock", onMessage);
}
