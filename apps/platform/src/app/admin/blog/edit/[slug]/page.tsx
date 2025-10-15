import { getBlogCategories } from "@/queries/blogQueries";
import { BlogEditClient } from "@/components/admin/blog-edit-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Force dynamic rendering for admin pages
export const dynamic = "force-dynamic";

// Define the BlogPost type
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: string;
  author_user_id: string; // Add author_user_id field
  category: string;
  featured: boolean;
  content: string;
  draft?: boolean;
  premium?: boolean;
}

// Server-side function to get a blog post by slug
async function getServerBlogPostBySlug(slug: string) {
  try {
    // Use the service role client instead since we're in an admin context
    // This bypasses the need for cookies and auth
    const supabase = createServiceRoleClient();

    // Fetch the blog post - for admin we don't filter by draft status
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(
        `[Server] Error fetching blog post with slug ${slug}:`,
        error,
      );
      return null;
    }

    return post;
  } catch (error) {
    console.error(
      `[Server] Exception in getServerBlogPostBySlug for ${slug}:`,
      error,
    );
    return null;
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Ensure params is properly resolved before accessing slug
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getServerBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Admin",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `Edit: ${post.title} | Admin`,
    description: `Edit blog post: ${post.title}`,
  };
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    // Ensure params is properly resolved before accessing slug
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Fetch blog post and categories in parallel
    // Use server-side client for admin context
    const supabase = createServiceRoleClient();
    const [postData, allCategories] = await Promise.all([
      getServerBlogPostBySlug(slug),
      getBlogCategories(supabase),
    ]);

    // If post not found, show 404 page
    if (!postData) {
      notFound();
    }

    // Format data correctly for the client component
    console.log("🔍🔍🔍 [EditPostPage] Raw post data from database:", postData);

    const formattedPost: BlogPost = {
      slug: postData.slug,
      title: postData.title,
      excerpt: postData.excerpt || "",
      coverImage: postData.cover_image || "",
      date: postData.date,
      author: postData.author || "Anonymous",
      author_user_id: postData.author_user_id || "", // Include author_user_id
      category: postData.category || "Uncategorized",
      featured: !!postData.featured,
      content: postData.content || "",
      draft: !!postData.draft,
      premium: !!postData.premium,
    };

    console.log(
      "🔍🔍🔍 [EditPostPage] Formatted post with author_user_id:",
      formattedPost.author_user_id,
    );

    // Filter out "All Categories" from the categories list
    const categories = allCategories.filter((c) => c !== "All Categories");

    return (
      <BlogEditClient
        slug={slug}
        categories={categories}
        initialPost={formattedPost}
      />
    );
  } catch (error) {
    console.error(`Error fetching blog post:`, error);
    notFound();
  }
}
