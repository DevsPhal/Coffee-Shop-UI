import { baseApi, unwrap } from "./baseApi";
import { capitalizeFirst, toTitleCase } from "@/lib/utils";
import type {
  ApiEnvelope,
  BannerResponse,
  CustomerCategoryResponse,
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

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<PublicEventResponse[], void>({
      query: () => "/api/events",
      transformResponse: (response: ApiEnvelope<PublicEventResponse[]>) =>
        unwrap(response).map((event) => ({
          ...event,
          title: toTitleCase(event.title),
          description: event.description ? capitalizeFirst(event.description) : event.description,
        })),
    }),
    getShopSettings: builder.query<ShopSettingsResponse, void>({
      query: () => "/api/shop/settings",
      transformResponse: unwrap<ShopSettingsResponse>,
    }),
    listCategories: builder.query<CustomerCategoryResponse[], void>({
      query: () => "/api/categories",
      transformResponse: unwrap<CustomerCategoryResponse[]>,
      providesTags: ["Category"],
    }),
    listProducts: builder.query<
      PageResponse<CustomerProductResponse>,
      ProductListQuery | void
    >({
      query: (params) => ({
        url: "/api/products",
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
      query: (id) => `/api/products/${id}`,
      transformResponse: unwrap<CustomerProductResponse>,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    listBanners: builder.query<BannerResponse[], void>({
      query: () => "/api/banners",
      transformResponse: (response: ApiEnvelope<BannerResponse[]>) =>
        unwrap(response).map((banner) => ({ ...banner, title: toTitleCase(banner.title) })),
      providesTags: ["Banner"],
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useListBannersQuery,
  useListEventsQuery,
  useListCategoriesQuery,
  useGetShopSettingsQuery,
} = catalogApi;
