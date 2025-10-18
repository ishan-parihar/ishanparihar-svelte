import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
  if (!event.locals.auth?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestData = await event.request.json();
    
    const { items, shipping_address, billing_address, payment_id, total_amount, currency } = requestData;

    if (!items || items.length === 0) {
      return json({ error: 'Order items are required' }, { status: 400 });
    }

    if (!shipping_address) {
      return json({ error: 'Shipping address is required' }, { status: 400 });
    }

    const orderData = {
      customer_id: event.locals.auth.user.id,
      order_number: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`, // Generate unique order number
      status: 'pending', // Will be updated when payment is processed
      total_amount,
      currency,
      items,
      shipping_address,
      billing_address: billing_address || shipping_address, // Use shipping address if billing not provided
      razorpay_order_id: payment_id, // Store the Razorpay order ID for webhook matching
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert order into the database
    const supabase = getSupabase();
    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return json({ error: error.message }, { status: 500 });
    }

    // Return the created order
    return json({ 
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        currency: order.currency,
        created_at: order.created_at,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        items: order.items,
        customer_id: order.customer_id // Include customer_id in response as well
      } 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};