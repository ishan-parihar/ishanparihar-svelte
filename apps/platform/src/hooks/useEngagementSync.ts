"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { blogQueryKeys } from "@/queries/blogQueries";

// Global refs to prevent multiple simultaneous invalidations
let lastInvalidationTime = 0;
let lastInvalidatedPathname = "";
const INVALIDATION_DEBOUNCE = 500; // 500ms debounce

/**
 * Hook to ensure engagement metrics stay synchronized across navigation
 * This addresses the issue where engagement updates don't immediately reflect
 * when navigating between blog listing and individual post pages
 */
export function useEngagementSync() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Listen for custom engagement update events
    const handleEngagementUpdate = (event: CustomEvent) => {
      const { slug, likes_count, comments_count, views_count } = event.detail;

      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔄 [EngagementSync] Received engagement update event:",
          event.detail,
        );
      }

      // Update all blog listing queries
      const blogListingQueries = [
        blogQueryKeys.publicPosts(),
        blogQueryKeys.featuredPosts(),
      ];

      blogListingQueries.forEach((queryKey) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;

          return oldData.map((post: any) => {
            if (post.slug === slug) {
              return {
                ...post,
                likes_count: likes_count ?? post.likes_count,
                comments_count: comments_count ?? post.comments_count,
                views_count: views_count ?? post.views_count,
              };
            }
            return post;
          });
        });
      });

      // Update individual post query
      queryClient.setQueryData(blogQueryKeys.post(slug), (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          likes_count: likes_count ?? oldData.likes_count,
          comments_count: comments_count ?? oldData.comments_count,
          views_count: views_count ?? oldData.views_count,
        };
      });

      // Update engagement query
      queryClient.setQueryData(
        blogQueryKeys.engagement(slug),
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            blog_engagement: [
              {
                ...oldData.blog_engagement?.[0],
                likes_count:
                  likes_count ?? oldData.blog_engagement?.[0]?.likes_count,
                comments_count:
                  comments_count ??
                  oldData.blog_engagement?.[0]?.comments_count,
                views_count:
                  views_count ?? oldData.blog_engagement?.[0]?.views_count,
              },
            ],
          };
        },
      );
    };

    // Add event listener for engagement updates
    window.addEventListener(
      "engagement-updated",
      handleEngagementUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "engagement-updated",
        handleEngagementUpdate as EventListener,
      );
    };
  }, [queryClient]);

  useEffect(() => {
    // Refresh engagement data when navigating to blog pages
    if (pathname.startsWith("/blog")) {
      const now = Date.now();

      // Prevent multiple invalidations for the same pathname within debounce period
      if (
        pathname === lastInvalidatedPathname &&
        now - lastInvalidationTime < INVALIDATION_DEBOUNCE
      ) {
        return;
      }

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Small delay to ensure page has loaded and debounce multiple calls
      timerRef.current = setTimeout(() => {
        const currentTime = Date.now();

        // Double-check to prevent race conditions
        if (
          pathname === lastInvalidatedPathname &&
          currentTime - lastInvalidationTime < INVALIDATION_DEBOUNCE
        ) {
          return;
        }

        // Update global tracking
        lastInvalidatedPathname = pathname;
        lastInvalidationTime = currentTime;

        // Invalidate all blog queries to ensure fresh data
        queryClient.invalidateQueries({
          queryKey: blogQueryKeys.all,
        });

        if (process.env.NODE_ENV === "development") {
          console.log(
            "🔄 [EngagementSync] Refreshed blog queries on navigation to:",
            pathname,
          );
        }
      }, 100);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [pathname, queryClient]);

  return {
    // Utility function to manually trigger engagement sync
    syncEngagement: (
      slug: string,
      updates: {
        likes_count?: number;
        comments_count?: number;
        views_count?: number;
      },
    ) => {
      window.dispatchEvent(
        new CustomEvent("engagement-updated", {
          detail: { slug, ...updates, timestamp: Date.now() },
        }),
      );
    },
  };
}

/**
 * Hook to ensure stale data is refreshed when returning to blog listings
 * This is particularly useful when users navigate back from individual posts
 */
export function useBlogListingRefresh() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const lastRefreshPathRef = useRef<string>("");

  useEffect(() => {
    // If we're on a blog listing page, check if we have stale engagement data
    if (pathname === "/blog" || pathname.startsWith("/blog/category/")) {
      // Prevent multiple refreshes for the same pathname
      if (lastRefreshPathRef.current === pathname) {
        return;
      }

      const now = Date.now();
      const staleThreshold = 30 * 1000; // 30 seconds

      // Check if any blog listing queries are stale
      const publicPostsQuery = queryClient.getQueryState(
        blogQueryKeys.publicPosts(),
      );
      const featuredPostsQuery = queryClient.getQueryState(
        blogQueryKeys.featuredPosts(),
      );

      const isStale = (query: any) => {
        if (!query) return true;
        return now - query.dataUpdatedAt > staleThreshold;
      };

      if (isStale(publicPostsQuery) || isStale(featuredPostsQuery)) {
        // Prevent duplicate invalidations by checking global state
        const timeSinceLastInvalidation = now - lastInvalidationTime;
        if (timeSinceLastInvalidation < INVALIDATION_DEBOUNCE) {
          return;
        }

        // Update tracking
        lastRefreshPathRef.current = pathname;
        lastInvalidationTime = now;

        // Invalidate stale queries to trigger refetch
        queryClient.invalidateQueries({
          queryKey: blogQueryKeys.publicPosts(),
        });
        queryClient.invalidateQueries({
          queryKey: blogQueryKeys.featuredPosts(),
        });

        if (process.env.NODE_ENV === "development") {
          console.log(
            "🔄 [BlogListingRefresh] Refreshed stale blog listing data",
          );
        }
      }
    } else {
      // Reset when leaving blog pages
      lastRefreshPathRef.current = "";
    }
  }, [pathname, queryClient]);
}

/**
 * Combined hook that provides comprehensive engagement synchronization
 * Use this in your main layout or blog components
 */
export function useComprehensiveEngagementSync() {
  const engagementSync = useEngagementSync();
  useBlogListingRefresh();

  return engagementSync;
}
