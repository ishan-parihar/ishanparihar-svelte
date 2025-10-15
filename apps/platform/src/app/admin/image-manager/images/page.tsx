import { Metadata } from "next";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";
import { ImageManagerClient } from "@/components/admin/image-manager/image-manager-client";

export const metadata: Metadata = {
  title: "Manage Images | Admin Dashboard",
  description: "Upload and manage images for the website",
};

export default function AdminImagesPage() {
  return (
    <PermissionProtected
      requiredPermission={PERMISSION_SCOPES.MANAGE_IMAGES}
      fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
          <p className="mb-4">
            You need the MANAGE_IMAGES permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to request access.
          </p>
        </div>
      }
    >
      <ImageManagerClient />
    </PermissionProtected>
  );
}
