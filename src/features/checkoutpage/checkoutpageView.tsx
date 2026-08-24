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
import { AlertCircle } from "lucide-react";
import "@/app/globals.scss";

export function CheckoutpageView() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const { user, updateUser } = useAuth();

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
      if (user.phone) setPhone((prev) => (prev ? prev : user.phone));
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

    try {
      localStorage.setItem(
        "checkout_delivery",
        JSON.stringify({
          method: deliveryMethod,
          fee: deliveryFee,
          customerName: (fullName || "").trim() || user?.name || "Guest",
        })
      );
    } catch {}
    router.push("/payment");
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
            Shopping Cart
          </Link>
          <span className="checkout_page_breadcrumb_separator">»</span>
          <span className="checkout_page_breadcrumb_current">Checkout</span>
        </nav>
      </div>

      <div className="checkout_page_grid">
        {/* Left Column: Shipping & Delivery Form */}
        <div className="checkout_page_form_section">
          {/* Shipping Information Section */}
          <div>
            <h2 className="checkout_section_title">Shipping Information</h2>

            <div className="checkout_form_stack">
              <div className="checkout_form_row">
                <div>
                  <label className="checkout_field_label">Full Name</label>
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
                  <label className="checkout_field_label">Email</label>
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
                    <label className="checkout_field_label">Phone Number</label>
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
                          setPhone(e.target.value);
                          validateSingleField("phone", e.target.value);
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
                      <label className="checkout_field_label">Phone Number</label>
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
                            setPhone(e.target.value);
                            validateSingleField("phone", e.target.value);
                          }}
                          placeholder="enter your phone number"
                          className="checkout_phone_field"
                        />
                      </div>
                      {errors.phone && <TooltipAlert message={errors.phone} />}
                    </div>

                    <div>
                      <label className="checkout_field_label">Capital</label>
                      <div className="checkout_select_wrapper">
                        <select
                          value={capital}
                          onChange={(e) => setCapital(e.target.value)}
                          disabled
                          className="checkout_select checkout_input_disabled cursor-not-allowed opacity-75 bg-gray-50 pr-4"
                        >
                          <option value="Phnom Penh">Phnom Penh</option>
                        </select>
                      </div>
                      {errors.capital && <TooltipAlert message={errors.capital} />}
                    </div>
                  </div>

                  <div className="checkout_form_row">
                    <div>
                      <label className="checkout_field_label">District</label>
                      <div className="checkout_select_wrapper min-w-0 w-full max-w-full overflow-hidden">
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="checkout_select min-w-0 w-full max-w-full truncate"
                        >
                          <option value="Khan Boeng Keng Kang">Khan Boeng Keng Kang</option>
                          <option value="Khan Chamkar Mon">Khan Chamkar Mon</option>
                          <option value="Khan Chbar Ampov">Khan Chbar Ampov</option>
                          <option value="Khan Chroy Changvar">Khan Chroy Changvar</option>
                          <option value="Khan Dangkao">Khan Dangkao</option>
                          <option value="Khan Daun Penh">Khan Daun Penh</option>
                          <option value="Khan Kambol">Khan Kambol</option>
                          <option value="Khan Meanchey">Khan Meanchey</option>
                          <option value="Khan Prampir Makara">Khan Prampir Makara</option>
                          <option value="Khan Prek Pnov">Khan Prek Pnov</option>
                          <option value="Khan Pur Senchey">Khan Pur Senchey</option>
                          <option value="Khan Russei Keo">Khan Russei Keo</option>
                          <option value="Khan Sen Sok">Khan Sen Sok</option>
                          <option value="Khan Tuol Kouk">Khan Tuol Kouk</option>
                        </select>
                        <div className="checkout_select_icon">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
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
                    <label className="checkout_field_label">Address</label>
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
            <h2 className="checkout_section_title">Delivery Methods</h2>

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
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="checkout_delivery_title">Store Pickup</h3>
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
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="checkout_delivery_title">Delivery (Phnom Penh)</h3>
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
          <h2 className="checkout_summary_title">Order Summary</h2>

          {/* Purchased Items List */}
          <div className="checkout_summary_items_list" suppressHydrationWarning>
            {items.length === 0 ? (
              <p className="checkout_summary_empty" suppressHydrationWarning>No items in your cart.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="checkout_item_row">
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
                      <h3 className="checkout_item_title">{item.title}</h3>
                      <p className="checkout_item_price" suppressHydrationWarning>${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <span className="checkout_item_qty" suppressHydrationWarning>Quantity: {item.quantity}</span>
                </div>
              ))
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="checkout_summary_breakdown" suppressHydrationWarning>
            <div className="checkout_summary_line">
              <span className="checkout_summary_label">Subtotal:</span>
              <span className="checkout_summary_value" suppressHydrationWarning>${subtotal.toFixed(2)}</span>
            </div>

            <div className="checkout_summary_line">
              <span className="checkout_summary_label">Delivery:</span>
              <span className="checkout_summary_value" suppressHydrationWarning>${deliveryFee.toFixed(2)}</span>
            </div>

            <div className="checkout_summary_line_total">
              <span className="checkout_summary_label_bold">Total:</span>
              <span className="checkout_summary_value" suppressHydrationWarning>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="button"
            onClick={handlePlaceOrderNow}
            className="checkout_submit_btn"
          >
            Place Order Now
          </button>

          {/* Cancel Button Under Place Order Now */}
          <button
            type="button"
            onClick={handleCancelOrder}
            className="checkout_cancel_btn"
          >
            Cancel
          </button>
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
              className="w-full bg-[#f95700] hover:bg-[#e04e00] text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              Yes
            </button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default CheckoutpageView;