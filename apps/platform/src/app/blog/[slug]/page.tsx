// Enable Incremental Static Regeneration (ISR) with 30-minute revalidation
export const revalidate = 1800; // Revalidate every 30 minutes

import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import {
  SingleBlogPostView,
  SingleBlogPostViewWithHelpers,
} from "@/components/blog/SingleBlogPostView";
import dynamic from "next/dynamic";

// Dynamic import for heavy blog post client component to reduce initial bundle size
const BlogPostClient = dynamic(
  () =>
    import("@/components/blog/blog-post-client").then((mod) => ({
      default: mod.BlogPostClient,
    })),
  {
    ssr: true, // Keep SSR for SEO
    loading: () => (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    ),
  },
);

// Dynamic import for MagicBento component with lazy loading - moved to client component
const RelatedArticlesSection = dynamic(
  () => import("@/components/blog/RelatedArticlesSection"),
  {
    ssr: true,
    loading: () => <div className="w-full h-64 bg-muted rounded-xl" />,
  },
);
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import {
  createServiceRoleClient,
  createServerClient,
} from "@/utils/supabase/server";
import { getBlogPost, preloadBlogPost } from "@/lib/blog-preload";
import {
  getBlogPostBySlug,
  prefetchBlogPostWithEngagement,
} from "@/queries/blogQueries";
import {
  buildUserPremiumStatusQuery,
  buildUserFollowedTopicsQuery,
  prefetchQuery as prefetchUserQuery,
} from "@/queries/userQueries";
import { getBlogPostsEngagementClient } from "@/lib/engagement-client";
import { getCommentCount } from "@/lib/comments";
import { auth } from "@/auth";
import { MDXProviderWrapper } from "@/components/mdx-provider";
import { CommentSectionServer } from "@/components/blog/comments/CommentSectionServer";
import "@/app/blog/mdx-clean.css";

