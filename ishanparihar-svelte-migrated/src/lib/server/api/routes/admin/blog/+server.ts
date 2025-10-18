import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

// Mock blog posts data
const mockBlogPosts = [
  {
    id: '1',
    title: 'Getting Started with Svelte 5',
    slug: 'getting-started-svelte-5',
    status: 'published',
    author: 'John Doe',
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T10:30:00Z',
    views: 1250,
    likes: 45
  },
  {
    id: '2',
    title: 'Building Modern Web Applications',
    slug: 'building-modern-web-applications',
    status: 'published',
    author: 'Jane Smith',
    createdAt: '2023-05-10T14:20:00Z',
    updatedAt: '2023-05-10T14:20:00Z',
    views: 2100,
    likes: 89
  },
  {
    id: '3',
    title: 'Advanced State Management',
    slug: 'advanced-state-management',
    status: 'draft',
    author: 'Bob Johnson',
    createdAt: '2023-05-05T09:15:00Z',
    updatedAt: '2023-05-08T11:45:00Z',
    views: 0,
    likes: 0
  },
  {
    id: '4',
    title: 'Performance Optimization Tips',
    slug: 'performance-optimization-tips',
    status: 'published',
    author: 'Alice Williams',
    createdAt: '2023-04-28T16:40:00Z',
    updatedAt: '2023-04-28T16:40:00Z',
    views: 3400,
    likes: 120
  },
  {
    id: '5',
    title: 'The Future of Web Development',
    slug: 'future-web-development',
    status: 'archived',
    author: 'Michael Brown',
    createdAt: '2023-04-20T13:10:00Z',
    updatedAt: '2023-04-25T15:30:00Z',
    views: 1800,
    likes: 67
  }
];

export const GET: RequestHandler = async (event) => {
  // In a real implementation, you would fetch data from your database
  // based on filters like status, category, search, etc.
  const status = event.url.searchParams.get('status');
  const category = event.url.searchParams.get('category');
  const search = event.url.searchParams.get('search');
  
  // Filter mock data based on parameters
  let filteredPosts = mockBlogPosts;
  
  if (status && status !== 'all') {
    filteredPosts = filteredPosts.filter(post => post.status === status);
  }
  
  if (search) {
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  return json(filteredPosts);
};

export const DELETE: RequestHandler = async (event) => {
  // In a real implementation, you would delete the post from your database
 // based on the slug parameter
  const slug = event.params.slug;
  
  // For now, just return success
  return json({ success: true, message: `Post with slug ${slug} deleted successfully` });
};