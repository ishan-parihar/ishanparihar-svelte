// Supabase-based authentication system
// Since we're using Supabase, we can use its built-in auth system
// instead of Lucia for now

import { createPublicClient } from './supabase';
import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

// Define the user and session types
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  email_verified?: boolean;
  picture?: string;
  permissions?: string[];
}

export interface Session {
  user: User;
  expires_at: number;
}

// Since we're using Supabase, we'll implement an auth system that works with it
export const auth = {
  sessionCookieName: 'sb-access-token', // Using Supabase cookie name
  createSessionCookie: (sessionId: string) => ({
    name: 'sb-access-token',
    value: sessionId,
    attributes: {
      secure: !dev,
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }
  }),
  createBlankSessionCookie: () => ({
    name: 'sb-access-token',
    value: '',
    attributes: {
      secure: !dev,
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      maxAge: 0
    }
  }),
  validateSession: async (sessionId: string): Promise<{ session: Session | null; user: User | null }> => {
    // In a real implementation, you'd call Supabase to validate the session
    // For now, we'll return a mock implementation
    try {
      // This would normally be a call to Supabase to verify the session
      // const { data, error } = await supabase.auth.getUser(sessionId);
      
      // For now, return mock data - in production, use actual Supabase validation
      return {
        session: {
          user: {
            id: 'mock-user-id',
            email: 'user@example.com',
            role: 'user'
          },
          expires_at: Date.now() + 604800000 // 1 week from now
        },
        user: {
          id: 'mock-user-id',
          email: 'user@example.com',
          role: 'user'
        }
      };
    } catch (error) {
      return { session: null, user: null };
    }
  }
};

export type Auth = typeof auth;

// Helper function to require admin access
export async function requireAdmin(event: { locals: { session: any; user: any } }) {
  const { locals } = event;
  
  // Check if user is authenticated
  if (!locals.session || !locals.user) {
    throw new Error('Authentication required');
  }
  
  // Check if user is an admin
  if (locals.user.role !== 'admin') {
    throw new Error('Insufficient permissions');
  }
  
  return locals.session;
}