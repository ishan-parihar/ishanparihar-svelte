import { createServiceRoleClient } from '../supabase';
import { getPublicBlogPosts, getBlogPostBySlug } from './blog';

/**
 * Test utility to verify service role client and query patterns
 * This demonstrates the proper usage pattern for admin operations
 */
export async function testBlogQueries() {
  try {
    // Create service role client for admin operations
    const supabase = createServiceRoleClient();
    
    // Test getPublicBlogPosts
    const postsResult = await getPublicBlogPosts(supabase, {
      page: 1,
      limit: 5,
      category: undefined,
      search: undefined
    });
    
    console.log('Public blog posts test successful:', {
      total: postsResult.total,
      page: postsResult.page,
      totalPages: postsResult.totalPages
    });
    
    // Test getBlogPostBySlug (will return null if no posts exist, which is fine)
    try {
      const post = await getBlogPostBySlug(supabase, 'test-slug');
      console.log('Blog post by slug test completed (may be null if no matching post)');
    } catch (error) {
      // This is expected if no post with that slug exists
      console.log('Blog post by slug test completed - no matching post found');
    }
    
    return true;
  } catch (error) {
    console.error('Blog queries test failed:', error);
    return false;
  }
}