"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";

interface UseViewTrackingOptions {
  slug: string;
  enabled?: boolean;
  delay?: number; // Delay before tracking view (to avoid counting quick bounces)
}

/**
 * Hook to track blog post views
 * Automatically increments view count when a blog post page is loaded
 * Includes debouncing to avoid multiple increments for the same session
 */
export function useViewTracking({
  slug,
  enabled = true,
  delay = 2000, // 2 second delay by default
}: UseViewTrackingOptions) {
  const queryClient = useQueryClient();
  const hasTrackedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use tRPC mutation to increment view count
  const viewMutation = api.blog.incrementView.useMutation({
    onSuccess: (data) => {
      // Update all related queries with the new view count
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              queryKey.some(
                (key) => typeof key === "string" && key.includes(slug),
              )
            );
          },
        },
        (oldData: any) => {
          if (!oldData) return oldData;

          // Update engagement data if it exists
          if (oldData.blog_engagement) {
            return {
              ...oldData,
              blog_engagement: [
                {
                  ...oldData.blog_engagement[0],
                  views_count: data.views_count,
                },
              ],
            };
          }

          // Update direct engagement properties if they exist
          if ("views_count" in oldData) {
            return {
              ...oldData,
              views_count: data.views_count,
            };
          }

          return oldData;
        },
      );

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey.some(
              (key) =>
                typeof key === "string" &&
                (key.includes("blog_posts") || key.includes("blog_engagement")),
            )
          );
        },
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          `📊 [ViewTracking] View tracked for ${slug}, new count: ${data.views_count}`,
        );
      }
    },
    onError: (error) => {
      console.error("[ViewTracking] Error tracking view:", error);
    },
  });

  useEffect(() => {
    if (!enabled || !slug || hasTrackedRef.current || viewMutation.isPending) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a timeout to track the view after the specified delay
    timeoutRef.current = setTimeout(() => {
      if (!hasTrackedRef.current) {
        hasTrackedRef.current = true;
        viewMutation.mutate({ slug });
      }
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [slug, enabled, delay, viewMutation]);

  // Reset tracking when slug changes
  useEffect(() => {
    hasTrackedRef.current = false;
  }, [slug]);

  return {
    isTracking: viewMutation.isPending,
    error: viewMutation.error,
    hasTracked: hasTrackedRef.current,
  };
}
