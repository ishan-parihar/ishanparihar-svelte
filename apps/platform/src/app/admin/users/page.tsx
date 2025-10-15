import { Metadata } from "next";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";

export const metadata: Metadata = {
  title: "User Management | Admin",
  description: "Manage user accounts and subscriptions",
};

export default function AdminUsersPage() {
  return (
    <PermissionProtected
      requiredPermission={PERMISSION_SCOPES.MANAGE_USERS}
      fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
          <p className="mb-4">
            You need the MANAGE_USERS permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to request access.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>

        <p className="text-muted-foreground">
          This is a placeholder for the user management page. In a real
          implementation, this would display a list of users and provide
          functionality to manage them.
        </p>

        {/* User management functionality would go here */}
      </div>
    </PermissionProtected>
  );
}
