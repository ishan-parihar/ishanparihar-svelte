import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Check if the user is an admin
 */
export async function requireAdmin(event: RequestEvent) {
  // In a real implementation, this would check the user's session/role
  // For now, we'll just return true to allow the request to proceed
  const session = event.locals.session;
  
  // Assuming session structure based on typical SvelteKit auth patterns
 if (!session || (session as any).user?.role !== 'admin') {
    throw error(401, 'Unauthorized');
  }
  
  return (session as any).user;
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