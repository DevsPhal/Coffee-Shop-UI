"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { shippingInformationSchema } from "@/lib/authSchema";
import { cleanPhoneInput } from "@/lib/phoneUtils";
import { AlertCircle, ChevronDown, Check } from "lucide-react";
import { getItemCustomizationConfig, getProductByIdOrTitle } from "@/data/products";
import { calculateSizePrice } from "@/store/useCartStore";
import PaymentMethodModal from "@/components/ui/PaymentMethodModal";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

const DISTRICT_OPTIONS = [
  "Khan Boeng Keng Kang",
  "Khan Chamkar Mon",
  "Khan Chbar Ampov",
  "Khan Chroy Changvar",
  "Khan Dangkao",
  "Khan Daun Penh",
  "Khan Kambol",
  "Khan Meanchey",
  "Khan Prampir Makara",
  "Khan Prek Pnov",
  "Khan Pur Senchey",
  "Khan Russei Keo",
  "Khan Sen Sok",
  "Khan Tuol Kouk",
];

function CustomDistrictSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[44px] px-3.5 flex items-center justify-between bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-900 shadow-2xs transition-all cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value || "Select District"}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ml-2 ${
            isOpen ? "rotate-180 text-[#A1255B]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
          {DISTRICT_OPTIONS.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border-none text-left select-none ${
                  isSelected
                    ? "bg-[#A1255B] text-white shadow-2xs font-semibold"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span className="truncate">{opt}</span>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CheckoutpageView() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const { user, updateUser } = useAuth();

  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [capital, setCapital] = useState("Phnom Penh");
  const [district, setDistrict] = useState("Khan Boeng Keng Kang");
  const [zipCode, setZipCode] = useState("120000");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "grab">("pickup");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    capital?: string;
    district?: string;
    zipCode?: string;
    address?: string;
  }>({});

  // Automatically pre-fill shipping fields from logged-in user profile
  useEffect(() => {
    if (user) {
      if (user.name) setFullName((prev) => (prev ? prev : user.name));
      if (user.email) setEmail((prev) => (prev ? prev : user.email));
      if (user.phone) setPhone((prev) => (prev ? prev : cleanPhoneInput(user.phone)));
      if (user.capital) setCapital((prev) => (prev ? prev : user.capital));
      if (user.district) setDistrict((prev) => (prev ? prev : user.district));
      if (user.zipCode) setZipCode((prev) => (prev ? prev : user.zipCode));
      if (user.address) setAddress((prev) => (prev ? prev : user.address));
    }
  }, [user]);

  const deliveryFee = deliveryMethod === "grab" ? 1.75 : 0.0;
  const grandTotal = subtotal + deliveryFee;

  const validateSingleField = (
    field: "fullName" | "email" | "phone" | "address" | "capital" | "district" | "zipCode",
    val?: string
  ) => {
    if (deliveryMethod === "pickup" && ["capital", "district", "zipCode", "address"].includes(field)) {
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
        district: undefined,
        zipCode: undefined,
        address: undefined,
      }));
    }
  };

  const handlePlaceOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
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
      district: (district || "").trim(),
      zipCode: (zipCode || "").trim(),
      address: (address || "").trim(),
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const newErrors = {
        fullName: fieldErrors.fullName?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        ...(deliveryMethod === "grab"
          ? {
              capital: fieldErrors.capital?.[0],
              district: fieldErrors.district?.[0],
              zipCode: fieldErrors.zipCode?.[0],
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
          ? newErrors.capital || newErrors.district || newErrors.zipCode || newErrors.address
          : undefined) ||
        "Please complete shipping information.";

      toast.add({
        type: "warning",
        description: firstErr,
      });
      return;
    }

    setErrors({});

    // Open Payment Method Modal to choose Cash or QR Code Scan
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPaymentMethod = (chosenMethod: "QR Scan" | "Cash") => {
    // Update & sync shipping information to user profile if user is logged in
    if (user && updateUser) {
      updateUser({
        name: (fullName || "").trim() || user.name,
        email: (email || "").trim() || user.email,
        phone: (phone || "").trim() || user.phone,
        ...(deliveryMethod === "grab"
          ? {
              capital: (capital || "").trim() || user.capital,
              district: (district || "").trim() || user.district,
              zipCode: (zipCode || "").trim() || user.zipCode,
              address: (address || "").trim() || user.address,
            }
          : {}),
      });
    }

    const deliveryLocation =
      deliveryMethod === "grab"
        ? [address, district, capital].filter(Boolean).join(", ") || "House 30A, St 590, Toul Kork"
        : "G01";

    const estimatedTime =
      deliveryMethod === "grab"
        ? "10 - 15 mins"
        : "5 mins";

    try {
      localStorage.setItem(
        "checkout_delivery",
        JSON.stringify({
          method: deliveryMethod,
          fee: deliveryFee,
          customerName: (fullName || "").trim() || user?.name || "Guest",
          location: deliveryLocation,
          estimatedTime,
          paymentType: chosenMethod,
        })
      );
    } catch {}

    if (chosenMethod === "Cash") {
      router.push("/checkoutdone");
    } else {
      router.push("/payment");
    }
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
                      <div className="checkout_phone_prefix">
                        <Image
                          src="/images/cambodia.svg"
                          alt="Cambodia"
                          width={20}
                          height={14}
                          className="checkout_phone_flag"
                        />
                        <span className="checkout_phone_code">+855</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const val = cleanPhoneInput(e.target.value);
                          setPhone(val);
                          validateSingleField("phone", val);
                        }}
                        placeholder="enter your phone number"
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
                          <span className="checkout_phone_code">+855</span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const val = cleanPhoneInput(e.target.value);
                            setPhone(val);
                            validateSingleField("phone", val);
                          }}
                          placeholder="enter your phone number"
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

                  <div className="checkout_form_row">
                    <div>
                      <label className="checkout_field_label">{t("District")}</label>
                      <CustomDistrictSelect
                        value={district}
                        onChange={setDistrict}
                      />
                      {errors.district && <TooltipAlert message={errors.district} />}
                    </div>

                    <div>
                      <label className="checkout_field_label">Zip Code</label>
                      <Input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="checkout_input checkout_input_disabled"
                      />
                      <p className="checkout_help_text">
                        For Cambodia, Input 120000 if you don&apos;t know
                      </p>
                      {errors.zipCode && <TooltipAlert message={errors.zipCode} />}
                    </div>
                  </div>

                  <div>
                    <label className="checkout_field_label">{t("Delivery Address")}</label>
                    <Input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        validateSingleField("address", e.target.value);
                      }}
                      placeholder="enter your address"
                      className="checkout_input"
                    />
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
                    <p className="checkout_delivery_price">$1.75</p>
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
              items.map((item, idx) => {
                const config = getItemCustomizationConfig(item.title);
                const prod = getProductByIdOrTitle(item.id, item.title);
                const origPrice = item.originalPrice ?? prod?.originalPrice;
                const hasDiscount = origPrice !== undefined && origPrice > item.price;
                const adjustedOrigPrice = hasDiscount ? calculateSizePrice(origPrice!, item.size) : undefined;
                const customDetails: string[] = [];
                if (config.hasIce && item.iceLevel) customDetails.push(`Ice: ${item.iceLevel}`);
                if (config.hasSugar && item.sugarLevel) customDetails.push(`Sugar: ${item.sugarLevel}`);
                if (config.hasMilk && item.milkType) customDetails.push(`Milk: ${item.milkType}`);

                return (
                  <div key={`${item.id}-${idx}`} className="checkout_item_row">
                    <div className="checkout_item_info">
                      <div className="checkout_item_image_wrapper">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="checkout_item_details">
                        <h3 className="checkout_item_title">{t(item.title)}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <p className="checkout_item_price font-extrabold text-[#A1255B]" suppressHydrationWarning>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.size && (
                            <span className="text-[10px] font-semibold text-[#A1255B] bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded-full">
                              Size: {item.size}
                            </span>
                          )}
                          {customDetails.map((detail, dIdx) => (
                            <span
                              key={dIdx}
                              className="text-[10px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md"
                            >
                              {detail}
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
              const fullSubtotal = items.reduce((acc, item) => {
                const prod = getProductByIdOrTitle(item.id, item.title);
                const origPrice = item.originalPrice ?? prod?.originalPrice;
                const itemOrigPrice = (origPrice && origPrice > item.price) ? calculateSizePrice(origPrice, item.size) : item.price;
                return acc + itemOrigPrice * item.quantity;
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

            <div className="checkout_summary_line">
              <span className="checkout_summary_label">{t("Delivery Method")}:</span>
              <span className="checkout_summary_value" suppressHydrationWarning>${deliveryFee.toFixed(2)}</span>
            </div>

            <div className="checkout_summary_line_total">
              <span className="checkout_summary_label_bold">{t("Total:")}</span>
              <span className="checkout_summary_value" suppressHydrationWarning>${grandTotal.toFixed(2)}</span>
            </div>
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
    </div>
  );
}

export default CheckoutpageView;