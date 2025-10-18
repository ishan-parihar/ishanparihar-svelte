import { auth } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// Lucia-style auth hook
const authHook: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(auth.sessionCookieName);
  if (!sessionId) {
    event.locals.auth = {
      session: null,
      user: null
    };
    return resolve(event);
  }

  try {
    const { session, user } = await auth.validateSession(sessionId);
    if (session && session.expires_at > Date.now()) {
      // Session is valid
      event.locals.auth = { session, user };
    } else {
      // Session is expired or invalid
      event.locals.auth = { session: null, user: null };
      // Clear the invalid session cookie
      event.cookies.delete(auth.sessionCookieName, { path: '/' });
    }
  } catch (error) {
    // If there's an error validating the session, clear it
    event.locals.auth = { session: null, user: null };
    event.cookies.delete(auth.sessionCookieName, { path: '/' });
  }

  return resolve(event);
};

// Security headers hook
const securityHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  return response;
};

export const handle = sequence(authHook, securityHook);