"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { getAccessToken, isAuthenticated } from "@/lib/authStorage";

/**
 * The API's STOMP endpoint isn't behind this app's own `/api/*` proxy — a WebSocket can't be
 * transparently forwarded by a plain Next.js route handler the way a REST call is, so this
 * connects straight to the API host. That means the API's CORS allowlist has to include
 * whatever origin this app is actually served from for the handshake to succeed.
 */
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "wss://api.590stcafe.shop/ws";

/**
 * Low-level STOMP subscription shared by every topic-specific hook (order updates, staff calls,
 * catalog, ...) so the connect/reconnect/teardown boilerplate lives in exactly one place instead
 * of a near-identical copy per topic. Connects only while signed in (the API requires a bearer
 * token on STOMP CONNECT, same as REST); disconnects on unmount or if the topic itself changes.
 */
export function useRealtimeTopic<T>(topic: string, onMessage: (message: T) => void) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${getAccessToken()}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
      client.subscribe(topic, (frame) => {
        try {
          const message = JSON.parse(frame.body) as T;
          onMessageRef.current(message);
        } catch {
          // Malformed push — ignore rather than take the subscription down.
        }
      });
    };

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [topic]);
}
