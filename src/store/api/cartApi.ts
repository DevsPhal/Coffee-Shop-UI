import { baseApi, unwrap } from "./baseApi";
import type {
  AddCartItemRequest,
  CartResponse,
  CheckoutRequest,
  OrderResponse,
  UpdateCartItemRequest,
  UUID,
} from "./types";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => "/api/customer/cart",
      transformResponse: unwrap<CartResponse>,
      providesTags: ["Cart"],
    }),

    addCartItem: builder.mutation<CartResponse, AddCartItemRequest>({
      query: (body) => ({ url: "/api/customer/cart/items", method: "POST", body }),
      transformResponse: unwrap<CartResponse>,
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: builder.mutation<
      CartResponse,
      { itemId: UUID; body: UpdateCartItemRequest }
    >({
      query: ({ itemId, body }) => ({
        url: `/api/customer/cart/items/${itemId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap<CartResponse>,
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation<CartResponse, UUID>({
      query: (itemId) => ({
        url: `/api/customer/cart/items/${itemId}`,
        method: "DELETE",
      }),
      transformResponse: unwrap<CartResponse>,
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({ url: "/api/customer/cart", method: "DELETE" }),
      transformResponse: unwrap<CartResponse>,
      invalidatesTags: ["Cart"],
    }),

    checkout: builder.mutation<OrderResponse, CheckoutRequest>({
      query: (body) => ({ url: "/api/customer/cart/checkout", method: "POST", body }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: ["Cart", "Order"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useCheckoutMutation,
} = cartApi;
