"use client";

import { useQuery } from "@tanstack/react-query";
import { getOptimizedSupabaseClient } from "@/utils/supabase/optimized-client";
import {
  getBlogPostBySlug,
  blogQueryKeys,
  PublicBlogPost,
  useBlogPostBySlugWithHelpers,
} from "@/queries/blogQueries";
import { BlogPostClient } from "./blog-post-client";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { useViewTracking } from "@/hooks/useViewTracking";
import { useComprehensiveEngagementSync } from "@/hooks/useEngagementSync";

interface SingleBlogPostViewProps {
  slug: string;
  isPremium?: boolean;
  currentPostSlug?: string;
  category?: string;
  relatedPosts?: any[];
}

interface AuthorDetails {
  id: string;
  display_name: string;
  profile_picture_url: string | null;
  role: string;
}

interface FormattedBlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  cover_image?: string;
  date: string;
  author: string;
  author_details?: AuthorDetails | null;
  category: string;
  featured: boolean;
  content: string;
  serializedContent?: any;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
}

// New component using Supabase Cache Helpers
export function SingleBlogPostViewWithHelpers({
  slug,
  isPremium = false,
  currentPostSlug,
  category,
  relatedPosts = [],
}: SingleBlogPostViewProps) {
  // Get optimized Supabase client (singleton pattern)
  const supabase = getOptimizedSupabaseClient();

  // Enable comprehensive engagement synchronization
  useComprehensiveEngagementSync();

  // Use Supabase Cache Helpers hook - automatic query key management
  const {
    data: post,
    isLoading,
    error,
    isError,
  } = useBlogPostBySlugWithHelpers(supabase, slug);

  // Track view for this blog post (with 2 second delay to avoid counting quick bounces)
  const { isTracking, hasTracked } = useViewTracking({
    slug,
    enabled: !isLoading && !isError && !!post,
    delay: 2000,
  });

  // Debug logging only in debug mode
  const DEBUG_MODE =
    process.env.NODE_ENV === "development" && process.env.BLOG_DEBUG === "true";

  // Loading state
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (isError) {
    if (DEBUG_MODE) {
      console.error(
        "[SingleBlogPostViewWithHelpers] Error loading post:",
        error,
      );
    }
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Error Loading Post
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Failed to load the blog post. Please try again later.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mx-auto"
          >
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  // Show not found if post doesn't exist
  if (!post) {
    if (DEBUG_MODE) {
      console.log(
        "[SingleBlogPostViewWithHelpers] Post not found for slug:",
        slug,
      );
    }
    notFound();
  }

  // Debug logging only in debug mode
  if (DEBUG_MODE) {
    console.log("[SingleBlogPostViewWithHelpers] Successfully loaded post:", {
      title: post.title,
      slug: post.slug,
      hasAuthor: !!post.author,
      hasEngagement: !!(
        post.likes_count ||
        post.comments_count ||
        post.views_count
      ),
      viewTracking: { isTracking, hasTracked },
    });
  }

  // Transform the data to match BlogPostClient expectations
  const formattedPost = {
    id: post.id, // Include the post ID for BookmarkButton functionality
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content || "",
    coverImage: post.cover_image || "",
    cover_image: post.cover_image || "",
    date: post.date,
    author:
      typeof post.author === "string"
        ? post.author
        : typeof post.author === "object" &&
            post.author &&
            "name" in post.author
          ? (post.author as any).name
          : "Anonymous",
    author_user_id: post.author_user_id || "",
    category: post.category,
    featured: post.featured || false,
    draft: post.draft || false,
    premium: post.premium || false,
    content_type: post.content_type || "blog",
    recommendation_tags: post.recommendation_tags || [],
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    author_details:
      typeof post.author === "object" && post.author && "id" in post.author
        ? {
            id: (post.author as any).id,
            display_name: (post.author as any).name || "Anonymous",
            profile_picture_url: (post.author as any).picture || null,
            role: (post.author as any).role || "author",
          }
        : null,
  };

  // Use the existing BlogPostClient component with the formatted data
  return (
    <BlogPostClient
      post={formattedPost}
      isPremium={isPremium}
      currentPostSlug={currentPostSlug}
      category={category}
    />
  );
}

// Original component (kept for comparison/fallback)
export function SingleBlogPostView({
  slug,
  isPremium = false,
  currentPostSlug,
  category,
  relatedPosts = [],
}: SingleBlogPostViewProps) {
  // Get optimized Supabase client (singleton pattern)
  const supabase = getOptimizedSupabaseClient();

  // Use React Query to fetch the blog post
  const {
    data: post,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: blogQueryKeys.post(slug),
    queryFn: () => getBlogPostBySlug(supabase, slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 or similar client error
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-neutral-600 dark:text-neutral-400 font-ui">
            Loading article...
          </p>
        </div>
      </main>
    );
  }

  // Show error state if there's an error
  if (isError || error) {
    // Always log errors regardless of debug mode
    console.error("[SingleBlogPostView] Error loading blog post:", error);
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive rounded-none p-6 max-w-2xl w-full text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Error Loading Blog Post
          </h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error
              ? error.message
              : "Failed to load blog post"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            This could be due to a temporary connection issue or the post may
            not exist.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mx-auto"
          >
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  // Show not found if post doesn't exist
  if (!post) {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[SingleBlogPostView] Post not found for slug:", slug);
    }
    notFound();
  }

  // Debug logging only in debug mode
  const DEBUG_MODE =
    process.env.NODE_ENV === "development" && process.env.BLOG_DEBUG === "true";
  if (DEBUG_MODE) {
    console.log("[SingleBlogPostView] Successfully loaded post:", {
      title: post.title,
      slug: post.slug,
      hasAuthor: !!post.author,
      hasEngagement: !!(
        post.likes_count ||
        post.comments_count ||
        post.views_count
      ),
    });
  }

  // Format the post data for the BlogPostClient component
  // Handle author data (could be string or object from the join)
  let authorDetails: AuthorDetails | null = null;
  let authorName = "Anonymous";

  if (typeof post.author === "string") {
    authorName = post.author;
  } else if (
    post.author &&
    typeof post.author === "object" &&
    "name" in post.author
  ) {
    const authorObj = post.author as any;
    authorName =
      authorObj.name || authorObj.email?.split("@")[0] || "Anonymous";
    authorDetails = {
      id: authorObj.id || "",
      display_name: authorName,
      profile_picture_url: authorObj.picture || null,
      role: authorObj.role || "User",
    };
  }

  const formattedPost: FormattedBlogPost = {
    id: post.id || `id-${Date.now()}`,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    coverImage: post.cover_image || "/default-blog-image.jpg",
    cover_image: post.cover_image || "/default-blog-image.jpg",
    date: post.date
      ? new Date(post.date).toISOString()
      : new Date().toISOString(),
    author: authorName,
    author_details: authorDetails,
    category: post.category || "Uncategorized",
    featured: !!post.featured,
    content: post.content || "",
    // Include engagement metrics from the joined data
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    views_count: post.views_count || 0,
  };

  // Use the existing BlogPostClient component with the formatted data
  return (
    <BlogPostClient
      post={formattedPost}
      isPremium={isPremium}
      currentPostSlug={currentPostSlug}
      category={category}
    />
  );
}
