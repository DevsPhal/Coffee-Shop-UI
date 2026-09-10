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

export type SugarLevel = "ZERO" | "TWENTY_FIVE" | "FIFTY" | "SEVENTY_FIVE" | "HUNDRED";
export type IceLevel = SugarLevel;
export type MilkType =
  | "NONE"
  | "WHOLE_MILK"
  | "SKIM_MILK"
  | "OAT_MILK"
  | "ALMOND_MILK"
  | "SOY_MILK"
  | "CONDENSED_MILK";

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

export interface ProductSizeOptionResponse {
  id: UUID;
  productId: UUID;
  name: string;
  priceDelta: Numeric;
  sortOrder: number | null;
  status: Status;
}

/** What /api/customer/products returns — no stock levels or audit fields. */
export interface CustomerProductResponse {
  id: UUID;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sku: string;
  unit: string;
  price: Numeric;
  categoryId: UUID;
  categoryName: string;
  status: Status;
  discountType: DiscountType | null;
  discountValue: Numeric | null;
  discountStartAt: string | null;
  discountEndAt: string | null;
  discountActive: boolean;
  finalPrice: Numeric;
  sizeOptions: ProductSizeOptionResponse[];
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

export interface CartItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  productImageUrl: string | null;
  unitPrice: Numeric;
  quantity: number;
  subtotal: Numeric;
  sizeOptionId: UUID | null;
  sizeOptionName: string | null;
  sugarLevel: SugarLevel | null;
  iceLevel: IceLevel | null;
  milkType: MilkType | null;
}

export interface CartResponse {
  id: UUID;
  items: CartItemResponse[];
  totalAmount: Numeric;
}

export interface AddCartItemRequest {
  productId: UUID;
  quantity: number;
  sizeOptionId?: UUID;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  milkType?: MilkType;
}

export interface UpdateCartItemRequest {
  quantity: number;
  sizeOptionId?: UUID;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  milkType?: MilkType;
}

export interface CheckoutRequest {
  note?: string;
  delivery?: {
    method: "PICKUP" | "DELIVERY";
    contactName: string;
    contactPhone: string;
    address?: string;
  };
  paymentMethod?: PaymentMethod;
}

// ---- orders ----

export interface OrderItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: Numeric;
  subtotal: Numeric;
  sizeOptionName: string | null;
  sugarLevel: SugarLevel | null;
  iceLevel: IceLevel | null;
  milkType: MilkType | null;
}

export interface OrderResponse {
  fulfillmentMethod?: "PICKUP" | "DELIVERY" | null;
  deliveryFee?: Numeric | null;
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
