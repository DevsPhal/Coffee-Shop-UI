/**
 * Types mirroring the customer-facing slice of the Coffee-Shop-API contract.
 *
 * Two things differ from the mock-era types in src/data/products.ts and are easy to get
 * wrong: every id is a UUID **string** (never a number or a slug), and every response is
 * wrapped in an envelope that baseApi unwraps.
 */

/** The `ApiResponse<T>` envelope every controller returns. */
export interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
  timeStamp: string;
}

/** The `ErrorResponse` body returned by GlobalExceptionHandler. */
export interface ApiErrorBody {
  status: string;
  message: string;
  path: string;
  timeStamp: string;
}

/** `PageResponse<T>` — `page` is 1-based. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageQuery {
  page?: number;
  size?: number;
}

/** Java BigDecimal serialises as a JSON number. */
export type Numeric = number;
export type UUID = string;

// ---- enums ----

export type Role = "ADMIN" | "BARISTA" | "CUSTOMER" | "SUPER_ADMIN";
export type Status = "ACTIVE" | "INACTIVE";
export type UserStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "DEACTIVATED"
  | "SUSPENDED"
  | "BANNED"
  | "DELETED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
/**
 * PENDING -> PAID -> PREPARING -> COMPLETED, or PENDING -> CANCELLED.
 *
 * PENDING means placed but not paid for, and is the only status an order can be cancelled from.
 * PAID is stamped the moment money clears, so that — not COMPLETED — is what revenue counts.
 * PREPARING and COMPLETED are the barista working through the drink and handing it over.
 */
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  // Delivery orders only: dispatched to a courier, then confirmed as arrived.
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentMethod = "CASH" | "BAKONG";
export type DiscountType = "PERCENTAGE" | "FIXED";
export type Currency = "USD" | "KHR";

/**
 * Re-checked against the live /v3/api-docs — these used to be percentage-based
 * (ZERO/TWENTY_FIVE/FIFTY/SEVENTY_FIVE/HUNDRED, shared between sugar and ice). The API now
 * uses qualitative levels instead, and ice and sugar no longer share one enum.
 */
export type SugarLevel = "ZERO" | "LESS" | "NORMAL" | "EXTRA";
export type IceLevel = "NO_ICE" | "LESS_ICE" | "NORMAL" | "EXTRA_ICE";
export type MilkType = "NONE" | "LESS" | "NORMAL" | "EXTRA";

// ---- auth ----

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  /** Milliseconds. */
  expiresIn: number;
  expiresInReadable: string;
}

/**
 * Customers always get `otpRequired: true` and must exchange the `loginTicket` plus the
 * emailed code at /verify-login-otp; only the super admin skips it.
 */
export interface LoginResponse {
  otpRequired: boolean;
  loginTicket: string | null;
  tokens: AuthTokenResponse | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: Gender;
}

/**
 * Self-service edit of the signed-in account (PATCH /api/users/me). Every field is optional and
 * a field left out is unchanged — but `phoneNumber: ""` is meaningful: it clears the number on
 * file, which is the only way to remove one.
 *
 * Email is absent on purpose: changing it is an auth flow, not a profile edit.
 */
export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  gender?: Gender;
}

export interface VerifyRegistrationRequest {
  email: string;
  otp: string;
}

export type ResendOtpRequest =
  | { purpose: "REGISTER" | "RESET_PASSWORD"; email: string }
  | { purpose: "LOGIN"; loginTicket: string };

