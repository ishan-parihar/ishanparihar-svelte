import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../utils';
import { createServiceRoleClient } from '$lib/server/supabase';

const getCommentsSchema = z.object({
  post_id: z.string(),
  page: z.number().default(1),
  limit: z.number().default(20)
});

const createCommentSchema = z.object({
  post_id: z.string(),
  content: z.string().min(1).max(1000),
  parent_id: z.string().optional()
});

export async function GET(event: RequestEvent) {
  try {
    const url = new URL(event.url);
    const query = {
      post_id: url.searchParams.get('post_id') || '',
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20')
    };
    
    const { post_id, page, limit } = validateRequest(getCommentsSchema, query);
    
    const supabase = createServiceRoleClient();
    
    const offset = (page - 1) * limit;
    const { data: comments, error, count } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact' })
      .eq('post_id', post_id)
      .eq('parent_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return json({
      comments: comments || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(event: RequestEvent) {
  try {
    const session = await requireAuth(event);
    const data = await event.request.json();
    const commentData = validateRequest(createCommentSchema, data);
    
    const supabase = createServiceRoleClient();
    
    const { data: comment, error } = await supabase
      .from('blog_comments')
      .insert({
        ...commentData,
        user_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return json({ success: true, comment });
  } catch (err) {
    return handleApiError(err);
  }
}