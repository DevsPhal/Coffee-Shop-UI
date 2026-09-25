"use client";

import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useCatalogLiveUpdates } from "@/hooks/useCatalogLiveUpdates";
import { baseApi } from "@/store/api/baseApi";
import type { AppDispatch } from "@/store/redux";
import type { ResourceChangeMessage } from "@/store/api/types";

/**
 * Mounted once, app-wide (in the root layout) rather than per page — "the menu changed" is
 * relevant to whichever page happens to be open, and RTK Query's cache is shared across the
 * whole app regardless of which component's subscription triggered the invalidation.
 *
 * A product/category/extra changing anywhere in the admin reaches every open storefront tab
 * within the STOMP round trip instead of on next navigation/poll. Extras carry no product id
 * on the push (an Extra's own id, not the products it's attached to), so an EXTRA change can't
 * be targeted at a specific product's cache entry here — the product detail page additionally
 * refetches itself on any catalog message for that reason (see productpageView.tsx).
 */
export function RealtimeCatalogSync() {
  const dispatch = useDispatch<AppDispatch>();

  const handleMessage = useCallback(
    (message: ResourceChangeMessage) => {
      if (message.resource === "PRODUCT") {
        dispatch(
          baseApi.util.invalidateTags([
            { type: "Product", id: message.id },
            { type: "Product", id: "LIST" },
          ])
        );
      } else if (message.resource === "CATEGORY") {
        dispatch(baseApi.util.invalidateTags(["Category", { type: "Product", id: "LIST" }]));
      } else {
        // EXTRA — affects whichever products offer it, which this message doesn't say. The
        // list view is cheap to refresh broadly; a currently-open product detail page handles
        // itself directly rather than guessing which id to invalidate here.
        dispatch(baseApi.util.invalidateTags([{ type: "Product", id: "LIST" }]));
      }
    },
    [dispatch]
  );

  useCatalogLiveUpdates(handleMessage);
  return null;
}

export default RealtimeCatalogSync;
