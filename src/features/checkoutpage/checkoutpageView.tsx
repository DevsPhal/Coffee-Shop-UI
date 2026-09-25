"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useMounted } from "@/hooks/useMounted";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { shippingInformationSchema } from "@/lib/authSchema";
import { cleanPhoneInput } from "@/lib/phoneUtils";
import { AlertCircle, Check, MapPin, Navigation, Compass, Search, Loader2 } from "lucide-react";
import { isAuthenticated } from "@/lib/authStorage";
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

// Leaflet touches `window` on import, which crashes during server rendering — this defers it
// to the client, same as react-leaflet's own Next.js guidance.
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
  const isMounted = useMounted();
  const [enteredName, setFullName] = useState<string | null>(null);
  const [enteredEmail, setEmail] = useState<string | null>(null);
  const [enteredPhone, setPhone] = useState<string | null>(null);
  const fullName = enteredName ?? currentUser?.fullName ?? "";
  const email = enteredEmail ?? currentUser?.email ?? "";
  const phone = enteredPhone ?? cleanPhoneInput(currentUser?.phoneNumber ?? "");
  // Anything the customer wants the barista to know. Optional, and free text — it reaches the
  // person actually making the drink, on the queue board.
  const [baristaNote, setBaristaNote] = useState("");
  const [capital, setCapital] = useState("Phnom Penh");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "grab">("pickup");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Location Picker State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number }>({
    lat: 11.5621, // Phnom Penh default lat
    lng: 104.9160, // Phnom Penh default lng
  });
  const [tempAddress, setTempAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [searchLocationQuery, setSearchLocationQuery] = useState("");

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    capital?: string;
    address?: string;
  }>({});

  // Location Picker Helper Functions
  const handleOpenMapModal = () => {
    setIsMapModalOpen(true);
    setTempAddress(address || capital);
    if (navigator.geolocation && !address) {
      handleDetectCurrentLocation();
    }
  };

  // Shared by "Locate Me" and by dragging/clicking the pin on the map itself — whichever set
  // the coordinates, the address line should update to match.
  const reverseGeocodeToAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        const formatted = data.display_name.split(",").slice(0, 4).join(", ");
        setTempAddress(formatted);
      } else {
        setTempAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Phnom Penh)`);
      }
    } catch {
      setTempAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    }
  };

  // Dragging or clicking the pin directly on the map — the map component only reports
  // coordinates, so this is where they turn into an address.
  const handlePickOnMap = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    reverseGeocodeToAddress(lat, lng);
  };

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.add({
        type: "warning",
        description: "Geolocation is not supported by your browser.",
      });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCoords({ lat: latitude, lng: longitude });
        await reverseGeocodeToAddress(latitude, longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        toast.add({
          type: "warning",
          description: "Could not retrieve exact location. Defaulting to Phnom Penh region.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchLocation = async () => {
    if (!searchLocationQuery.trim()) return;
    setIsLocating(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          searchLocationQuery + ", Cambodia"
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);
        setMapCoords({ lat: newLat, lng: newLng });
        setTempAddress(first.display_name.split(",").slice(0, 4).join(", "));
      } else {
        toast.add({
          type: "warning",
          description: "Location not found. Please try another query.",
        });
      }
    } catch {
      toast.add({
        type: "error",
        description: "Error searching location.",
      });
    } finally {
      setIsLocating(false);
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
  // Delivery fee is a manual figure the shop sets once it can see the pinned address — there's
  // no auto-pricing by distance, and no order exists yet at this point on the page, so this is
  // always just the cart subtotal. The fee (and the real, server-computed grand total) only
  // exist from /checkoutdone onward, once the order has actually been placed.
  const grandTotal = subtotal;

  const validateSingleField = (
    field: "fullName" | "email" | "phone" | "address" | "capital",
    val?: string
  ) => {
    if (deliveryMethod === "pickup" && ["capital", "address"].includes(field)) {
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

  const handleSelectDeliveryMethod = (method: "pickup" | "grab") => {
    setDeliveryMethod(method);
    if (method === "pickup") {
      setErrors((prev) => ({
        ...prev,
        capital: undefined,
        address: undefined,
      }));
    }
  };

  const handlePlaceOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPlacing) return;
    if (items.length === 0) {
      toast.add({
        type: "warning",
        description: "Your cart is empty! Please add items before placing order.",
      });
      return;
    }

    // Validate Shipping Information with Zod Schema
    const schemaToValidate =
      deliveryMethod === "pickup"
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

    // Delivery has no Cash/QR choice to make yet — the shop hasn't set a fee for it (there's
    // no auto-pricing by distance, a person sets it by hand once the pin is visible), so
    // there's nothing to charge either method for. Pickup has a fixed price up front, so it
    // still asks right here.
    if (deliveryMethod === "grab") {
      void handleSubmitDeliveryOrder();
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  /**
   * Creates the order for real — the cart is local until this point. Shared by both the
   * pickup (pay-now) and delivery (pay-later) paths below; what happens after the order exists
   * is where they diverge.
   *
   * The fulfillment method, contact details and (for delivery) the address are sent with the
   * order — along with the map pin's coordinates, which is what lets the shop see where the
   * order needs to go and set a delivery fee by hand (there's no auto-pricing by distance).
   * There is no `paymentMethod` field on checkout itself: that's a separate step once the
   * order exists, which is why this doesn't send one.
   */
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
    const deliveryLocation = isDelivery
      ? [address, capital].filter(Boolean).join(", ") || "Delivery Address"
      : "Pickup at Store";

    const order = await placeOrder({
      note: baristaNote.trim(),
      ...(isDelivery ? { deliveryLatitude: mapCoords.lat, deliveryLongitude: mapCoords.lng } : {}),
      delivery: {
        method: isDelivery ? "DELIVERY" : "PICKUP",
        contactName: fullName.trim(),
        contactPhone: phone.trim(),
        ...(isDelivery ? { address: deliveryLocation } : {}),
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
          // The real fee the shop set — not a client-side guess. Still null here for a fresh
          // delivery order; /checkoutdone picks up the real value once staff set it.
          fee: Number(order.deliveryFee ?? 0),
          customerName:
            (fullName || "").trim() || currentUser?.fullName || "Customer",
          location: deliveryLocation,
          estimatedTime: isDelivery ? "10 - 15 mins" : "5 mins",
          paymentType,
        })
      );
    } catch {
      // Storage unavailable — the confirmation screen falls back to the order itself.
    }
  };

  /**
   * Pickup only: price is fixed up front, so Cash-on-pickup is confirmed right here with its
   * own call, and Bakong hands off to /payment, which generates the QR against the order id.
   */
  const handleConfirmPaymentMethod = async (chosenMethod: "QR Scan" | "Cash") => {
    const result = await submitOrder();
    if (!result) return;
    let { order } = result;
    const { isDelivery, deliveryLocation } = result;

    if (chosenMethod === "Cash") {
      try {
        order = await payCashOnPickup(order.id).unwrap();
      } catch (err) {
        // The order already exists at this point — staff can still collect cash and mark it
        // paid at the counter, so a failed confirmation call here shouldn't block the customer
        // from seeing their order.
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

  /**
   * Delivery: the order goes in as a hold, visible to staff immediately over the realtime
   * order feed so they can price it from the pinned location. No payment method is chosen yet
   * — /checkoutdone offers that choice itself once the fee lands.
   */
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
      {/* Header & Breadcrumb */}
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
        {/* Left Column: Shipping & Delivery Form */}
        <div className="checkout_page_form_section">
          {/* Shipping Information Section */}
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

              {deliveryMethod === "pickup" ? (
                <div className="checkout_form_row">
                  <div>
                    <label className="checkout_field_label">{t("Phone Number")}</label>
                    <div className="checkout_phone_input_wrapper">
                      {/* recently added phone prefix */} 
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
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const val = cleanPhoneInput(e.target.value);
                          setPhone(val);
                          validateSingleField("phone", val);
                        }}
                        placeholder="097 444 5566"
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
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const val = cleanPhoneInput(e.target.value);
                            setPhone(val);
                            validateSingleField("phone", val);
                          }}
                          placeholder="097 444 5566"
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

          {/* Delivery Methods Section */}
          <div>
            <h2 className="checkout_section_title">{t("Delivery Method")}</h2>

            <div className="checkout_delivery_options">
              {/* Store Pickup Option */}
              <div
                onClick={() => handleSelectDeliveryMethod("pickup")}
                className={`checkout_delivery_card ${
                  deliveryMethod === "pickup" ? "checkout_delivery_card_active" : ""
                }`}
              >
                <div className="checkout_delivery_card_content">
                  <div className="checkout_delivery_logo_container">
                    <Image
                      src="/images/Logo.svg"
                      alt="590st CAFE"
                      width={48}
                      height={36}
                      style={{ width: "auto", height: "auto" }}
                      className="object-contain"
                    />
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

              {/* Grab Express Option */}
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
                    {/* Was a hardcoded "$0.50" — the shop sets the real fee by hand once it can
                        see the pinned address, so a fixed number here would just be wrong most
                        of the time rather than an estimate. */}
                    <p className="checkout_delivery_price text-xs">{t("Fee set by the shop")}</p>
                  </div>
                </div>

                <div
                  className={`checkout_radio_indicator ${
                    deliveryMethod === "grab" ? "checkout_radio_indicator_active" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="checkout_summary_card">
          <h2 className="checkout_summary_title">{t("Order Summary")}</h2>

          {/* Purchased Items List */}
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

          {/* Pricing Breakdown */}
          <div className="checkout_summary_breakdown" suppressHydrationWarning>
            {(() => {
              // Pre-discount total; each line carries its own original unit price. Extras are
              // never discounted, so the same amount applies either way.
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

          {/* Goes straight to whoever makes the drink, on the barista queue board. */}
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
            {/* Place Order Button */}
            <button
              type="button"
              onClick={handlePlaceOrderNow}
              className="checkout_submit_btn"
            >
              {t("Place Order")}
            </button>

            {/* Cancel Button Under Place Order Now */}
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

      {/* CANCEL CONFIRMATION ALERT MODAL */}
      <Modal open={showCancelModal} onOpenChange={setShowCancelModal}>
        <ModalContent className="max-w-sm p-6 text-center rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)]" showCloseButton={false}>
          {/* Refined Top Warning Badge */}
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <AlertCircle className="w-6 h-6 stroke-[2.2]" />
          </div>

          {/* Question & Description */}
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-1">
            Are you sure to cancel?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6 leading-normal">
            Your order information will be lost.
          </p>

          {/* Professional Action Buttons */}
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

      {/* PAYMENT METHOD SELECTION MODAL (Cash vs QR Scan) */}
      <PaymentMethodModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        grandTotal={grandTotal}
        onConfirm={handleConfirmPaymentMethod}
      />
      {checkoutError && <p role="alert" className="mt-3 text-center text-sm text-red-600">{checkoutError}</p>}

      {/* INTERACTIVE DYNAMIC GOOGLE MAP LOCATION PICKER MODAL */}
      <Modal open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <ModalContent className="max-w-xl p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-2xl">
          {/* Header */}
          <div className="bg-[#A1255B] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="text-base font-bold leading-tight">{t("Select Delivery Location")}</h3>
                <p className="text-xs text-white/80">{t("Drag the pin or tap anywhere on the map")}</p>
              </div>
            </div>
          </div>

          {/* Search & Action Bar */}
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-wrap sm:flex-nowrap gap-2 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLocationQuery}
                onChange={(e) => setSearchLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                placeholder={t("Search street, landmark, or area...")}
                className="w-full pl-9 pr-3 py-2 rounded-full bg-white text-xs sm:text-sm  border border-gray-200 outline-none focus:border-[#A1255B] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleSearchLocation}
              className="px-3 py-2 rounded-full bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold  border-none cursor-pointer transition-all"
            >
              {t("Search")}
            </button>
            <button
              type="button"
              onClick={handleDetectCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold  border-none cursor-pointer transition-all shadow-xs disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>{t("Locate Me")}</span>
            </button>
          </div>

          {/* Interactive Map — drag the marker or click anywhere to move it */}
          <div className="relative w-full h-72 sm:h-80 bg-gray-100">
            {isMapModalOpen && (
              <DeliveryMapPicker
                lat={mapCoords.lat}
                lng={mapCoords.lng}
                onPick={handlePickOnMap}
              />
            )}

            {/* Pin Overlay Badge */}
            <div className="absolute top-3 left-3 z-1000 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-gray-800 flex items-center gap-1.5 border border-white pointer-events-none">
              <Compass className="w-4 h-4 text-[#A1255B] animate-spin" style={{ animationDuration: '8s' }} />
              <span>
                {mapCoords.lat.toFixed(4)}, {mapCoords.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Address Confirmation Panel */}
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
