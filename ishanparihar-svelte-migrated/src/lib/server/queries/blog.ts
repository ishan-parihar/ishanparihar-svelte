import { createServiceRoleClient } from '../supabase';
import type { Database } from '$lib/types/database';

export async function getPublicBlogPosts(
  supabase: ReturnType<typeof createServiceRoleClient>,
  options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  } = {}
) {
  const { page = 1, limit = 10, category, search } = options;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('draft', false)
    .order('created_at', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,content.ilike.%${search}%`
    );
  }
  
  const { data, error, count } = await query
    .range(offset, offset + limit - 1);
  
  if (error) {
    throw error;
  }
  
  return {
    posts: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

export async function getBlogPostBySlug(
  supabase: ReturnType<typeof createServiceRoleClient>,
  slug: string
) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('draft', false)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}