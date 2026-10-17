"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

import { makeStore } from "./redux";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  // Lets queries that opt into refetchOnFocus / refetchOnReconnect hear about those events.
  useEffect(() => setupListeners(store.dispatch), [store]);
  return <Provider store={store}>{children}</Provider>;
}
