"use client";

import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useCatalogLiveUpdates } from "@/hooks/useCatalogLiveUpdates";
import { baseApi } from "@/store/api/baseApi";
import type { AppDispatch } from "@/store/redux";
import type { ResourceChangeMessage } from "@/store/api/types";

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
        dispatch(baseApi.util.invalidateTags([{ type: "Product", id: "LIST" }]));
      }
    },
    [dispatch]
  );

  useCatalogLiveUpdates(handleMessage);
  return null;
}

export default RealtimeCatalogSync;
