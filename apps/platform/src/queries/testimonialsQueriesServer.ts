import "server-only";

import { createServiceRoleClient } from "@/utils/supabase/server";
import { ServiceTestimonial } from "@/lib/supabase";

// Debug mode for development
const DEBUG_MODE = 
  process.env.NODE_ENV === "development" && process.env.ADMIN_DEBUG === "true";

/**
 * Server-side function to fetch featured testimonials directly from Supabase
 * This is used in Server Components where fetch() with relative URLs doesn't work
 */
export async function getFeaturedTestimonials(): Promise<ServiceTestimonial[]> {
  try {
    if (DEBUG_MODE) {
      console.log("[TestimonialsQueriesServer] Fetching featured testimonials (server-side)...");
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[TestimonialsQueriesServer] Failed to initialize Supabase service role client");
      throw new Error("Database connection failed");
    }

    // Build the query to fetch featured and approved testimonials
    const { data: testimonials, error } = await supabase
      .from("service_testimonials")
      .select("*")
      .eq("featured", true)
      .eq("approved", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching featured testimonials (server-side):", error);
      throw new Error("Failed to fetch testimonials");
    }

    if (DEBUG_MODE) {
      console.log(
        `[TestimonialsQueriesServer] Successfully fetched ${testimonials?.length || 0} featured testimonials (server-side)`,
      );
    }

    return testimonials || [];
  } catch (error) {
    console.error("Error fetching featured testimonials (server-side):", error);
    throw error;
  }
}