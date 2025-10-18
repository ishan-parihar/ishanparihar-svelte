import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/db';

export const GET: RequestHandler = async (event) => {
  if (!event.locals.auth?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total,
        items,
        shipping_address
      `)
       .eq('customer_id', event.locals.auth.user.id) // Ensure user can only access their own orders
      .order('created_at', { ascending: false });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ orders: orders || [] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};