/**
 * Environment Configuration Server Utilities
 *
 * Server-side implementation of environment configuration functions
 */

import "server-only";

/**
 * Get environment configuration (server-side implementation)
 * @returns Object with environment configuration
 */
export function getEnvConfigServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    supabaseUrl,
    supabaseKey,
    serviceRoleKey,
    isConfigured: !!supabaseUrl && !!supabaseKey,
    hasServiceRole: !!serviceRoleKey,
  };
}