export interface VerifyLoginOtpRequest {
  loginTicket: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

/**
 * The Telegram Login Widget's callback payload, forwarded to POST /api/auth/login/telegram
 * as-is. `hash` is the widget's HMAC over the other fields, which the backend verifies against
 * the bot token — there is nothing for the frontend to validate here.
 */
export interface TelegramWidgetAuthRequest {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * A short-lived code for linking Telegram to the signed-in account — separate from the login
 * widget above. The customer opens `deepLink` (a t.me URL), which starts a chat with the bot
 * pre-filled with `code`; the bot completes the link over Telegram's webhook, not this app.
 */
/** GET /api/auth/telegram/widget-config — the bot the API verifies widget logins against. */
export interface TelegramWidgetConfigResponse {
  botUsername: string;
}

export interface TelegramLinkCodeResponse {
  code: string;
  expiresInSeconds: number;
  deepLink: string;
}

// ---- user ----

export interface UserResponse {
  id: UUID;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  gender: Gender | null;
  role: Role;
  status: UserStatus;
  telegramLinked: boolean;
  createdBy: UUID | null;
  createdByName: string | null;
  createdByRole: Role | null;
}

// ---- catalogue ----

export type CategoryGroup = "FRESH_DRINK" | "BEVERAGE" | "SNACK";
export type VariantName = "MEDIUM" | "LARGE" | "PIECE";
export type StockUnit = "PACK" | "BOX" | "CARTON" | "PIECE";
export type SellUnit = "PLATE" | "BOTTLE" | "CAN" | "CUP" | "CARTON" | "PACKAGE" | "TANK" | "PIECE";

/**
 * Was `ProductSizeOptionResponse` (free-form `name`, a `priceDelta` added to the product's own
 * price). The API now prices each variant on its own — `price`/`finalPrice` here are absolute,
 * not an add-on — and `name` is one of three fixed sizes rather than free text.
 */
export interface ProductVariantResponse {
  id: UUID;
  productId: UUID;
  name: VariantName;
  price: Numeric;
  finalPrice: Numeric;
  sortOrder: number | null;
  status: Status;
}

/** An optional add-on (extra shot, pearls, ...) a customer can attach to a cart line. */
export interface ProductExtraResponse {
  id: UUID;
  productId: UUID;
  extraId: UUID;
  name: string;
  price: Numeric;
  sortOrder: number | null;
  status: Status;
  quantityOnHand: Numeric | null;
  /** Shown next to the add-on choice so customers can see what they're adding. Null if unset. */
  imageUrl: string | null;
}

/**
 * What /api/customer/products returns. Re-checked against the live /v3/api-docs — the product
 * itself no longer carries a `price`/`finalPrice` (or a single `unit`): pricing moved entirely
 * onto `variants`, since every product must have at least a default size, and stock/sell units
 * split in two (`stockUnit` for inventory counting, `sellUnit` for what's shown at checkout).
 */
export interface CustomerProductResponse {
  id: UUID;
  name: string;
  nameKh: string | null;
  description: string | null;
  imageUrl: string | null;
  sku: string;
  stockUnit: StockUnit;
  sellUnit: SellUnit;
  unitsPerStock: Numeric;
  categoryId: UUID;
  categoryName: string;
  categoryGroup: CategoryGroup;
  status: Status;
  discountType: DiscountType | null;
  discountValue: Numeric | null;
  discountStartAt: string | null;
  discountEndAt: string | null;
  discountActive: boolean;
  variants: ProductVariantResponse[];
  extras: ProductExtraResponse[];
}

/** What GET /api/customer/categories returns. */
export interface CustomerCategoryResponse {
  id: UUID;
  name: string;
  description: string | null;
  categoryGroup: CategoryGroup;
}

export interface BannerResponse {
  id: UUID;
  title: string;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number | null;
  status: Status;
  adminId: UUID | null;
  adminName: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- cart ----

/** An extra attached to a cart line — a snapshot (name/price at the time it was added), not a
 *  live reference back to the product's extra list. */
export interface CartItemExtraResponse {
  extraId: UUID;
  name: string;
  price: Numeric;
}

export interface CartItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  productNameKh: string | null;
  productImageUrl: string | null;
  unitPrice: Numeric;
  quantity: number;
  subtotal: Numeric;
  variantId: UUID | null;
  variantName: VariantName | null;
  sugarLevel: SugarLevel | null;
  iceLevel: IceLevel | null;
  milkType: MilkType | null;
  extras: CartItemExtraResponse[];
}

export interface CartResponse {
  id: UUID;
  items: CartItemResponse[];
  totalAmount: Numeric;
}

export interface AddCartItemRequest {
  productId: UUID;
  quantity: number;
  variantId?: UUID;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  milkType?: MilkType;
  extraIds?: UUID[];
}

export interface UpdateCartItemRequest {
  quantity: number;
  variantId?: UUID;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  milkType?: MilkType;
  extraIds?: UUID[];
}

/**
 * Matches POST /api/customer/cart/checkout exactly (checked against the live /v3/api-docs) —
 * there is no `paymentMethod` here despite an earlier version of this type having one: payment
 * is a separate step after the order exists (POST .../pay/cash-on-pickup or .../pay/bakong/qr),
 * not part of checkout. `deliveryLatitude`/`deliveryLongitude` are what the backend actually
 * uses to price a delivery order by distance — omitting them (as this type used to) meant the
 * server had no coordinates to compute a real fee from.
 */
export interface CheckoutRequest {
  note?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  delivery?: {
    method: "PICKUP" | "DELIVERY";
    contactName: string;
    contactPhone: string;
    address?: string;
  };
}

// ---- orders ----

export interface OrderItemExtraResponse {
  extraId: UUID;
  name: string;
  price: Numeric;
}

export interface OrderItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  productNameKh: string | null;
  quantity: number;
  unitPrice: Numeric;
  subtotal: Numeric;
  variantName: VariantName | null;
  sugarLevel: SugarLevel | null;
  iceLevel: IceLevel | null;
  milkType: MilkType | null;
  extras: OrderItemExtraResponse[];
}

export interface OrderResponse {
  fulfillmentMethod?: "PICKUP" | "DELIVERY" | null;
  deliveryAddress?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  id: UUID;
  handledById: UUID | null;
  handledByName: string | null;
  handledByRole: Role | null;
  customerId: UUID | null;
  customerName: string | null;
  status: OrderStatus;
  items: OrderItemResponse[];
  totalAmount: Numeric;
  paymentMethod: PaymentMethod | null;
  amountTendered: Numeric | null;
  changeDue: Numeric | null;
  bakongQrString: string | null;
  bakongMd5Hash: string | null;
  bakongCurrency: Currency | null;
  bakongAmount: Numeric | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
  /** Bumped on every change. A live-push message older than the copy already held is stale. */
  updatedAt: string;
  /** Null for a pickup order. Both set together or not at all. */
  deliveryLatitude: Numeric | null;
  deliveryLongitude: Numeric | null;
  /**
   * Zero until staff quote it — check `awaitingDeliveryFee`, not this being non-null/non-zero,
   * to tell whether a delivery order's fee has actually been set yet. Already folded into
   * `totalAmount`.
   */
  deliveryFee: Numeric;
  /** Straight-line distance from the shop — null for pickup, or if the shop's own location
   *  isn't configured. */
  distanceMeters: Numeric | null;
  /** When staff last quoted the delivery fee; null until then. */
  deliveryFeeSetAt: string | null;
  /** True while a delivery order waits for staff to quote its fee — can't be paid or prepared
   *  until then. This is the field to check, not `deliveryFee == null` (it's never null). */
  awaitingDeliveryFee: boolean;
  /** Items only, before the delivery fee. totalAmount = itemsTotal + deliveryFee. */
  itemsTotal: Numeric;
}

/** The customer's own live-order-status push channel, `/user/queue/orders` over STOMP. */
export type OrderAuditAction =
  | "CREATED"
  | "CASH_COLLECTED"
  | "BAKONG_CONFIRMED"
  | "CANCELLED"
  | "DELIVERY_FEE_SET"
  | "CASH_SELECTED"
  | "BAKONG_QR_GENERATED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED";

export interface OrderUpdateMessage {
  action: OrderAuditAction;
  order: OrderResponse;
  sentAt: string;
}

/** One open (unanswered) call, or the result of pressing "Call Staff". */
export interface StaffCallResponse {
  orderId: UUID;
  customerName: string | null;
  orderStatus: OrderStatus;
  fulfillmentMethod: "PICKUP" | "DELIVERY" | null;
  calledAt: string;
  /** When the customer's button can be enabled again. Null on a stale/listed call. */
  nextCallAllowedAt: string | null;
}

/** Pushed to the customer's own `/user/queue/staff-calls` only when a call is answered. */
export interface StaffCallMessage {
  type: "CALLED" | "ANSWERED";
  orderId: UUID;
  customerName: string | null;
  orderStatus: OrderStatus;
  fulfillmentMethod: "PICKUP" | "DELIVERY" | null;
  calledAt: string;
  /** Who answered — null for a CALLED message, set for ANSWERED. */
  answeredByName: string | null;
  sentAt: string;
}

/** A product, category or extra a customer's cart/catalogue can reference. */
export type CatalogResourceType = "PRODUCT" | "CATEGORY" | "EXTRA";
export type CatalogChangeType = "CREATED" | "UPDATED" | "DELETED";

/**
 * Pushed to `/topic/catalog` (any signed-in customer) whenever a product, category or extra
 * changes. Carries no data — refetch through the normal REST endpoints, same reasoning as
 * OrderUpdateMessage not being trusted as the order's own source of truth.
 */
export interface ResourceChangeMessage {
  resource: CatalogResourceType;
  id: UUID;
  change: CatalogChangeType;
  sentAt: string;
}

export interface BakongQrResponse {
  orderId: UUID;
  qrString: string;
  md5Hash: string;
  /**
   * Already converted for `currency` — a KHR code carries whole riel, not the order's USD
   * total. Display this rather than converting the total client-side, so the figure on screen
   * always matches what the customer's wallet will charge.
   */
  amount: Numeric;
  currency: Currency;
  /** When the QR itself stops working (EMV tag 99), not a timer of the page's own invention. */
  expiresAt: string;
  /**
   * The same deadline as a duration. `expiresAt` is shop-local with no offset, so counting down
   * from it on a phone in another timezone would be wrong; this needs no clock reconciliation.
   */
  expiresInSeconds: number;
}

/** A link that opens whichever Bakong-enabled banking app the customer already has installed —
 *  for viewing the QR on the same phone that would otherwise need to scan it. */
export interface BakongDeeplinkResponse {
  orderId: UUID;
  deeplink: string;
}

export interface PublicEventResponse {
  id: UUID;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startAt: string;
  endAt: string;
}

export interface ShopSettingsResponse {
  deliveryFee: Numeric;
  khrPerUsdRate: Numeric;
}
