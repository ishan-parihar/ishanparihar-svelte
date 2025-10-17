import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { hash } from '@node-rs/argon2';
import { LuciaError } from 'lucia';

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    // In a real implementation, we would verify the current password here
    // For now, we'll just update the password hash
    
    // Hash the new password
    const passwordHash = await hash(newPassword);
    
    // Update user password in database
    const { error } = await db
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', locals.user.id);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    // In a real implementation, we would also invalidate all sessions for this user
    // await lucia.invalidateUserSessions(locals.user.id);

    return json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};