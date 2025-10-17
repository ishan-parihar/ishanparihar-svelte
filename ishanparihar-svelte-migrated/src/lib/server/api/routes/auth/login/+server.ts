import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest } from '../../utils';
import { auth as lucia } from '$lib/server/auth';

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