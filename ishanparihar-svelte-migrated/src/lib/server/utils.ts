import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from './db';
import { auth as lucia } from './auth';

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error instanceof z.ZodError) {
    return json({ error: 'Validation error', details: error.issues }, { status: 400 });
  }
  
  if (error instanceof ApiError) {
    return json({ error: error.message }, { status: error.status });
  }
  
  return json({ error: 'Internal server error' }, { status: 500 });
};

export const validateRequest = <T extends z.ZodSchema>(schema: T, data: any) => {
  return schema.parse(data);
};

export const requireAuth = async (event: RequestEvent) => {
  const sessionId = event.cookies.get(lucia.sessionCookieName);
  if (!sessionId) {
    throw new ApiError('Unauthorized', 401);
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    throw new ApiError('Unauthorized', 401);
  }

  return { session, user };
};

export const requireAdmin = async (event: RequestEvent) => {
  const { session, user } = await requireAuth(event);
  // User should have a role property according to our database schema
  if ((user as any)?.role !== 'admin') {
    throw new ApiError('Forbidden', 403);
  }

  return { session, user };
};

// Define authenticateUser function
export const authenticateUser = async (email: string, password: string) => {
  // This is a placeholder implementation
  // In your actual implementation, you'd need to retrieve and verify the password
  // from your database using bcrypt or similar
  const { data: users, error } = await db()
    .from('users')
    .select('id, email, password_hash')
    .eq('email', email)
    .single();
  
  if (error || !users) {
    return null;
  }

  // For actual password verification, you would use bcrypt.compare:
  // const isValid = await bcrypt.compare(password, users.password_hash);
  // For now, this is just a placeholder
  // In a real implementation, you'd need to properly hash and verify passwords
  return users;
};