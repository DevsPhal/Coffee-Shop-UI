"use client";

import React, { useState } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { shippingInformationSchema } from "@/lib/authSchema";
import { cleanPhoneInput, phoneInputProps } from "@/lib/phoneUtils";
import { AlertCircle, Armchair, Check, MapPin, Navigation, Compass, Search, Loader2 } from "lucide-react";
import { isAuthenticated } from "@/lib/authStorage";
import {
  isShortMapsLink,
  locateMe,
  parseCoordinates,
  reverseGeocode,
  searchPlaces,
  type LatLng,
  type PlaceResult,
} from "@/lib/geoSearch";
import type { MapFocus } from "@/components/ui/DeliveryMapPicker";
import { normalizeTableNumber, setDineInTable, TABLE_NUMBER_PATTERN, useDineIn } from "@/lib/dineIn";
import { useLazyGetTableQuery } from "@/store/api/tableApi";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useGetCurrentUserQuery } from "@/store/api/authApi";
import { usePayCashOnPickupMutation } from "@/store/api/orderApi";
import { ICE_LABELS, MILK_LABELS, SUGAR_LABELS, VARIANT_LABELS } from "@/store/api/optionMapping";
import type { VariantName } from "@/store/api/types";
import { resolveProductImage } from "@/store/api/productAdapter";
import { toTitleCase } from "@/lib/utils";
import { useCheckout } from "@/store/api/useCheckout";
import { PaymentMethodModal } from "@/components/ui/PaymentMethodModal";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";
import { clearPersistentState, usePersistentState } from "@/hooks/usePersistentState";

const DeliveryMapPicker = dynamic(() => import("@/components/ui/DeliveryMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
      Loading map…
    </div>
  ),
});

