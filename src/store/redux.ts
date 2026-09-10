import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "./api/baseApi";

/**
 * The RTK Query store. It lives alongside the zustand stores in this folder rather than
 * replacing them: zustand still owns the guest cart and UI state, while everything that talks
 * to the API goes through here.
 */
export const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
