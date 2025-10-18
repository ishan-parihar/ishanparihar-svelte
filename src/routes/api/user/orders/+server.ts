import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

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
      totalPages: Math.ceil((count || 0) / query.limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
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