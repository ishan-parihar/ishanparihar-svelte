import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError, requireAdmin } from '../../utils';
import { createServiceRoleClient } from '$lib/server/supabase';

export async function GET(event: RequestEvent) {
  try {
    const session = await requireAdmin(event);
    
    const supabase = createServiceRoleClient();
    
    // Get user statistics
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (userError) throw userError;
    
    // Get blog post statistics
    const { count: postCount, error: postError } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });
    
    if (postError) throw postError;
    
    // Get comment statistics
    const { count: commentCount, error: commentError } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true });
    
    if (commentError) throw commentError;
    
    return json({
      success: true,
      stats: {
        users: userCount || 0,
        posts: postCount || 0,
        comments: commentCount || 0
      },
      user: session.user
    });
  } catch (err) {
    return handleApiError(err);
  }
}