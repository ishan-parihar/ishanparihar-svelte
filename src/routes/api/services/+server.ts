import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest } from '../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../lib/server/supabase';

const getServicesSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(12),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  serviceType: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional()
});

export async function GET(event: RequestEvent) {
  try {
    const url = new URL(event.url);
    const params = Object.fromEntries(url.searchParams);
    const query = validateRequest(getServicesSchema, {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 12,
      category: params.category,
      featured: params.featured === 'true' ? true : undefined,
      serviceType: params.serviceType,
      search: params.search,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined
    });

    const supabase = createServiceRoleClient();
    const offset = (query.page - 1) * query.limit;

    // Build query with filters
    let dbQuery = supabase
      .from('products_services')
      .select(`
        *,
        category:service_categories!inner(*),
        pricing:service_pricing!inner(*)
      `, { count: 'exact' })
      .eq('published', true)
      .eq('available', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (query.category) {
      dbQuery = dbQuery.eq('category.slug', query.category);
    }

    if (query.featured !== undefined) {
      dbQuery = dbQuery.eq('featured', query.featured);
    }

    if (query.serviceType) {
      dbQuery = dbQuery.eq('service_type', query.serviceType);
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      if (query.minPrice !== undefined) {
        dbQuery = dbQuery.gte('pricing.base_price', query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        dbQuery = dbQuery.lte('pricing.base_price', query.maxPrice);
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
  } catch (err) {
    return handleApiError(err);
  }
}