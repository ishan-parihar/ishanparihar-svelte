import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/db';

export const GET: RequestHandler = async (event) => {
  if (!event.locals.auth?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const page = parseInt(event.url.searchParams.get('page') || '1');
    const limit = parseInt(event.url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get user orders from database
    const { data: orders, error, count } = await getSupabase()
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total,
        items
      `, { count: 'exact' })
       .eq('customer_id', event.locals.auth.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({
      orders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};