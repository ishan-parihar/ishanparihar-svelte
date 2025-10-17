import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { id: orderId } = params;
  
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get specific order from database
    const { data: order, error } = await db
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
      .eq('user_id', locals.user.id) // Ensure user can only access their own orders
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