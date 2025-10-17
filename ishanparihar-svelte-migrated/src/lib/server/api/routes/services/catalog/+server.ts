import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest } from '../../utils';
import { createServiceRoleClient } from '$lib/server/supabase';

const getCatalogSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  category: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('active')
});

export async function GET(event: RequestEvent) {
  try {
    const url = new URL(event.url);
    const query = {
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10'),
      category: url.searchParams.get('category') || undefined,
      search: url.searchParams.get('search') || undefined,
      status: (url.searchParams.get('status') as any) || 'active'
    };
    
    const { page, limit, category, search, status } = validateRequest(getCatalogSchema, query);
    
    const supabase = createServiceRoleClient();
    
    let queryBuilder = supabase
      .from('services')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (status !== 'all') {
      queryBuilder = queryBuilder.eq('status', status);
    }
    
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }
    
    if (search) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }
    
    const offset = (page - 1) * limit;
    const { data: services, error, count } = await queryBuilder
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return json({
      services: services || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (err) {
    return handleApiError(err);
  }
}