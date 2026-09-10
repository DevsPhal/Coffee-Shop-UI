import { baseApi, unwrap } from "./baseApi";
import type {
  BakongQrResponse,
  Currency,
  OrderResponse,
  OrderStatus,
  PageQuery,
  PageResponse,
  UUID,
} from "./types";

interface OrderListQuery extends PageQuery {
  status?: OrderStatus;
}

/**
 * The customer's own orders. Payment has two routes: cash-on-pickup marks the order for staff
 * to collect at the counter, while Bakong generates a QR the customer pays and then confirms.
 */
export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestOrderAssistance: builder.mutation<unknown, UUID>({
      query: (id) => ({ url: `/api/customer/orders/${id}/request-assistance`, method: "POST" }),
    }),
    listMyOrders: builder.query<PageResponse<OrderResponse>, OrderListQuery | void>({
      query: (params) => ({
        url: "/api/customer/orders",
        params: params ?? undefined,
      }),
      transformResponse: unwrap<PageResponse<OrderResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "Order" as const, id })),
              { type: "Order" as const, id: "LIST" },
            ]
          : [{ type: "Order" as const, id: "LIST" }],
    }),

    getMyOrder: builder.query<OrderResponse, UUID>({
      query: (id) => `/api/customer/orders/${id}`,
      transformResponse: unwrap<OrderResponse>,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),

    /** Choose to pay at the counter; staff collect the cash and complete the order. */
    payCashOnPickup: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({
        url: `/api/customer/orders/${id}/pay/cash-on-pickup`,
        method: "POST",
      }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    generateBakongQr: builder.mutation<
      BakongQrResponse,
      { id: UUID; currency?: Currency }
    >({
      query: ({ id, currency }) => ({
        url: `/api/customer/orders/${id}/pay/bakong/qr`,
        method: "POST",
        params: currency ? { currency } : undefined,
      }),
      transformResponse: unwrap<BakongQrResponse>,
      // The QR is stored on the order, so the order view is stale once one is issued.
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }],
    }),

    /** Verify the transfer with Bakong; unpaid orders remain pending until the bank confirms. */
    confirmBakongPayment: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({
        url: `/api/customer/orders/${id}/pay/bakong/confirm`,
        method: "POST",
        timeout: 15000,
      }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    cancelMyOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/customer/orders/${id}/cancel`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListMyOrdersQuery,
  useGetMyOrderQuery,
  useLazyGetMyOrderQuery,
  usePayCashOnPickupMutation,
  useGenerateBakongQrMutation,
  useConfirmBakongPaymentMutation,
  useCancelMyOrderMutation,
  useRequestOrderAssistanceMutation,
} = orderApi;
