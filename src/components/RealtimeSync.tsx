"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { useCatalogLiveUpdates } from "@/hooks/useCatalogLiveUpdates";
import { useOrderLiveUpdates } from "@/hooks/useOrderLiveUpdates";
import { useStaffCallUpdates } from "@/hooks/useStaffCallUpdates";
import { useStockLiveUpdates } from "@/hooks/useStockLiveUpdates";
import { onRealtimeResync, setRealtimeSessionRefresher } from "@/lib/realtime";
import { authApi } from "@/store/api/authApi";
import { baseApi } from "@/store/api/baseApi";
import { orderApi } from "@/store/api/orderApi";
import type { AppDispatch } from "@/store/redux";
import type { OrderResponse, ResourceChangeMessage } from "@/store/api/types";

type CacheTag = Parameters<typeof baseApi.util.invalidateTags>[0][number];

// A sale touches several stock rows at once; gather a burst into one refetch instead of one per message.
const INVALIDATE_BATCH_MS = 300;

// Pushes can overtake each other when two changes commit together; never let an older one win.
const isNewer = (incoming: OrderResponse, cached: OrderResponse) =>
  !incoming.updatedAt || !cached.updatedAt || incoming.updatedAt >= cached.updatedAt;

// Keeps the RTK Query cache in step with what the API pushes, so every page shows changes without a reload.
export function RealtimeSync() {
  const dispatch = useDispatch<AppDispatch>();
  const pendingTags = useRef<CacheTag[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const invalidateSoon = useCallback(
    (tags: CacheTag[]) => {
      pendingTags.current.push(...tags);
      if (flushTimer.current) return;
      flushTimer.current = setTimeout(() => {
        flushTimer.current = null;
        const batch = pendingTags.current;
        pendingTags.current = [];
        dispatch(baseApi.util.invalidateTags(batch));
      }, INVALIDATE_BATCH_MS);
    },
    [dispatch]
  );

  useEffect(
    () => () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    },
    []
  );

  // An expired token makes /api/users/me answer 401, which the REST client turns into its one shared refresh.
  useEffect(() => {
    setRealtimeSessionRefresher(async () => {
      await dispatch(authApi.endpoints.getCurrentUser.initiate(undefined, { forceRefetch: true, subscribe: false }));
    });
  }, [dispatch]);

  useEffect(
    () =>
      onRealtimeResync(() => {
        dispatch(baseApi.util.invalidateTags(["Product", "Category", "Banner", "Event", "Order", "StaffCall"]));
      }),
    [dispatch]
  );

  useCatalogLiveUpdates(
    useCallback(
      (message: ResourceChangeMessage) => {
        switch (message.resource) {
          case "PRODUCT":
            invalidateSoon([{ type: "Product", id: message.id }, { type: "Product", id: "LIST" }]);
            break;
          case "CATEGORY":
            // Every product carries its category's name.
            invalidateSoon(["Category", "Product"]);
            break;
          case "EXTRA":
            // Extras are listed inside each product that offers them.
            invalidateSoon(["Product"]);
            break;
          case "BANNER":
            invalidateSoon(["Banner"]);
            break;
          case "EVENT":
            invalidateSoon(["Event"]);
            break;
          default:
            invalidateSoon([{ type: "Product", id: "LIST" }]);
        }
      },
      [invalidateSoon]
    )
  );

  // Recipe drinks share ingredients, so one stock change can move availability on many products.
  useStockLiveUpdates(useCallback(() => invalidateSoon(["Product"]), [invalidateSoon]));

  useOrderLiveUpdates(
    useCallback(
      ({ order }) => {
        // The push carries the whole order, so the order page updates without a round trip.
        dispatch(
          orderApi.util.updateQueryData("getMyOrder", order.id, (cached) => (isNewer(order, cached) ? order : undefined))
        );
        // Lists are filtered by status, so a change can move an order in or out of them: refetch those.
        dispatch(baseApi.util.invalidateTags([{ type: "Order", id: "LIST" }]));
      },
      [dispatch]
    )
  );

  useStaffCallUpdates(
    useCallback(
      (message) => {
        dispatch(baseApi.util.invalidateTags([{ type: "StaffCall", id: message.orderId }]));
      },
      [dispatch]
    )
  );

  return null;
}

export default RealtimeSync;
