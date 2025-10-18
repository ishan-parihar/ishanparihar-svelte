import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

const getUsersSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  search: z.string().optional(),
  role: z.string().optional(),
});

export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();

    // Check if user has admin privileges
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', auth.user.userId)
      .single();

    if (userError) throw userError;

    if (currentUser?.role !== 'admin') {
      return json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const url = new URL(event.url);
    const params = Object.fromEntries(url.searchParams);
    
    const query = validateRequest(getUsersSchema, {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      search: params.search,
      role: params.role
    });

    const offset = (query.page - 1) * query.limit;

    let dbQuery = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (query.search) {
      dbQuery = dbQuery.or(`
        email.ilike.%${query.search}%,
        name.ilike.%${query.search}%
      `);
    }

    if (query.role) {
      dbQuery = dbQuery.eq('role', query.role);
    }

    const { data: users, error, count } = await dbQuery
      .range(offset, offset + query.limit - 1);

    if (error) throw error;

    // Remove sensitive information before returning
    const safeUsers = users?.map(({ password, ...safeUser }) => safeUser) || [];

    return json({
      users: safeUsers,
      total: count || 0,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil((count || 0) / query.limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}