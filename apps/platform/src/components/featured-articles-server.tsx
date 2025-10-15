"use client";

import { Suspense } from "react";
import { FeaturedArticlesSection } from "./featured-articles-section";
import { useFeaturedBlogPostsWithHelpers } from "@/queries/blogQueries";
import { createClient } from "@/utils/supabase/client";

interface FeaturedArticle {
  id?: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  cover_image?: string;
  date: string;
  category: string;
  slug: string;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
  premium?: boolean;
}

// Loading component for the featured articles section
function FeaturedArticlesLoading() {
  return <FeaturedArticlesSection featuredPosts={[]} isLoading={true} />;
}

// Error component for the featured articles section
function FeaturedArticlesError({ error }: { error: string }) {
  return <FeaturedArticlesSection featuredPosts={[]} error={error} />;
}

// Client component that fetches featured articles using React Query
function FeaturedArticlesContent() {
  const supabase = createClient();

  // Use React Query hook to fetch featured posts with engagement data (limit to 3 for home page)
  const {
    data: featuredPosts,
    isLoading,
    error,
  } = useFeaturedBlogPostsWithHelpers(supabase, 3);

  if (error) {
    console.error(
      "[FeaturedArticlesClient] Error fetching featured articles:",
      error,
    );
    return <FeaturedArticlesError error="Failed to load featured articles" />;
  }

  if (isLoading) {
    return <FeaturedArticlesLoading />;
  }

  // Transform the data to match our component interface
  const transformedPosts: FeaturedArticle[] = (featuredPosts || []).map(
    (post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.cover_image,
      date: post.date,
      category: post.category,
      slug: post.slug,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      views_count: post.views_count || 0,
      content_type: post.content_type || "blog",
      recommendation_tags: post.recommendation_tags || [],
      premium: post.premium || false,
    }),
  );

  return <FeaturedArticlesSection featuredPosts={transformedPosts} />;
}

// Main client component with Suspense boundary
export function FeaturedArticlesServer() {
  return (
    <Suspense fallback={<FeaturedArticlesLoading />}>
      <FeaturedArticlesContent />
    </Suspense>
  );
}
