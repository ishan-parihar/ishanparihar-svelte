import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

// GET /api/search - Search across the site
export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('q');
  const type = url.searchParams.get('type') || 'all'; // all, blog, user, etc.
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  if (!query || query.trim().length < 2) {
    return json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  try {
    let results = [];
    let total = 0;

    switch (type) {
      case 'blog':
        // Search in blog posts
        const { data: blogResults, error: blogError, count } = await db
          .from('blog_posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            created_at,
            updated_at,
            author
          `)
          .ilike('title', `%${query}%`)
          .or(`excerpt.ilike.%${query}%,content.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (blogError) {
          return json({ error: blogError.message }, { status: 500 });
        }

        results = blogResults;
        total = count || 0;
        break;

      case 'all':
      default:
        // Search across all content types
        // For now, just search blog posts as an example
        const { data: allResults, error: allError, count: allCount } = await db
          .from('blog_posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            created_at,
            updated_at,
            author
          `)
          .ilike('title', `%${query}%`)
          .or(`excerpt.ilike.%${query}%,content.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (allError) {
          return json({ error: allError.message }, { status: 500 });
        }

        results = allResults;
        total = allCount || 0;
        break;
    }

    return json({
      query,
      type,
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};