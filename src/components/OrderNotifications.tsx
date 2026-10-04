"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { toast } from "@/components/ui/toast";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useAuth } from "@/context/AuthContext";
import { useOrderLiveUpdates } from "@/hooks/useOrderLiveUpdates";
import { useStaffCallUpdates } from "@/hooks/useStaffCallUpdates";
import { getOrderEstimate } from "@/lib/estimate";
import { baseApi } from "@/store/api/baseApi";
import type { AppDispatch } from "@/store/redux";
import type { OrderResponse, OrderUpdateMessage, StaffCallMessage } from "@/store/api/types";

type ToastType = "success" | "info" | "warning";

interface Notice {
  type: ToastType;
  title: string;
  description: string;
}

const orderLink = (orderId: string) => `/checkoutdone?orderId=${encodeURIComponent(orderId)}`;
const shortId = (orderId: string) => `#${orderId.slice(0, 8).toUpperCase()}`;

export function OrderNotifications() {
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const estimateText = useCallback(
    (order: OrderResponse) => {
      const estimate = getOrderEstimate(order, Date.now());
      if (estimate.state === "counting") {
        return `~${estimate.minutesLeft} ${t("mins")} (${t("ready by")} ${estimate.clock})`;
      }
      if (estimate.state === "due") return t("Any moment now");
      return null;
    },
    [t]
  );

  const describe = useCallback(
    ({ action, order }: OrderUpdateMessage): Notice | null => {
      const id = shortId(order.id);
      switch (action) {
        case "PREPARING":
          return { type: "success", title: t("Your order is being prepared"), description: estimateText(order) ?? id };
        case "ESTIMATE_SET": {
          const estimate = estimateText(order);
          return estimate ? { type: "info", title: t("Estimated time updated"), description: estimate } : null;
        }
        case "OUT_FOR_DELIVERY":
          return { type: "info", title: t("Your order is on the way"), description: id };
        case "COMPLETED":
          return { type: "success", title: t("Order complete — enjoy!"), description: id };
        case "DELIVERED":
          return { type: "success", title: t("Your order has been delivered"), description: id };
        case "CANCELLED":
          return { type: "warning", title: t("Your order was cancelled"), description: id };
        case "DELIVERY_FEE_SET":
          return { type: "info", title: t("Delivery fee is ready"), description: t("Choose how you'd like to pay.") };
        case "BAKONG_CONFIRMED":
        case "BAKONG_BY_RECEIPT":
        case "CASH_COLLECTED":
          return pathname.startsWith("/payment")
            ? null
            : { type: "success", title: t("Payment received"), description: id };
        default:
          return null;
      }
    },
    [t, estimateText, pathname]
  );

  const show = useCallback(
    (notice: Notice, orderId: string) => {
      const onOrderPage = pathname.startsWith("/checkoutdone");
      toast.add({
        ...notice,
        timeout: 6000,
        ...(onOrderPage
          ? {}
          : { actionProps: { children: t("View order"), onClick: () => router.push(orderLink(orderId)) } }),
      });
    },
    [pathname, router, t]
  );

  useOrderLiveUpdates(
    useCallback(
      (message: OrderUpdateMessage) => {
        const notice = describe(message);
        if (notice) show(notice, message.order.id);
      },
      [describe, show]
    ),
    isLoggedIn
  );

  useStaffCallUpdates(
    useCallback(
      (message: StaffCallMessage) => {
        if (message.type !== "ANSWERED") return;
        dispatch(baseApi.util.invalidateTags([{ type: "StaffCall", id: message.orderId }]));
        const who = message.answeredByName || t("Staff");
        show(
          {
            type: "success",
            title: `${who} ${t("responded to your request")}`,
            description: message.reply ? `“${message.reply}”` : t("A staff member is on the way to help."),
          },
          message.orderId
        );
      },
      [dispatch, show, t]
    ),
    isLoggedIn
  );

  return null;
}

export default OrderNotifications;
