"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Armchair, ChevronRight, Coffee, LogOut, Users } from "lucide-react";
import { EmptyState, PageLoader } from "@/components/ui/states";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useOrderLiveUpdates } from "@/hooks/useOrderLiveUpdates";
import { useMounted } from "@/hooks/useMounted";
import { clearPersistentState } from "@/hooks/usePersistentState";
import { isAuthenticated } from "@/lib/authStorage";
import { clearDineInTable, setDineInTable } from "@/lib/dineIn";
import { useGetTableQuery, useListMyTableOrdersQuery } from "@/store/api/tableApi";
import type { OrderResponse } from "@/store/api/types";
import "@/app/globals.scss";

const STATUS_STEPS: { label: string; reached: (status: OrderResponse["status"]) => boolean }[] = [
  { label: "Ordered", reached: () => true },
  { label: "Paid", reached: (s) => s !== "PENDING" },
  { label: "Preparing", reached: (s) => s === "PREPARING" || s === "COMPLETED" },
  { label: "Served", reached: (s) => s === "COMPLETED" },
];

const money = (value: number | string) => `$${Number(value).toFixed(2)}`;

export default function TablepageView({ tableNumber }: { tableNumber: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const mounted = useMounted();
  const signedIn = mounted && isAuthenticated();
  const { data: table, isLoading, error } = useGetTableQuery(tableNumber);

  // Remember the scanned table so checkout sends the next order as dine-in at this table.
  useEffect(() => {
    if (!table) return;
    setDineInTable(table.tableNumber);
    // Drop an earlier pickup/delivery choice so checkout defaults to dine-in for this visit.
    clearPersistentState("checkout:deliveryMethod");
  }, [table]);

  const leaveTable = () => {
    clearDineInTable();
    router.push("/");
  };

  if (isLoading) return <PageLoader label="Finding your table..." />;

  if (error || !table) {
    return (
      <div className="table_scan_page">
        <EmptyState
          icon={Armchair}
          title="We couldn't find this table"
          message={`Table ${tableNumber.toUpperCase()} isn't set up. Please ask a staff member, or order for pickup instead.`}
          action={{ label: "Browse the menu", onClick: () => router.push("/menu") }}
        />
      </div>
    );
  }

  return (
    <div className="table_scan_page font-sans">
      <section className="table_scan_card">
        <span className="table_scan_badge">
          <Armchair aria-hidden />
          {t("Dine-in")}
        </span>
        <h1 className="table_scan_title">
          {t("Table")} {table.tableNumber}
        </h1>
        <p className="table_scan_text">
          {t("Order from the menu and we'll bring it to your table.")}
        </p>
        <p className="table_scan_meta">
          <Users aria-hidden />
          {t("Seats")} {table.capacity}
        </p>

        <Link href="/menu" className="table_scan_primary">
          <Coffee aria-hidden />
          {t("Browse the menu")}
        </Link>
        {!signedIn && mounted ? (
          <Link href={`/login?next=${encodeURIComponent(`/table/${table.tableNumber}`)}`} className="table_scan_secondary">
            {t("Sign in to order")}
          </Link>
        ) : null}
      </section>

      {signedIn ? <MyTableOrders tableNumber={table.tableNumber} /> : null}

      <button type="button" className="table_scan_leave" onClick={leaveTable}>
        <LogOut aria-hidden />
        {t("Not at this table? Leave table")}
      </button>
    </div>
  );
}

function MyTableOrders({ tableNumber }: { tableNumber: string }) {
  const { t } = useLanguage();
  const { data: orders, refetch } = useListMyTableOrdersQuery(tableNumber);

  useOrderLiveUpdates(
    useCallback(
      (message) => {
        if (message.order.tableNumber === tableNumber) void refetch();
      },
      [refetch, tableNumber]
    )
  );

  if (!orders || orders.length === 0) return null;

  return (
    <section className="table_scan_orders" aria-label={t("Your orders at this table")}>
      <h2 className="table_scan_orders_title">{t("Your orders at this table")}</h2>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={order.status === "PENDING" ? `/payment?orderId=${order.id}` : `/checkoutdone?orderId=${order.id}`}
          className="table_scan_order"
        >
          <div className="table_scan_order_head">
            <span>
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} {t("items")} · {money(order.totalAmount)}
            </span>
            <ChevronRight aria-hidden />
          </div>
          <ol className="table_scan_steps">
            {STATUS_STEPS.map((step) => (
              <li key={step.label} className={step.reached(order.status) ? "is_reached" : undefined}>
                {t(step.label)}
              </li>
            ))}
          </ol>
          {order.status === "PENDING" ? <p className="table_scan_order_hint">{t("Tap to finish paying")}</p> : null}
        </Link>
      ))}
    </section>
  );
}
