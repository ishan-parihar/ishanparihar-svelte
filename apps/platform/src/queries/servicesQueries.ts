import { SupabaseClient } from "@supabase/supabase-js";
import {
  Database,
  ServiceCategory,
  ProductService,
  ServiceFeature,
  ServicePricing,
  ServiceTestimonial,
  ServiceWithDetails,
} from "@/lib/supabase";
import {
  useQuery as useReactQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import {
  useQuery as useSupabaseQuery,
  prefetchQuery as supabasePrefetchQuery,
  useUpsertMutation,
  useDeleteMutation,
} from "@supabase-cache-helpers/postgrest-react-query";

// Re-export prefetchQuery for convenience
export { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";

// Debug mode for development
const DEBUG_MODE =
  process.env.NODE_ENV === "development" &&
  process.env.SERVICES_DEBUG === "true";

// ============================================================================
// SERVICE CATEGORIES QUERIES
// ============================================================================

/**
 * Fetches all active service categories
 */
export async function getServiceCategories(
  supabase: SupabaseClient<Database>,
): Promise<ServiceCategory[]> {
  try {
    if (DEBUG_MODE) {
      console.log("[ServicesQueries] Fetching service categories...");
    }

    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(
        "[ServicesQueries] Error fetching service categories:",
        error,
      );
      throw new Error(`Failed to fetch service categories: ${error.message}`);
    }

    if (DEBUG_MODE) {
      console.log(
        `[ServicesQueries] Found ${data?.length || 0} service categories`,
      );
    }

    return data || [];
  } catch (error) {
    console.error(
      "[ServicesQueries] Exception in getServiceCategories:",
      error,
    );
    throw error;
  }
}

/**
 * React Query hook for service categories
 */
export function useServiceCategories(supabase: SupabaseClient<Database>) {
  return useReactQuery({
    queryKey: ["service-categories"],
    queryFn: () => getServiceCategories(supabase),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Shared query builder for service categories
 */
export function buildServiceCategoriesQuery(
  supabase: SupabaseClient<Database>,
) {
  return supabase
    .from("service_categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
}

// ============================================================================
// PRODUCTS AND SERVICES QUERIES
// ============================================================================

/**
 * Fetches all published and available services
 */
export async function getPublicServices(
  supabase: SupabaseClient<Database>,
  limit?: number,
): Promise<ProductService[]> {
  try {
    if (DEBUG_MODE) {
      console.log("[ServicesQueries] Fetching public services...");
    }

    let query = supabase
      .from("products_services")
      .select(
        `
        *,
        category:category_id(*)
      `,
      )
      .eq("published", true)
      .eq("available", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[ServicesQueries] Error fetching public services:", error);
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    if (DEBUG_MODE) {
      console.log(
        `[ServicesQueries] Found ${data?.length || 0} public services`,
      );
    }

    return data || [];
  } catch (error) {
    console.error("[ServicesQueries] Exception in getPublicServices:", error);
    throw error;
  }
}

/**
 * Fetches featured services
 */
export async function getFeaturedServices(
  supabase: SupabaseClient<Database>,
  limit: number = 3,
): Promise<ProductService[]> {
  try {
    if (DEBUG_MODE) {
      console.log("[ServicesQueries] Fetching featured services...");
    }

    const { data, error } = await supabase
      .from("products_services")
      .select(
        `
        *,
        category:category_id(*)
      `,
      )
      .eq("published", true)
      .eq("available", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error) {
      console.error(
        "[ServicesQueries] Error fetching featured services:",
        error,
      );
      throw new Error(`Failed to fetch featured services: ${error.message}`);
    }

    if (DEBUG_MODE) {
      console.log(
        `[ServicesQueries] Found ${data?.length || 0} featured services`,
      );
    }

    return data || [];
  } catch (error) {
    console.error("[ServicesQueries] Exception in getFeaturedServices:", error);
    throw error;
  }
}

/**
 * Fetches a single service by slug with all related data
 */
export async function getServiceBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ServiceWithDetails | null> {
  try {
    if (DEBUG_MODE) {
      console.log(`[ServicesQueries] Fetching service with slug: ${slug}`);
    }

    // Fetch the main service data
    const { data: service, error: serviceError } = await supabase
      .from("products_services")
      .select(
        `
        *,
        category:category_id(*)
      `,
      )
      .eq("slug", slug)
      .eq("published", true)
      .eq("available", true)
      .maybeSingle();

    if (serviceError) {
      console.error("[ServicesQueries] Error fetching service:", serviceError);
      throw new Error(`Failed to fetch service: ${serviceError.message}`);
    }

    if (!service) {
      if (DEBUG_MODE) {
        console.log(`[ServicesQueries] No service found with slug: ${slug}`);
      }
      return null;
    }

    // Fetch related data in parallel
    const [featuresResult, pricingResult, testimonialsResult] =
      await Promise.allSettled([
        supabase
          .from("service_features")
          .select("*")
          .eq("service_id", service.id)
          .order("sort_order", { ascending: true }),

        supabase
          .from("service_pricing")
          .select("*")
          .eq("service_id", service.id)
          .eq("active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("service_testimonials")
          .select("*")
          .eq("service_id", service.id)
          .eq("approved", true)
          .order("sort_order", { ascending: true }),
      ]);

    // Extract data from settled promises
    const features =
      featuresResult.status === "fulfilled"
        ? featuresResult.value.data || []
        : [];
    const pricing =
      pricingResult.status === "fulfilled"
        ? pricingResult.value.data || []
        : [];
    const testimonials =
      testimonialsResult.status === "fulfilled"
        ? testimonialsResult.value.data || []
        : [];

    if (DEBUG_MODE) {
      console.log(
        `[ServicesQueries] Service found with ${features.length} features, ${pricing.length} pricing tiers, ${testimonials.length} testimonials`,
      );
    }

    return {
      ...service,
      features,
      pricing,
      testimonials,
    };
  } catch (error) {
    console.error("[ServicesQueries] Exception in getServiceBySlug:", error);
    throw error;
  }
}

/**
 * React Query hook for public services
 */
export function usePublicServices(
  supabase: SupabaseClient<Database>,
  limit?: number,
) {
  return useReactQuery({
    queryKey: ["public-services", limit],
    queryFn: () => getPublicServices(supabase, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for featured services
 */
export function useFeaturedServices(
  supabase: SupabaseClient<Database>,
  limit: number = 3,
) {
  return useReactQuery({
    queryKey: ["featured-services", limit],
    queryFn: () => getFeaturedServices(supabase, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for service by slug
 */
export function useServiceBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  return useReactQuery({
    queryKey: ["service", slug],
    queryFn: () => getServiceBySlug(supabase, slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!slug,
  });
}

/**
 * Shared query builder for public services
 */
export function buildPublicServicesQuery(
  supabase: SupabaseClient<Database>,
  limit?: number,
) {
  let query = supabase
    .from("products_services")
    .select(
      `
      *,
      category:category_id(*)
    `,
    )
    .eq("published", true)
    .eq("available", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  return query;
}

/**
 * Shared query builder for featured services
 */
export function buildFeaturedServicesQuery(
  supabase: SupabaseClient<Database>,
  limit: number = 3,
) {
  return supabase
    .from("products_services")
    .select(
      `
      *,
      category:category_id(*)
    `,
    )
    .eq("published", true)
    .eq("available", true)
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
}

// ============================================================================
// PREFETCH FUNCTIONS FOR SERVER-SIDE RENDERING
// ============================================================================

/**
 * Prefetch service categories for server-side rendering
 */
export async function prefetchServiceCategories(
  queryClient: QueryClient,
  supabase: SupabaseClient<Database>,
) {
  await queryClient.prefetchQuery({
    queryKey: ["service-categories"],
    queryFn: () => getServiceCategories(supabase),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch featured services for server-side rendering
 */
export async function prefetchFeaturedServices(
  queryClient: QueryClient,
  supabase: SupabaseClient<Database>,
  limit: number = 3,
) {
  await queryClient.prefetchQuery({
    queryKey: ["featured-services", limit],
    queryFn: () => getFeaturedServices(supabase, limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch public services for server-side rendering
 */
export async function prefetchPublicServices(
  queryClient: QueryClient,
  supabase: SupabaseClient<Database>,
  limit?: number,
) {
  await queryClient.prefetchQuery({
    queryKey: ["public-services", limit],
    queryFn: () => getPublicServices(supabase, limit),
    staleTime: 5 * 60 * 1000,
  });
}
