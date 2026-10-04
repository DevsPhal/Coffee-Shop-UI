"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Clock, MapPin, ChevronRight, RefreshCw, CheckCircle2, Truck, Package, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/toast";
import { isAuthenticated } from "@/lib/authStorage";
import { useMounted } from "@/hooks/useMounted";
import { useListMyOrdersQuery } from "@/store/api/orderApi";
import { toTitleCase } from "@/lib/utils";
import { reorderLines } from "@/lib/reorder";
import type { OrderResponse, OrderStatus } from "@/store/api/types";
import { OrderEstimateBadge } from "@/components/common/OrderEstimate";
import { useOrderLiveUpdates } from "@/hooks/useOrderLiveUpdates";
import { EmptyState, ErrorState, LoadingRegion, OrderCardSkeleton } from "@/components/ui/states";
import "@/app/globals.scss";
import { usePersistentState } from "@/hooks/usePersistentState";

export function OrderhistorypageView() {
  const router = useRouter();
  const pathname = usePathname();
  const { addItem, openCart } = useCart();

  const [filterStatus, setFilterStatus] = usePersistentState<string>("order-history:filterStatus", "All");

  const mounted = useMounted();
  const signedIn = mounted && isAuthenticated();
  useEffect(() => {
    if (mounted && !signedIn) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, signedIn, router, pathname]);

  const { data, currentData, isFetching, error, refetch } = useListMyOrdersQuery(
    {
      page: 1,
      size: 50,
      ...(filterStatus === "All" ? {} : { status: filterStatus as OrderStatus }),
    },
    { skip: !signedIn }
  );

  useOrderLiveUpdates(() => refetch());

  const filteredOrders = data?.content ?? [];
  const isLoadingOrders = isFetching && currentData === undefined;

  const handleReorder = (order: OrderResponse) => {
    reorderLines(order).forEach((line) => addItem(line, false));
    toast.add({
      type: "success",
      description: `Reordered ${order.items.length} items to your cart!`,
    });
    openCart();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PAID":
      case "PREPARING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OUT_FOR_DELIVERY":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "COMPLETED":
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: "All", label: "All" },
    { value: "PENDING", label: "Unpaid" },
    { value: "PAID", label: "Paid" },
    { value: "PREPARING", label: "Preparing" },
    { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
    { value: "COMPLETED", label: "Completed" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  if (!signedIn) return null;

  return (
    <div className="contact_page_container font-sans min-h-screen">
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

      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilterStatus(value)}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all shrink-0 cursor-pointer ${
              filterStatus === value
                ? "bg-[#A1255B] text-white border-[#A1255B] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoadingOrders ? (
        <LoadingRegion label="Loading your orders..." className="space-y-4 max-w-3xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </LoadingRegion>
      ) : error && !currentData ? (
        <ErrorState
          title="We couldn't load your orders"
          error={error}
          onRetry={() => void refetch()}
          className="my-8"
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          message="You haven't placed any orders matching this status yet."
          action={{ label: "Explore Menu", href: "/menu" }}
          className="my-8"
        />
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
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
                  <OrderEstimateBadge order={order} />
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

              <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="w-3.5 h-3.5 text-[#A1255B]" />
                  <span>Customer: </span>
                  <strong className="text-gray-900 font-bold" suppressHydrationWarning>
                    {order.customerName ?? "You"}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment: </span>
                  <strong className="text-gray-900 font-bold">
                    {order.paymentMethod ?? "Not paid yet"}
                  </strong>
                </div>
                <div className="flex items-start gap-1.5 text-gray-600 sm:col-span-2">
                  {order.fulfillmentMethod === "DELIVERY" ? (
                    <Truck className="w-3.5 h-3.5 text-[#A1255B] shrink-0 mt-0.5" />
                  ) : (
                    <Package className="w-3.5 h-3.5 text-[#A1255B] shrink-0 mt-0.5" />
                  )}
                  <span className="shrink-0">
                    {order.fulfillmentMethod === "DELIVERY" ? "Deliver to: " : "Pickup: "}
                  </span>
                  <strong className="min-w-0 break-words text-gray-900 font-bold">
                    {order.fulfillmentMethod === "DELIVERY"
                      ? order.deliveryAddress || "Address not recorded"
                      : "At the store"}
                  </strong>
                </div>
              </div>

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
                        {toTitleCase(item.productName)}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      $ {Number(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-left">
                  {Number(order.deliveryFee ?? 0) > 0 && (
                    <div className="text-xs text-gray-500 font-medium">
                      Delivery fee: $ {Number(order.deliveryFee).toFixed(2)}
                    </div>
                  )}
                  <span className="text-xs text-gray-500 font-medium">
                    Grand Total:{" "}
                  </span>
                  <span className="value_grand_total text-base">
                    $ {Number(order.totalAmount).toFixed(2)}
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

                  {order.status === "COMPLETED" || order.status === "DELIVERED" ? (
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
