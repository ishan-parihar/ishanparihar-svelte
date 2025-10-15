import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissions-client";
import { SalesDashboardClient } from "@/components/admin/sales/sales-dashboard-client";

export const metadata: Metadata = {
  title: "Sales Dashboard | Admin Dashboard",
  description: "Manage orders, track revenue, and analyze customer billing",
};

export default async function SalesPage() {
  // Get the user session
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user is admin
  if (session.user.role !== "admin") {
    redirect("/");
  }

  // Check if user has sales permissions
  const hasManageSalesPermission = hasPermissionFromSession(
    session,
    PERMISSION_SCOPES.MANAGE_SALES,
  );

  if (!hasManageSalesPermission) {
    redirect("/admin");
  }

  return <SalesDashboardClient />;
}