export function CheckoutpageView() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated(),
  });
  const {
    placeOrder,
    isPlacing,
    error: checkoutError,
    errorRef: checkoutErrorRef,
  } = useCheckout();
  const [payCashOnPickup] = usePayCashOnPickupMutation();

  const { t } = useLanguage();
  const [enteredName, setFullName] = usePersistentState<string | null>("checkout:enteredName", null);
  const [enteredEmail, setEmail] = usePersistentState<string | null>("checkout:enteredEmail", null);
  const [enteredPhone, setPhone] = usePersistentState<string | null>("checkout:enteredPhone", null);
  const fullName = enteredName ?? currentUser?.fullName ?? "";
  const email = enteredEmail ?? currentUser?.email ?? "";
  const phone = enteredPhone ?? cleanPhoneInput(currentUser?.phoneNumber ?? "");
  const [baristaNote, setBaristaNote] = usePersistentState("checkout:baristaNote", "");
  const [capital, setCapital] = usePersistentState("checkout:capital", "Phnom Penh");
  const [address, setAddress] = usePersistentState("checkout:address", "");
  const dineIn = useDineIn();
  // Until the customer picks a method, scanning a shop QR makes dine-in the default.
  const [chosenMethod, setDeliveryMethod] = usePersistentState<"pickup" | "grab" | "dinein" | null>("checkout:deliveryMethod", null);
  const deliveryMethod = chosenMethod ?? (dineIn.active ? "dinein" : "pickup");
  const [tableInput, setTableInput] = useState<string | null>(null);
  const tableNumber = normalizeTableNumber(tableInput ?? dineIn.tableNumber ?? "");
  const [lookupTable, { isFetching: isCheckingTable }] = useLazyGetTableQuery();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapCoords, setMapCoords] = usePersistentState<{ lat: number; lng: number }>("checkout:mapCoords", {
    lat: 11.5621,
    lng: 104.9160,
  });
  const [tempAddress, setTempAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<PlaceResult[]>([]);
  const [locationNotice, setLocationNotice] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    capital?: string;
    address?: string;
    table?: string;
  }>({});

  const handleOpenMapModal = () => {
    setIsMapModalOpen(true);
    setTempAddress(address || capital);
    setLocationResults([]);
    setLocationNotice(null);
    setMapFocus(null);
    if (!address) void handleDetectCurrentLocation();
  };

  const placeDeliveryPin = (point: LatLng, options: { fly?: boolean; label?: string } = {}) => {
    setMapCoords(point);
    if (options.fly) setMapFocus({ ...point, zoom: 17, key: Date.now() });
    if (options.label) {
      setTempAddress(options.label);
      return;
    }
    void reverseGeocode(point).then((label) =>
      setTempAddress(label || `Lat: ${point.lat.toFixed(4)}, Lng: ${point.lng.toFixed(4)}`)
    );
  };

  const handlePickOnMap = (lat: number, lng: number) => {
    setLocationAccuracy(null);
    setLocationResults([]);
    placeDeliveryPin({ lat, lng });
  };

  const handleDetectCurrentLocation = async () => {
    setIsLocating(true);
    setLocationNotice(null);
    setLocationResults([]);
    try {
      const position = await locateMe();
      setLocationAccuracy(position.accuracy);
      placeDeliveryPin(position, { fly: true });
      setLocationNotice({
        tone: "info",
        text: `${t("Pinned your current location")} (±${Math.round(position.accuracy)} m)`,
      });
    } catch (err) {
      setLocationNotice({ tone: "error", text: t((err as Error).message) });
    } finally {
      setIsLocating(false);
    }
  };

  const chooseLocationResult = (place: PlaceResult) => {
    setLocationResults([]);
    setLocationAccuracy(null);
    setLocationNotice(null);
    placeDeliveryPin(place, { fly: true, label: [place.name, place.detail].filter(Boolean).join(", ") });
  };

  const handleSearchLocation = async () => {
    const query = searchLocationQuery.trim();
    if (!query) return;
    setLocationNotice(null);
    setLocationResults([]);

    const pasted = parseCoordinates(query);
    if (pasted) {
      setLocationAccuracy(null);
      placeDeliveryPin(pasted, { fly: true });
      return;
    }
    if (isShortMapsLink(query)) {
      setLocationNotice({
        tone: "error",
        text: t("Short Google Maps links can't be read here. Open the link, then copy the full link or the coordinates."),
      });
      return;
    }

    setIsSearchingLocation(true);
    try {
      const found = await searchPlaces(query, mapCoords);
      if (found.length === 0) {
        setLocationNotice({
          tone: "error",
          text: t("No places found. Try a street, area or landmark — or paste a Google Maps link."),
        });
      } else if (found.length === 1) {
        chooseLocationResult(found[0]);
      } else {
        setLocationResults(found);
      }
    } catch {
      setLocationNotice({ tone: "error", text: t("Search isn't reachable right now. Drag the pin or tap the map instead.") });
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleConfirmLocation = () => {
    const finalAddr = tempAddress.trim() || capital;
    setAddress(finalAddr);
    validateSingleField("address", finalAddr);
    setIsMapModalOpen(false);
    toast.add({
      type: "success",
      description: "Delivery address updated from map!",
    });
  };
  const grandTotal = subtotal;

  const validateSingleField = (
    field: "fullName" | "email" | "phone" | "address" | "capital",
    val?: string
  ) => {
    if (deliveryMethod !== "grab" && ["capital", "address"].includes(field)) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }
    const stringVal = (val || "").trim();
    const res = shippingInformationSchema.shape[field].safeParse(stringVal);
    if (!res.success) {
      setErrors((prev) => ({ ...prev, [field]: res.error.issues[0]?.message }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectDeliveryMethod = (method: "pickup" | "grab" | "dinein") => {
    setDeliveryMethod(method);
    if (method !== "dinein") setErrors((prev) => ({ ...prev, table: undefined }));
    if (method !== "grab") {
      setErrors((prev) => ({
        ...prev,
        capital: undefined,
        address: undefined,
      }));
    }
  };

  // Confirms the typed table exists before the order is placed, and remembers it for this visit.
  const confirmTable = async (): Promise<boolean> => {
    if (!TABLE_NUMBER_PATTERN.test(tableNumber)) {
      const message = tableNumber ? t("Use the number shown on your table, e.g. 05") : t("Enter your table number");
      setErrors((prev) => ({ ...prev, table: message }));
      toast.add({ type: "warning", description: message });
      return false;
    }
    try {
      const table = await lookupTable(tableNumber, true).unwrap();
      setDineInTable(table.tableNumber);
      setTableInput(null);
      setErrors((prev) => ({ ...prev, table: undefined }));
      return true;
    } catch (err) {
      const notFound = (err as { status?: unknown } | null)?.status === 404;
      const message = notFound
        ? `${t("Table")} ${tableNumber} ${t("doesn't exist. Check the number on your table.")}`
        : apiErrorMessage(err as Parameters<typeof apiErrorMessage>[0], "Could not check the table number.");
      setErrors((prev) => ({ ...prev, table: message }));
      toast.add({ type: "warning", description: message });
      return false;
    }
  };

  const handlePlaceOrderNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPlacing || isCheckingTable) return;
    if (items.length === 0) {
      toast.add({
        type: "warning",
        description: "Your cart is empty — add items first.",
      });
      return;
    }

    const schemaToValidate =
      deliveryMethod !== "grab"
        ? shippingInformationSchema.pick({ fullName: true, email: true, phone: true })
        : shippingInformationSchema;

    const validationResult = schemaToValidate.safeParse({
      fullName: (fullName || "").trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      capital: (capital || "").trim(),
      address: (address || "").trim(),
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const newErrors = {
        fullName: fieldErrors.fullName?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        ...(deliveryMethod === "grab"
          ? {
              capital: fieldErrors.capital?.[0],
              address: fieldErrors.address?.[0],
            }
          : {}),
      };
      setErrors(newErrors);

      const firstErr =
        newErrors.fullName ||
        newErrors.email ||
        newErrors.phone ||
        (deliveryMethod === "grab"
          ? newErrors.capital || newErrors.address
          : undefined) ||
        "Please complete shipping information.";

      toast.add({
        type: "warning",
        description: firstErr,
      });
      return;
    }

    setErrors({});

    if (deliveryMethod === "dinein" && !(await confirmTable())) return;

    if (deliveryMethod === "grab") {
      void handleSubmitDeliveryOrder();
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const submitOrder = async () => {
    if (!isAuthenticated()) {
      toast.add({
        type: "warning",
        description: "Please sign in to place your order.",
      });
      router.push(`/login?next=${encodeURIComponent("/checkout")}`);
      return null;
    }

    const isDelivery = deliveryMethod === "grab";
    const isDineIn = deliveryMethod === "dinein";
    const deliveryLocation = isDelivery
      ? [address, capital].filter(Boolean).join(", ") || "Delivery Address"
      : isDineIn
        ? `Table ${tableNumber}`
        : "Pickup at Store";

    const order = await placeOrder({
      note: baristaNote.trim(),
      ...(isDelivery ? { deliveryLatitude: mapCoords.lat, deliveryLongitude: mapCoords.lng } : {}),
      delivery: {
        method: isDelivery ? "DELIVERY" : isDineIn ? "DINE_IN" : "PICKUP",
        contactName: fullName.trim(),
        contactPhone: phone.trim(),
        ...(isDelivery ? { address: deliveryLocation } : {}),
        ...(isDineIn ? { tableNumber } : {}),
      },
    });
    if (!order) {
      toast.add({
        type: "error",
        description:
          checkoutErrorRef.current ??
          checkoutError ??
          "Could not place your order. Please try again.",
      });
      return null;
    }
    clearPersistentState("checkout:baristaNote");
    return { order, isDelivery, deliveryLocation };
  };

  const persistCheckoutSummary = (
    order: { id: string; deliveryFee?: number | null },
    isDelivery: boolean,
    deliveryLocation: string,
    paymentType: string
  ) => {
    try {
      localStorage.setItem(
        "checkout_delivery",
        JSON.stringify({
          orderId: order.id,
          method: deliveryMethod,
          fee: Number(order.deliveryFee ?? 0),
          customerName:
            (fullName || "").trim() || currentUser?.fullName || "Customer",
          location: deliveryLocation,
          paymentType,
        })
      );
    } catch {
    }
  };

  const handleConfirmPaymentMethod = async (chosenMethod: "QR Scan" | "Cash") => {
    const result = await submitOrder();
    if (!result) return;
    let { order } = result;
    const { isDelivery, deliveryLocation } = result;

    if (chosenMethod === "Cash") {
      try {
        order = await payCashOnPickup(order.id).unwrap();
      } catch (err) {
        toast.add({
          type: "warning",
          description: apiErrorMessage(
            err as Parameters<typeof apiErrorMessage>[0],
            "Order placed, but could not confirm cash payment automatically."
          ),
        });
      }
    }

    persistCheckoutSummary(order, isDelivery, deliveryLocation, chosenMethod);
    if (chosenMethod === "Cash") {
      router.push(`/checkoutdone?orderId=${order.id}`);
    } else {
      router.push(`/payment?orderId=${order.id}`);
    }
  };

  const handleSubmitDeliveryOrder = async () => {
    const result = await submitOrder();
    if (!result) return;
    const { order, isDelivery, deliveryLocation } = result;
    persistCheckoutSummary(order, isDelivery, deliveryLocation, "Pending");
    router.push(`/checkoutdone?orderId=${order.id}`);
  };

  const handleCancelOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    toast.add({
      type: "warning",
      description: "Checkout has been cancelled.",
    });
    router.push("/cart");
  };

  return (
    <div className="checkout_page_container font-sans">
      <div className="checkout_page_header">
        <h1 className="checkout_page_title">
          Checkout
        </h1>
        <nav className="checkout_page_breadcrumb" aria-label="Breadcrumb">
          <Link
            href="/"
            className="checkout_page_breadcrumb_link"
          >
            Home
          </Link>
          <span className="checkout_page_breadcrumb_separator">»</span>
          <Link
            href="/cart"
            className="checkout_page_breadcrumb_link"
          >
            {t("Shopping Cart")}
          </Link>
          <span className="checkout_page_breadcrumb_separator">»</span>
          <span className="checkout_page_breadcrumb_current">{t("Checkout")}</span>
        </nav>
      </div>

      <div className="checkout_page_grid">
        <div className="checkout_page_form_section">
          <div>
            <h2 className="checkout_section_title">{t("Shipping Information")}</h2>

            <div className="checkout_form_stack">
              <div className="checkout_form_row">
                <div>
                  <label className="checkout_field_label">{t("Full Name")}</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      validateSingleField("fullName", e.target.value);
                    }}
                    placeholder="Enter your Name"
                    className="checkout_input"
                  />
                  {errors.fullName && <TooltipAlert message={errors.fullName} />}
                </div>

                <div>
                  <label className="checkout_field_label">{t("Email Address")}</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateSingleField("email", e.target.value);
                    }}
                    placeholder="Enter your email"
                    className="checkout_input"
                  />
                  {errors.email && <TooltipAlert message={errors.email} />}
                </div>
              </div>

              {deliveryMethod !== "grab" ? (
                <div className="checkout_form_row">
                  <div>
                    <label className="checkout_field_label">{t("Phone Number")}</label>
                    <div className="checkout_phone_input_wrapper">
                      <div className="checkout_phone_prefix">
                        <Image
                          src="/images/cambodia.svg"
                          alt="Cambodia"
                          width={20}
                          height={14}
                          className="checkout_phone_flag"
                        />
                        <span className="checkout_phone_code">KH</span>
                      </div>
                      <input
                        {...phoneInputProps}
                        value={phone}
                        onChange={(e) => {
                          const val = cleanPhoneInput(e.target.value);
                          setPhone(val);
                          validateSingleField("phone", val);
                        }}
                        className="checkout_phone_field"
                      />
                    </div>
                    {errors.phone && <TooltipAlert message={errors.phone} />}
                  </div>
                </div>
              ) : (
                <>
                  <div className="checkout_form_row">
                    <div>
                      <label className="checkout_field_label">{t("Phone Number")}</label>
                      <div className="checkout_phone_input_wrapper">
                        <div className="checkout_phone_prefix">
                          <Image
                            src="/images/cambodia.svg"
                            alt="Cambodia"
                            width={20}
                            height={14}
                            className="checkout_phone_flag"
                          />
                          <span className="checkout_phone_code">KH</span>
                        </div>
                        <input
                          {...phoneInputProps}
                          value={phone}
                          onChange={(e) => {
                            const val = cleanPhoneInput(e.target.value);
                            setPhone(val);
                            validateSingleField("phone", val);
                          }}
                          className="checkout_phone_field"
                        />
                      </div>
                      {errors.phone && <TooltipAlert message={errors.phone} />}
                    </div>

                    <div>
                      <label className="checkout_field_label">{t("Capital / City")}</label>
                      <div className="checkout_select_wrapper">
                        <select
                          value={capital}
                          onChange={(e) => setCapital(e.target.value)}
                          disabled
                          className="checkout_select checkout_input_disabled cursor-not-allowed opacity-75 bg-gray-50 pr-4"
                        >
                          <option value="Phnom Penh">{t("Phnom Penh")}</option>
                        </select>
                      </div>
                      {errors.capital && <TooltipAlert message={errors.capital} />}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="checkout_field_label mb-0">{t("Delivery Address")}</label>
                    </div>
                    <div className="relative flex items-center">
                      <Input
                        type="text"
                        readOnly
                        value={address}
                        onClick={handleOpenMapModal}
                        placeholder={t("Click pin button to select location on map")}
                        className="checkout_input pr-28 cursor-pointer select-none bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleOpenMapModal}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A1255B] hover:bg-[#881d52] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 border-none"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {errors.address && <TooltipAlert message={errors.address} />}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h2 className="checkout_section_title">{t("Delivery Method")}</h2>

            <div className="checkout_delivery_options">
              <div
                onClick={() => handleSelectDeliveryMethod("dinein")}
                className={`checkout_delivery_card ${
                  deliveryMethod === "dinein" ? "checkout_delivery_card_active" : ""
                }`}
              >
                <div className="checkout_delivery_card_content">
                  <div className="checkout_delivery_logo_container">
                    <Armchair className="h-7 w-7 text-[#A1255B]" aria-hidden />
                  </div>
                  <div>
                    <h3 className="checkout_delivery_title">
                      {t("Dine-in")}
                      {deliveryMethod === "dinein" && tableNumber && !errors.table ? ` · ${t("Table")} ${tableNumber}` : ""}
                    </h3>
                    <p className="checkout_delivery_price">{t("Served to your table")}</p>
                  </div>
                </div>

                <div
                  className={`checkout_radio_indicator ${
                    deliveryMethod === "dinein" ? "checkout_radio_indicator_active" : ""
                  }`}
                />
              </div>
              <div
                onClick={() => handleSelectDeliveryMethod("pickup")}
                className={`checkout_delivery_card ${
                  deliveryMethod === "pickup" ? "checkout_delivery_card_active" : ""
                }`}
              >
                <div className="checkout_delivery_card_content">
                  <div className="checkout_delivery_logo_container">
                    <BrandLogo href={null} className="h-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="checkout_delivery_title">{t("Pickup at Store")}</h3>
                    <p className="checkout_delivery_price">$0.00</p>
                  </div>
                </div>

                <div
                  className={`checkout_radio_indicator ${
                    deliveryMethod === "pickup" ? "checkout_radio_indicator_active" : ""
                  }`}
                />
              </div>

              <div
                onClick={() => handleSelectDeliveryMethod("grab")}
                className={`checkout_delivery_card ${
                  deliveryMethod === "grab" ? "checkout_delivery_card_active" : ""
                }`}
              >
                <div className="checkout_delivery_card_content">
                  <div className="checkout_delivery_logo_container">
                    <Image
                      src="/images/delivery.png"
                      alt="Grab Express"
                      width={44}
                      height={28}
                      style={{ width: "auto", height: "auto" }}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="checkout_delivery_title">{t("Home Delivery")}</h3>
                    <p className="checkout_delivery_price text-xs">{t("Fee set by the shop")}</p>
                  </div>
                </div>

                <div
                  className={`checkout_radio_indicator ${
                    deliveryMethod === "grab" ? "checkout_radio_indicator_active" : ""
                  }`}
                />
              </div>
              {deliveryMethod === "dinein" ? (
                <div className="checkout_table_field">
                  <label htmlFor="checkout-table-number" className="checkout_field_label">
                    {t("Table number")}
                  </label>
                  <Input
                    id="checkout-table-number"
                    value={tableInput ?? dineIn.tableNumber ?? ""}
                    onChange={(e) => {
                      setTableInput(e.target.value.toUpperCase().replace(/[^A-Za-z0-9-]/g, "").slice(0, 20));
                      setErrors((prev) => ({ ...prev, table: undefined }));
                    }}
                    placeholder={t("e.g. 05")}
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.table)}
                    aria-describedby={errors.table ? "checkout-table-error" : "checkout-table-hint"}
                    className={`checkout_input checkout_table_input ${errors.table ? "border-red-500" : ""}`}
                  />
                  {errors.table ? (
                    <p id="checkout-table-error" className="checkout_table_error">{errors.table}</p>
                  ) : (
                    <p id="checkout-table-hint" className="checkout_table_hint">{t("You'll find the number on your table.")}</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="checkout_summary_card">
          <h2 className="checkout_summary_title">{t("Order Summary")}</h2>

          <div className="checkout_summary_items_list" suppressHydrationWarning>
            {items.length === 0 ? (
              <p className="checkout_summary_empty" suppressHydrationWarning>{t("Your cart is empty")}</p>
            ) : (
              items.map((item) => {
                const customDetails: string[] = [];
                if (item.iceLevel) customDetails.push(`Ice: ${ICE_LABELS[item.iceLevel]}`);
                if (item.sugarLevel)
                  customDetails.push(`Sugar: ${SUGAR_LABELS[item.sugarLevel]}`);
                if (item.milkType) customDetails.push(`Milk: ${MILK_LABELS[item.milkType]}`);
                const extrasTotal = (item.selectedExtras ?? []).reduce(
                  (sum, extra) => sum + extra.price,
                  0
                );

                return (
                  <div key={item.lineId} className="checkout_item_row">
                    <div className="checkout_item_info">
                      <div className="checkout_item_image_wrapper">
                        <Image
                          src={resolveProductImage(item.image)}
                          alt={toTitleCase(item.title)}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="checkout_item_details">
                        <h3 className="checkout_item_title">{t(toTitleCase(item.title))}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <p className="checkout_item_price font-extrabold text-[#A1255B]" suppressHydrationWarning>
                            ${((item.unitPrice + extrasTotal) * item.quantity).toFixed(2)}
                          </p>
                          {item.variantName && (
                            <span className="rounded-full text-[10px] font-semibold text-[#A1255B] bg-pink-50 border border-pink-200 px-1.5 py-0.5 ">
                              Size: {VARIANT_LABELS[item.variantName as VariantName]}
                            </span>
                          )}
                          {customDetails.map((detail, dIdx) => (
                            <span
                              key={dIdx}
                              className="rounded-full text-[10px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-1.5 py-0.5 "
                            >
                              {detail}
                            </span>
                          ))}
                          {(item.selectedExtras ?? []).map((extra) => (
                            <span
                              key={extra.extraId}
                              className="rounded-full text-[10px] font-semibold text-[#A1255B] bg-pink-50 border border-pink-200 px-1.5 py-0.5 "
                            >
                              + {t(extra.name)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="checkout_item_qty" suppressHydrationWarning>{t("Quantity")}: {item.quantity}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="checkout_summary_breakdown" suppressHydrationWarning>
            {(() => {
              const fullSubtotal = items.reduce((acc, item) => {
                const original = item.originalUnitPrice ?? item.unitPrice;
                const extrasTotal = (item.selectedExtras ?? []).reduce(
                  (sum, extra) => sum + extra.price,
                  0
                );
                return acc + (Math.max(original, item.unitPrice) + extrasTotal) * item.quantity;
              }, 0);

              const totalDiscount = Math.max(0, fullSubtotal - subtotal);
              const hasDiscount = totalDiscount > 0;

              return (
                <>
                  <div className="checkout_summary_line">
                    <span className="checkout_summary_label">{t("Subtotal:")}</span>
                    <span className="checkout_summary_value" suppressHydrationWarning>
                      ${(hasDiscount ? fullSubtotal : subtotal).toFixed(2)}
                    </span>
                  </div>

                  {hasDiscount && (
                    <div className="checkout_summary_line">
                      <span className="checkout_summary_label">{t("Discount:")}</span>
                      <span className="checkout_summary_value font-bold text-[#A1255B]" suppressHydrationWarning>
                        -${totalDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              );
            })()}

            {deliveryMethod === "grab" && (
              <div className="checkout_summary_line">
                <span className="checkout_summary_label">{t("Delivery Fee:")}</span>
                <span className="checkout_summary_value text-gray-500 text-xs sm:text-sm" suppressHydrationWarning>
                  {t("Set by the shop once you place your order — you'll pick how to pay after")}
                </span>
              </div>
            )}

            <div className="checkout_summary_line_total">
              <span className="checkout_summary_label_bold">{t("Total:")}</span>
              <span className="checkout_summary_value" suppressHydrationWarning>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="w-full mt-3">
            <label
              htmlFor="barista-note"
              className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1"
            >
              {t("Note for the barista")}{" "}
              <span className="font-medium normal-case text-gray-400">
                ({t("optional")})
              </span>
            </label>
            <textarea
              id="barista-note"
              rows={2}
              maxLength={200}
              value={baristaNote}
              onChange={(e) => setBaristaNote(e.target.value)}
              placeholder={t("e.g. less ice, extra hot, no straw")}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 outline-none focus:border-[#A1255B] focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full mt-1">
            <button
              type="button"
              onClick={handlePlaceOrderNow}
              disabled={isCheckingTable}
              className="checkout_submit_btn"
            >
              {isCheckingTable ? t("Checking table...") : t("Place Order")}
            </button>

            <button
              type="button"
              onClick={handleCancelOrder}
              className="checkout_cancel_btn !mt-0"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>

      <Modal open={showCancelModal} onOpenChange={setShowCancelModal}>
        <ModalContent className="max-w-sm p-6 text-center rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)]" showCloseButton={false}>
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <AlertCircle className="w-6 h-6 stroke-[2.2]" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-1">
            Are you sure to cancel?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6 leading-normal">
            Your order information will be lost.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl text-sm border border-gray-200 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              No
            </button>

            <button
              type="button"
              onClick={handleConfirmCancel}
              className="w-full bg-[#A1255B] hover:bg-[#881d52] text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-sm active:scale-[0.98] border-none"
            >
              Yes
            </button>
          </div>
        </ModalContent>
      </Modal>

      <PaymentMethodModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        grandTotal={grandTotal}
        onConfirm={handleConfirmPaymentMethod}
      />
      {checkoutError && <p role="alert" className="mt-3 text-center text-sm text-red-600">{checkoutError}</p>}

      <Modal open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <ModalContent className="max-w-xl p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-2xl">
          <div className="bg-[#A1255B] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="text-base font-bold leading-tight">{t("Select Delivery Location")}</h3>
                <p className="text-xs text-white/80">{t("Drag the pin or tap the map. Scroll or pinch to zoom.")}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 border-b border-gray-100 space-y-2">
            <form
              className="flex flex-wrap sm:flex-nowrap gap-2 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSearchLocation();
              }}
            >
              <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchLocationQuery}
                  onChange={(e) => setSearchLocationQuery(e.target.value)}
                  placeholder={t("Street, landmark, area, or paste a Google Maps link")}
                  aria-label={t("Search for a place")}
                  enterKeyHint="search"
                  className="w-full h-10 pl-9 pr-3 rounded-full bg-white text-sm border border-gray-200 outline-none focus:border-[#A1255B] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingLocation || !searchLocationQuery.trim()}
                className="flex-1 sm:flex-none h-10 flex items-center justify-center gap-1.5 px-4 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSearchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t("Search")}
              </button>
              <button
                type="button"
                onClick={() => void handleDetectCurrentLocation()}
                disabled={isLocating}
                className="flex-1 sm:flex-none h-10 flex items-center justify-center gap-1.5 whitespace-nowrap px-4 rounded-full bg-[#A1255B] hover:bg-[#881d52] text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-50"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                <span>{t("Use my location")}</span>
              </button>
            </form>

            {locationResults.length > 0 ? (
              <ul className="max-h-44 overflow-y-auto rounded-xl border border-gray-200 bg-white" aria-label={t("Search results")}>
                {locationResults.map((place) => (
                  <li key={place.id} className="border-b border-gray-100 last:border-0">
                    <button
                      type="button"
                      onClick={() => chooseLocationResult(place)}
                      className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 cursor-pointer"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A1255B]" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900">{place.name}</span>
                        {place.detail ? <span className="block truncate text-xs text-gray-500">{place.detail}</span> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {locationNotice ? (
              <p
                role={locationNotice.tone === "error" ? "alert" : "status"}
                className={`rounded-lg px-3 py-2 text-xs ${
                  locationNotice.tone === "error" ? "bg-red-50 text-red-700" : "bg-pink-50 text-[#A1255B]"
                }`}
              >
                {locationNotice.text}
              </p>
            ) : null}
          </div>

          <div className="relative w-full h-72 sm:h-80 bg-gray-100">
            {isMapModalOpen && (
              <DeliveryMapPicker
                lat={mapCoords.lat}
                lng={mapCoords.lng}
                onPick={handlePickOnMap}
                focus={mapFocus}
                accuracy={locationAccuracy}
              />
            )}

            <div className="absolute top-3 left-3 z-1000 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-gray-800 flex items-center gap-1.5 border border-white pointer-events-none">
              <Compass className="w-4 h-4 text-[#A1255B]" />
              <span className="tabular-nums">
                {mapCoords.lat.toFixed(5)}, {mapCoords.lng.toFixed(5)}
              </span>
            </div>
          </div>

          <div className="p-4 bg-white space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                {t("Confirmed Location Address")}
              </label>
              <textarea
                rows={2}
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                placeholder={t("Address details will appear here...")}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 outline-none focus:border-[#A1255B] focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="w-full rounded-full bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 text-xs sm:text-sm border border-gray-200 transition-all cursor-pointer"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmLocation}
                className="w-full rounded-full bg-[#A1255B] hover:bg-[#881d52] text-white font-semibold py-2.5 px-4 text-xs sm:text-sm transition-all cursor-pointer shadow-md border-none flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t("Confirm Location")}</span>
              </button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default CheckoutpageView;
