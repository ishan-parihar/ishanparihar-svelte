import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/utils/supabase";
import { useQuery as useSupabaseQuery } from "@supabase-cache-helpers/postgrest-react-query";
import {
  useQuery as useReactQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { AppRouter } from "@/server/api/root";

// Admin Query Keys Factory
export const adminQueryKeys = {
  all: ["admin"] as const,

  // Newsletter queries
  newsletter: () => [...adminQueryKeys.all, "newsletter"] as const,
  subscribers: (activeOnly?: boolean) =>
    [...adminQueryKeys.newsletter(), "subscribers", { activeOnly }] as const,
  campaigns: () => [...adminQueryKeys.newsletter(), "campaigns"] as const,

  // Team queries
  team: () => [...adminQueryKeys.all, "team"] as const,
  adminUsers: () => [...adminQueryKeys.team(), "adminUsers"] as const,
  authors: () => [...adminQueryKeys.team(), "authors"] as const,

  // Comments queries
  comments: () => [...adminQueryKeys.all, "comments"] as const,
  allComments: () => [...adminQueryKeys.comments(), "all"] as const,

  // Blog queries
  blog: () => [...adminQueryKeys.all, "blog"] as const,
  adminBlogPosts: (params?: { includeDrafts?: boolean; category?: string }) =>
    [...adminQueryKeys.blog(), "posts", params] as const,
  adminBlogPost: (id: string) =>
    [...adminQueryKeys.blog(), "post", id] as const,
  adminBlogPostBySlug: (slug: string) =>
    [...adminQueryKeys.blog(), "postBySlug", slug] as const,

  // Accounts queries
  accounts: () => [...adminQueryKeys.all, "accounts"] as const,
  allSiteUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    [...adminQueryKeys.accounts(), "allUsers", params] as const,

  // Images queries
  images: () => [...adminQueryKeys.all, "images"] as const,
  allImages: (params?: { search?: string; tag?: string }) =>
    [...adminQueryKeys.images(), "all", params] as const,
} as const;

// Types for admin data
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribed_at: string;
  is_active: boolean;
  preferences?: any;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  status: "draft" | "scheduled" | "sent";
  created_at: string;
  sent_at?: string;
  recipient_count?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  permissions?: string[];
}

export interface Author {
  id: string;
  display_name: string;
  profile_picture_url: string | null;
  role: string;
  bio: string | null;
}

export interface AdminBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  date: string;
  author: string;
  author_user_id: string;
  category: string;
  featured: boolean;
  draft: boolean;
  premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSiteUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  newsletter_subscribed?: boolean;
  provider?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface AdminImage {
  id: string;
  url: string;
  alt_text: string;
  caption?: string;
  filename_original: string;
  width: number;
  height: number;
  tags?: string[];
  created_at: string;
}

// Newsletter Queries - MIGRATED TO tRPC
// This function is deprecated - use api.admin.getNewsletterSubscribers.useQuery() instead
export async function getNewsletterSubscribers(
  activeOnly: boolean = false,
): Promise<NewsletterSubscriber[]> {
  console.warn(
    "[DEPRECATED] getNewsletterSubscribers: Use api.admin.getNewsletterSubscribers.useQuery() instead",
  );
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching newsletter subscribers...", {
        activeOnly,
      });
    }

    const response = await fetch(
      `/api/admin/newsletter/subscribers?activeOnly=${activeOnly}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch subscribers: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    throw error;
  }
}

export async function getNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching newsletter campaigns...");
    }

    const response = await fetch("/api/admin/newsletter/campaigns");

    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching newsletter campaigns:", error);
    throw error;
  }
}

// Team Queries - MIGRATED TO tRPC
// This function is deprecated - use api.admin.getUsers.useQuery() with role filter instead
export async function getAdminTeamUsers(): Promise<AdminUser[]> {
  console.warn(
    '[DEPRECATED] getAdminTeamUsers: Use api.admin.getUsers.useQuery({ role: "admin" }) instead',
  );
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching admin team users...");
    }

    const response = await fetch("/api/admin/team");

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // Validate the response data
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format");
    }

    return data;
  } catch (error) {
    console.error("Error fetching admin team users:", error);
    throw error;
  }
}

export async function getAdminAuthors(): Promise<Author[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching admin authors...");
    }

    const response = await fetch("/api/admin/authors");

    if (!response.ok) {
      throw new Error(`Failed to fetch admin authors: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.authors)) {
      throw new Error("Invalid response format from admin authors API");
    }

    if (DEBUG_MODE) {
      console.log(
        `[AdminQueries] Successfully fetched ${data.authors.length} admin authors`,
      );
    }

    return data.authors;
  } catch (error) {
    console.error("[AdminQueries] Error fetching admin authors:", error);
    throw error;
  }
}

