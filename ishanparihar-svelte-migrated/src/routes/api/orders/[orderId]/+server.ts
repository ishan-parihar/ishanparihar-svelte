import { json } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ params, locals }) => {
  try {
    const session = await locals.getSession();
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient(
      env.PUBLIC_SUPABASE_URL,
      env.PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => locals.cookies.getAll(),
        },
      }
    );

    // Fetch order details from the database (using Supabase)
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', params.orderId)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return json({ error: 'Order not found' }, { status: 404 });
    }

    // Return order data without sensitive information
    const orderData = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total_amount: order.total_amount,
      currency: order.currency,
      created_at: order.created_at,
      updated_at: order.updated_at,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      items: order.order_items?.map(item => ({
        id: item.id,
        service_id: item.service_id,
        service_title: item.service_title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })) || []
    };

    return json(orderData);
  } catch (error) {
    console.error('Error fetching order:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

/** @type {import('./$types').RequestHandler} */
export const PATCH = async ({ params, request, locals }) => {
  try {
    const session = await locals.getSession();
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient(
      env.PUBLIC_SUPABASE_URL,
      env.PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => locals.cookies.getAll(),
        },
      }
    );

    const { status } = await request.json();

    // Verify the order belongs to the user
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', params.orderId)
      .single();

    if (fetchError || !order || order.user_id !== session.user.id) {
      return json({ error: 'Order not found' }, { status: 404 });
    }

    // In a real implementation, you would have specific rules for which order fields can be updated
    // For example, only admins might be able to change the status directly
    // Here we'll just show a basic update mechanism
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', params.orderId)
      .eq('user_id', session.user.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return json({ error: 'Failed to update order' }, { status: 500 });
    }

    return json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};