import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError } from '../../utils';
import { auth as lucia } from '$lib/server/auth';

export async function POST(event: RequestEvent) {
  try {
    // Get the session from the request
    const session = await event.locals.auth();
    
    if (!session) {
      // No active session, but that's okay
      return json({ success: true });
    }
    
    // Invalidate the session
    await lucia.invalidateSession(session.sessionId);
    
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