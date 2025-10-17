import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email_notifications, sms_notifications, push_notifications, marketing_emails } = await request.json();

    // Update notification preferences in database
    const { data: user, error } = await db
      .from('users')
      .update({
        notification_preferences: {
          email: email_notifications || false,
          sms: sms_notifications || false,
          push: push_notifications || false
        },
        marketing_emails: marketing_emails || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', locals.user.id)
      .select('id, notification_preferences, marketing_emails')
      .single();

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ user });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};