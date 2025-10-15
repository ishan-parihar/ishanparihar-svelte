"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useDeleteBlogPostMutation } from "@/queries/blogQueries";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2, RefreshCw } from "lucide-react";
import { api } from "@/lib/trpc-client";
import { AdminBlogPost } from "@/queries/adminQueries";

// Use AdminBlogPost type from queries
type BlogPost = AdminBlogPost & {
  coverImage?: string; // Keep for backward compatibility
};

// Helper function to get the correct image URL
// Note: This client-side function doesn't use the Supabase client directly
// It only handles URLs that have already been processed by the server
const getBlogImage = (post: BlogPost): string => {
  // Prioritize cover_image first as it's the format stored in Supabase,
  // then fallback to coverImage if it exists, otherwise use default
  let imageUrl =
    post.cover_image || post.coverImage || "/default-blog-image.jpg";

  // Validate and sanitize the URL
  try {
    // Handle null, undefined, or empty strings
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      return "/default-blog-image.jpg";
    }

    // Trim whitespace
    imageUrl = imageUrl.trim();

    // Check if it's already a valid URL or relative path
    if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
      // FALLBACK FIX: Fix problematic URL patterns directly in the component
      if (imageUrl.includes("/blog-images/blog/public/")) {
        const fixedUrl = imageUrl.replace(
          "/blog-images/blog/public/",
          "/blog-images/public/",
        );
        console.warn(
          `⚠️ ADMIN BLOG COVER - FALLBACK FIX: "${imageUrl}" -> "${fixedUrl}". This should be fixed server-side.`,
        );
        imageUrl = fixedUrl;
      } else if (imageUrl.includes("/blog-images/blog/")) {
        const fixedUrl = imageUrl.replace(
          "/blog-images/blog/",
          "/blog-images/",
        );
        console.warn(
          `⚠️ ADMIN BLOG COVER - FALLBACK FIX: "${imageUrl}" -> "${fixedUrl}". This should be fixed server-side.`,
        );
        imageUrl = fixedUrl;
      }

      // Additional validation for absolute URLs
      if (imageUrl.startsWith("http")) {
        try {
          new URL(imageUrl); // This will throw if invalid
          return imageUrl;
        } catch (urlError) {
          console.error(
            `Invalid URL detected in admin blog: "${imageUrl}"`,
            urlError,
          );
          return "/default-blog-image.jpg";
        }
      }

      // Return relative paths as-is (they're valid for Next.js Image)
      return imageUrl;
    } else {
      // If it's not a valid URL or relative path, use default
      console.warn(
        `Invalid image URL format in admin blog: "${imageUrl}". Using default.`,
      );
      return "/default-blog-image.jpg";
    }
  } catch (error) {
    console.error(
      `Error processing image URL in admin blog: "${imageUrl}"`,
      error,
    );
    return "/default-blog-image.jpg";
  }
};

interface AdminBlogClientProps {
  initialPosts: BlogPost[];
}

export function AdminBlogClient({ initialPosts }: AdminBlogClientProps) {
  const [deleteError, setDeleteError] = useState("");
  const supabase = createClient();

  // tRPC query for admin blog posts
  const {
    data: posts = initialPosts,
    isLoading,
    error,
    refetch,
  } = api.blog.getAdminPosts.useQuery({ includeDrafts: true });

  // Optimized delete mutation using Supabase Cache Helpers
  const { mutateAsync: deleteBlogPost, isPending: isDeleting } =
    useDeleteBlogPostMutation(supabase);

  // Handle post deletion
  const handleDelete = async (slug: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleteError("");

    try {
      // Find the post to get its ID for deletion
      const postToDelete = posts.find((p: BlogPost) => p.slug === slug);
      if (!postToDelete) {
        setDeleteError("Post not found");
        return;
      }

      // Use optimized mutation with automatic cache updates
      await deleteBlogPost({ id: postToDelete.id });

      // Cache updates are handled automatically by the mutation hook
    } catch (error) {
      console.error("Error deleting post:", error);
      setDeleteError("An error occurred while deleting the post.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
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
          <Button asChild>
            <Link href="/admin/blog/new">Create New Post</Link>
          </Button>
        </div>
      </div>

      {(deleteError || error) && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {deleteError ||
            (error instanceof Error
              ? error.message
              : "Failed to load blog posts")}
        </div>
      )}

      {(isDeleting || isLoading) && (
        <div className="mb-6 rounded-md bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isDeleting ? "Deleting post..." : "Loading posts..."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {posts.length > 0 ? (
          posts.map((post: BlogPost) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Image Column */}
                  <div className="md:col-span-3 relative h-48 md:h-full min-h-[150px]">
                    <Image
                      src={getBlogImage(post)}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>

                  {/* Content Column */}
                  <div className="md:col-span-9 p-6">
                    <div className="flex flex-col h-full">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                            {post.category}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(post.date)}
                          </span>
                          {post.featured && (
                            <span className="px-3 py-1 text-xs rounded-full bg-amber-500/10 text-amber-500 font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="mr-2"
                        >
                          <Link href={`/blog/${post.slug}`}>View Post</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="mr-2"
                        >
                          <Link href={`/admin/blog/edit/${post.slug}`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(post.slug)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first blog post
            </p>
            <Button asChild>
              <Link href="/admin/blog/new">Create New Post</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
