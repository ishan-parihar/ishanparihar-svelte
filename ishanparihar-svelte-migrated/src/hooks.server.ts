import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// SEO metadata hook
const seoHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Add SEO headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
};

// Generate structured data for SEO
export function generateStructuredData(type: string, data: any) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };
  
  return JSON.stringify(structuredData);
}

// Generate meta tags
export function generateMetaTags(pageData: {
 title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  keywords?: string;
  locale?: string;
}) {
  const metaTags = [
    { title: pageData.title },
    { name: 'description', content: pageData.description },
    { name: 'keywords', content: pageData.keywords || '' },
    { name: 'author', content: pageData.author || '' },
    { property: 'og:title', content: pageData.title },
    { property: 'og:description', content: pageData.description },
    { property: 'og:type', content: pageData.type || 'website' },
    { property: 'og:image', content: pageData.image || '/default-og-image.jpg' },
    { property: 'og:url', content: pageData.url || '' },
    { property: 'og:locale', content: pageData.locale || 'en_US' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageData.title },
    { name: 'twitter:description', content: pageData.description },
    { name: 'twitter:image', content: pageData.image || '/default-og-image.jpg' }
  ].filter(tag => tag.content); // Filter out tags with empty content
  
  return metaTags;
}

export const handle = sequence(seoHook);