// Comments Queries
export async function getAllComments(): Promise<any[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching all comments via tRPC...");
    }

    // Create a vanilla client for server-side usage
    const { createTRPCProxyClient, httpBatchLink } = await import(
      "@trpc/client"
    );
    const { default: superjson } = await import("superjson");

    const trpcClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/trpc`,
          transformer: superjson,
        }),
      ],
    });

    const result = await trpcClient.blog.getAllComments.query({
      page: 1,
      limit: 1000, // Get all comments for admin
      sortBy: "created_at",
      sortOrder: "desc",
      status: "all",
    });

    return result.comments || [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

// ============================================================================
// CLIENT-SIDE ADMIN QUERIES (for Client Components and API routes)
// ============================================================================

// Blog Queries
export async function getAdminBlogPosts(params?: {
  includeDrafts?: boolean;
  category?: string;
}): Promise<AdminBlogPost[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log(
        "[AdminQueries] Fetching admin blog posts via tRPC...",
        params,
      );
    }

    const searchParams = new URLSearchParams();
    if (params?.includeDrafts !== undefined) {
      searchParams.set("includeDrafts", params.includeDrafts.toString());
    }
    if (params?.category) {
      searchParams.set("category", params.category);
    }

    // Create a vanilla client for server-side usage
    const { createTRPCProxyClient, httpBatchLink } = await import(
      "@trpc/client"
    );
    const { default: superjson } = await import("superjson");

    const trpcClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/trpc`,
          transformer: superjson,
        }),
      ],
    });

    const posts = await trpcClient.blog.getAdminPosts.query({
      includeDrafts: params?.includeDrafts ?? true,
      category: params?.category,
    });

    return posts as AdminBlogPost[];
  } catch (error) {
    console.error("Error fetching admin blog posts:", error);
    throw error;
  }
}

export async function getAdminBlogPostById(
  id: string,
): Promise<AdminBlogPost | null> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching admin blog post by ID...", id);
    }

    const response = await fetch(`/api/admin/blog/posts/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch admin blog post: ${response.status}`);
    }

    const data = await response.json();
    return data.post || null;
  } catch (error) {
    console.error("Error fetching admin blog post by ID:", error);
    throw error;
  }
}

