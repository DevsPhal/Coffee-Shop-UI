import { baseApi, unwrap } from "./baseApi";
import type {
  BannerResponse,
  CustomerProductResponse,
  PageQuery,
  PageResponse,
  UUID,
  PublicEventResponse,
  ShopSettingsResponse,
} from "./types";

interface ProductListQuery extends PageQuery {
  categoryId?: UUID;
}

/**
 * The public storefront catalogue. `/api/customer/products` GETs are open to anonymous
 * visitors (SecurityConfig permits them ahead of the customer-role rule), so the menu renders
 * before anyone signs in.
 *
 * There is no customer-facing categories endpoint, so the category list is derived from the
 * products themselves — see `useCategories` below.
 */
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<PublicEventResponse[], void>({
      query: () => "/api/events",
      transformResponse: unwrap<PublicEventResponse[]>,
    }),
    getShopSettings: builder.query<ShopSettingsResponse, void>({
      query: () => "/api/shop/settings",
      transformResponse: unwrap<ShopSettingsResponse>,
    }),
    listProducts: builder.query<
      PageResponse<CustomerProductResponse>,
      ProductListQuery | void
    >({
      query: (params) => ({
        url: "/api/customer/products",
        params: params ?? undefined,
      }),
      transformResponse: unwrap<PageResponse<CustomerProductResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getProduct: builder.query<CustomerProductResponse, UUID>({
      query: (id) => `/api/customer/products/${id}`,
      transformResponse: unwrap<CustomerProductResponse>,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    listBanners: builder.query<BannerResponse[], void>({
      query: () => "/api/banners",
      transformResponse: unwrap<BannerResponse[]>,
      providesTags: ["Banner"],
    }),
  }),
});

export const { useListProductsQuery, useGetProductQuery, useListBannersQuery, useListEventsQuery, useGetShopSettingsQuery } =
  catalogApi;
