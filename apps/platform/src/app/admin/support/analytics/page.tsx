import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissions-client";
import { AnalyticsDashboard } from "@/components/admin/support/analytics/analytics-dashboard";

export const metadata: Metadata = {
  title: "Analytics | Support | Admin Dashboard",
  description: "Support analytics, metrics, and performance insights",
};

export default async function AnalyticsPage() {
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

  return (
    <div className="w-full py-6 bg-surface-background dark:bg-[var(--bg-primary)] min-h-screen">
      <div className="space-y-6">
        {/* Header - Vectura Labs Theme */}
        <div className="px-6 py-6 border-b border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-primary)]">
          <h1 className="text-3xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
            Support Analytics
          </h1>
          <p className="text-text-secondary dark:text-[var(--text-secondary)] font-ui">
            Comprehensive insights into support performance and customer
            satisfaction
          </p>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
