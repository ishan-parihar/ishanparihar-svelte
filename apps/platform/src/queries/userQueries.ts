import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/utils/supabase";
import {
  useQuery as useSupabaseQuery,
  prefetchQuery as supabasePrefetchQuery,
  useUpdateMutation,
} from "@supabase-cache-helpers/postgrest-react-query";

// Re-export prefetchQuery for convenience
export { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";

// User Query Keys Factory
export const userQueryKeys = {
  all: ["user"] as const,

  // Premium status queries
  premiumStatus: (userEmail?: string) =>
    [...userQueryKeys.all, "premiumStatus", userEmail] as const,

  // Followed topics queries
  followedTopics: (userEmail?: string | null) =>
    [...userQueryKeys.all, "followedTopics", userEmail] as const,

  // Newsletter status queries
  newsletterStatus: (userId?: string | null) =>
    [...userQueryKeys.all, "newsletterStatus", userId] as const,
} as const;

// Types for user data - Updated for direct Supabase queries
export interface UserPremiumData {
  id: string;
  email: string;
  has_active_membership: boolean | null;
  role: string | null;
}

export interface UserFollowedTopicsData {
  id: string;
  email: string;
  followed_topics: string[] | null;
}

export interface UserNewsletterData {
  id: string;
  email: string;
  newsletter_subscribed: boolean | null;
  manually_unsubscribed: boolean | null;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
}

// Legacy types for backward compatibility with API responses
export interface UserPremiumStatus {
  success: boolean;
  hasPremium: boolean;
  user?: {
    email: string;
    has_active_membership: boolean;
    role: string;
  };
  error?: string;
}

export interface UserFollowedTopics {
  followed_topics: string[];
}

export interface UserNewsletterStatus {
  newsletter_subscribed: boolean;
  manually_unsubscribed: boolean;
  subscribed_at?: string;
  unsubscribed_at?: string;
}

// Note: These functions are deprecated in favor of tRPC procedures
// Use api.user.getPremiumStatus.useQuery() instead of getUserPremiumStatus()
// Use api.user.getFollowedTopics.useQuery() instead of getUserFollowedTopics()
// Use api.user.updateFollowedTopics.useMutation() instead of updateFollowedTopics()
// Use api.user.updateNewsletterStatus.useMutation() instead of updateUserNewsletterStatus()

// Legacy query functions - DEPRECATED - Use tRPC instead
// These functions are kept for backward compatibility but should not be used in new code
export async function getUserPremiumStatus(): Promise<UserPremiumStatus> {
  console.warn(
    "getUserPremiumStatus is deprecated. Use api.user.getPremiumStatus.useQuery() instead",
  );
  throw new Error(
    "This function has been deprecated. Please use api.user.getPremiumStatus.useQuery() instead",
  );
}

export async function getUserFollowedTopics(): Promise<UserFollowedTopics> {
  console.warn(
    "getUserFollowedTopics is deprecated. Use api.user.getFollowedTopics.useQuery() instead",
  );
  throw new Error(
    "This function has been deprecated. Please use api.user.getFollowedTopics.useQuery() instead",
  );
}

/**
 * @deprecated Use api.user.getNewsletterStatus.useQuery() directly instead
 */
export async function getUserNewsletterStatus(): Promise<{
  success: boolean;
  subscribed: boolean;
  user: UserNewsletterStatus;
}> {
  // Legacy implementation - use tRPC directly in components instead
  throw new Error(
    "This function is deprecated. Use api.user.getNewsletterStatus.useQuery() directly.",
  );
}

// Mutation functions for user data updates
/**
 * @deprecated Use api.user.updateFollowedTopics.useMutation() directly instead
 */
export async function updateFollowedTopics(
  topic: string,
  action: "add" | "remove",
): Promise<void> {
  // Legacy implementation - use tRPC directly in components instead
  throw new Error(
    "This function is deprecated. Use api.user.updateFollowedTopics.useMutation() directly.",
  );
}

// ============================================================================
// SUPABASE CACHE HELPERS - SHARED QUERY BUILDERS
// ============================================================================

/**
 * Shared query builder for user premium status
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 * Requires authenticated user - uses RLS to ensure user can only access their own data
 */
export function buildUserPremiumStatusQuery(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  return supabase
    .from("users")
    .select("id, email, has_active_membership, role")
    .eq("id", userId)
    .single();
}

/**
 * Shared query builder for user followed topics
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 * Requires authenticated user - uses RLS to ensure user can only access their own data
 */
export function buildUserFollowedTopicsQuery(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  return supabase
    .from("users")
    .select("id, email, followed_topics")
    .eq("id", userId)
    .single();
}

/**
 * Shared query builder for user newsletter status
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 * Requires authenticated user - uses RLS to ensure user can only access their own data
 */
export function buildUserNewsletterStatusQuery(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  return supabase
    .from("users")
    .select(
      "id, email, newsletter_subscribed, manually_unsubscribed, subscribed_at, unsubscribed_at",
    )
    .eq("id", userId)
    .single();
}

// ============================================================================
// SUPABASE CACHE HELPERS - OPTIMIZED QUERY HOOKS
// ============================================================================

/**
 * Hook for fetching user premium status using Supabase Cache Helpers
 * This replaces the manual useQuery + getUserPremiumStatus pattern
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 */
export function useUserPremiumStatusWithHelpers(
  supabase: SupabaseClient<Database>,
  userId: string,
  enabled: boolean = true,
) {
  return useSupabaseQuery(buildUserPremiumStatusQuery(supabase, userId), {
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - premium status doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch premium status on focus
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (authentication issues)
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as any).status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching user followed topics using Supabase Cache Helpers
 * This replaces the manual useQuery + getUserFollowedTopics pattern
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 */
export function useUserFollowedTopicsWithHelpers(
  supabase: SupabaseClient<Database>,
  userId: string,
  enabled: boolean = true,
) {
  return useSupabaseQuery(buildUserFollowedTopicsQuery(supabase, userId), {
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - followed topics might change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for better UX
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (authentication issues)
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as any).status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching user newsletter status using Supabase Cache Helpers
 * This replaces the manual useQuery + getUserNewsletterStatus pattern
 * Benefits: Automatic query key management, enhanced type safety, optimized caching
 */
export function useUserNewsletterStatusWithHelpers(
  supabase: SupabaseClient<Database>,
  userId: string,
  enabled: boolean = true,
) {
  return useSupabaseQuery(buildUserNewsletterStatusQuery(supabase, userId), {
    enabled: enabled && !!userId,
    staleTime: 30 * 1000, // 30 seconds - newsletter status might change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for better UX
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (authentication issues)
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as any).status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

// ============================================================================
// UTILITY FUNCTIONS FOR DATA TRANSFORMATION
// ============================================================================

/**
 * Transforms direct Supabase user premium data to legacy API format
 * Used for backward compatibility when migrating from API routes to direct queries
 */
export function transformUserPremiumData(
  userData: UserPremiumData | null,
): UserPremiumStatus {
  if (!userData) {
    return {
      success: false,
      hasPremium: false,
      error: "User not found",
    };
  }

  // User has premium if they have active membership OR are an admin
  const hasPremium =
    userData.has_active_membership === true || userData.role === "admin";

  return {
    success: true,
    hasPremium,
    user: {
      email: userData.email,
      has_active_membership: userData.has_active_membership || false,
      role: userData.role || "user",
    },
  };
}

/**
 * Transforms direct Supabase user followed topics data to legacy API format
 * Used for backward compatibility when migrating from API routes to direct queries
 */
export function transformUserFollowedTopicsData(
  userData: UserFollowedTopicsData | null,
): UserFollowedTopics {
  return {
    followed_topics: userData?.followed_topics || [],
  };
}

/**
 * Transforms direct Supabase user newsletter data to legacy API format
 * Used for backward compatibility when migrating from API routes to direct queries
 */
export function transformUserNewsletterData(
  userData: UserNewsletterData | null,
): UserNewsletterStatus {
  if (!userData) {
    return {
      newsletter_subscribed: false,
      manually_unsubscribed: false,
    };
  }

  return {
    newsletter_subscribed: userData.newsletter_subscribed || false,
    manually_unsubscribed: userData.manually_unsubscribed || false,
    subscribed_at: userData.subscribed_at || undefined,
    unsubscribed_at: userData.unsubscribed_at || undefined,
  };
}

// ============================================================================
// SUPABASE CACHE HELPERS - MUTATION HOOKS
// ============================================================================

/**
 * Hook for updating user followed topics using Supabase Cache Helpers
 * This replaces the manual useMutation + updateFollowedTopics pattern
 * Benefits: Automatic cache updates, no manual invalidation needed, optimistic updates
 */
export function useUpdateUserFollowedTopicsMutation(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  return useUpdateMutation(
    supabase.from("users"),
    ["id"], // Primary key
    "id, email, followed_topics", // Return these columns for cache updates
    {
      onSuccess: () => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Successfully updated followed topics with automatic cache updates",
          );
        }
      },
      onError: (error) => {
        console.error("Error updating followed topics:", error);
      },
    },
  );
}

/**
 * Hook for updating user newsletter subscription status using Supabase Cache Helpers
 * This replaces the manual fetch() + API route pattern
 * Benefits: Automatic cache updates, no manual invalidation needed, optimistic updates
 */
export function useUpdateUserNewsletterSubscriptionMutation(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  return useUpdateMutation(
    supabase.from("users"),
    ["id"], // Primary key
    "id, email, newsletter_subscribed, manually_unsubscribed, subscribed_at, unsubscribed_at", // Return these columns for cache updates
    {
      onSuccess: () => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Successfully updated newsletter subscription with automatic cache updates",
          );
        }
      },
      onError: (error) => {
        console.error("Error updating newsletter subscription:", error);
      },
    },
  );
}

/**
 * Helper function to calculate newsletter subscription update data
 * Used with the mutation hook to toggle subscription status
 */
export function calculateNewsletterUpdateData(
  currentData: UserNewsletterData | null,
  newSubscriptionStatus: boolean,
): {
  newsletter_subscribed: boolean;
  manually_unsubscribed: boolean;
  subscribed_at?: string;
  unsubscribed_at?: string;
  updated_at: string;
} {
  const now = new Date().toISOString();

  const updateData: any = {
    newsletter_subscribed: newSubscriptionStatus,
    updated_at: now,
  };

  if (newSubscriptionStatus) {
    // Subscribing
    updateData.subscribed_at = now;
    updateData.manually_unsubscribed = false;
    // Clear unsubscribed_at when subscribing
    updateData.unsubscribed_at = null;
  } else {
    // Unsubscribing
    updateData.unsubscribed_at = now;
    updateData.manually_unsubscribed = true;
  }

  return updateData;
}

/**
 * Helper function to determine effective newsletter subscription status
 * A user is effectively subscribed if newsletter_subscribed is true AND manually_unsubscribed is false
 */
export function isEffectivelySubscribed(
  data: UserNewsletterData | null,
): boolean {
  if (!data) return false;
  return !!data.newsletter_subscribed && !data.manually_unsubscribed;
}

/**
 * Helper function to update followed topics array
 * Used with the mutation hook to add/remove topics
 */
export function updateFollowedTopicsArray(
  currentTopics: string[] | null,
  topic: string,
  action: "add" | "remove",
): string[] {
  const topics = currentTopics || [];

  if (action === "add" && !topics.includes(topic)) {
    return [...topics, topic];
  } else if (action === "remove") {
    return topics.filter((t) => t !== topic);
  }

  return topics;
}
