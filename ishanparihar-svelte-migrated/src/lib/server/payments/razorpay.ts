import { env } from '$env/dynamic/private';

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'captured' | 'refunded';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

interface CreateOrderParams {
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export class RazorpayService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    if (!env.PRIVATE_RAZORPAY_KEY_ID || !env.PRIVATE_RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials are not configured');
    }
    
    this.apiKey = env.PRIVATE_RAZORPAY_KEY_ID;
    this.secretKey = env.PRIVATE_RAZORPAY_KEY_SECRET;
    this.baseUrl = 'https://api.razorpay.com/v1';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${this.apiKey}:${this.secretKey}`)}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Razorpay API error: ${error.error?.description || 'Unknown error'}`);
    }

    return response.json();
  }

  async createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
    const orderData = {
      amount: Math.round(params.amount * 100), // Convert to paise
      currency: params.currency || 'INR',
      receipt: params.receipt || `order_${Date.now()}`,
      notes: params.notes || {},
    };

    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async verifyPaymentSignature(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ): Promise<boolean> {
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    return expectedSignature === razorpay_signature;
  }

  async capturePayment(paymentId: string, amount: number) {
    const captureData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
    };

    return this.makeRequest(`/payments/${paymentId}/capture`, {
      method: 'POST',
      body: JSON.stringify(captureData),
    });
  }

  async refundPayment(paymentId: string, amount?: number) {
    const refundData: { amount?: number } = {};
    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to paise
    }

    return this.makeRequest(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  }

  async getOrder(orderId: string) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async getPayment(paymentId: string) {
    return this.makeRequest(`/payments/${paymentId}`);
  }
}