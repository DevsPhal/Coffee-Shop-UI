"use client";

import { useEffect, useRef } from "react";
import { subscribeRealtime } from "@/lib/realtime";

export function useRealtimeTopic<T>(topic: string, onMessage: (message: T) => void, enabled = true) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) return;
    return subscribeRealtime(topic, (message) => onMessageRef.current(message as T));
  }, [topic, enabled]);
}
