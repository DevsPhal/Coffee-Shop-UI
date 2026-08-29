"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Clock, MapPin, ChevronRight, RefreshCw, CheckCircle2, Truck, Package, ArrowRight, User } from "lucide-react";
import { useOrderStore, OrderRecord } from "@/store/useOrderStore";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/toast";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

export function OrderhistorypageView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const { ordersHistory } = useOrderStore();
  const { addItem, openCart } = useCart();

  const [filterStatus, setFilterStatus] = useState<string>("All");

  const userOrders = user
    ? ordersHistory.filter((o) => {
        if (user.userId && o.userId === user.userId) return true;
        if (user.name && o.customerName && o.customerName.toLowerCase() === user.name.toLowerCase()) return true;
        if (user.email && o.customerName && o.customerName.toLowerCase() === user.email.toLowerCase()) return true;
        return false;
      })
    : [];

  const filteredOrders = userOrders.filter((o) => {
    if (filterStatus === "All") return true;
    return o.status === filterStatus;
  });

  const handleReorder = (order: OrderRecord) => {
    order.items.forEach((item) => {
      addItem(
        {
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
        },
        false
      );
    });
    toast.add({
      type: "success",
      description: `Reordered ${order.items.length} items to your cart!`,
    });
    openCart();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Order Confirmed":
      case "Preparing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "On the way":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="contact_page_container font-sans min-h-screen">
      {/* Top Header & Breadcrumbs */}
      <div className="product_detail_header mb-6">
        <h1 className="product_detail_title">Order History</h1>

        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb_link">
            Home
          </Link>
          <span className="breadcrumb_separator">»</span>
          <Link href="/userprofile" className="breadcrumb_link">
            Profile
          </Link>
          <span className="breadcrumb_separator">»</span>
          <span className="breadcrumb_current">Order History</span>
        </nav>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {["All", "Preparing", "On the way", "Completed"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all shrink-0 cursor-pointer ${
              filterStatus === st
                ? "bg-[#A1255B] text-white border-[#A1255B] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm max-w-md mx-auto my-8">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Orders Found</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            You haven't placed any orders matching this status yet.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary-color text-white text-xs font-bold rounded-full shadow-md hover:bg-[#d84800] transition-colors"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Top Bar: ID + Status + Date */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900">
                    {order.id}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Order Meta info: Customer & Delivery */}
              <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="w-3.5 h-3.5 text-[#A1255B]" />
                  <span>Customer: </span>
                  <strong className="text-gray-900 font-bold" suppressHydrationWarning>
                    {order.customerName}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Est. Time: </span>
                  <strong className="text-gray-900 font-bold">
                    {order.estimatedTime}
                  </strong>
                </div>
              </div>

              {/* Items List */}
              <div className="py-3 space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {item.quantity}x
                      </span>
                      <span className="text-gray-800 font-medium">
                        {item.title}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      $ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer: Grand Total + Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-left">
                  <span className="text-xs text-gray-500 font-medium">
                    Grand Total:{" "}
                  </span>
                  <span className="value_grand_total text-base">
                    $ {order.grandTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-nowrap shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>

                  {order.status === "Completed" ? (
                    <Link
                      href={`/checkoutdone?id=${order.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Order Complete</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/checkoutdone?id=${order.id}`}
                      className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-[#A1255B] hover:bg-[#881d52] rounded-xl transition-colors shadow-sm whitespace-nowrap shrink-0"
                    >
                      <span>Track</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderhistorypageView;