export async function getAdminBlogPostBySlug(
  slug: string,
): Promise<AdminBlogPost | null> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching admin blog post by slug...", slug);
    }

    // Create a vanilla client for server-side usage
    const { createTRPCProxyClient, httpBatchLink } = await import(
      "@trpc/client"
    );
    const { default: superjson } = await import("superjson");

    const trpcClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/trpc`,
          transformer: superjson,
        }),
      ],
    });

    const post = await trpcClient.blog.getAdminPost.query({
      slug,
      includeDrafts: true,
    });

    return post as AdminBlogPost;
  } catch (error) {
    console.error("Error fetching admin blog post by slug:", error);
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      error.message === "Blog post not found"
    ) {
      return null;
    }
    throw error;
  }
}

// Accounts Queries
export async function getAdminAllSiteUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AdminSiteUser[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching all site users via tRPC...", params);
    }

    // Create a vanilla client for server-side usage
    const { createTRPCProxyClient, httpBatchLink } = await import(
      "@trpc/client"
    );
    const { default: superjson } = await import("superjson");

    const trpcClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/trpc`,
          transformer: superjson,
        }),
      ],
    });

    const usersData = await trpcClient.admin.getUsers.query({
      page: params?.page || 1,
      limit: params?.limit || 100,
      search: params?.search,
    });

    // Transform the tRPC response to match the expected AdminSiteUser format
    return usersData.users.map(
      (user: any): AdminSiteUser => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
        picture: user.picture,
        provider: user.provider || "email",
        email_verified: user.email_verified || false,
        newsletter_subscribed: user.newsletter_subscribed || false,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }),
    );
  } catch (error) {
    console.error("Error fetching all site users:", error);
    throw error;
  }
}

