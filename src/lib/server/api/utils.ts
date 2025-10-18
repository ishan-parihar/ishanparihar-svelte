import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { z } from 'zod';

export function handleApiError(err: any) {
  console.error('API Error:', err);
  
  // Determine appropriate status code based on error type
 let statusCode = 500;
  let message = 'Internal server error';
  
  if (err.status && typeof err.status === 'number') {
    statusCode = err.status;
    message = err.message || message;
 } else if (err.code) {
    // Handle specific error codes
    switch (err.code) {
      case '23505': // PostgreSQL unique violation
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case '23503': // PostgreSQL foreign key violation
        statusCode = 400;
        message = 'Invalid reference';
        break;
      case '42501': // PostgreSQL insufficient privileges
        statusCode = 403;
        message = 'Insufficient permissions';
        break;
      default:
        statusCode = 400;
        message = err.message || message;
    }
  } else if (err.message?.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  }
  
  return new Response(
    JSON.stringify({ 
      error: message,
      success: false 
    }),
    { 
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
 );
}

export function validateRequest<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    const result = schema.parse(data);
    return result;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessages = err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      
      throw error(400, {
        message: 'Validation failed',
        details: errorMessages
      });
    }
    throw error(400, 'Invalid request data');
  }
}

export async function requireAuth(event: RequestEvent) {
  // Check if the user is authenticated via the Lucia auth system
  const { locals } = event;
  
  // Check if session exists and user is authenticated
  if (!locals.auth || !locals.auth.session || !locals.auth.user) {
    throw error(401, 'Authentication required');
  }
  
  return {
    user: {
      userId: locals.auth.user.id,
      email: locals.auth.user.email,
      name: locals.auth.user.name,
      role: locals.auth.user.role
    },
    session: locals.auth.session
  };
}
  
  // For now, using a mock session - in production, validate the session against Supabase
  // In a real implementation, you would use Supabase Auth to validate the session
  // const supabase = createPublicClient();
  // const { data: { session }, error } = await supabase.auth.getSession();
  
  // For now, returning mock session data but with a realistic structure
  // The actual auth validation would happen in production with Supabase
  return {
    user: {
      userId: event.locals.userId || 'mock-user-id', // This would come from a proper session
      email: event.locals.userEmail || 'user@example.com' // This would come from a proper session
    }
  };
}