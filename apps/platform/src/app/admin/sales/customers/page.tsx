import { Metadata } from "next";
import { CustomersPageClient } from "@/components/admin/sales/customers-page-client";

export const metadata: Metadata = {
  title: "Customer Management | Admin Dashboard",
  description:
    "Manage customer billing, view purchase history, and analyze customer data",
};

export default function CustomersPage() {
  return <CustomersPageClient />;
}
