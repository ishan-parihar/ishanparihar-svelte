import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

const getOrdersSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  status: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
    
    const query = validateRequest(getOrdersSchema, {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      status: params.status,
      search: params.search,
      startDate: params.startDate,
      endDate: params.endDate
    });

    const offset = (query.page - 1) * query.limit;

    let dbQuery = supabase
      .from('orders')
      .select(`
        *,
        user:users(email, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.search) {
      dbQuery = dbQuery.or(`
        order_number.ilike.%${query.search}%,
        customer_name.ilike.%${query.search}%,
        customer_email.ilike.%${query.search}%
      `);
    }

    if (query.startDate) {
      dbQuery = dbQuery.gte('created_at', query.startDate);
    }

    if (query.endDate) {
      dbQuery = dbQuery.lte('created_at', query.endDate);
    }

    const { data: orders, error, count } = await dbQuery
      .range(offset, offset + query.limit - 1);

    if (error) throw error;

    return json({
      orders: orders || [],
      total: count || 0,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil((count || 0) / query.limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Allow updating order status for admin
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

    const { orderId } = event.params;
    const data = await event.request.json();

    // Validate the data
    const updateSchema = z.object({
      status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded'])
    });

    const validatedData = validateRequest(updateSchema, data);

    const { error } = await supabase
      .from('orders')
      .update({ status: validatedData.status })
      .eq('id', orderId);

    if (error) throw error;

    return json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}