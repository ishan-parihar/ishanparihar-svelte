import { createServiceRoleClient } from "@/utils/supabase/server";
import { Database } from "@/lib/supabase";

export type PathOffering = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  path: "Mastery & Achievement" | "Connection & Intimacy" | "Purpose & Transcendence" | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
  available: boolean;
};

// Debug mode for development
const DEBUG_MODE =
  process.env.NODE_ENV === "development" && process.env.SERVICES_DEBUG === "true";

/**
 * Server-side function to fetch one featured offering for each archetype path
 * This is used in Server Components where fetch() with relative URLs doesn't work
 */
export async function getFeaturedOfferingsByPathServer(): Promise<PathOffering[]> {
  try {
    if (DEBUG_MODE) {
      console.log("[PathOfferingsQueriesServer] Fetching featured offerings by path (server-side)...");
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error(
        "[PathOfferingsQueriesServer] Failed to initialize Supabase service role client",
      );
      return [];
    }

    // Use raw SQL to get one featured offering per path
    const { data, error } = await supabase.rpc("get_featured_offerings_by_path");

    if (error) {
      console.error(
        "[PathOfferingsQueriesServer] Error fetching featured offerings by path:",
        error,
      );
      return [];
    }

    if (DEBUG_MODE) {
      console.log(
        `[PathOfferingsQueriesServer] Found ${data?.length || 0} featured offerings by path`,
      );
    }

    return data || [];
  } catch (error) {
    console.error("[PathOfferingsQueriesServer] Exception in getFeaturedOfferingsByPathServer:", error);
    return [];
  }
}