"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { MediumBlogCard } from "./MediumBlogCard";
import { getOptimizedSupabaseClient } from "@/utils/supabase/optimized-client";
import {
  getPublicBlogPosts,
  blogQueryKeys,
  type PublicBlogPost,
  usePublicBlogPostsWithHelpers,
} from "@/queries/blogQueries";
import { useComprehensiveEngagementSync } from "@/hooks/useEngagementSync";
import { normalizeImageUrl } from "@/lib/imageUtils";
import { useDataLoading } from "@/hooks/useLoadingStates";
import {
  BlogCardSkeleton,
  InlineLoader,
} from "@/components/ui/loading-animations";

// Define BlogPost interface for compatibility with existing components
interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  cover_image?: string;
  date: string;
  author?: string;
  author_user_id?: string;
  category: string;
  featured: boolean;
  content: string;
  draft?: boolean;
  premium?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
  author_details?: {
    id: string;
    display_name: string;
    profile_picture_url: string | null;
    role: string;
  } | null;
}

interface OptimizedBlogListProps {
  initialPosts?: BlogPost[];
  limit?: number;
}

// New component using Supabase Cache Helpers
export function OptimizedBlogListWithHelpers({
  initialPosts = [],
  limit,
}: OptimizedBlogListProps) {
  // Create optimized Supabase client (singleton pattern)
  const supabase = getOptimizedSupabaseClient();

  // Enable comprehensive engagement synchronization
  useComprehensiveEngagementSync();

  // Use Supabase Cache Helpers hook - automatic query key management
  const {
    data: queryPosts,
    isLoading,
    error,
    isError,
    isFetching,
  } = usePublicBlogPostsWithHelpers(supabase, limit);

  // Enhanced loading state management
  useDataLoading(isLoading, isFetching, {
    componentId: "blog-list-with-helpers",
    initialMessage: "Loading blog posts...",
    refetchMessage: "Refreshing posts...",
  });

  // Debug logging only in debug mode
  const DEBUG_MODE =
    process.env.NODE_ENV === "development" && process.env.BLOG_DEBUG === "true";

  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("[OptimizedBlogListWithHelpers] Query state:", {
        isLoading,
        isError,
        postsCount: queryPosts?.length || 0,
        error: error?.message,
      });
    }
  }, [isLoading, isError, queryPosts, error, DEBUG_MODE]);

  // Transform data to match expected format for MediumBlogCard
  const posts = queryPosts
    ? queryPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || "",
        cover_image: post.cover_image || "",
        coverImage: post.cover_image || "",
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
        content: post.content || "",
        draft: post.draft || false,
        premium: post.premium || false,
        content_type: post.content_type || "blog",
        recommendation_tags: post.recommendation_tags || [],
        likes_count: post.likes_count || 0, // Use actual engagement data
        comments_count: post.comments_count || 0, // Use actual engagement data
        views_count: post.views_count || 0, // Use actual engagement data
        author_details:
          typeof post.author === "object" && post.author && "id" in post.author
            ? {
                id: (post.author as any).id,
                display_name: (post.author as any).name || "Anonymous",
                profile_picture_url: (post.author as any).picture || null,
                role: (post.author as any).role || "author",
              }
            : null,
      }))
    : [];

  // Helper function to get blog image using consolidated logic
  const getBlogImage = (post: BlogPost): string => {
    return normalizeImageUrl(post.cover_image || post.coverImage, {
      context: "blog",
      logFixes: true,
    });
  };

  // Loading state with enhanced skeleton
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton
              key={i}
              className="border-b border-neutral-200 dark:border-neutral-700 pb-8"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    if (DEBUG_MODE) {
      console.error(
        "[OptimizedBlogListWithHelpers] Error loading posts:",
        error,
      );
    }
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Failed to load blog posts. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // No posts state
  if (!posts || posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          No blog posts found.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {posts && posts.length > 0 ? (
        <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
          {posts.map((post, index) => (
            <MediumBlogCard
              key={post.slug}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              coverImage={getBlogImage(post)}
              date={post.date}
              category={post.category}
              slug={post.slug}
              index={index}
              premium={post.premium}
              likes_count={post.likes_count}
              comments_count={post.comments_count}
              views_count={post.views_count}
              author={post.author}
              author_details={post.author_details}
              content_type={post.content_type}
              recommendation_tags={post.recommendation_tags}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">
            No blog posts available.
          </p>
        </div>
      )}
    </div>
  );
}

// Original component (kept for comparison/fallback)
export function OptimizedBlogList({
  initialPosts = [],
  limit,
}: OptimizedBlogListProps) {
  // Create optimized Supabase client (singleton pattern)
  const supabase = getOptimizedSupabaseClient();

  // Use React Query to fetch blog posts with caching
  const {
    data: queryPosts,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: limit
      ? blogQueryKeys.publicPostsWithLimit(limit)
      : blogQueryKeys.publicPosts(),
    queryFn: () => getPublicBlogPosts(supabase, limit),
    // Use initial data if provided (from server-side prefetch)
    initialData:
      initialPosts.length > 0
        ? transformToPublicBlogPosts(initialPosts)
        : undefined,
    // Stale time: consider data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time: keep in cache for 10 minutes when not being used
    gcTime: 10 * 60 * 1000,
    // Refetch on window focus for better UX
    refetchOnWindowFocus: true,
    // Don't refetch on mount if we have initial data
    refetchOnMount: initialPosts.length === 0,
  });

  // Transform PublicBlogPost to BlogPost format for compatibility
  const posts: BlogPost[] = queryPosts
    ? transformFromPublicBlogPosts(queryPosts)
    : initialPosts;

  // Debug logging for engagement data (only in debug mode)
  useEffect(() => {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.BLOG_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("🔍 [OptimizedBlogList] Query state:", {
        isLoading,
        isError,
        postsCount: posts.length,
      });
      if (posts && posts.length > 0) {
        console.log("🔍 [OptimizedBlogList] First 3 posts engagement data:");
        posts.slice(0, 3).forEach((post, index) => {
          console.log(`   ${index + 1}. ${post.slug}:`);
          console.log(`      - likes_count: ${post.likes_count}`);
          console.log(`      - comments_count: ${post.comments_count}`);
          console.log(`      - views_count: ${post.views_count}`);
          console.log(
            `      - Has engagement data: ${post.likes_count !== undefined || post.comments_count !== undefined || post.views_count !== undefined}`,
          );
        });
      }
    }
  }, [posts, isLoading, isError]);

  // Helper function to get the correct image URL using consolidated logic
  const getBlogImage = (post: BlogPost): string => {
    return normalizeImageUrl(post.coverImage || post.cover_image, {
      context: "blog",
      logFixes: true,
    });
  };

  // Show loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-4 py-6 px-0"
            >
              <div className="flex-1 md:w-2/3 space-y-3">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
                </div>
              </div>
              <div className="md:w-1/3">
                <div className="aspect-[4/3] md:aspect-[3/2] bg-neutral-200 dark:bg-neutral-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (isError && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <h3 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-100">
            Failed to load blog posts
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {posts && posts.length > 0 ? (
        <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
          {posts.map((post, index) => (
            <MediumBlogCard
              key={post.slug}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              coverImage={getBlogImage(post)}
              date={post.date}
              category={post.category}
              slug={post.slug}
              index={index}
              premium={post.premium}
              likes_count={post.likes_count}
              comments_count={post.comments_count}
              views_count={post.views_count}
              author={post.author}
              author_details={post.author_details}
              content_type={post.content_type}
              recommendation_tags={post.recommendation_tags}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-2">No blog posts found</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Check back later for new content
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions to transform between data formats
function transformToPublicBlogPosts(posts: BlogPost[]): PublicBlogPost[] {
  return posts.map((post) => ({
    id: post.slug, // Use slug as fallback ID
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    cover_image: post.cover_image || post.coverImage || "",
    date: post.date,
    // Handle both legacy string author and new object format
    author: post.author_details
      ? post.author_details.display_name
      : typeof post.author === "string"
        ? post.author
        : undefined,
    author_user_id: post.author_user_id || "",
    category: post.category,
    featured: post.featured,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    draft: post.draft || false,
    premium: post.premium || false,
    content_type: post.content_type || "blog",
    recommendation_tags: post.recommendation_tags || [],
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    views_count: post.views_count || 0,
  }));
}

function transformFromPublicBlogPosts(posts: PublicBlogPost[]): BlogPost[] {
  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    date: post.date,
    // Handle legacy string author field
    author: typeof post.author === "string" ? post.author : undefined,
    author_user_id: post.author_user_id,
    category: post.category,
    featured: post.featured,
    content: post.content || "",
    draft: post.draft,
    premium: post.premium,
    content_type: post.content_type,
    recommendation_tags: post.recommendation_tags,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
    views_count: post.views_count,
    // Transform object author to author_details
    author_details:
      typeof post.author === "object" && post.author && "id" in post.author
        ? {
            id: (post.author as any).id,
            display_name: (post.author as any).name,
            profile_picture_url: (post.author as any).picture,
            role: (post.author as any).role,
          }
        : null,
  }));
}