// Images Queries
export async function getAdminImages(params?: {
  search?: string;
  tag?: string;
}): Promise<AdminImage[]> {
  try {
    const DEBUG_MODE =
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_DEBUG === "true";
    if (DEBUG_MODE) {
      console.log("[AdminQueries] Fetching admin images...", params);
    }

    const searchParams = new URLSearchParams();
    if (params?.search) {
      searchParams.set("search", params.search);
    }
    if (params?.tag) {
      searchParams.set("tag", params.tag);
    }

    const response = await fetch(
      `/api/image-manager/images?${searchParams.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch admin images: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.images || [] : [];
  } catch (error) {
    console.error("Error fetching admin images:", error);
    throw error;
  }
}

// ============================================================================
// SUPABASE CACHE HELPERS - ADMIN SHARED QUERY BUILDERS
// ============================================================================

/**
 * Shared query builder for admin blog posts
 * Uses service role client to bypass RLS and access all posts including drafts
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 */
export function buildAdminBlogPostsQuery(
  supabase: SupabaseClient<Database>,
  params?: { includeDrafts?: boolean; category?: string },
) {
  let query = supabase
    .from("blog_posts")
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      content,
      cover_image,
      date,
      author,
      author_user_id,
      category,
      featured,
      draft,
      premium,
      created_at,
      updated_at
    `,
    )
    .order("date", { ascending: false });

  // Apply filters based on parameters
  if (params?.category) {
    query = query.eq("category", params.category);
  }

  // If includeDrafts is false, only show published posts
  if (params?.includeDrafts === false) {
    query = query.eq("draft", false);
  }
  // If includeDrafts is true or undefined, show all posts (including drafts)

  return query;
}

/**
 * Shared query builder for single admin blog post by slug
 * Uses service role client to bypass RLS and access all posts including drafts
 * Can be used on both server (with prefetchQuery) and client (with useQuery)
 */
export function buildAdminBlogPostBySlugQuery(
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  return supabase
    .from("blog_posts")
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      content,
      cover_image,
      date,
      author,
      author_user_id,
      category,
      featured,
      draft,
      premium,
      created_at,
      updated_at
    `,
    )
    .eq("slug", slug)
    .maybeSingle();
}

// ============================================================================
// SUPABASE CACHE HELPERS - ADMIN OPTIMIZED QUERY HOOKS
// ============================================================================

/**
 * Hook for fetching admin blog posts using optimized caching
 * This replaces the manual useQuery + getAdminBlogPosts pattern
 * Benefits: Enhanced caching strategies, consistent query patterns
 *
 * Note: Uses existing API routes for security (service role operations stay on server)
 */
export function useAdminBlogPostsWithHelpers(params?: {
  includeDrafts?: boolean;
  category?: string;
}) {
  return useReactQuery({
    queryKey: adminQueryKeys.adminBlogPosts(params),
    queryFn: () => getAdminBlogPosts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (admin data changes more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when admin returns to tab
    retry: (failureCount, error) => {
      // Don't retry if it's a 401/403 (auth error)
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as any).message;
        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("Unauthorized")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching a single admin blog post by slug using optimized caching
 * This replaces the manual useQuery + getAdminBlogPostBySlug pattern
 * Benefits: Enhanced caching strategies, consistent query patterns
 *
 * Note: Uses existing API routes for security (service role operations stay on server)
 */
export function useAdminBlogPostBySlugWithHelpers(
  slug: string,
  enabled: boolean = true,
) {
  return useReactQuery({
    queryKey: adminQueryKeys.adminBlogPostBySlug(slug),
    queryFn: () => getAdminBlogPostBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes (admin editing data)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 401/403 (auth error) or 404 (not found)
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as any).message;
        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("404") ||
          message.includes("Unauthorized") ||
          message.includes("Not found")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching newsletter subscribers using optimized caching
 * This replaces the manual useQuery + getNewsletterSubscribers pattern
 * Benefits: Enhanced caching strategies, consistent query patterns
 *
 * Note: Uses existing API routes for security (service role operations stay on server)
 */
export function useAdminNewsletterSubscribersWithHelpers(params?: {
  activeOnly?: boolean;
}) {
  const activeOnly = params?.activeOnly ?? false;

  return useReactQuery({
    queryKey: adminQueryKeys.subscribers(activeOnly),
    queryFn: () => getNewsletterSubscribers(activeOnly),
    staleTime: 2 * 60 * 1000, // 2 minutes (admin data changes more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when admin returns to tab
    retry: (failureCount, error) => {
      // Don't retry if it's a 401/403 (auth error)
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as any).message;
        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("Unauthorized")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching newsletter campaigns using optimized caching
 * This replaces the manual useQuery + getNewsletterCampaigns pattern
 * Benefits: Enhanced caching strategies, consistent query patterns
 *
 * Note: Uses existing API routes for security (service role operations stay on server)
 */
export function useAdminNewsletterCampaignsWithHelpers() {
  return useReactQuery({
    queryKey: adminQueryKeys.campaigns(),
    queryFn: () => getNewsletterCampaigns(),
    staleTime: 2 * 60 * 1000, // 2 minutes (admin data changes more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when admin returns to tab
    retry: (failureCount, error) => {
      // Don't retry if it's a 401/403 (auth error)
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as any).message;
        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("Unauthorized")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching admin team users using optimized caching
 * This replaces the manual useQuery + getAdminTeamUsers pattern
 * Benefits: Enhanced caching strategies, consistent query patterns
 *
 * Note: Uses existing API routes for security (service role operations stay on server)
 */
export function useAdminTeamUsersWithHelpers() {
  return useReactQuery({
    queryKey: adminQueryKeys.adminUsers(),
    queryFn: () => getAdminTeamUsers(),
    staleTime: 2 * 60 * 1000, // 2 minutes (admin data changes more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when admin returns to tab
    retry: (failureCount, error) => {
      // Don't retry if it's a 401/403 (auth error)
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as any).message;
        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("Unauthorized")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching admin authors using optimized caching
 * This replaces the manual useQuery + getAdminAuthors pattern
 * Benefits: Enhanced caching strategies, consistent query patterns
 *
 * Note: Uses existing API routes for security (service role operations stay on server)
 */
export function useAdminAuthorsWithHelpers() {
  return useReactQuery({
    queryKey: adminQueryKeys.authors(),
    queryFn: () => getAdminAuthors(),
    staleTime: 5 * 60 * 1000, // 5 minutes (authors don't change frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Authors rarely change
    retry: (failureCount, error) => {
      // Don't retry if it's a 401/403 (auth error)
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as any).message;
        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("Unauthorized")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching all site users using optimized caching
 * This replaces the manual useQuery + getAdminAllSiteUsers pattern
 * Benefits: Enhanced caching strategies, consistent query patterns
 *
 * Note: Uses existing API routes for security (service role operations stay on server)
 */
export function useAdminAllSiteUsersWithHelpers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useReactQuery({
    queryKey: adminQueryKeys.allSiteUsers(params),
    queryFn: () => getAdminAllSiteUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (admin data changes more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when admin returns to tab
    retry: (failureCount, error) => {
      // Don't retry if it's a 401/403 (auth error)
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as any).message;
        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("Unauthorized")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for fetching admin images using optimized caching
 * This replaces the manual useQuery + getAdminImages pattern
 * Benefits: Enhanced caching strategies, consistent query patterns
 *
 * Note: Uses existing API routes for security (service role operations stay on server)
 */
export function useAdminImagesWithHelpers(params?: {
  search?: string;
  tag?: string;
}) {
  return useReactQuery({
    queryKey: adminQueryKeys.allImages(params),
    queryFn: () => getAdminImages(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (admin data changes more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when admin returns to tab
    retry: (failureCount, error) => {
      // Don't retry if it's a 401/403 (auth error)
      if (error && typeof error === "object" && "message" in error) {
        const message = (error as any).message;
        if (
          message.includes("401") ||
          message.includes("403") ||
          message.includes("Unauthorized")
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

// ============================================================================
// ADMIN USER MANAGEMENT MUTATIONS
// ============================================================================

/**
 * Hook for toggling user newsletter subscription status
 * Calls /api/admin/accounts/[id]/newsletter-status
 */
export function useToggleUserNewsletterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      subscribed,
    }: {
      userId: string;
      subscribed: boolean;
    }) => {
      const response = await fetch(
        `/api/admin/accounts/${userId}/newsletter-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscribed }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to update newsletter subscription",
        );
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin user lists to refresh data
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.allSiteUsers(),
      });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminUsers() });
    },
  });
}

