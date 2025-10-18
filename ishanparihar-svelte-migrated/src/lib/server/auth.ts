import { Lucia } from 'lucia';
import { Google } from 'arctic';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { adapter } from './db';
import { env } from '$env/dynamic/private';

export const auth = new Lucia(adapter, {
  sessionCookie: {
    expires: true, // Enable session expiration
    attributes: {
      secure: !dev, // Set to true in production
      sameSite: "lax",
      path: "/"
    }
  },
  getUserAttributes: (data) => {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      email_verified: data.email_verified,
      picture: data.picture,
      permissions: data.permissions || []
    };
  }
});

export const googleAuth = new Google(
  env.GOOGLE_CLIENT_ID!,
  env.GOOGLE_CLIENT_SECRET!,
  env.GOOGLE_REDIRECT_URI || (dev
    ? 'http://localhost:5173/login/google/callback'
    : 'https://yourdomain.com/login/google/callback')
);

export type Auth = typeof auth;

// Helper function to require admin access
export async function requireAdmin(event: { locals: { session: any; user: any } }) {
  const { locals } = event;
  
  // Check if user is authenticated
  if (!locals.session || !locals.user) {
    throw redirect(302, '/login');
  }
  
  // Check if user is an admin
  if (locals.user.role !== 'admin') {
    throw redirect(302, '/unauthorized');
  }
  
  return locals.session;
}