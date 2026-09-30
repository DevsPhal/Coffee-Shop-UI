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

/**
 * The public storefront catalogue. Products, categories, banners and events need no login.
 */
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<PublicEventResponse[], void>({
      query: () => "/api/events",
      // Staff type event titles into the admin however they like ("summer sale", "DJ NIGHT") —
      // title-cased here, once, so every card/modal downstream reads like a real event listing
      // rather than needing each display site to remember to format it. The description is
      // prose (full sentences), so only its first letter is fixed, not every word.
      transformResponse: (response: ApiEnvelope<PublicEventResponse[]>) =>
        unwrap(response).map((event) => ({
          ...event,
          title: toTitleCase(event.title),
          description: event.description ? capitalizeFirst(event.description) : event.description,
        })),
    }),
    /**
     * `/api/shop/settings` does not exist in the live API (checked against /v3/api-docs — no
     * match among its 131 paths). The nearest equivalent, the KHR exchange rate, is only
     * exposed admin-side via GET /api/admin/bakong/exchange-rate. This call will 404/401 until
     * that's resolved; see checkoutpageView.tsx's delivery-fee handling.
     */
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
      // Same reasoning as listEvents' title-casing below — a banner's title is staff-entered
      // in the admin and shown as-is on the storefront otherwise.
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
