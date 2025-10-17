import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { update } from '$lib/server/queries/blog';

// GET /api/user/profile - Get user profile
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user profile from database
    const { data: user, error } = await db
      .from('users')
      .select(`
        id,
        name,
        email,
        picture,
        bio,
        phone,
        marketing_emails,
        created_at,
        notification_preferences
      `)
      .eq('id', locals.user.id)
      .single();

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ user });
  } catch (error) {
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

// PUT /api/user/profile - Update user profile
export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, phone, bio } = await request.json();

    // Update user profile in database
    const { data: user, error } = await db
      .from('users')
      .update({
        name,
        email,
        phone,
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', locals.user.id)
      .select(`
        id,
        name,
        email,
        picture,
        bio,
        phone,
        marketing_emails,
        created_at
      `)
      .single();

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ user });
  } catch (error) {
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};