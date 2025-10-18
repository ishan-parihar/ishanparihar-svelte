import { browser } from '$app/environment';

export interface ApiClient {
  admin: {
    getDashboard: () => Promise<any>;
    getUsers: (params: any) => Promise<any>;
    suspendUser: (userId: string, data: any) => Promise<any>;
    updateUserRole: (userId: string, role: string) => Promise<any>;
    getAnalytics: (params: any) => Promise<any>;
    blog: {
      getPosts: (params: any) => Promise<any>;
      deletePost: (slug: string) => Promise<any>;
    };
    newsletter: {
      getCampaigns: (params: any) => Promise<any>;
      createCampaign: (data: any) => Promise<any>;
      updateCampaign: (id: string, data: any) => Promise<any>;
      getSubscribers: () => Promise<any>;
    };
  };
  support: {
    getChatMessages: (sessionId: string) => Promise<any>;
    createTicket: (data: any) => Promise<any>;
    getTickets: (params: any) => Promise<any>;
    getTicket: (id: string) => Promise<any>;
    updateTicket: (id: string, data: any) => Promise<any>;
  };
  user: {
    getProfile: () => Promise<any>;
    updateProfile: (data: any) => Promise<any>;
    changePassword: (data: any) => Promise<any>;
    updateNotificationSettings: (data: any) => Promise<any>;
  };
  orders: {
    getUserOrders: (userId: string) => Promise<any>;
    getOrder: (orderId: string) => Promise<any>;
    createOrder: (data: any) => Promise<any>;
  };
}

// API client that makes actual HTTP requests to server endpoints
export const apiClient: ApiClient = {
  admin: {
    getDashboard: async () => {
      if (!browser) return null;
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    getUsers: async (params) => {
      if (!browser) return { users: [], page: 1, limit: 20, total: 0, totalPages: 1 };
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.status) searchParams.set('status', params.status);
      if (params.role) searchParams.set('role', params.role);
      
      const queryString = searchParams.toString();
      const response = await fetch(`/api/admin/users${queryString ? '?' + queryString : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    suspendUser: async (userId, data) => {
      if (!browser) return null;
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to suspend user');
      }
      return response.json();
    },
    updateUserRole: async (userId, role) => {
      if (!browser) return null;
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      return response.json();
    },
    getAnalytics: async (params) => {
      if (!browser) return null;
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.set('from', params.from);
      if (params.to) searchParams.set('to', params.to);
      if (params.metric) searchParams.set('metric', params.metric);
      
      const queryString = searchParams.toString();
      const response = await fetch(`/api/admin/analytics${queryString ? '?' + queryString : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
    blog: {
      getPosts: async (params) => {
        if (!browser) return [];
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.status) searchParams.set('status', params.status);
        if (params.author) searchParams.set('author', params.author);
        
        const queryString = searchParams.toString();
        const response = await fetch(`/api/admin/blog${queryString ? '?' + queryString : ''}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        return response.json();
      },
      deletePost: async (slug) => {
        if (!browser) return { success: false };
        const response = await fetch(`/api/admin/blog/${slug}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Failed to delete blog post');
        }
        return response.json();
      }
    },
    newsletter: {
      getCampaigns: async (params) => {
        if (!browser) return { campaigns: [], total: 0, page: 1, limit: 10, totalPages: 1 };
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.status) searchParams.set('status', params.status);
        if (params.search) searchParams.set('search', params.search);
        
        const queryString = searchParams.toString();
        const response = await fetch(`/api/admin/newsletter${queryString ? '?' + queryString : ''}`);
        if (!response.ok) {
          throw new Error('Failed to fetch newsletter campaigns');
        }
        return response.json();
      },
      createCampaign: async (data) => {
        if (!browser) return { success: false };
        const response = await fetch('/api/admin/newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error('Failed to create newsletter campaign');
        }
        return response.json();
      },
      updateCampaign: async (id, data) => {
        if (!browser) return { success: false };
        const response = await fetch(`/api/admin/newsletter/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error('Failed to update newsletter campaign');
        }
        return response.json();
      },
      getSubscribers: async () => {
        if (!browser) return { total: 0, active: 0, unsubscribed: 0 };
        const response = await fetch('/api/admin/newsletter/subscribers');
        if (!response.ok) {
          throw new Error('Failed to fetch subscribers');
        }
        return response.json();
      }
    }
  },
  support: {
    getChatMessages: async (sessionId) => {
      if (!browser) return [];
      const response = await fetch(`/api/support/chats/${sessionId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      return response.json();
    },
    createTicket: async (data) => {
      if (!browser) return { success: false };
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }
      return response.json();
    },
    getTickets: async (params) => {
      if (!browser) return { tickets: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status) searchParams.set('status', params.status);
      if (params.priority) searchParams.set('priority', params.priority);
      if (params.search) searchParams.set('search', params.search);
      
      const queryString = searchParams.toString();
      const response = await fetch(`/api/support/tickets${queryString ? '?' + queryString : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      return response.json();
    },
    getTicket: async (id) => {
      if (!browser) return null;
      const response = await fetch(`/api/support/tickets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      return response.json();
    },
    updateTicket: async (id, data) => {
      if (!browser) return { success: false };
      const response = await fetch(`/api/support/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }
      return response.json();
    }
  },
  user: {
    getProfile: async () => {
      if (!browser) return null;
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch profile');
      }
      const result = await response.json();
      return result.user;
    },
    updateProfile: async (data) => {
      if (!browser) return { success: false };
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    changePassword: async (data) => {
      if (!browser) return { success: false };
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to change password');
      }
      return response.json();
    },
    updateNotificationSettings: async (data) => {
      if (!browser) return { success: false };
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to update notification settings');
      }
      return response.json();
    }
  },
  orders: {
    getUserOrders: async (userId) => {
      if (!browser) return [];
      const response = await fetch(`/api/user/orders`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch orders');
      }
      const result = await response.json();
      return result.orders;
    },
    getOrder: async (orderId) => {
      if (!browser) return null;
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      return response.json();
    },
    createOrder: async (data) => {
      if (!browser) return { success: false };
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      return response.json();
    }
  }
};