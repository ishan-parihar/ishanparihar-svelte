import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, authenticateUser, ApiError } from '$lib/server/utils';
import { auth as lucia } from '$lib/server/auth';
import { googleAuth as google } from '$lib/server/auth';
import { generateCodeVerifier, generateState } from 'arctic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(event: RequestEvent) {
  try {
    const data = await event.request.json();
    const { email, password } = validateRequest(loginSchema, data);
    
    // Implement login logic using Lucia
    const user = await authenticateUser(email, password);
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }
    
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
    
    return json({ success: true, user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(event: RequestEvent) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  
  event.cookies.set('google_oauth_state', state, {
    secure: true,
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10
  });
  
  event.cookies.set('google_code_verifier', codeVerifier, {
    secure: true,
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10
  });
  
  const url = google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);
  
  return json({ url: url.toString() });
}