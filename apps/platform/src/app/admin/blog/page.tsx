import { getAdminBlogPostsServer } from "@/queries/adminQueriesServer";
import { Metadata } from "next";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";
import Dynamic from "next/dynamic";

// Dynamic import for the admin blog client component
const AdminBlogClient = Dynamic(
  () =>
    import("@/components/admin/admin-blog-client").then((mod) => ({
      default: mod.AdminBlogClient,
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

export const metadata: Metadata = {
  title: "Admin Blog | Ishan Parihar",
  description: "Manage blog posts",
};

// Helper function to ensure posts have all required fields for AdminBlogClient
function ensurePostsFormat(posts: any[]): any[] {
  return posts.map((post) => ({
    ...post,
    author: post.author || "Anonymous",
    author_user_id: post.author_user_id || "",
    draft: post.draft !== undefined ? post.draft : false,
    premium: post.premium !== undefined ? post.premium : false,
  }));
}

export default async function AdminBlogPage() {
  // Fetch blog posts server-side using the server-specific function
  const posts = await getAdminBlogPostsServer({ includeDrafts: true }); // Include drafts for admin

  // Ensure posts have all required fields
  const formattedPosts = ensurePostsFormat(posts);

  return (
    <PermissionProtected
      requiredPermission={PERMISSION_SCOPES.MANAGE_BLOG}
      fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
          <p className="mb-4">
            You need the MANAGE_BLOG permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to request access.
          </p>
        </div>
      }
    >
      <AdminBlogClient initialPosts={formattedPosts} />
    </PermissionProtected>
  );
}
