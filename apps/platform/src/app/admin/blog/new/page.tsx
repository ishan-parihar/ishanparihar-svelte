import { getBlogCategories } from "@/queries/blogQueries";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { BlogNewClient } from "@/components/admin/blog-new-client";
import { Metadata } from "next";

// Force dynamic rendering for admin pages
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create New Blog Post | Admin",
  description: "Create a new blog post",
};

export default async function NewPostPage() {
  // Fetch categories server-side using service role client for admin context
  const supabase = createServiceRoleClient();
  const allCategories = await getBlogCategories(supabase);
  const categories = allCategories.filter((c) => c !== "All Categories");

  return <BlogNewClient categories={categories} />;
}
