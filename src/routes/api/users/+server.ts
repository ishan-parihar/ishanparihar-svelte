import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError, requireAuth } from '../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../lib/server/supabase';

export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();

    // Check if user has admin privileges by checking if they have an admin role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', auth.user.userId)
      .single();

    if (userError) throw userError;

    // If user doesn't have admin role, only allow access to their own info
    if (user?.role !== 'admin') {
      return json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // For admin users, return user statistics
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    return json({ 
      totalUsers: count || 0,
      admin: true 
    });
  } catch (error) {
    return handleApiError(error);
  }
}

    // For admin users, return user statistics
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    return json({ 
      totalUsers: count || 0,
      admin: true 
    });
  } catch (error) {
    return handleApiError(error);
  }
}