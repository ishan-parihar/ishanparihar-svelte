import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest } from '$lib/server/utils';
import { auth as lucia } from '$lib/server/auth';
import { getSupabase } from '$lib/server/db';
import { compare } from 'bcrypt';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(event: RequestEvent) {
  try {
    const data = await event.request.json();
    const { email, password } = validateRequest(loginSchema, data);
    
    // Get user by email
    const { data: userData, error } = await getSupabase()
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();
    
    if (error || !userData) {
      // Don't reveal whether the user exists or not for security
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // In a real app you'd have a password_hash column
    // For now, let's assume there's a password_hash in the database
    // This is pseudocode - in a real app you'd need to properly hash passwords
    const isValidPassword = await compare(password, userData.password_hash); // This would need real implementation
    
    if (!isValidPassword) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create session
    const session = await lucia.createSession(userData.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
    
    return json({ success: true, user: { id: userData.id, email: userData.email } });
  } catch (err) {
    return handleApiError(err);
  }
}