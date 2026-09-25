"use client";

import { useRealtimeTopic } from "./useRealtimeTopic";
import type { OrderUpdateMessage } from "@/store/api/types";

/**
 * Subscribes to this customer's own `/user/queue/orders` push channel and calls `onMessage`
 * with every order change the API broadcasts — a barista pressing a button on the queue board
 * reaches the customer within the STOMP round trip instead of on the next poll.
 *
 * This only pushes notice that *something* changed — callers still read the actual order
 * through the normal REST/RTK Query path (e.g. by refetching), so there's one source of truth
 * for the order shape rather than trusting a second, independently-parsed copy off the socket.
 */
export function useOrderLiveUpdates(onMessage: (message: OrderUpdateMessage) => void) {
  useRealtimeTopic<OrderUpdateMessage>("/user/queue/orders", onMessage);
}