/**
 * Hook for toggling user email verification status
 * Calls /api/admin/accounts/[id]/verification-status
 */
export function useToggleUserVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      verified,
    }: {
      userId: string;
      verified: boolean;
    }) => {
      const response = await fetch(
        `/api/admin/accounts/${userId}/verification-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verified }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to update verification status",
        );
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin user lists to refresh data
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.allSiteUsers(),
      });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminUsers() });
    },
  });
}

/**
 * Hook for promoting a user to admin
 * Calls /api/admin/team (POST)
 */
// MIGRATED TO tRPC - Use api.admin.promoteUser.useMutation() instead
export function usePromoteUserToAdminMutation() {
  console.warn(
    "[DEPRECATED] usePromoteUserToAdminMutation: Use api.admin.promoteUser.useMutation() instead",
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin user lists to refresh data
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminUsers() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.allSiteUsers(),
      });
    },
  });
}

/**
 * Hook for demoting an admin to regular user
 * Calls /api/admin/team/[userId] (DELETE)
 */
export function useDemoteAdminToUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await fetch(`/api/admin/team/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to demote admin");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin user lists to refresh data
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminUsers() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.allSiteUsers(),
      });
    },
  });
}

/**
 * Hook for updating admin user permissions
 * Calls /api/admin/team/[userId] (PUT)
 */
export function useUpdateAdminPermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: string[];
    }) => {
      const response = await fetch(`/api/admin/team/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update permissions");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin user lists to refresh data
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminUsers() });
    },
  });
}

// ============================================================================
// ADMIN NEWSLETTER CAMPAIGN MUTATIONS
// ============================================================================

/**
 * Hook for creating a new newsletter campaign
 * Calls /api/admin/newsletter/campaigns (POST)
 */
// MIGRATED TO tRPC - Use api.admin.createNewsletterCampaign.useMutation() instead
export function useCreateNewsletterCampaignMutation() {
  console.warn(
    "[DEPRECATED] useCreateNewsletterCampaignMutation: Use api.admin.createNewsletterCampaign.useMutation() instead",
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subject,
      content,
      status = "draft",
    }: {
      subject: string;
      content: string;
      status?: string;
    }) => {
      const response = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, content, status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create campaign");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaigns() });
    },
  });
}

/**
 * Hook for updating an existing newsletter campaign
 * Calls /api/admin/newsletter/campaigns/[id] (PUT)
 */
export function useUpdateNewsletterCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      subject,
      content,
    }: {
      campaignId: string;
      subject: string;
      content: string;
    }) => {
      const response = await fetch(
        `/api/admin/newsletter/campaigns/${campaignId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject, content }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update campaign");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaigns() });
    },
  });
}

