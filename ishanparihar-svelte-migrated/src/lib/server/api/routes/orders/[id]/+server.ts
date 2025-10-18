import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/db';

export const GET: RequestHandler = async (event) => {
  // Extract order ID from URL query params instead of route params
  const orderId = event.url.searchParams.get('id');
  
  if (!event.locals.auth?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!orderId) {
    return json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    // Get specific order from database
    const supabase = getSupabase();
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total,
        items,
        shipping_address
      `)
      .eq('id', orderId)
      .eq('user_id', event.locals.auth.user.id) // Ensure user can only access their own orders
      .single();

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};