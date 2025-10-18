import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError } from '$lib/server/utils';
import { auth as lucia } from '$lib/server/auth';

export async function POST(event: RequestEvent) {
  try {
    // Get the session ID from cookies
    const sessionId = event.cookies.get(lucia.sessionCookieName);
    
    if (!sessionId) {
      // No active session, but that's okay
      return json({ success: true });
    }
    
    // Invalidate the session
    await lucia.invalidateSession(sessionId);
    
    // Create a blank session cookie to clear the existing one
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
    
    return json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}