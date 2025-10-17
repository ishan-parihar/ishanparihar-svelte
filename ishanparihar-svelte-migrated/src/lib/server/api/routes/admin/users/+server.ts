import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAdmin } from '../../utils';
import { createServiceRoleClient } from '$lib/server/supabase';

const getUsersSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(20),
  search: z.string().optional(),
  role: z.string().optional()
});

const updateUserSchema = z.object({
  user_id: z.string(),
  role: z.enum(['user', 'admin']).optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).optional()
});

export async function GET(event: RequestEvent) {
  try {
    const url = new URL(event.url);
    const query = {
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
      search: url.searchParams.get('search') || undefined,
      role: url.searchParams.get('role') || undefined
    };
    
    const { page, limit, search, role } = validateRequest(getUsersSchema, query);
    
    const supabase = createServiceRoleClient();
    
    let queryBuilder = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (role) {
      queryBuilder = queryBuilder.eq('role', role);
    }
    
    if (search) {
      queryBuilder = queryBuilder.or(
        `email.ilike.%${search}%,name.ilike.%${search}%`
      );
    }
    
    const offset = (page - 1) * limit;
    const { data: users, error, count } = await queryBuilder
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return json({
      users: users || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(event: RequestEvent) {
  try {
    const session = await requireAdmin(event);
    const data = await event.request.json();
    const updateData = validateRequest(updateUserSchema, data);
    
    const supabase = createServiceRoleClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', updateData.user_id)
      .select()
      .single();
    
    if (error) throw error;
    
    return json({ success: true, user });
  } catch (err) {
    return handleApiError(err);
  }
}