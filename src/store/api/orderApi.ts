import { baseApi, unwrap } from "./baseApi";
import type {
  BakongDeeplinkResponse,
  BakongQrResponse,
  Currency,
  OrderResponse,
  OrderStatus,
  PageQuery,
  PageResponse,
  StaffCallResponse,
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
    /**
     * Asks staff to come help with this order. Rate-limited server-side (once per cooldown
     * window) — a repeat press too soon comes back as a 429 whose message says how long is
     * left; `nextCallAllowedAt` on a successful call is when the button can re-enable.
     */
    callStaff: builder.mutation<StaffCallResponse, UUID>({
      query: (id) => ({ url: `/api/customer/orders/${id}/call-staff`, method: "POST" }),
      transformResponse: unwrap<StaffCallResponse>,
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

    /**
     * A single link that opens whichever Bakong-enabled banking app is already on the phone —
     * for a customer viewing this QR on the same phone they'd otherwise need to scan it with.
     * Requires generateBakongQr to have run first (same order, same stored QR).
     */
    generateBakongDeeplink: builder.mutation<BakongDeeplinkResponse, UUID>({
      query: (id) => ({
        url: `/api/customer/orders/${id}/pay/bakong/deeplink`,
        method: "POST",
      }),
      transformResponse: unwrap<BakongDeeplinkResponse>,
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
  useGenerateBakongDeeplinkMutation,
  useConfirmBakongPaymentMutation,
  useCancelMyOrderMutation,
  useCallStaffMutation,
} = orderApi;
