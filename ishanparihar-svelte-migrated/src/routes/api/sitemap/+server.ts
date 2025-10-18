import type { RequestHandler } from './$types';
import { getSupabase } from '$lib/server/db';

// GET /api/sitemap - Generate sitemap.xml
export const GET: RequestHandler = async ({ url: requestUrl }) => {
  try {
    // Base URLs that should always be included
    const baseUrls = [
      { url: `${requestUrl.origin}/`, lastmod: new Date().toISOString(), priority: 1.0 },
      { url: `${requestUrl.origin}/blog`, lastmod: new Date().toISOString(), priority: 0.9 },
      { url: `${requestUrl.origin}/offerings`, lastmod: new Date().toISOString(), priority: 0.9 },
      { url: `${requestUrl.origin}/support`, lastmod: new Date().toISOString(), priority: 0.8 },
      { url: `${requestUrl.origin}/account`, lastmod: new Date().toISOString(), priority: 0.8 },
    ];

     // Fetch blog posts to include in sitemap
     const { data: blogPosts, error: blogError } = await getSupabase()
       .from('blog_posts')
       .select('slug, updated_at')
       .eq('status', 'published')
       .order('updated_at', { ascending: false });

    if (blogError) {
      console.error('Error fetching blog posts for sitemap:', blogError);
    }

     // Add blog posts to URLs
     const blogPostUrls = blogPosts?.map((post: any) => ({
       url: `${requestUrl.origin}/blog/${post.slug}`,
       lastmod: post.updated_at,
       priority: 0.7
     })) || [];

    // Combine all URLs
    const allUrls = [...baseUrls, ...blogPostUrls];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>
`).join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600'
      }
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600'
      }
    });
  }
};