// API Client for making requests to our API routes
export const apiClient = {
  services: {
    async getServices(params: any = {}) {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.set(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/api/services${queryString ? `?${queryString}` : ''}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
    },
    
    async getCategories() {
      // This would be implemented when we have a categories endpoint
      return [
        { id: '1', name: 'Consulting', slug: 'consulting' },
        { id: '2', name: 'Development', slug: 'development' },
        { id: '3', name: 'Analytics', slug: 'analytics' },
        { id: '4', name: 'Training', slug: 'training' }
      ];
    }
  },
  
  user: {
    async getProfile() {
      // This would be implemented when we have user authentication
      return {
        id: 'mock-user-id',
        email: 'user@example.com',
        name: 'Mock User'
      };
    }
  },
  
  payments: {
    async createOrder(orderData: any) {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }
      
      return await response.json();
    },
    
    async verifyPayment(verificationData: any) {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      
      return await response.json();
    }
  },
  
  orders: {
    async create(orderData: any) {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return await response.json();
    },
    
    async getOrders() {
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return await response.json();
    },
    
    async getOrder(orderId: string) {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`);
      }
      
      return await response.json();
    }
  }
};