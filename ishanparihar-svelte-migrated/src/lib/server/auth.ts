import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { google } from '@lucia-auth/oauth/providers';
import { dev } from '$app/environment';
import { adapter } from './db';
import { env } from '$env/dynamic/private';

export const auth = lucia({
  adapter: adapter,
  middleware: sveltekit(),
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  },
  getUserAttributes: (data) => {
    return {
      userId: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      emailVerified: data.email_verified,
      picture: data.picture,
      permissions: data.permissions || []
    };
  }
});

export const googleAuth = google(auth, {
  clientId: env.GOOGLE_CLIENT_ID!,
  clientSecret: env.GOOGLE_CLIENT_SECRET!,
  redirectUri: env.GOOGLE_REDIRECT_URI || (dev
    ? 'http://localhost:5173/login/google/callback'
    : 'https://yourdomain.com/login/google/callback')
});

export type Auth = typeof auth;