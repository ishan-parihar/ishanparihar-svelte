import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '$lib/server/utils';
import { createServiceRoleClient } from '$lib/server/supabase';

const getPostsSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  category: z.string().optional(),
  search: z.string().optional()
});

const createPostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(50),
  excerpt: z.string().max(500),
  category: z.string().optional(),
  draft: z.boolean().default(false)
});

export async function GET(event: RequestEvent) {
  try {
    const url = new URL(event.url);
    const query = {
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10'),
      category: url.searchParams.get('category') || undefined,
      search: url.searchParams.get('search') || undefined
    };
    
    const { page, limit, category, search } = validateRequest(getPostsSchema, query);
    
    const supabase = createServiceRoleClient();
    
    let queryBuilder = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('draft', false)
      .order('created_at', { ascending: false });
    
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }
    
    if (search) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${search}%,content.ilike.%${search}%`
      );
    }
    
    const offset = (page - 1) * limit;
    const { data: posts, error, count } = await queryBuilder
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return json({
      posts: posts ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit)
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(event: RequestEvent) {
  try {
    const session = await requireAuth(event);
    const data = await event.request.json();
    const postData = validateRequest(createPostSchema, data);
    
    const supabase = createServiceRoleClient();
    
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert([{
        ...postData,
        slug,
        author_user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views_count: 0,
        likes_count: 0,
        comments_count: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return json({ success: true, post: post || null });
  } catch (err) {
    return handleApiError(err);
  }
}