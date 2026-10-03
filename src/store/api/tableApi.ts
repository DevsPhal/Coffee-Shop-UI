import { baseApi, unwrap } from "./baseApi";
import type { OrderResponse, TableResponse } from "./types";

export const tableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTable: builder.query<TableResponse, string>({
      query: (tableNumber) => `/api/tables/${encodeURIComponent(tableNumber)}`,
      transformResponse: unwrap<TableResponse>,
    }),

    listMyTableOrders: builder.query<OrderResponse[], string>({
      query: (tableNumber) => `/api/customer/tables/${encodeURIComponent(tableNumber)}/orders`,
      transformResponse: unwrap<OrderResponse[]>,
      providesTags: [{ type: "Order", id: "LIST" }],
    }),
  }),
});

export const { useGetTableQuery, useLazyGetTableQuery, useListMyTableOrdersQuery } = tableApi;
