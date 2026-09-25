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
 * The public storefront catalogue.
 *
 * Per the live OpenAPI spec (GET /v3/api-docs), `/api/customer/products`,
 * `/api/customer/products/{id}` and `/api/customer/categories` are all declared with
 * `security: [bearerAuth]` — the API currently requires a signed-in customer for these, unlike
 * `/api/banners` and `/api/events` which carry no security requirement and work anonymously.
 * The storefront is meant to be publicly browsable, so this is a backend SecurityConfig gap
 * (permitAll needs adding for these two GET routes) rather than something fixable here.
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
      query: () => "/api/customer/categories",
      transformResponse: unwrap<CustomerCategoryResponse[]>,
      providesTags: ["Category"],
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
