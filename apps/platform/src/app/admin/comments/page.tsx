import { Metadata } from "next";
import { getAllComments } from "@/lib/comments";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";
import { createServiceRoleClient } from "@/utils/supabase/server";
import Dynamic from "next/dynamic";

// Dynamic import for the admin comments client component
const AdminCommentsClient = Dynamic(
  () =>
    import("@/components/admin/admin-comments-client").then((mod) => ({
      default: mod.AdminCommentsClient,
    })),
  {
    loading: () => (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    ),
  },
);

// Force dynamic rendering for admin pages
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Comments Management",
  description: "Manage and moderate user comments",
};

export default async function AdminCommentsPage() {
  // Create a Supabase client with service role for admin operations
  const supabase = createServiceRoleClient();

  // Fetch comments server-side, passing the Supabase client
  const comments = await getAllComments(supabase);

  return (
    <PermissionProtected
      requiredPermission={PERMISSION_SCOPES.MANAGE_COMMENTS}
      fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
          <p className="mb-4">
            You need the MANAGE_COMMENTS permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to request access.
          </p>
        </div>
      }
    >
      <AdminCommentsClient initialComments={comments} />
    </PermissionProtected>
  );
}
