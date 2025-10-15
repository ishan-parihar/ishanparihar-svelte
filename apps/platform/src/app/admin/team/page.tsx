import { Metadata } from "next";
import { AdminTeamClient } from "@/components/admin/team/admin-team-client";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";
import { getAdminUsers } from "@/lib/permissions-server";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Admin Team Management - Admin Dashboard",
  description: "Manage admin team members and their permissions",
};

export default async function AdminTeamPage() {
  // Get the user session on the server using the auth() function
  const session = await auth();

  // Fetch admin users on the server if the user is an admin
  let initialAdminUsers: any[] = [];
  if (session?.user?.role === "admin") {
    try {
      initialAdminUsers = await getAdminUsers();
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  }

  return (
    <PermissionProtected
      requiredPermission={PERMISSION_SCOPES.MANAGE_ADMINS}
      fallback={
        <div className="w-full mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
          <p className="mb-4">
            You need the MANAGE_ADMINS permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to request access.
          </p>
        </div>
      }
    >
      <div className="w-full mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Team Management</h1>
        <AdminTeamClient initialAdminUsers={initialAdminUsers} />
      </div>
    </PermissionProtected>
  );
}
