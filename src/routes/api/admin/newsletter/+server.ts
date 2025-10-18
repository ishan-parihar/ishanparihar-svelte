import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

const getSubscribersSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  search: z.string().optional(),
});

export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();

    // Check if user has admin privileges
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', auth.user.userId)
      .single();

    if (userError) throw userError;

    if (currentUser?.role !== 'admin') {
      return json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const url = new URL(event.url);
    const params = Object.fromEntries(url.searchParams);
    
    const query = validateRequest(getSubscribersSchema, {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      search: params.search
    });

    const offset = (query.page - 1) * query.limit;

    let dbQuery = supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (query.search) {
      dbQuery = dbQuery.ilike('email', `%${query.search}%`);
    }

    const { data: subscribers, error, count } = await dbQuery
      .range(offset, offset + query.limit - 1);

    if (error) throw error;

    return json({
      subscribers: subscribers || [],
      total: count || 0,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil((count || 0) / query.limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();

    // Check if user has admin privileges
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', auth.user.userId)
      .single();

    if (userError) throw userError;

    if (currentUser?.role !== 'admin') {
      return json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const data = await event.request.json();

    // Validate the newsletter data
    const newsletterSchema = z.object({
      subject: z.string().min(1),
      content: z.string().min(1),
      recipients: z.array(z.string().email()).default(['all'])
    });

    const validatedData = validateRequest(newsletterSchema, data);

    // In a real implementation, you would send emails here
    // For now, just return success
    
    return json({ 
      success: true, 
      message: 'Newsletter would be sent in production' 
    });
  } catch (error) {
    return handleApiError(error);
  }
}