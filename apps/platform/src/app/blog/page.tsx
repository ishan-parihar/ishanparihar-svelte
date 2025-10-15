// Enable Incremental Static Regeneration (ISR) with 30-minute revalidation
export const revalidate = 1800; // Revalidate every 30 minutes

import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { createAnonymousClient } from "@/utils/supabase/static";
import {
  getPublicBlogPosts,
  getFeaturedBlogPosts,
  getBlogCategories,
  blogQueryKeys,
  type PublicBlogPost,
} from "@/queries/blogQueries";
import { Metadata } from "next";
import "./blog-listing-sidebar.css";
import UnifiedBlogPageClient from "@/components/blog/UnifiedBlogPageClient";

export const metadata: Metadata = {
  title: "Blog | Ishan Parihar",
  description:
    "Explore insights on spirituality, consciousness, and personal growth.",
};

export default async function BlogPage() {
  const queryClient = new QueryClient();

  try {
    // Use anonymous client for static data fetching - no authentication required
    const supabase = createAnonymousClient();

    // Fetch all data in parallel using Promise.all for maximum efficiency
    const [postsData, categoriesData, featuredPostsData] = await Promise.all([
      getPublicBlogPosts(supabase), // Fetch posts
      getBlogCategories(supabase), // Fetch categories
      getFeaturedBlogPosts(supabase, 3), // Fetch featured posts for sidebar
    ]);

    // Populate the query client with the fetched data
    queryClient.setQueryData(blogQueryKeys.publicPosts(), postsData);
    queryClient.setQueryData(blogQueryKeys.categories(), categoriesData);
    queryClient.setQueryData(
      [...blogQueryKeys.featuredPosts(), 3],
      featuredPostsData,
    );
  } catch (error) {
    console.error("[BlogPage] Critical error during data fetching:", error);
    // We can render a fallback error UI here if needed
  }

  // Extract data from the query client for initial props
  const categoriesData = queryClient.getQueryData<string[]>(
    blogQueryKeys.categories(),
  );
  const categories = categoriesData ?? [];

  const publicPostsData = queryClient.getQueryData<PublicBlogPost[]>(
    blogQueryKeys.publicPosts(),
  );
  const featuredPostsData = queryClient.getQueryData<PublicBlogPost[]>([
    ...blogQueryKeys.featuredPosts(),
    3,
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnifiedBlogPageClient
        initialCategories={categories}
        initialPosts={publicPostsData || []}
        initialFeaturedPosts={featuredPostsData || []}
      />
    </HydrationBoundary>
  );
}
