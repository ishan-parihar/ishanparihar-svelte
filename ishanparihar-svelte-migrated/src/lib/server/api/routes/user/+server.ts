import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/db';

// GET /api/user/profile - Get user profile
export const GET: RequestHandler = async (event) => {
  if (!event.locals.auth?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user profile from database
    const supabase = getSupabase();
    const { data: user, error } = await supabase
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
      .eq('id', event.locals.auth.user.id)
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
export const PUT: RequestHandler = async (event) => {
  if (!event.locals.auth?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, phone, bio } = await event.request.json();

    // Update user profile in database
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        phone,
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', event.locals.auth.user.id)
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