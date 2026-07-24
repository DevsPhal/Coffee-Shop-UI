"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import "@/app/globals.scss";

export function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, clearCart, subtotal } = useCart();

  const handleClearAndDeleteAll = () => {
    clearCart();
    closeCart();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="cart_drawer_wrapper">
      {/* Backdrop overlay */}
      <div
        className="cart_drawer_backdrop"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="cart_drawer_panel_container">
        <div className="cart_drawer_panel">
          {/* Header */}
          <div className="cart_drawer_header">
            <h2 className="cart_drawer_title">Shopping Cart</h2>
            <button
              type="button"
              onClick={handleClearAndDeleteAll}
              className="cart_drawer_close_btn"
              aria-label="Clear cart and close"
              title="Delete all data and close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Cart Item List */}
          <div className="cart_drawer_body">
            {items.length === 0 ? (
              <div className="cart_drawer_empty">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cart_drawer_empty_icon"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <p className="cart_drawer_empty_text">Your cart is empty</p>
              </div>
            ) : (
              <div className="cart_drawer_items_list">
                {items.map((item) => (
                  <div key={item.id} className="cart_item">
                    {/* Thumbnail */}
                    <div className="cart_item_thumbnail">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="cart_item_fallback-img" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="cart_item_details">
                      <h3 className="cart_item_title">{item.title}</h3>

                      {/* Quantity Pill */}
                      <div className="cart_quantity_pill">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="cart_quantity_btn"
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>
                        <span className="cart_quantity_value">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="cart_quantity_btn"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <p className="cart_item-price">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="cart_drawer_footer">
            <div className="cart_drawer_subtotal-row">
              <span className="cart_drawer_subtotal-label">Subtotal:</span>
              <span className="cart_drawer_subtotal-value">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <Link
              href="/cart"
              onClick={closeCart}
              className="cart_drawer_btn_view"
            >
              View Cart
            </Link>

            <Link
              href="/order"
              onClick={closeCart}
              className="cart_drawer_btn_checkout"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;