/**
 * Hook for deleting a newsletter campaign
 * Calls /api/admin/newsletter/campaigns/[id] (DELETE)
 */
export function useDeleteNewsletterCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId }: { campaignId: string }) => {
      const response = await fetch(
        `/api/admin/newsletter/campaigns/${campaignId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete campaign");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaigns() });
    },
  });
}

/**
 * Hook for sending a newsletter campaign
 * Calls /api/admin/newsletter/campaigns/[id]/send (POST)
 */
export function useSendNewsletterCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId }: { campaignId: string }) => {
      const response = await fetch(
        `/api/admin/newsletter/campaigns/${campaignId}/send`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send campaign");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate campaigns query to refresh the list (status will change to 'sent')
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaigns() });
    },
  });
}

// ============================================================================
// ADMIN BLOG POST MUTATIONS
// ============================================================================

/**
 * Hook for saving (creating or updating) blog posts via tRPC
 * This replaces the REST API route to use tRPC for type safety
 * Benefits: Type-safe operations, proper permission checks, automatic cache updates
 */
export function useAdminSaveBlogPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: {
      id?: string;
      slug?: string;
      title: string;
      excerpt: string;
      content: string;
      cover_image?: string;
      date?: string;
      author?: string;
      author_user_id: string;
      category: string;
      featured: boolean;
      draft?: boolean;
      premium?: boolean;
    }) => {
      // Create a vanilla client for mutation
      const { createTRPCProxyClient, httpBatchLink } = await import(
        "@trpc/client"
      );
      const { default: superjson } = await import("superjson");

      const trpcClient = createTRPCProxyClient<AppRouter>({
        links: [
          httpBatchLink({
            url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/trpc`,
            transformer: superjson,
          }),
        ],
      });

      // Determine if this is an update or create operation
      if (postData.id) {
        // Update existing post
        return await trpcClient.blog.updatePost.mutate({
          id: postData.id,
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          cover_image: postData.cover_image,
          category: postData.category,
          featured: postData.featured,
          draft: postData.draft,
          premium: postData.premium,
          published_at: postData.date,
        });
      } else {
        // Create new post
        return await trpcClient.blog.createPost.mutate({
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          cover_image: postData.cover_image,
          category: postData.category,
          featured: postData.featured,
          draft: postData.draft,
          premium: postData.premium,
          published_at: postData.date,
        });
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate admin blog posts queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.adminBlogPosts(),
      });

      // If we have a slug, also invalidate the specific post query
      if (data.slug) {
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.adminBlogPostBySlug(data.slug),
        });
      }

      // If the original post had a slug (update operation), invalidate that too
      if (variables.slug && variables.slug !== data.slug) {
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.adminBlogPostBySlug(variables.slug),
        });
      }
    },
  });
}

/**
 * Hook for scheduling a newsletter campaign
 * Calls /api/admin/newsletter/campaigns/[id]/schedule (POST)
 */
export function useScheduleNewsletterCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      scheduledTime,
    }: {
      campaignId: string;
      scheduledTime: string;
    }) => {
      const response = await fetch(
        `/api/admin/newsletter/campaigns/${campaignId}/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scheduledTime }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to schedule campaign");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate campaigns query to refresh the list (status will change to 'scheduled')
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaigns() });
    },
  });
}
