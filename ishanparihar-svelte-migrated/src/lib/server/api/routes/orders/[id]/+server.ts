import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  // Extract order ID from route params
  const orderId = event.params.id;
  
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
        order_number,
        created_at,
        status,
        total_amount,
        currency,
        items,
        shipping_address,
        billing_address
      `)
      .eq('id', orderId)
      .eq('customer_id', event.locals.auth.user.id) // Ensure user can only access their own orders
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return json({ error: error.message }, { status: 500 });
    }

    return json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};