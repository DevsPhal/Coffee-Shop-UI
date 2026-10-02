export interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
  timeStamp: string;
}

export interface ApiErrorBody {
  status: string;
  message: string;
  path: string;
  timeStamp: string;
}

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

export type Numeric = number;
export type UUID = string;

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
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentMethod = "CASH" | "BAKONG";
export type DiscountType = "PERCENTAGE" | "FIXED";
export type Currency = "USD" | "KHR";

export type SugarLevel = "ZERO" | "LESS" | "NORMAL" | "EXTRA";
export type IceLevel = "NO_ICE" | "LESS_ICE" | "NORMAL" | "EXTRA_ICE";
export type MilkType = "NONE" | "LESS" | "NORMAL" | "EXTRA";

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresInReadable: string;
}

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

export interface TelegramWidgetAuthRequest {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramWidgetConfigResponse {
  botUsername: string;
  loginDomain: string | null;
}

export interface TelegramLinkCodeResponse {
  code: string;
  expiresInSeconds: number;
  deepLink: string;
}

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

export type CategoryGroup = "FRESH_DRINK" | "BEVERAGE" | "SNACK";
export type VariantName = "MEDIUM" | "LARGE" | "PIECE";
export type StockUnit = "PACK" | "BOX" | "CARTON" | "PIECE";
export type SellUnit = "PLATE" | "BOTTLE" | "CAN" | "CUP" | "CARTON" | "PACKAGE" | "TANK" | "PIECE";

export interface ProductVariantResponse {
  id: UUID;
  productId: UUID;
  name: VariantName;
  price: Numeric;
  finalPrice: Numeric;
  sortOrder: number | null;
  status: Status;
}

export interface ProductExtraResponse {
  id: UUID;
  productId: UUID;
  extraId: UUID;
  name: string;
  price: Numeric;
  sortOrder: number | null;
  status: Status;
  quantityOnHand: Numeric | null;
  imageUrl: string | null;
}

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

export type FulfillmentMethod = "PICKUP" | "DELIVERY" | "DINE_IN";

export interface CheckoutRequest {
  note?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  delivery?: {
    method: FulfillmentMethod;
    contactName: string;
    contactPhone: string;
    address?: string;
    tableNumber?: string;
  };
}

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
  fulfillmentMethod?: FulfillmentMethod | null;
  tableNumber?: string | null;
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
  updatedAt: string;
  deliveryLatitude: Numeric | null;
  deliveryLongitude: Numeric | null;
  deliveryFee: Numeric;
  distanceMeters: Numeric | null;
  deliveryFeeSetAt: string | null;
  estimatedReadyAt: string | null;
  awaitingDeliveryFee: boolean;
  itemsTotal: Numeric;
}

export type OrderAuditAction =
  | "CREATED"
  | "CASH_COLLECTED"
  | "BAKONG_CONFIRMED"
  | "CANCELLED"
  | "DELIVERY_FEE_SET"
  | "ESTIMATE_SET"
  | "CASH_SELECTED"
  | "BAKONG_QR_GENERATED"
  | "LOCATION_PINNED"
  | "STAFF_CALLED"
  | "STAFF_CALL_ANSWERED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED";

export interface OrderUpdateMessage {
  action: OrderAuditAction;
  order: OrderResponse;
  sentAt: string;
}

export type StaffCallReason =
  | "PAYMENT_HELP"
  | "CHANGE_ORDER"
  | "ORDER_DELAY"
  | "WRONG_OR_MISSING_ITEM"
  | "NAPKINS_UTENSILS"
  | "DELIVERY_HELP"
  | "OTHER";

export interface StaffCallRequest {
  reason: StaffCallReason;
  note?: string;
}

export type StaffCallStatus = "OPEN" | "ANSWERED";

export interface StaffCallResponse {
  orderId: UUID;
  customerName: string | null;
  orderStatus: OrderStatus;
  fulfillmentMethod: FulfillmentMethod | null;
  tableNumber: string | null;
  status: StaffCallStatus;
  reason: StaffCallReason;
  note: string | null;
  calledAt: string;
  answeredByName: string | null;
  reply: string | null;
  answeredAt: string | null;
  nextCallAllowedAt: string | null;
}

export interface StaffCallMessage {
  type: "CALLED" | "ANSWERED";
  orderId: UUID;
  customerName: string | null;
  orderStatus: OrderStatus;
  fulfillmentMethod: FulfillmentMethod | null;
  tableNumber: string | null;
  reason: StaffCallReason;
  note: string | null;
  calledAt: string;
  answeredByName: string | null;
  reply: string | null;
  sentAt: string;
}

export type CatalogResourceType = "PRODUCT" | "CATEGORY" | "EXTRA";
export type CatalogChangeType = "CREATED" | "UPDATED" | "DELETED";

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
  amount: Numeric;
  currency: Currency;
  expiresAt: string;
  expiresInSeconds: number;
}

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

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED";

export interface TableResponse {
  id: UUID;
  tableNumber: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  capacity: number;
  guestCount: number;
  status: TableStatus;
  scanUrl: string;
}
