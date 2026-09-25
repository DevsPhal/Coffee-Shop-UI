"use client";

import { useRealtimeTopic } from "./useRealtimeTopic";
import type { StaffCallMessage } from "@/store/api/types";

/**
 * Subscribes to this customer's own `/user/queue/staff-calls` — pushed only when a "Call Staff"
 * press has actually been answered, so a customer who called can hear back the moment someone
 * does, rather than wondering whether anyone noticed.
 */
export function useStaffCallUpdates(onMessage: (message: StaffCallMessage) => void) {
  useRealtimeTopic<StaffCallMessage>("/user/queue/staff-calls", onMessage);
}
