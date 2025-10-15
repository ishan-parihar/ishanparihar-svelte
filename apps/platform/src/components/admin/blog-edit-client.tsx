"use client";

// Enable detailed logging for debugging form submission issues
const DEBUG_EDIT = true;

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/trpc-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { generateSEOSlug } from "@/lib/slug-utils";

// Dynamically import the BlogPostForm component to reduce initial bundle size
const BlogPostForm = dynamic(
  () =>
    import("@/components/admin/blog-post-form").then((mod) => mod.BlogPostForm),
  {
    loading: () => (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-lg">Loading editor...</div>
      </div>
    ),
    ssr: false, // Disable SSR for the editor component
  },
);

// Define the BlogPost type
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  cover_image?: string; // Use database column name
  date: string;
  author: string;
  author_user_id?: string; // Add author_user_id field
  category: string;
  featured: boolean;
  content: string;
  draft?: boolean;
  premium?: boolean;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
}

interface BlogEditClientProps {
  slug: string;
  categories: string[];
  initialPost?: BlogPost; // Optional for SSR hydration
}

export function BlogEditClient({
  slug,
  categories,
  initialPost,
}: BlogEditClientProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  // tRPC query for fetching the blog post
  const {
    data: post,
    isLoading,
    error: queryError,
    refetch,
  } = api.blog.getAdminPost.useQuery(
    { slug, includeDrafts: true },
    { enabled: !!slug },
  );

  // tRPC mutation for saving blog posts
  const createPostMutation = api.blog.createPost.useMutation();
  const updatePostMutation = api.blog.updatePost.useMutation();

  // Handle query error
  if (queryError) {
    console.error("Error fetching blog post:", queryError);
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Blog Post</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/blog">Back to Posts</Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (queryError || !post) {
    return (
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Blog Post</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/blog">Back to Posts</Link>
            </Button>
          </div>
        </div>
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {queryError
            ? queryError.message || "Failed to load blog post"
            : "Failed to load blog post"}
        </div>
      </div>
    );
  }

  const handleSave = async (formData: {
    title: string;
    excerpt: string;
    date: string;
    author_user_id: string;
    category: string;
    featured: boolean;
    draft: boolean;
    content: string;
    premium: boolean;
    cover_image?: string; // Use database column name
  }) => {
    setError("");

    console.log(
      "🚀🚀🚀 BLOG EDIT CLIENT - Received form data:",
      JSON.stringify(formData, null, 2),
    );
    console.log(
      "🚀🚀🚀 BLOG EDIT CLIENT - author_user_id:",
      formData.author_user_id,
    );
    console.log(
      "🚀🚀🚀 BLOG EDIT CLIENT - Original post:",
      JSON.stringify(post, null, 2),
    );

    if (DEBUG_EDIT) {
      // Validate required fields
      const requiredFields = [
        "title",
        "excerpt",
        "content",
        "category",
        "author_user_id",
      ];
      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof typeof formData],
      );

      if (missingFields.length > 0) {
        console.error("❌❌❌ Missing required fields:", missingFields);
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        return;
      }
    }

    // Check if title has changed and regenerate slug if needed
    const titleChanged = formData.title.trim() !== post.title.trim();
    let newSlug = post.slug; // Default to existing slug

    if (titleChanged) {
      // Generate new SEO-optimized slug from the updated title
      newSlug = generateSEOSlug(formData.title);
      console.log(
        `🔄 Title changed from "${post.title}" to "${formData.title}"`,
      );
      console.log(
        `🔄 Slug will be updated from "${post.slug}" to "${newSlug}"`,
      );
    }

    // Create a BlogPost object from the form data
    const updatedPost = {
      ...formData,
      slug: newSlug, // Use the new slug (either existing or regenerated)
      originalSlug: post.slug, // Include original slug for API to handle URL updates
      author: post.author, // Keep the original author display name for now
      author_user_id: formData.author_user_id, // Explicitly include author_user_id
      // cover_image is already properly set from formData
    };

    console.log(
      "📦📦📦 BLOG EDIT CLIENT - Final updatedPost object:",
      JSON.stringify(updatedPost, null, 2),
    );
    console.log(
      "📦📦📦 BLOG EDIT CLIENT - author_user_id:",
      updatedPost.author_user_id,
    );

    try {
      // Use tRPC mutation to update the blog post
      const result = await updatePostMutation.mutateAsync({
        id: post.id,
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: formData.cover_image,
        category: formData.category,
        featured: formData.featured,
        draft: formData.draft,
        premium: formData.premium,
        published_at: formData.date,
      });

      // If slug changed, redirect to the new URL, otherwise go to admin blog page
      if (titleChanged && newSlug !== post.slug) {
        console.log(`🔄 Redirecting to new URL: /blog/${newSlug}`);
        // Redirect to the new blog post URL to verify the change worked
        router.push(`/blog/${newSlug}`);
      } else {
        // Redirect to admin blog page on success
        // Cache updates are handled automatically by tRPC
        router.push("/admin/blog");
      }
    } catch (error) {
      console.error("Error saving blog post:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save post. Please try again.",
      );
    }
  };

  // Convert AdminBlogPost to BlogPost format for the form
  const formPost: BlogPost = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    date: post.date,
    author: post.author,
    author_user_id: post.author_user_id,
    category: post.category,
    featured: post.featured,
    content: post.content,
    draft: post.draft,
    premium: post.premium,
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/blog">Back to Posts</Link>
          </Button>
        </div>
      </div>

      {(error || queryError) && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error ||
            (queryError
              ? (queryError as Error).message || "Failed to load blog post"
              : "Failed to load blog post")}
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-lg">Loading editor...</div>
          </div>
        }
      >
        <BlogPostForm
          initialData={formPost}
          categories={categories}
          onSubmit={handleSave}
        />
      </Suspense>
    </>
  );
}
