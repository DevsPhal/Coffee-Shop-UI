"use client";

import { useRealtimeTopic } from "./useRealtimeTopic";
import type { StaffCallMessage } from "@/store/api/types";

export function useStaffCallUpdates(onMessage: (message: StaffCallMessage) => void) {
  useRealtimeTopic<StaffCallMessage>("/user/queue/staff-calls", onMessage);
}
