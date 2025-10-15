"use server";

import { createServiceRoleClient } from "@/utils/supabase/server";
import { PathOffering } from "@/queries/pathOfferingsQueriesServer";

// Debug mode for development
const DEBUG_MODE =
  process.env.NODE_ENV === "development" && process.env.SERVICES_DEBUG === "true";

/**
 * Server action to fetch one featured offering for each archetype path
 */
export async function getFeaturedOfferingsByPathAction(): Promise<PathOffering[]> {
  try {
    if (DEBUG_MODE) {
      console.log("[PathOfferingsAction] Fetching featured offerings by path...");
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error(
        "[PathOfferingsAction] Failed to initialize Supabase service role client",
      );
      return [];
    }

    // Use direct query instead of RPC function to avoid type issues
    const { data, error } = await supabase
      .from("products_services")
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image,
        path,
        featured,
        sort_order,
        published,
        available
      `)
      .eq("published", true)
      .eq("available", true)
      .not("path", "is", null);

    if (error) {
      console.error(
        "[PathOfferingsAction] Error fetching featured offerings by path:",
        error,
      );
      return [];
    }

    // Group by path and take the first offering for each path
    const offeringsByPath: Record<string, any> = {};
    
    // Sort by sort_order and created_at to ensure consistent ordering
    const sortedData = [...data].sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Take the first offering for each path
    for (const offering of sortedData) {
      if (!offeringsByPath[offering.path]) {
        offeringsByPath[offering.path] = offering;
      }
    }

    // Convert to array
    const result = Object.values(offeringsByPath);

    if (DEBUG_MODE) {
      console.log(
        `[PathOfferingsAction] Found ${result.length} featured offerings by path`,
        result
      );
    }

    return result as PathOffering[];
  } catch (error) {
    console.error("[PathOfferingsAction] Exception in getFeaturedOfferingsByPathAction:", error);
    return [];
  }
}