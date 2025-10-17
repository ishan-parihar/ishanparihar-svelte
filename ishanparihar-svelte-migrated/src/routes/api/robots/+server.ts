import { text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET /api/robots.txt - Generate robots.txt
export const GET: RequestHandler = async ({ url: requestUrl }) => {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${requestUrl.origin}/api/sitemap

# Disallow sensitive areas
Disallow: /account/
Disallow: /admin/
Disallow: /api/

# Crawl-delay: 10
`;

  return text(robotsTxt);
};