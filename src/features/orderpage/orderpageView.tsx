"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import "@/app/globals.scss";

export function OrderpageView() {
  const { items, updateQuantity, subtotal } = useCart();

  return (
    <div className="order_page_container">
      <div className="order_page_header">
        <h1 className="order_page_title">
          Shopping Cart
        </h1>
        <nav className="order_page_breadcrumb" aria-label="Breadcrumb">
          <Link
            href="/"
            className="order_page_breadcrumb_link"
          >
            Home
          </Link>
          <span className="order_page_breadcrumb_separator">»</span>
          <span className="order_page_breadcrumb_current">Shopping Cart</span>
        </nav>
      </div>

      {items.length === 0 ? (
        <div className="order_page_empty">
          <div className="order_page_empty_icon_wrapper">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="order_page_empty_title">
            Your cart is empty
          </h2>
          <p className="order_page_empty_desc">
            Looks like you haven't added any coffee or drinks to your cart yet.
          </p>
          <Link
            href="/menu"
            className="order_page_empty_btn"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="order_page_grid">
          <div className="order_page_cart_section">
            <div className="order_page_table_header">
              <div className="order_page_table_header_product">Product</div>
              <div className="order_page_table_header_price">Price</div>
              <div className="order_page_table_header_quantity">Quantity</div>
              <div className="order_page_table_header_total">Total</div>
            </div>
            <div className="order_page_items_list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="order_page_item_row"
                >
                  <div className="order_page_item_product">
                    <div className="order_page_item_image_wrapper">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="order_page_item_details">
                      <h3 className="order_page_item_title">
                        {item.title}
                      </h3>
                      <span className="order_page_item_stock">
                        In Stock
                      </span>
                    </div>
                  </div>
                  <div className="order_page_item_price">
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="order_page_item_quantity">
                    <div className="order_page_quantity_pill">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="order_page_quantity_btn"
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <span className="order_page_quantity_val">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="order_page_quantity_btn"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="order_page_item_total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order_page_summary_card">
            <div className="order_page_summary_subtotal">
              <div className="order_page_summary_row">
                <span className="order_page_summary_label">
                  Subtotal:
                </span>
                <span className="order_page_summary_value">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <div className="order_page_summary_row">
                <span className="order_page_summary_label">
                  Total:
                </span>
                <span className="order_page_summary_value">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="order_page_summary_note">
                (Delivery Fee Not Included)
              </p>
            </div>
            <div className="order_page_summary_actions">
              <Link
                href="/menu"
                className="order_page_btn_continue"
              >
                Continue Shopping
              </Link>

              <Link
                href="/checkout"
                className="order_page_btn_checkout"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderpageView;