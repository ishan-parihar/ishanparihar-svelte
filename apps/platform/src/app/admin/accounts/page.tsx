import { Metadata } from "next";
import { AccountManagementClient } from "@/components/admin/accounts/account-management-client";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";

export const metadata: Metadata = {
  title: "Account Management - Admin Dashboard",
  description: "Manage user accounts and newsletter subscriptions",
};

export default function AccountManagementPage() {
  return (
    <PermissionProtected
      requiredPermission={PERMISSION_SCOPES.MANAGE_USERS}
      fallback={
        <div className="w-full mx-auto py-8 px-4 text-center">
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
      <div className="w-full mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Account Management</h1>
        <AccountManagementClient />
      </div>
    </PermissionProtected>
  );
}
