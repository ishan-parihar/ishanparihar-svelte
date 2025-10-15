import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissions-client";
import { SupportMainDashboard } from "@/components/admin/support/support-main-dashboard";
import { SupportErrorBoundary } from "@/components/admin/support/support-error-boundary";

export const metadata: Metadata = {
  title: "Customer Support | Admin Dashboard",
  description: "Manage customer support tickets and live chat sessions",
};

export default async function SupportPage() {
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

  // Check if user has support permissions
  const hasViewPermission = hasPermissionFromSession(
    session,
    PERMISSION_SCOPES.VIEW_SUPPORT_TICKETS,
  );
  const hasManagePermission = hasPermissionFromSession(
    session,
    PERMISSION_SCOPES.MANAGE_SUPPORT,
  );

  if (!hasViewPermission && !hasManagePermission) {
    redirect("/admin");
  }

  // No need to fetch initial data - component will fetch it client-side using tRPC
  const initialData = undefined;

  return (
    <SupportErrorBoundary>
      <SupportMainDashboard initialData={initialData} />
    </SupportErrorBoundary>
  );
}
