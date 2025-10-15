import { Metadata } from "next";
import { AnalyticsPageClient } from "@/components/admin/sales/analytics-page-client";

export const metadata: Metadata = {
  title: "Sales Analytics | Admin Dashboard",
  description: "Detailed sales analytics and performance insights",
};

export default function SalesAnalyticsPage() {
  return <AnalyticsPageClient />;
}
