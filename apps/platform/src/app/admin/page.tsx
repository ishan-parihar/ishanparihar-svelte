import { Metadata } from "next";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { auth } from "@/auth";
import { getUserPermissions } from "@/lib/permissions-server";

export const metadata: Metadata = {
  title: "Admin Dashboard | Ishan Parihar",
  description: "Admin dashboard for managing the website",
};

export default async function AdminPage() {
  // Get the user session on the server using the auth() function
  const session = await auth();

  // If the user is logged in and is an admin, fetch their permissions
  let userPermissions: string[] = [];
  if (session?.user?.id && session?.user?.role === "admin") {
    userPermissions = await getUserPermissions(session.user.id);
  }

  // Pass the session and permissions to the client component
  return <AdminDashboardClient serverPermissions={userPermissions} />;
}
