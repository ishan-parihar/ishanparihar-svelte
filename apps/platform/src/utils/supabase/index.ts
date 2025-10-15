// Export client creation functions
export { createClient } from "./client";
export {
  createServerClient,
  createRouteHandlerClient,
  createMiddlewareClient,
  createServiceRoleClient,
} from "./server";

// Note: SupabaseClientFactory and SupabaseServerFactory are deprecated as of Iteration 57
// Use the direct client creation functions instead

// Export types
export type { Database } from "@/lib/supabase";
