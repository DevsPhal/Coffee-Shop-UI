"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import "@/app/globals.scss";

export function CheckoutpageView() {
  const router = useRouter();
  const { items, subtotal } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [capital, setCapital] = useState("Phnom Penh");
  const [district, setDistrict] = useState("Songkat BKK1 - Khan Jomkar Mon");
  const [zipCode, setZipCode] = useState("120000");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "grab">("pickup");

  const deliveryFee = deliveryMethod === "grab" ? 1.75 : 0.0;
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/payment");
  };

  const handleCancelOrder = (e: React.MouseEvent) => {
    e.preventDefault();
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
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your Name"
                    className="checkout_input"
                  />
                </div>

                <div>
                  <label className="checkout_field_label">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="checkout_input"
                  />
                </div>
              </div>

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
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="enter your phone number"
                      className="checkout_phone_field"
                    />
                  </div>
                </div>

                <div>
                  <label className="checkout_field_label">Capital</label>
                  <div className="checkout_select_wrapper">
                    <select
                      value={capital}
                      onChange={(e) => setCapital(e.target.value)}
                      className="checkout_select"
                    >
                      <option value="Phnom Penh">Phnom Penh</option>
                      <option value="Siem Reap">Siem Reap</option>
                      <option value="Battambang">Battambang</option>
                    </select>
                    <div className="checkout_select_icon">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="checkout_form_row">
                <div>
                  <label className="checkout_field_label">City or District</label>
                  <div className="checkout_select_wrapper">
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="checkout_select"
                    >
                      <option value="Songkat BKK1 - Khan Jomkar Mon">Songkat BKK1 - Khan Jomkar Mon</option>
                      <option value="Sangkat Toul Kork">Sangkat Toul Kork</option>
                      <option value="Sangkat Daun Penh">Sangkat Daun Penh</option>
                    </select>
                    <div className="checkout_select_icon">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
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
                    For Cambodia, Input 120000 if you dont know
                  </p>
                </div>
              </div>

              <div>
                <label className="checkout_field_label">Address</label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="enter your address"
                  className="checkout_input"
                />
              </div>
            </div>
          </div>

          {/* Delivery Methods Section */}
          <div>
            <h2 className="checkout_section_title">Delivery Methods</h2>

            <div className="checkout_delivery_options">
              {/* Store Pickup Option */}
              <div
                onClick={() => setDeliveryMethod("pickup")}
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
                onClick={() => setDeliveryMethod("grab")}
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
          <div className="checkout_summary_items_list">
            {items.length === 0 ? (
              <p className="checkout_summary_empty">No items in your cart.</p>
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
                      <p className="checkout_item_price">${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <span className="checkout_item_qty">Quantity: {item.quantity}</span>
                </div>
              ))
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="checkout_summary_breakdown">
            <div className="checkout_summary_line">
              <span className="checkout_summary_label">Subtotal:</span>
              <span className="checkout_summary_value">${subtotal.toFixed(2)}</span>
            </div>

            <div className="checkout_summary_line">
              <span className="checkout_summary_label">Delivery:</span>
              <span className="checkout_summary_value">${deliveryFee.toFixed(2)}</span>
            </div>

            <div className="checkout_summary_line_total">
              <span className="checkout_summary_label_bold">Total:</span>
              <span className="checkout_summary_value">${grandTotal.toFixed(2)}</span>
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
    </div>
  );
}

export default CheckoutpageView;