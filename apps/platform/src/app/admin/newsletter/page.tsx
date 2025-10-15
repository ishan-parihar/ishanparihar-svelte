import { Metadata } from "next";
import { NewsletterAdminClient } from "@/components/admin/newsletter/newsletter-admin-client";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";

export const metadata: Metadata = {
  title: "Newsletter Management - Admin Dashboard",
  description: "Manage newsletter subscribers and campaigns",
};

export default function NewsletterAdminPage() {
  return (
    <PermissionProtected
      requiredPermission={PERMISSION_SCOPES.MANAGE_NEWSLETTER}
      fallback={
        <div className="w-full mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
          <p className="mb-4">
            You need the MANAGE_NEWSLETTER permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to request access.
          </p>
        </div>
      }
    >
      <div className="w-full mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Newsletter Management</h1>
        <NewsletterAdminClient />
      </div>
    </PermissionProtected>
  );
}
