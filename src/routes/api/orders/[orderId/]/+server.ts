import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const { orderId } = event.params;
    const supabase = createServiceRoleClient();

    // Fetch the specific order with its items and related service information
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          service:products_services (*)
        )
      `)
      .eq('id', orderId)
      .eq('user_id', auth.user.userId)
      .single();

    if (error) throw error;

    if (!order) {
      return json({ error: 'Order not found' }, { status: 404 });
    }

    return json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}