import { Metadata } from "next";
import { AnalyticsDashboardClient } from "@/components/admin/analytics/analytics-dashboard-client";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";
import { auth } from "@/auth";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { getTotalEvents, getUniqueVisitors, getTopEvents } from "@/queries/analyticsQueries";

export const metadata: Metadata = {
  title: "Analytics Dashboard - Admin Dashboard | Ishan Parihar",
  description: "View analytics and key performance indicators for the website",
};

export default async function AnalyticsDashboardPage() {
  // Get the user session on the server
  const session = await auth();

  // If the user is not logged in or is not an admin, show the permission protected component
  if (!session?.user || session.user.role !== "admin") {
    return (
      <PermissionProtected
        requiredPermission={PERMISSION_SCOPES.VIEW_SUPPORT_ANALYTICS}
        fallback={
          <div className="w-full mx-auto py-8 px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
            <p className="mb-4">
              You need the VIEW_SUPPORT_ANALYTICS permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Please contact an administrator to request access.
            </p>
          </div>
        }
      >
        <div className="w-full mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
          <AnalyticsDashboardClient />
        </div>
      </PermissionProtected>
    );
  }

  // Fetch analytics data on the server
  let totalEvents = 0;
  let uniqueVisitors = 0;
  let topEvents: { event_name: string; count: number }[] = [];

  try {
    const supabase = createServiceRoleClient();

    if (supabase) {
      // Fetch total events
      const totalEventsResult = await getTotalEvents(supabase);
      totalEvents = totalEventsResult || 0;

      // Fetch unique visitors
      const uniqueVisitorsResult = await getUniqueVisitors(supabase);
      uniqueVisitors = uniqueVisitorsResult || 0;

      // Fetch top events
      const topEventsResult = await getTopEvents(supabase);
      topEvents = topEventsResult || [];
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error);
  }

  // Pass the data to the client component
  return (
    <div className="w-full mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <AnalyticsDashboardClient
        initialTotalEvents={totalEvents}
        initialUniqueVisitors={uniqueVisitors}
        initialTopEvents={topEvents}
      />
    </div>
  );
}