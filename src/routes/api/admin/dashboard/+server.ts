import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();

    // Check if user has admin privileges
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', auth.user.userId)
      .single();

    if (userError) throw userError;

    if (user?.role !== 'admin') {
      return json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get basic analytics for admin dashboard
    const [
      { count: totalUsers, error: usersError },
      { count: totalOrders, error: ordersError },
      { count: totalServices, error: servicesError }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products_services').select('*', { count: 'exact', head: true })
    ]);

    if (usersError) throw usersError;
    if (ordersError) throw ordersError;
    if (servicesError) throw servicesError;

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        customer_name,
        user:users(email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentOrdersError) throw recentOrdersError;

    // Get recent users
    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentUsersError) throw recentUsersError;

    return json({
      stats: {
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        totalServices: totalServices || 0
      },
      recentOrders: recentOrders || [],
      recentUsers: recentUsers || []
    });
  } catch (error) {
    return handleApiError(error);
  }
}