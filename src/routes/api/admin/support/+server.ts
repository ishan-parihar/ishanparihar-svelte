import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

const getTicketsSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  search: z.string().optional(),
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
    
    const query = validateRequest(getTicketsSchema, {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      status: params.status as 'open' | 'in-progress' | 'resolved' | 'closed' || undefined,
      priority: params.priority as 'low' | 'medium' | 'high' | 'urgent' || undefined,
      search: params.search
    });

    const offset = (query.page - 1) * query.limit;

    let dbQuery = supabase
      .from('support_tickets')
      .select(`
        *,
        user:users(email, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.priority) {
      dbQuery = dbQuery.eq('priority', query.priority);
    }

    if (query.search) {
      dbQuery = dbQuery.or(`
        subject.ilike.%${query.search}%,
        message.ilike.%${query.search}%,
        user.email.ilike.%${query.search}%
      `);
    }

    const { data: tickets, error, count } = await dbQuery
      .range(offset, offset + query.limit - 1);

    if (error) throw error;

    return json({
      tickets: tickets || [],
      total: count || 0,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil((count || 0) / query.limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(event: RequestEvent) {
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

    const { ticketId } = event.params;
    const data = await event.request.json();

    // Validate the update data
    const updateSchema = z.object({
      status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assignee_id: z.string().optional()
    });

    const validatedData = validateRequest(updateSchema, data);

    const { error } = await supabase
      .from('support_tickets')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) throw error;

    return json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}