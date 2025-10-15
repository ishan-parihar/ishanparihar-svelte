"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { getBlogCategories, blogQueryKeys } from "@/queries/blogQueries";
import { api } from "@/lib/trpc-client";
import Link from "next/link";
import Image from "next/image";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  userQueryKeys,
  getUserFollowedTopics,
  updateFollowedTopics,
} from "@/queries/userQueries";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";
import dynamic from "next/dynamic";

// Dynamic import for MagicBento component with lazy loading
const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-muted rounded-xl" />,
});

// Define BlogPost interface
interface BlogPost {
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
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
}

interface BlogSidebarProps {
  featuredPosts?: BlogPost[];
}

export function BlogSidebar({ featuredPosts = [] }: BlogSidebarProps) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const userEmail = session?.user?.email;
  const userId = session?.user?.id;
  const [showAllTopics, setShowAllTopics] = useState(false);

  // Use tRPC for categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    api.blog.getCategories.useQuery(undefined, {
      staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
      gcTime: 30 * 60 * 1000, // 30 minutes
    });

  // Transform the categories data
  const categories = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) {
      return ["Personal Growth"]; // Fallback
    }

    // categoriesData is now an array of strings from the API
    const uniqueCategories = [
      ...new Set(
        categoriesData
          .filter(Boolean)
          .filter((cat) => cat !== "All Categories"),
      ),
    ];

    return uniqueCategories.length > 0 ? uniqueCategories : ["Personal Growth"];
  }, [categoriesData]);

  // Use React Query with API route for followed topics (more reliable than Supabase Cache Helpers)
  const {
    data: followedTopicsData,
    isLoading: followedTopicsLoading,
    error: followedTopicsError,
    refetch: refetchFollowedTopics,
  } = useQuery({
    queryKey: userQueryKeys.followedTopics(userEmail),
    queryFn: getUserFollowedTopics,
    enabled: status === "authenticated" && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const followedTopics = followedTopicsData?.followed_topics || [];

  // tRPC mutation for toggling followed topics
  const toggleTopicMutation = api.user.toggleFollowedTopic.useMutation({
    onSuccess: () => {
      // Invalidate and refetch the followed topics data
      refetchFollowedTopics();
    },
    onError: (error) => {
      console.error("Failed to toggle topic:", error);
    },
  });

  // Helper function to get blog cover image URL with simple URL pattern fixing
  const getBlogImage = (post: BlogPost | null): string => {
    if (!post) return "/default-blog-image.jpg";

    // Prioritize cover_image first as it's the format stored in Supabase,
    // then fallback to coverImage if it exists, otherwise use default
    let imageUrl =
      post.cover_image || post.coverImage || "/default-blog-image.jpg";

    // Validate URL before returning
    try {
      // Check if it's already a valid URL or a relative path
      if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
        // FALLBACK FIX: Fix problematic URL patterns directly in the component
        // This is only a fallback in case the server-side fix in getImagePublicUrl didn't catch all cases
        if (imageUrl.includes("/blog-images/blog/public/")) {
          const fixedUrl = imageUrl.replace(
            "/blog-images/blog/public/",
            "/blog-images/public/",
          );
          imageUrl = fixedUrl;
        } else if (imageUrl.includes("/blog-images/blog/")) {
          const fixedUrl = imageUrl.replace(
            "/blog-images/blog/",
            "/blog-images/",
          );
          imageUrl = fixedUrl;
        }
        return imageUrl;
      } else {
        // If it's not a valid URL or relative path, use default image
        return "/default-blog-image.jpg";
      }
    } catch (error) {
      console.error(`Error processing image URL: "${imageUrl}"`, error);
      return "/default-blog-image.jpg";
    }
  };

  // Toggle following a topic
  const toggleFollowTopic = async (topic: string) => {
    if (!session) {
      // Open the auth modal instead of redirecting
      console.log("Opening auth modal for following topic:", topic);
      openAuthModal("signIn", pathname || "");
      return;
    }

    if (!userId) {
      console.error("User ID not available");
      return;
    }

    try {
      // Check if already following
      const isFollowing = followedTopics.includes(topic);
      const action = isFollowing ? "remove" : "add";

      // Use tRPC mutation instead of direct API call
      const result = await toggleTopicMutation.mutateAsync({
        topic: topic,
        action: action,
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`Successfully ${action}ed topic: ${topic}`, result);
      }

      // Invalidate and refetch the followed topics data to update the UI
      await refetchFollowedTopics();

      // Also invalidate the legacy query keys for backward compatibility
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.followedTopics(userEmail),
      });
    } catch (error) {
      console.error("Error updating followed topics:", error);
    }
  };

  // Limit featured posts to 3 for better space management
  const limitedFeaturedPosts = featuredPosts.slice(0, 3);

  // Determine which topics to show based on showAllTopics state
  const topicsToShow = showAllTopics ? categories : categories.slice(0, 6);
  const hasMoreTopics = categories.length > 6;

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Featured Posts Section - Limited to 3 */}
      {limitedFeaturedPosts.length > 0 && (
        <MagicBento
          cards={[
            {
              id: "featured-posts",
              content: (
                <div className="overflow-hidden w-full">
                  <div className="pb-2 p-4">
                    <h3 className="text-lg font-heading font-bold text-neutral-900 dark:text-white">
                      Featured Posts
                    </h3>
                  </div>
                  <div className="p-0">
                    <div className="space-y-0">
                      {limitedFeaturedPosts.map((post, index) => (
                        <LinkLoadingWrapper
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          showIndicator={true}
                          className="group block"
                        >
                          <article className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors duration-200 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0">
                            {/* Content - Text only layout */}
                            <div className="w-full">
                              <div className="flex items-start gap-2 mb-2">
                                <h4 className="font-heading font-semibold text-sm line-clamp-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200 text-neutral-900 dark:text-white flex-1">
                                  {post.title}
                                </h4>
                                {post.premium && (
                                  <Badge
                                    variant="default"
                                    className="font-ui font-medium text-xs px-1.5 py-0.5 flex-shrink-0 flex items-center gap-1"
                                  >
                                    <Star className="w-3 h-3" />
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs line-clamp-2 text-neutral-600 dark:text-neutral-400 mb-2">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 truncate">
                                  {post.category}
                                </span>
                                {post.content_type === "research_paper" && (
                                  <span className="px-2 py-1 text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                                    RESEARCH
                                  </span>
                                )}
                                <span className="text-neutral-500 dark:text-neutral-500">
                                  ·
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-500">
                                  {formatDistanceToNow(new Date(post.date), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            </div>
                          </article>
                        </LinkLoadingWrapper>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
          className="w-full"
        />
      )}

      {/* Topics to Follow - Enhanced Condensed Layout */}
      <MagicBento
        cards={[
          {
            id: "topics-to-follow",
            content: (
              <div className="overflow-hidden w-full">
                <div className="pb-2 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Topics to Follow
                    </h3>
                    {status === "authenticated" && (
                      <LinkLoadingWrapper
                        href="/account/topics"
                        showIndicator={true}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </LinkLoadingWrapper>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  {categoriesLoading || followedTopicsLoading ? (
                    <div className="w-full text-center py-4 text-neutral-700 dark:text-neutral-300">
                      Loading...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Compact grid layout for topics */}
                      <div className="grid grid-cols-1 gap-2">
                        {topicsToShow.map((category, index) => {
                          const categoryStr = String(category);
                          const isFollowing =
                            followedTopics.includes(categoryStr);
                          return (
                            <div
                              key={`${categoryStr}-${index}`}
                              className="flex items-center justify-between py-1.5 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 rounded transition-colors"
                            >
                              <span className="text-sm font-ui font-medium text-neutral-900 dark:text-white sidebar-topic flex-1 truncate pr-2">
                                {categoryStr}
                              </span>
                              <Button
                                variant={isFollowing ? "default" : "outline"}
                                size="sm"
                                className={`text-xs px-2 py-1 h-7 min-w-[60px] ${
                                  isFollowing
                                    ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-none"
                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 rounded-none"
                                }`}
                                onClick={() => toggleFollowTopic(categoryStr)}
                              >
                                {isFollowing ? "Following" : "Follow"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Show More/Less button */}
                      {hasMoreTopics && (
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs"
                            onClick={() => setShowAllTopics(!showAllTopics)}
                          >
                            {showAllTopics ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Show More ({categories.length - 6} more)
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ),
          },
        ]}
        className="w-full"
      />
    </div>
  );
}

export default BlogSidebar;
