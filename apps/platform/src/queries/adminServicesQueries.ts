"use client";

import {
  useMutation,
  useQuery as useReactQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase";
import { ProductService, ServiceCategory } from "@/lib/supabase";
import { api } from "@/lib/trpc-client";

// Debug mode for development
const DEBUG_MODE =
  process.env.NODE_ENV === "development" && process.env.ADMIN_DEBUG === "true";

// Admin Service type with additional fields for admin operations
export interface AdminProductService extends ProductService {
  category?: ServiceCategory;
}

// Query keys for React Query caching
export const adminServicesQueryKeys = {
  all: ["admin-services"] as const,
  adminServices: (params?: {
    includeUnpublished?: boolean;
    category?: string;
    service_type?: string;
  }) => [...adminServicesQueryKeys.all, "list", params] as const,
  adminService: (slug: string) =>
    [...adminServicesQueryKeys.all, "detail", slug] as const,
  categories: () => [...adminServicesQueryKeys.all, "categories"] as const,
};

/**
 * Fetch admin services with enhanced permissions
 * Uses tRPC for type-safe server-side operations
 * Note: This function is kept for compatibility but the React hook should be preferred
 */
export async function getAdminServices(params?: {
  includeUnpublished?: boolean;
  category?: string;
  service_type?: string;
}): Promise<AdminProductService[]> {
  try {
    if (DEBUG_MODE) {
      console.log(
        "[AdminServicesQueries] Fetching admin services via tRPC...",
        params,
      );
    }

    // This is a compatibility function - in practice, use the React hook directly
    // For server-side usage, use the server-side queries instead
    throw new Error(
      "Use useAdminServicesWithHelpers() hook instead of calling getAdminServices directly",
    );
  } catch (error) {
    console.error(
      "[AdminServicesQueries] Error fetching admin services:",
      error,
    );
    throw error;
  }
}

/**
 * Fetch a single admin service by slug
 * Note: This function is kept for compatibility but the React hook should be preferred
 */
export async function getAdminServiceBySlug(
  slug: string,
): Promise<AdminProductService | null> {
  try {
    if (DEBUG_MODE) {
      console.log(
        `[AdminServicesQueries] Fetching admin service with slug: ${slug}`,
      );
    }

    // This is a compatibility function - in practice, use the React hook directly
    throw new Error(
      "Use useAdminServiceBySlug() hook instead of calling getAdminServiceBySlug directly",
    );
  } catch (error) {
    console.error(
      "[AdminServicesQueries] Error fetching admin service by slug:",
      error,
    );
    throw error;
  }
}

/**
 * Fetch service categories for admin operations
 * Note: This function is kept for compatibility but the React hook should be preferred
 */
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    if (DEBUG_MODE) {
      console.log("[AdminServicesQueries] Fetching service categories...");
    }

    // This is a compatibility function - in practice, use the React hook directly
    throw new Error(
      "Use useServiceCategories() hook instead of calling getServiceCategories directly",
    );
  } catch (error) {
    console.error(
      "[AdminServicesQueries] Error fetching service categories:",
      error,
    );
    throw error;
  }
}

/**
 * React Query hook for admin services with caching using tRPC
 */
export function useAdminServicesWithHelpers(params?: {
  includeUnpublished?: boolean;
  category?: string;
  service_type?: string;
}) {
  return api.services.getServicesAdmin.useQuery(
    {
      page: 1,
      limit: 100, // Get all services for admin interface
      includeUnpublished: params?.includeUnpublished ?? true,
      category: params?.category,
      serviceType: params?.service_type as
        | "product"
        | "service"
        | "course"
        | "consultation"
        | undefined,
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes (admin data changes more frequently)
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true, // Refetch when admin returns to tab
      retry: (failureCount, error) => {
        // Don't retry if it's a 401/403 (auth error)
        if (
          error?.data?.code === "UNAUTHORIZED" ||
          error?.data?.code === "FORBIDDEN"
        ) {
          return false;
        }
        return failureCount < 3;
      },
      select: (data) => {
        // Transform the paginated response to just return the services array for compatibility
        return data.services as AdminProductService[];
      },
    },
  );
}

/**
 * React Query hook for admin service by slug using tRPC
 */
export function useAdminServiceBySlug(slug: string) {
  return api.services.getServiceAdmin.useQuery(
    { slug },
    {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: !!slug,
      retry: (failureCount, error) => {
        if (
          error?.data?.code === "UNAUTHORIZED" ||
          error?.data?.code === "FORBIDDEN"
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
  );
}

/**
 * React Query hook for service categories using tRPC
 */
export function useServiceCategories() {
  return api.services.getServiceCategories.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Mutation for creating a new service using tRPC
 */
export function useAdminCreateServiceMutation() {
  const utils = api.useUtils();

  return api.services.createService.useMutation({
    onSuccess: () => {
      // Invalidate and refetch admin services
      utils.services.getServicesAdmin.invalidate();

      if (DEBUG_MODE) {
        console.log(
          "[AdminServicesQueries] Service created successfully, cache invalidated",
        );
      }
    },
    onError: (error) => {
      console.error("[AdminServicesQueries] Error creating service:", error);
    },
  });
}

/**
 * Mutation for updating a service using tRPC
 */
export function useAdminUpdateServiceMutation() {
  const utils = api.useUtils();

  return api.services.updateService.useMutation({
    onSuccess: () => {
      // Invalidate and refetch admin services
      utils.services.getServicesAdmin.invalidate();
      utils.services.getServiceAdmin.invalidate();

      if (DEBUG_MODE) {
        console.log(
          "[AdminServicesQueries] Service updated successfully, cache invalidated",
        );
      }
    },
    onError: (error) => {
      console.error("[AdminServicesQueries] Error updating service:", error);
    },
  });
}

/**
 * Mutation for deleting a service using tRPC
 */
export function useDeleteServiceMutation() {
  const utils = api.useUtils();

  return api.services.deleteService.useMutation({
    onSuccess: () => {
      // Invalidate and refetch admin services
      utils.services.getServicesAdmin.invalidate();

      if (DEBUG_MODE) {
        console.log(
          "[AdminServicesQueries] Service deleted successfully, cache invalidated",
        );
      }
    },
    onError: (error) => {
      console.error("[AdminServicesQueries] Error deleting service:", error);
    },
  });
}

/**
 * Combined mutation for saving (creating or updating) a service using tRPC
 */
export function useAdminSaveServiceMutation() {
  const utils = api.useUtils();
  const createMutation = api.services.createService.useMutation({
    onSuccess: () => {
      utils.services.getServicesAdmin.invalidate();
    },
  });
  const updateMutation = api.services.updateService.useMutation({
    onSuccess: () => {
      utils.services.getServicesAdmin.invalidate();
    },
  });

  return {
    mutate: (data: any) => {
      if (data.id) {
        // Update existing service
        return updateMutation.mutate(data);
      } else {
        // Create new service
        return createMutation.mutate(data);
      }
    },
    mutateAsync: async (data: any) => {
      if (data.id) {
        // Update existing service
        return updateMutation.mutateAsync(data);
      } else {
        // Create new service
        return createMutation.mutateAsync(data);
      }
    },
    isPending: createMutation.isPending || updateMutation.isPending,
    isError: createMutation.isError || updateMutation.isError,
    error: createMutation.error || updateMutation.error,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
    reset: () => {
      createMutation.reset();
      updateMutation.reset();
    },
  };
}
