import { baseApi, unwrap } from "./baseApi";
import type {
  BakongDeeplinkResponse,
  BakongQrResponse,
  Currency,
  OrderResponse,
  OrderStatus,
  PageQuery,
  PageResponse,
  StaffCallRequest,
  StaffCallResponse,
  UUID,
} from "./types";

interface OrderListQuery extends PageQuery {
  status?: OrderStatus;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    callStaff: builder.mutation<StaffCallResponse, { id: UUID; body: StaffCallRequest }>({
      query: ({ id, body }) => ({ url: `/api/customer/orders/${id}/call-staff`, method: "POST", body }),
      transformResponse: unwrap<StaffCallResponse>,
      invalidatesTags: (_result, _error, { id }) => [{ type: "StaffCall", id }],
    }),
    getMyStaffCall: builder.query<StaffCallResponse | null, UUID>({
      query: (id) => `/api/customer/orders/${id}/staff-call`,
      transformResponse: unwrap<StaffCallResponse | null>,
      providesTags: (_result, _error, id) => [{ type: "StaffCall", id }],
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
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }],
    }),

    generateBakongDeeplink: builder.mutation<BakongDeeplinkResponse, UUID>({
      query: (id) => ({
        url: `/api/customer/orders/${id}/pay/bakong/deeplink`,
        method: "POST",
      }),
      transformResponse: unwrap<BakongDeeplinkResponse>,
    }),

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
  useGetMyStaffCallQuery,
} = orderApi;
