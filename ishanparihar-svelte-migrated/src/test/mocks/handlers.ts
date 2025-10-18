import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const handlers = [
  // Admin endpoints
  http.get('/api/admin/dashboard', async ({ request, params, cookies }) => {
    return HttpResponse.json({
      stats: {
        totalUsers: 1250,
        totalRevenue: 24567.89,
        newUsersToday: 12,
        activeUsers: 342
      }
    }, { status: 200 });
  }),
  
  http.get('/api/admin/users', async ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '10');
    
    return HttpResponse.json({
      users: [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: '2',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          status: 'active',
          created_at: '2023-01-02T00:00:00Z'
        }
      ],
      page,
      limit,
      total: 1250,
      totalPages: Math.ceil(1250 / limit)
    }, { status: 200 });
  }),
  
  http.post('/api/admin/users/:userId/suspend', async ({ request, params, cookies }) => {
    const userId = params.userId;
    return HttpResponse.json({ success: true, message: `User ${userId} suspended` }, { status: 200 });
  }),
  
  http.put('/api/admin/users/:userId/role', async ({ request, params, cookies }) => {
    const userId = params.userId as string;
    const body = await request.json();
    const { role } = body as { role: string };
    return HttpResponse.json({ success: true, message: `User ${userId} role updated to ${role}` }, { status: 200 });
  }),
  
  http.get('/api/admin/analytics', async ({ request, params, cookies }) => {
    return HttpResponse.json({
      users: [
        { date: '2023-01-01', newUsers: 5, returningUsers: 12 },
        { date: '2023-01-02', newUsers: 8, returningUsers: 15 }
      ],
      revenue: [
        { date: '2023-01-01', amount: 500 },
        { date: '2023-01-02', amount: 750 }
      ],
      topServices: [
        { name: 'Service 1', sales: 45 },
        { name: 'Service 2', sales: 32 }
      ]
    }, { status: 200 });
  }),
  
  // Blog admin endpoints
  http.get('/api/admin/blog', async ({ request, params, cookies }) => {
    return HttpResponse.json({
      posts: [
        {
          id: '1',
          title: 'Test Blog Post',
          slug: 'test-blog-post',
          status: 'published',
          author: 'admin',
          created_at: '2023-01-01T00:00:00Z'
        }
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    }, { status: 200 });
  }),
  
  http.delete('/api/admin/blog/:slug', async ({ request, params, cookies }) => {
    const slug = params.slug;
    return HttpResponse.json({ success: true, message: `Post ${slug} deleted` }, { status: 200 });
  }),
  
  // Newsletter admin endpoints
  http.get('/api/admin/newsletter', async ({ request, params, cookies }) => {
    return HttpResponse.json({
      campaigns: [
        { id: '1', name: 'Test Campaign', status: 'sent', sent: 125 },
        { id: '2', name: 'Draft Campaign', status: 'draft', sent: 0 }
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1
    }, { status: 200 });
  }),
  
  http.post('/api/admin/newsletter', async ({ request, params, cookies }) => {
    return HttpResponse.json({ success: true, id: 'new-campaign-id' }, { status: 201 });
  }),
  
  http.put('/api/admin/newsletter/:id', async ({ request, params, cookies }) => {
    const id = params.id;
    return HttpResponse.json({ success: true, message: `Campaign ${id} updated` }, { status: 200 });
  }),
  
  http.get('/api/admin/newsletter/subscribers', async ({ request, params, cookies }) => {
    return HttpResponse.json({ total: 1250, active: 1200, unsubscribed: 50 }, { status: 200 });
  }),
  
  // Support endpoints
  http.get('/api/support/chats/:sessionId/messages', async ({ request, params, cookies }) => {
    const sessionId = params.sessionId;
    return HttpResponse.json([
      { id: '1', content: 'Hello, how can I help?', sender: 'agent', timestamp: '2023-01-01T00:00:00Z' },
      { id: '2', content: 'I have a question', sender: 'user', timestamp: '2023-01-01T00:01:00Z' }
    ], { status: 200 });
  }),
  
  http.post('/api/support/tickets', async ({ request, params, cookies }) => {
    return HttpResponse.json({ success: true, id: 'new-ticket-id' }, { status: 201 });
  }),
  
  http.get('/api/support/tickets', async ({ request, params, cookies }) => {
    return HttpResponse.json({
      tickets: [
        { id: '1', subject: 'Test Ticket', status: 'open', priority: 'medium', createdAt: '2023-01-01T00:00:00Z' }
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    }, { status: 200 });
  }),
  
  http.get('/api/support/tickets/:id', async ({ request, params, cookies }) => {
    const id = params.id;
    return HttpResponse.json({
      id,
      subject: 'Test Ticket',
      status: 'open',
      priority: 'medium',
      description: 'Test ticket description',
      createdAt: '2023-01-01T00:00:00Z',
      messages: [
        { id: '1', content: 'I have an issue', sender: 'user', timestamp: '2023-01-01T00:00:00Z' }
      ]
    }, { status: 200 });
  }),
  
  http.put('/api/support/tickets/:id', async ({ request, params, cookies }) => {
    const id = params.id;
    return HttpResponse.json({ success: true, message: `Ticket ${id} updated` }, { status: 200 });
  }),
  
  // User profile endpoints
  http.get('/api/user/profile', async ({ request, params, cookies }) => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        created_at: '2023-01-01T00:00:00Z'
      }
    }, { status: 200 });
  }),
  
  http.put('/api/user/profile', async ({ request, params, cookies }) => {
    return HttpResponse.json({ success: true, message: 'Profile updated' }, { status: 200 });
  }),
  
  http.put('/api/user/password', async ({ request, params, cookies }) => {
    return HttpResponse.json({ success: true, message: 'Password changed' }, { status: 200 });
  }),
  
  http.put('/api/user/notifications', async ({ request, params, cookies }) => {
    return HttpResponse.json({ success: true, message: 'Notifications updated' }, { status: 200 });
  }),
  
  // Orders endpoints
  http.get('/api/user/orders', async ({ request, params, cookies }) => {
    return HttpResponse.json({
      orders: [
        {
          id: '1',
          status: 'completed',
          total: 117.98,
          items: [
            {
              id: '1',
              service: {
                id: '1',
                title: 'Test Service',
                base_price: 99.99
              },
              quantity: 1
            }
          ],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ]
    }, { status: 200 });
  }),
  
  http.get('/api/orders/:orderId', async ({ request, params, cookies }) => {
    const orderId = params.orderId;
    return HttpResponse.json({
      id: orderId,
      status: 'completed',
      total: 117.98,
      items: [
        {
          id: '1',
          service: {
            id: '1',
            title: 'Test Service',
            base_price: 99.99
          },
          quantity: 1
        }
      ],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }, { status: 200 });
  }),
  
  http.post('/api/orders', async ({ request, params, cookies }) => {
    const orderData = await request.json();
    const typedOrderData = orderData as { total?: number; items?: any[] };
    return HttpResponse.json({
      id: 'new-order-id',
      status: 'pending',
      total: typedOrderData.total || 117.98,
      items: typedOrderData.items || [],
      created_at: new Date().toISOString()
    }, { status: 201 });
  })
];

export { handlers };
export const server = setupServer(...handlers);