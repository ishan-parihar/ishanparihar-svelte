import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError, requireAuth } from '../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../lib/server/supabase';
import { createCustomerOrder } from '../../../lib/server/payments/razorpay';

// Handle different HTTP methods for orders
export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();
    
    const url = new URL(event.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          service:products_services (*)
        )
      `, { count: 'exact' })
      .eq('user_id', auth.user.userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: orders, error, count } = await query
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return json({
      orders: orders || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const data = await event.request.json();
    
    // Create customer order using the payment integration
    const order = await createCustomerOrder(
      auth.user.userId,
      data.items,
      data.total,
      data.paymentId
    );
    
    // Update order with customer information
    const supabase = createServiceRoleClient();
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        status: 'paid',
        payment_status: 'completed'
      })
      .eq('id', order.id);
    
    if (updateError) throw updateError;
    
    // Fetch the updated order
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          service:products_services (*)
        )
      `)
      .eq('id', order.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    return json({ success: true, order: updatedOrder });
  } catch (error) {
    return handleApiError(error);
  }
}

function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}