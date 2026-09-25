"use client";

import { useRealtimeTopic } from "./useRealtimeTopic";
import type { ResourceChangeMessage } from "@/store/api/types";

/**
 * Subscribes to `/topic/catalog` and calls `onMessage` whenever staff change a product,
 * category or extra — the push carries no data, it's only a signal to refetch through the
 * normal REST/RTK Query path. Wired once, app-wide (see RealtimeCatalogSync), rather than per
 * page, since "the menu changed" is relevant to whichever page happens to be open.
 */
export function useCatalogLiveUpdates(onMessage: (message: ResourceChangeMessage) => void) {
  useRealtimeTopic<ResourceChangeMessage>("/topic/catalog", onMessage);
}
