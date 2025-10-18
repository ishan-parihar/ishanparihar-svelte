import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

/**
 * Check if the user is an admin
 */
export async function requireAdmin(event: RequestEvent) {
  // In a real implementation, this would check the user's session/role
  // For now, we'll just return true to allow the request to proceed
  const auth = event.locals.auth;
  
  // Using the auth structure from hooks.server.ts ({ session, user })
  if (!auth || !auth.user || (auth.user as any).role !== 'admin') {
    throw error(401, 'Unauthorized');
  }
  
  return auth.user;
}

/**
 * Handle API errors
 */
export function handleApiError(error: any) {
  console.error('API Error:', error);
  return new Response(
    JSON.stringify({ error: error.message || 'Internal server error' }),
    { 
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Validate request using zod
 */
export async function validateRequest<T extends z.ZodSchema>(
  schema: T,
  data: any
): Promise<z.infer<T>> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errorMessages = result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
    throw error(400, `Validation failed: ${errorMessages.join(', ')}`);
  }
  
  return result.data;
}

/**
 * Require authentication for API endpoint
 */
export async function requireAuth(event: RequestEvent) {
  const auth = event.locals.auth;
  
  if (!auth || !auth.user) {
    throw error(401, 'Unauthorized');
  }
  
  return auth.user;
}