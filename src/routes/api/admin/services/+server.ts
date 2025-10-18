import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../../lib/server/supabase';

const getServicesSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  category: z.string().optional(),
  status: z.enum(['published', 'draft', 'archived']).optional(),
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
    
    const query = validateRequest(getServicesSchema, {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      category: params.category,
      status: params.status as 'published' | 'draft' | 'archived' || undefined,
      search: params.search
    });

    const offset = (query.page - 1) * query.limit;

    let dbQuery = supabase
      .from('products_services')
      .select(`
        *,
        category:service_categories!inner(*),
        pricing:service_pricing!inner(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (query.category) {
      dbQuery = dbQuery.eq('category.slug', query.category);
    }

    if (query.status) {
      dbQuery = dbQuery.eq('published', query.status === 'published');
      if (query.status === 'archived') {
        dbQuery = dbQuery.eq('available', false);
      }
    }

    if (query.search) {
      dbQuery = dbQuery.or(`
        title.ilike.%${query.search}%,
        excerpt.ilike.%${query.search}%,
        description.ilike.%${query.search}%
      `);
    }

    const { data: services, error, count } = await dbQuery
      .range(offset, offset + query.limit - 1);

    if (error) throw error;

    return json({
      services: services || [],
      total: count || 0,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil((count || 0) / query.limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Admin can create/update services
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

    // Validate the service data
    const serviceSchema = z.object({
      title: z.string().min(1),
      description: z.string(),
      excerpt: z.string(),
      category_id: z.string(),
      service_type: z.string(),
      published: z.boolean().default(false),
      available: z.boolean().default(true),
      featured: z.boolean().default(false),
      sort_order: z.number().default(0)
    });

    const validatedData = validateRequest(serviceSchema, data);

    const { data: newService, error } = await supabase
      .from('products_services')
      .insert({
        ...validatedData,
        created_by: auth.user.userId
      })
      .select()
      .single();

    if (error) throw error;

    return json({ success: true, service: newService });
  } catch (error) {
    return handleApiError(error);
  }
}