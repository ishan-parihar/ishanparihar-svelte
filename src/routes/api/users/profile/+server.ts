import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

// Schema for updating user profile
const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  avatar: z.string().url().optional()
});

export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone, bio, location, website, avatar_url, created_at')
      .eq('id', auth.user.userId)
      .single();

    if (error) throw error;

    return json({
      id: user.id,
      email: user.email,
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      avatar: user.avatar_url || '',
      createdAt: user.created_at
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const data = await event.request.json();
    const updateData = validateRequest(updateUserSchema, data);

    const supabase = createServiceRoleClient();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name: updateData.name,
        phone: updateData.phone,
        bio: updateData.bio,
        location: updateData.location,
        website: updateData.website,
        avatar_url: updateData.avatar
      })
      .eq('id', auth.user.userId)
      .select('id, email, name, phone, bio, location, website, avatar_url')
      .single();

    if (error) throw error;

    return json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || '',
      phone: updatedUser.phone || '',
      bio: updatedUser.bio || '',
      location: updatedUser.location || '',
      website: updatedUser.website || '',
      avatar: updatedUser.avatar_url || ''
    });
  } catch (error) {
    return handleApiError(error);
  }
}