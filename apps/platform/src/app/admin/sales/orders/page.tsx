import { Metadata } from "next";
import { OrdersPageClient } from "@/components/admin/sales/orders-page-client";

export const metadata: Metadata = {
  title: "Orders Management | Admin Dashboard",
  description: "Manage customer orders, track payments, and handle billing",
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
