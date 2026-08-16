import OrderhistorypageView from "@/features/orderhistorypage/orderhistorypageView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order History | 590st CAFE",
  description: "View your complete order history, track active delivery status, and easily reorder your favorite coffee and beverages.",
};

export default function OrderHistoryPage() {
  return <OrderhistorypageView />;
}
