import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissions-client";
import { AdvancedSearch } from "@/components/admin/support/search/advanced-search";

export const metadata: Metadata = {
  title: "Advanced Search | Support | Admin Dashboard",
  description: "Search across tickets, messages, customers, and chat sessions",
};

export default async function SearchPage() {
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

  return <AdvancedSearch />;
}