// Note: We're now using the cached getBlogPost from blog-preload.ts
// which internally uses the cached getServerBlogPostBySlug from blog-server.ts

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  // Create a Supabase client with service role
  const supabase = createServiceRoleClient();

  // Fetch all published blog posts
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("draft", false);

  if (error || !posts) {
    console.error("[generateStaticParams] Error fetching blog posts:", error);
    return [];
  }

  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    // Ensure params is a valid object before accessing properties
    if (!params || typeof params !== "object") {
      console.error(`[BlogMetadata] Invalid params object:`, params);
      return {
        title: "Post Not Found | Ishan Parihar",
        description: "The requested blog post could not be found.",
      };
    }

    // Extract slug from params safely - ensure it's not a Promise
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug;

    // Validate slug is a string
    if (typeof slug !== "string") {
      console.error(`[BlogMetadata] Invalid slug type:`, typeof slug);
      return {
        title: "Post Not Found | Ishan Parihar",
        description: "The requested blog post could not be found.",
      };
    }

    console.log(`[BlogMetadata] Generating metadata for slug: ${slug}`);

    // Use React Query approach for metadata generation (using service role for ISR compatibility)
    try {
      const supabase = createServiceRoleClient();
      const post = await getBlogPostBySlug(supabase, slug);

      if (!post) {
        console.log(
          `[BlogMetadata] Post not found, returning default metadata`,
        );
        return {
          title: "Post Not Found | Ishan Parihar",
          description: "The requested blog post could not be found.",
        };
      }

      console.log(
        `[BlogMetadata] Successfully generated metadata for: ${post.title}`,
      );

      // Handle author data (could be string or object)
      const authorName =
        typeof post.author === "string"
          ? post.author
          : (post.author as any)?.name || "Ishan Parihar";

      // Ensure all fields have fallback values
      return {
        title: `${post.title} | Ishan Parihar`,
        description:
          post.excerpt || "Read this article on Ishan Parihar's blog",
        openGraph: {
          title: post.title,
          description:
            post.excerpt || "Read this article on Ishan Parihar's blog",
          type: "article",
          publishedTime: post.date || new Date().toISOString(),
          authors: [authorName],
          images: [
            {
              url: post.cover_image || "/default-blog-image.jpg",
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
        },
      };
    } catch (queryError) {
      console.error(
        `[BlogMetadata] Error with React Query approach:`,
        queryError,
      );
      // Fallback to legacy method
      preloadBlogPost(slug);
      const post = await getBlogPost(slug);

      if (!post) {
        return {
          title: "Post Not Found | Ishan Parihar",
          description: "The requested blog post could not be found.",
        };
      }

      return {
        title: `${post.title} | Ishan Parihar`,
        description:
          post.excerpt || "Read this article on Ishan Parihar's blog",
        openGraph: {
          title: post.title,
          description:
            post.excerpt || "Read this article on Ishan Parihar's blog",
          type: "article",
          publishedTime: post.date || new Date().toISOString(),
          authors: [post.author || "Ishan Parihar"],
          images: [
            {
              url: post.cover_image || "/default-blog-image.jpg",
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error(`[BlogMetadata] Error generating metadata:`, error);
    // Return default metadata in case of error
    return {
      title: "Blog | Ishan Parihar",
      description:
        "Explore insights on productivity, spirituality, and personal evolution.",
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    // Ensure params is a valid object before accessing properties
    if (!params || typeof params !== "object") {
      console.error(`[BlogPostPage] Invalid params object:`, params);
      notFound();
    }

    // Extract slug from params safely - ensure it's not a Promise
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug;

    // Log after slug has been properly resolved
    console.log(`[BlogPostPage] Rendering page for slug: "${slug}"`);

    if (!slug) {
      console.error(`[BlogPostPage] Missing slug parameter`);
      notFound();
    }

    // Validate slug is a string
    if (typeof slug !== "string") {
      console.error(`[BlogPostPage] Invalid slug type:`, typeof slug);
      notFound();
    }

    // Create a new QueryClient for server-side prefetching
    const queryClient = new QueryClient();

    // Get Supabase server client for prefetching (using service role for ISR compatibility)
    const supabase = createServiceRoleClient();

    // Prefetch the blog post using custom prefetch function with engagement data
    let post;
    try {
      await prefetchBlogPostWithEngagement(queryClient, supabase, slug);

      // Skip user-specific data prefetching for ISR compatibility
      // User-specific data will be fetched on the client side instead
      console.log(
        `[BlogPostPage] Skipping user-specific data prefetching for ISR compatibility`,
      );

      // Get the prefetched data to check if post exists
      // Note: With cache helpers, we need to get data differently
      // For now, we'll use the legacy method to get the data for validation
      post = await getBlogPostBySlug(supabase, slug);

      console.log(`[BlogPostPage] React Query prefetch result for "${slug}":`, {
        found: !!post,
        title: post?.title,
        premium: post?.premium,
        draft: post?.draft,
        id: post?.id,
      });

      // If post not found, show 404 page
      if (!post) {
        console.log(
          `[BlogPostPage] Primary React Query fetch for slug "${slug}" returned null. Investigating...`,
        );

        // Try to fetch all posts to see what's available and debug the issue
        const debugSupabase = createServiceRoleClient();
        console.log(
          `[BlogPostPage] Using createServiceRoleClient to bypass RLS for debugging`,
        );

        const { data: allPosts, error: debugError } = await debugSupabase
          .from("blog_posts")
          .select("id, title, slug, draft, premium")
          .eq("draft", false)
          .limit(10);

        if (debugError) {
          console.error(
            `[BlogPostPage] Error fetching posts for debugging:`,
            debugError,
          );
        }

        if (allPosts && allPosts.length > 0) {
          console.log(
            `[BlogPostPage] Available posts:`,
            allPosts.map(
              (p: any) =>
                `${p.id}: ${p.title} (${p.slug}) [premium: ${p.premium}]`,
            ),
          );

          // First check if the exact slug exists (case-insensitive)
          const exactMatch = allPosts.find(
            (p: any) => p.slug.toLowerCase() === slug.toLowerCase(),
          );

          if (exactMatch) {
            console.error(
              `[BlogPostPage] CRITICAL ISSUE: React Query fetch for "${slug}" failed, but found the EXACT SAME slug in direct query.`,
            );
            console.log(
              `[BlogPostPage] Exact match found: ${exactMatch.title} (${exactMatch.slug}) [premium: ${exactMatch.premium}]`,
            );
            console.log(
              `[BlogPostPage] This indicates a potential RLS policy issue blocking access to premium content.`,
            );

            // If this is a premium post, the issue is likely RLS-related
            if (exactMatch.premium) {
              console.error(
                `[BlogPostPage] This is a PREMIUM POST. The RLS policies may be incorrectly blocking access.`,
              );
              console.log(
                `[BlogPostPage] Check: 1) User authentication status, 2) User premium membership, 3) RLS policies`,
              );
            }

            // Don't redirect to the same slug to avoid infinite loops
            // Instead, show 404 page
            notFound();
          }

          // If no exact match, check for similar slugs
          const similarPost = allPosts.find(
            (p: any) =>
              p.slug !== slug && // Ensure it's not the same slug
              (p.slug.toLowerCase().includes(slug.toLowerCase()) ||
                slug.toLowerCase().includes(p.slug.toLowerCase())),
          );

          if (similarPost) {
            console.log(
              `[BlogPostPage] Found truly SIMILAR post with slug "${similarPost.slug}". Redirecting.`,
            );
            // Redirect to the similar post
            redirect(`/blog/${similarPost.slug}`);
          } else {
            console.log(
              `[BlogPostPage] No similar post found for slug "${slug}". Triggering 404.`,
            );
          }
        } else {
          console.log(`[BlogPostPage] No published posts found in database.`);
        }

        // If we get here, no similar post was found or redirect didn't happen
        notFound();
      }
    } catch (error) {
      // Check if this is a NEXT_REDIRECT error and re-throw it to allow the redirect to proceed
      if (error && typeof error === "object" && "digest" in error) {
        const errorWithDigest = error as { digest?: string };
        if (
          errorWithDigest.digest &&
          errorWithDigest.digest.startsWith("NEXT_REDIRECT")
        ) {
          console.log(
            `[BlogPostPage] Re-throwing NEXT_REDIRECT error to allow redirect to proceed`,
          );
          throw error;
        }
      }

      console.error(`[BlogPostPage] Error with React Query prefetch:`, error);
      // Fallback to legacy method
      console.log(`[BlogPostPage] Falling back to legacy getBlogPost method`);
      try {
        preloadBlogPost(slug);
        post = await getBlogPost(slug);
        if (!post) {
          notFound();
        }
      } catch (legacyError) {
        console.error(`[BlogPostPage] Legacy method also failed:`, legacyError);
        notFound();
      }
    }

    console.log(`[BlogPostPage] Successfully fetched post: "${post.title}"`);

    // Helper function to calculate engagement score
    function calculateEngagementScore(
      likes_count: number,
      views_count: number,
    ): number {
      // Score = (Likes × 3) + (Views × 0.1)
      return likes_count * 3 + views_count * 0.1;
    }

    // Helper function to calculate tag similarity score
    function calculateTagSimilarity(
      currentTags: string[],
      postTags: string[],
    ): number {
      if (
        !currentTags ||
        !postTags ||
        currentTags.length === 0 ||
        postTags.length === 0
      ) {
        return 0;
      }

      const currentTagsSet = new Set(
        currentTags.map((tag) => tag.toLowerCase()),
      );
      const postTagsSet = new Set(postTags.map((tag) => tag.toLowerCase()));

      // Calculate intersection
      const intersection = new Set(
        [...currentTagsSet].filter((tag) => postTagsSet.has(tag)),
      );

      // Calculate Jaccard similarity: intersection / union
      const union = new Set([...currentTagsSet, ...postTagsSet]);
      return intersection.size / union.size;
    }

    // Enhanced scoring function that combines engagement and tag similarity
    function calculateRecommendationScore(
      likes_count: number,
      views_count: number,
      currentTags: string[],
      postTags: string[],
    ): number {
      const engagementScore = calculateEngagementScore(
        likes_count,
        views_count,
      );
      const tagSimilarity = calculateTagSimilarity(currentTags, postTags);

      // Weight: 70% engagement, 30% tag similarity (with bonus for tag matches)
      const tagBonus = tagSimilarity > 0 ? tagSimilarity * 50 : 0; // Bonus points for tag matches
      return engagementScore + tagBonus;
    }

    // Helper function to enrich posts with engagement metrics and scores
    async function enrichPostsWithEngagement(
      posts: any[],
      supabase: any,
      currentPostTags: string[] = [],
    ): Promise<any[]> {
      if (!posts || posts.length === 0) {
        return [];
      }

      try {
        // Get blog post IDs
        const postIds = posts.map((post) => post.id).filter(Boolean);

        if (postIds.length === 0) {
          return posts.map((post) => ({
            ...post,
            likes_count: 0,
            comments_count: 0,
            views_count: 0,
            engagement_score: 0,
          }));
        }

        // Fetch engagement data from blog_engagement table
        const engagementData = await getBlogPostsEngagementClient(
          supabase,
          postIds,
        );

        // Fetch real comments count from comments table
        const commentsCountPromises = postIds.map((postId) =>
          getCommentCount(supabase, postId),
        );
        const commentsCounts = await Promise.all(commentsCountPromises);
        const commentsCountMap = postIds.reduce(
          (acc, postId, index) => {
            acc[postId] = commentsCounts[index] || 0;
            return acc;
          },
          {} as Record<string, number>,
        );

        // Merge engagement data with posts and calculate scores
        return posts.map((post) => {
          const engagement = engagementData[post.id];
          const realCommentsCount = commentsCountMap[post.id] || 0;
          const likes_count = engagement?.likes_count || 0;
          const views_count = engagement?.views_count || 0;

          return {
            ...post,
            likes_count,
            comments_count: realCommentsCount, // Use real comments count
            views_count,
            engagement_score: calculateRecommendationScore(
              likes_count,
              views_count,
              currentPostTags,
              post.recommendation_tags || [],
            ),
          };
        });
      } catch (error) {
        console.error(
          "[BlogPostPage] Error fetching engagement data for related posts:",
          error,
        );
        // Return posts with default engagement values on error
        return posts.map((post) => ({
          ...post,
          likes_count: 0,
          comments_count: 0,
          views_count: 0,
          engagement_score: 0,
        }));
      }
    }

    // Initialize related posts arrays for two rows
    let firstRowPosts: any[] = []; // Category-based posts (up to 3)
    let secondRowPosts: any[] = []; // Score-based posts from other categories (up to 3)

    // Try to fetch related posts, but don't fail the whole page if this fails
    try {
      console.log(
        `[BlogPostPage] Fetching related posts for category: ${post.category} with scoring system`,
      );

      // Create a Supabase client with service role for related posts
      const relatedPostsSupabase = createServiceRoleClient();

      // Fetch posts from the same category (up to 10 for better selection)
      const { data: sameCategoryPosts, error: categoryError } =
        await relatedPostsSupabase
          .from("blog_posts")
          .select("*")
          .eq("draft", false)
          .eq("category", post.category)
          .neq("slug", post.slug)
          .order("date", { ascending: false })
          .limit(10);

      if (categoryError) {
        console.error(
          `[BlogPostPage] Error fetching same category posts:`,
          categoryError,
        );
      }

      // Fetch posts from other categories (up to 10 for better selection)
      const { data: otherCategoryPosts, error: otherError } =
        await relatedPostsSupabase
          .from("blog_posts")
          .select("*")
          .eq("draft", false)
          .neq("category", post.category)
          .neq("slug", post.slug)
          .order("date", { ascending: false })
          .limit(10);

      if (otherError) {
        console.error(
          `[BlogPostPage] Error fetching other category posts:`,
          otherError,
        );
      }

      // Process same category posts
      if (sameCategoryPosts && sameCategoryPosts.length > 0) {
        const sameCategoryWithCoverImage = sameCategoryPosts.map((p: any) => ({
          ...p,
          coverImage: p.cover_image || "/default-blog-image.jpg",
        }));

        // Enrich with engagement metrics and scores
        const enrichedSameCategoryPosts = await enrichPostsWithEngagement(
          sameCategoryWithCoverImage,
          relatedPostsSupabase,
          post.recommendation_tags || [],
        );

        // Sort by engagement score (highest first)
        const sortedSameCategoryPosts = enrichedSameCategoryPosts.sort(
          (a, b) => b.engagement_score - a.engagement_score,
        );

        // Take top 3 for first row
        firstRowPosts = sortedSameCategoryPosts.slice(0, 3);

        console.log(
          `[BlogPostPage] Found ${firstRowPosts.length} same-category posts for first row (sorted by score)`,
        );
      }

      // Process other category posts for second row
      if (otherCategoryPosts && otherCategoryPosts.length > 0) {
        const otherCategoryWithCoverImage = otherCategoryPosts.map(
          (p: any) => ({
            ...p,
            coverImage: p.cover_image || "/default-blog-image.jpg",
          }),
        );

        // Enrich with engagement metrics and scores
        const enrichedOtherCategoryPosts = await enrichPostsWithEngagement(
          otherCategoryWithCoverImage,
          relatedPostsSupabase,
          post.recommendation_tags || [],
        );

        // Sort by engagement score (highest first)
        const sortedOtherCategoryPosts = enrichedOtherCategoryPosts.sort(
          (a, b) => b.engagement_score - a.engagement_score,
        );

        // Take top 3 for second row
        secondRowPosts = sortedOtherCategoryPosts.slice(0, 3);

        console.log(
          `[BlogPostPage] Found ${secondRowPosts.length} other-category posts for second row (sorted by score)`,
        );
      }

      // If we don't have enough posts in the first row, fill with top-scored posts from other categories
      if (firstRowPosts.length < 3 && secondRowPosts.length > 0) {
        const neededPosts = 3 - firstRowPosts.length;
        const additionalPosts = secondRowPosts.slice(0, neededPosts);
        firstRowPosts = [...firstRowPosts, ...additionalPosts];

        // Remove the used posts from second row
        secondRowPosts = secondRowPosts.slice(neededPosts);

        console.log(
          `[BlogPostPage] Filled first row with ${additionalPosts.length} top-scored posts from other categories`,
        );
      }

      console.log(
        `[BlogPostPage] Final result: ${firstRowPosts.length} posts in first row, ${secondRowPosts.length} posts in second row`,
      );
    } catch (relatedError) {
      console.error(
        `[BlogPostPage] Error fetching related posts:`,
        relatedError,
      );
      // Continue with empty related posts rather than failing the whole page
    }

    // Format data correctly for the client component

    // Log the cover image values for debugging
    console.log(`[BlogPostPage] Cover image values for post "${post.title}":`, {
      cover_image: post.cover_image,
      cover_image_url_processed: (post as any).cover_image_url_processed,
    });

    // Pass the prefetched data to the client component with React Query hydration
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <section className="w-full">
          <MDXProviderWrapper>
            {/* Use the new SingleBlogPostViewWithHelpers component with Supabase Cache Helpers */}
            <SingleBlogPostViewWithHelpers
              slug={slug}
              isPremium={!!post.premium}
              currentPostSlug={post.slug}
              category={post.category}
              relatedPosts={[...firstRowPosts, ...secondRowPosts]} // Pass combined posts for backward compatibility
            />

            {/* Comments Section - positioned after main content */}
            <div
              className="py-8 bg-transparent relative comments-section"
              style={{ zIndex: 10, position: "relative" }}
            >
              <div className="w-full mx-auto px-4 md:px-6">
                <div className="comments-container relative">
                  <CommentSectionServer
                    blogPostId={post.id || `id-${Date.now()}`}
                    blogPostSlug={post.slug}
                  />
                </div>
              </div>
            </div>

            {/* Related Articles Section - positioned after comments - Always show */}
            <RelatedArticlesSection
              firstRowPosts={firstRowPosts}
              secondRowPosts={secondRowPosts}
              currentPostCategory={post.category}
            />
          </MDXProviderWrapper>
        </section>
      </HydrationBoundary>
    );
  } catch (error) {
    console.error(`[BlogPostPage] Unhandled error:`, error);
    notFound();
  }
}
