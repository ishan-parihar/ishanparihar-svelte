import { setupServer } from 'msw/node';
import { rest } from 'msw';

const handlers = [
  // Admin endpoints
  rest.get('/api/admin/dashboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        stats: {
          totalUsers: 1250,
          totalRevenue: 24567.89,
          newUsersToday: 12,
          activeUsers: 342
        }
      })
    );
  }),
  
  rest.get('/api/admin/users', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page') || '1');
    const limit = Number(req.url.searchParams.get('limit') || '10');
    
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),
  
  rest.post('/api/admin/users/:userId/suspend', (req, res, ctx) => {
    const { userId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: `User ${userId} suspended` })
    );
  }),
  
  rest.put('/api/admin/users/:userId/role', (req, res, ctx) => {
    const { userId } = req.params;
    const { role } = req.body as any;
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: `User ${userId} role updated to ${role}` })
    );
  }),
  
  rest.get('/api/admin/analytics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),
  
  // Blog admin endpoints
  rest.get('/api/admin/blog', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),
  
  rest.delete('/api/admin/blog/:slug', (req, res, ctx) => {
    const { slug } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: `Post ${slug} deleted` })
    );
  }),
  
  // Newsletter admin endpoints
  rest.get('/api/admin/newsletter', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        campaigns: [
          { id: '1', name: 'Test Campaign', status: 'sent', sent: 125 },
          { id: '2', name: 'Draft Campaign', status: 'draft', sent: 0 }
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      })
    );
  }),
  
  rest.post('/api/admin/newsletter', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ success: true, id: 'new-campaign-id' })
    );
  }),
  
  rest.put('/api/admin/newsletter/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: `Campaign ${id} updated` })
    );
  }),
  
  rest.get('/api/admin/newsletter/subscribers', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ total: 1250, active: 1200, unsubscribed: 50 })
    );
  }),
  
  // Support endpoints
  rest.get('/api/support/chats/:sessionId/messages', (req, res, ctx) => {
    const { sessionId } = req.params;
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', content: 'Hello, how can I help?', sender: 'agent', timestamp: '2023-01-01T00:00:00Z' },
        { id: '2', content: 'I have a question', sender: 'user', timestamp: '2023-01-01T00:01:00Z' }
      ])
    );
  }),
  
  rest.post('/api/support/tickets', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ success: true, id: 'new-ticket-id' })
    );
  }),
  
  rest.get('/api/support/tickets', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        tickets: [
          { id: '1', subject: 'Test Ticket', status: 'open', priority: 'medium', createdAt: '2023-01-01T00:00:00Z' }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      })
    );
  }),
  
  rest.get('/api/support/tickets/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        subject: 'Test Ticket',
        status: 'open',
        priority: 'medium',
        description: 'Test ticket description',
        createdAt: '2023-01-01T00:00:00Z',
        messages: [
          { id: '1', content: 'I have an issue', sender: 'user', timestamp: '2023-01-01T00:00:00Z' }
        ]
      })
    );
  }),
  
  rest.put('/api/support/tickets/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: `Ticket ${id} updated` })
    );
  }),
  
  // User profile endpoints
  rest.get('/api/user/profile', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Test User',
          role: 'user',
          created_at: '2023-01-01T00:00:00Z'
        }
      })
    );
  }),
  
  rest.put('/api/user/profile', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: 'Profile updated' })
    );
  }),
  
  rest.put('/api/user/password', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: 'Password changed' })
    );
  }),
  
  rest.put('/api/user/notifications', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: 'Notifications updated' })
    );
  }),
  
  // Orders endpoints
  rest.get('/api/user/orders', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),
  
  rest.get('/api/orders/:orderId', (req, res, ctx) => {
    const { orderId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),
  
  rest.post('/api/orders', (req, res, ctx) => {
    const orderData = req.body as any;
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-order-id',
        status: 'pending',
        total: orderData.total || 117.98,
        items: orderData.items || [],
        created_at: new Date().toISOString()
      })
    );
  })
];

export const server = setupServer(...handlers);