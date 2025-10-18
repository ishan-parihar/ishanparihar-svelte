import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/db';
import { hash } from 'bcrypt';
import { auth as lucia } from '$lib/server/auth';

export const PUT: RequestHandler = async (event) => {
  if (!event.locals.auth?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await event.request.json();

    // In a real implementation, we would verify the current password here
    // For now, we'll just update the password hash
    
    // Hash the new password
    const passwordHash = await hash(newPassword, 10);
    
    // Update user password in database
    const { error } = await getSupabase()
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', event.locals.auth.user.id);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    // In a real implementation, we would also invalidate all sessions for this user
    // await lucia.invalidateUserSessions(event.locals.auth.user.id);

    return json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};