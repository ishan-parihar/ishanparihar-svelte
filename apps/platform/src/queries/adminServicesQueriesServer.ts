import "server-only";

import { createServiceRoleClient } from "@/utils/supabase/server";
import { AdminProductService } from "./adminServicesQueries";
import { ServiceCategory } from "@/lib/supabase";

// Debug mode for development
const DEBUG_MODE =
  process.env.NODE_ENV === "development" && process.env.ADMIN_DEBUG === "true";

/**
 * Server-side function to fetch admin services directly from Supabase
 * This is used in Server Components where fetch() with relative URLs doesn't work
 */
export async function getAdminServicesServer(params?: {
  includeUnpublished?: boolean;
  category?: string;
  service_type?: string;
}): Promise<AdminProductService[]> {
  try {
    if (DEBUG_MODE) {
      console.log(
        "[AdminServicesQueriesServer] Fetching admin services (server-side)...",
        params,
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error(
        "[AdminServicesQueriesServer] Failed to initialize Supabase service role client",
      );
      throw new Error("Database connection failed");
    }

    // Build the query
    let query = supabase
      .from("products_services")
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        description,
        cover_image,
        category_id,
        service_type,
        base_price,
        currency,
        pricing_type,
        billing_period,
        available,
        featured,
        premium,
        meta_title,
        meta_description,
        keywords,
        views_count,
        inquiries_count,
        bookings_count,
        author_user_id,
        published,
        sort_order,
        created_at,
        updated_at,
        published_at,
        category:category_id(
          id,
          name,
          slug,
          description,
          icon,
          color,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `,
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    // Filter by published status if not including unpublished
    if (!params?.includeUnpublished) {
      query = query.eq("published", true);
    }

    // Filter by category if specified
    if (params?.category) {
      query = query.eq("service_categories.slug", params.category);
    }

    // Filter by service type if specified
    if (params?.service_type) {
      query = query.eq("service_type", params.service_type);
    }

    const { data: services, error } = await query;

    if (error) {
      console.error("Error fetching admin services (server-side):", error);
      throw new Error("Failed to fetch services");
    }

    if (DEBUG_MODE) {
      console.log(
        `[AdminServicesQueriesServer] Successfully fetched ${services?.length || 0} services (server-side)`,
      );
    }

    // Format the services to match AdminProductService type
    const formattedServices: AdminProductService[] = (services || []).map(
      (service: any) => ({
        ...service,
        category:
          Array.isArray(service.category) && service.category.length > 0
            ? service.category[0]
            : undefined,
      }),
    );

    return formattedServices;
  } catch (error) {
    console.error("Error fetching admin services (server-side):", error);
    throw error;
  }
}

/**
 * Server-side function to fetch a single admin service by slug
 */
export async function getAdminServiceBySlugServer(
  slug: string,
): Promise<AdminProductService | null> {
  try {
    if (DEBUG_MODE) {
      console.log(
        `[AdminServicesQueriesServer] Fetching admin service with slug: ${slug} (server-side)`,
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error(
        "[AdminServicesQueriesServer] Failed to initialize Supabase service role client",
      );
      throw new Error("Database connection failed");
    }

    // Build the query
    const { data: service, error } = await supabase
      .from("products_services")
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        description,
        cover_image,
        category_id,
        service_type,
        base_price,
        currency,
        pricing_type,
        billing_period,
        available,
        featured,
        premium,
        meta_title,
        meta_description,
        keywords,
        views_count,
        inquiries_count,
        bookings_count,
        author_user_id,
        published,
        sort_order,
        created_at,
        updated_at,
        published_at,
        category:category_id(
          id,
          name,
          slug,
          description,
          icon,
          color,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `,
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(
        "Error fetching admin service by slug (server-side):",
        error,
      );
      throw new Error("Failed to fetch service");
    }

    if (DEBUG_MODE) {
      console.log(
        `[AdminServicesQueriesServer] Successfully fetched service: ${service?.title || "not found"} (server-side)`,
      );
    }

    // Format the service to match AdminProductService type
    if (service) {
      const formattedService: AdminProductService = {
        ...service,
        category:
          Array.isArray(service.category) && service.category.length > 0
            ? service.category[0]
            : undefined,
      };
      return formattedService;
    }

    return null;
  } catch (error) {
    console.error("Error fetching admin service by slug (server-side):", error);
    throw error;
  }
}

/**
 * Server-side function to fetch service categories
 */
export async function getServiceCategoriesServer(): Promise<ServiceCategory[]> {
  try {
    if (DEBUG_MODE) {
      console.log(
        "[AdminServicesQueriesServer] Fetching service categories (server-side)...",
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error(
        "[AdminServicesQueriesServer] Failed to initialize Supabase service role client",
      );
      throw new Error("Database connection failed");
    }

    // Build the query
    const { data: categories, error } = await supabase
      .from("service_categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        icon,
        color,
        sort_order,
        active,
        created_at,
        updated_at
      `,
      )
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching service categories (server-side):", error);
      throw new Error("Failed to fetch categories");
    }

    if (DEBUG_MODE) {
      console.log(
        `[AdminServicesQueriesServer] Successfully fetched ${categories?.length || 0} categories (server-side)`,
      );
    }

    return categories || [];
  } catch (error) {
    console.error("Error fetching service categories (server-side):", error);
    throw error;
  }
}

/**
 * Helper function to ensure services have all required fields for admin operations
 */
export function ensureServicesFormat(services: any[]): AdminProductService[] {
  return services.map((service) => ({
    id: service.id,
    title: service.title || "",
    slug: service.slug || "",
    excerpt: service.excerpt || "",
    description: service.description || "",
    cover_image: service.cover_image || "",
    category_id: service.category_id || null,
    service_type: service.service_type || "service",
    base_price: service.base_price || null,
    currency: service.currency || "USD",
    pricing_type: service.pricing_type || "one_time",
    billing_period: service.billing_period || null,
    available: service.available !== undefined ? service.available : true,
    featured: service.featured !== undefined ? service.featured : false,
    premium: service.premium !== undefined ? service.premium : false,
    meta_title: service.meta_title || null,
    meta_description: service.meta_description || null,
    keywords: service.keywords || null,
    views_count: service.views_count || 0,
    inquiries_count: service.inquiries_count || 0,
    bookings_count: service.bookings_count || 0,
    author_user_id: service.author_user_id || null,
    published: service.published !== undefined ? service.published : false,
    sort_order: service.sort_order || 0,
    created_at: service.created_at || new Date().toISOString(),
    updated_at: service.updated_at || new Date().toISOString(),
    published_at: service.published_at || new Date().toISOString(),
    category: service.category || null,
  }));
}
